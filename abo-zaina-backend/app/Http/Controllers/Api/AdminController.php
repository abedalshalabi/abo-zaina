<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Brand;
use App\Models\Review;
use App\Http\Resources\OrderResource;
use App\Http\Resources\BrandResource;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Admin: Get all orders
     */
    public function orders(Request $request): JsonResponse
    {
        $query = QueryBuilder::for(Order::class)
            ->with(['orderItems.product'])
            ->allowedFilters([
                'order_number',
                'customer_name',
                'customer_email',
                'order_status',
                'payment_status',
                'payment_method',
                AllowedFilter::exact('order_status'),
                AllowedFilter::exact('payment_status'),
                AllowedFilter::scope('date_range'),
                AllowedFilter::scope('amount_range'),
            ])
            ->allowedSorts(['created_at', 'total', 'order_status', 'payment_status'])
            ->defaultSort('-created_at');

        // Apply search filter
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_email', 'like', '%' . $request->search . '%');
            });
        }

        $orders = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ]
        ]);
    }

    /**
     * Admin: Show specific order
     */
    public function showOrder(Order $order): JsonResponse
    {
        return response()->json([
            'data' => new OrderResource($order->load(['orderItems.product']))
        ]);
    }

    /**
     * Admin: Update order
     */
    public function updateOrder(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'order_status' => 'sometimes|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|string|in:pending,paid,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => new OrderResource($order->load(['orderItems.product']))
        ]);
    }

    /**
     * Admin: Get all reviews
     */
    public function reviews(Request $request): JsonResponse
    {
        $query = QueryBuilder::for(Review::class)
            ->with(['product', 'user'])
            ->allowedFilters([
                'rating',
                'customer_name',
                'is_approved',
                'is_featured',
                AllowedFilter::exact('rating'),
                AllowedFilter::exact('is_approved'),
                AllowedFilter::exact('is_featured'),
                AllowedFilter::scope('date_range'),
            ])
            ->allowedSorts(['created_at', 'rating', 'is_approved'])
            ->defaultSort('-created_at');

        // Apply search filter
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('comment', 'like', '%' . $request->search . '%')
                  ->orWhereHas('product', function ($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $reviews = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    /**
     * Admin: Update review
     */
    public function updateReview(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'is_approved' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'comment' => 'sometimes|string',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated successfully',
            'data' => new ReviewResource($review->load(['product', 'user']))
        ]);
    }

    /**
     * Admin: Delete review
     */
    public function destroyReview(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Admin: Store brand
     */
    public function storeBrand(Request $request): JsonResponse
    {
        // Convert is_active from string to boolean before validation if provided
        if ($request->has('is_active') && is_string($request->input('is_active'))) {
            $request->merge(['is_active' => filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:brands,slug',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'logo_file' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
            'website' => 'nullable|url',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        // Handle logo upload
        $logoPath = null;
        if ($request->hasFile('logo_file')) {
            $file = $request->file('logo_file');
            $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('brands', $filename, 'public');
            $logoPath = asset('storage/' . $path);
            Log::info('Logo file stored', [
                'filename' => $filename,
                'path' => $path,
                'logo_path' => $logoPath,
            ]);
        } elseif ($request->has('logo') && !empty($request->input('logo'))) {
            // Direct URL or base64 data URI provided
            $logoPath = $request->input('logo');
        }

        $brand = Brand::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'logo' => $logoPath,
            'website' => $validated['website'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
        ]);
        
        $brand->loadCount('products');

        return response()->json([
            'message' => 'Brand created successfully',
            'data' => new BrandResource($brand)
        ], 201);
    }

    /**
     * Admin: Update brand
     */
    public function updateBrand(Request $request, Brand $brand): JsonResponse
    {
        Log::info('Update brand request received', [
            'brand_id' => $brand->id,
            'has_file' => $request->hasFile('logo_file'),
            'has_logo' => $request->has('logo'),
            'logo_value' => $request->input('logo'),
            'all_inputs' => $request->except(['logo_file', '_method']),
        ]);

        // Convert is_active from string to boolean before validation
        if ($request->has('is_active') && is_string($request->input('is_active'))) {
            $request->merge(['is_active' => filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:brands,slug,' . $brand->id,
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'logo_file' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp,svg|max:10240',
            'website' => 'nullable|url',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo_file')) {
            Log::info('Logo file detected', [
                'file_name' => $request->file('logo_file')->getClientOriginalName(),
                'file_size' => $request->file('logo_file')->getSize(),
                'mime_type' => $request->file('logo_file')->getMimeType(),
            ]);
            // Delete old logo if exists
            if ($brand->logo && strpos($brand->logo, 'storage/') !== false) {
                $oldPath = str_replace(asset('storage/'), '', $brand->logo);
                $oldPath = str_replace(asset(''), '', $oldPath);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            
            $file = $request->file('logo_file');
            $filename = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('brands', $filename, 'public');
            $validated['logo'] = asset('storage/' . $path);
        } elseif ($request->has('logo')) {
            // If logo is empty string, delete it
            if (empty($request->input('logo'))) {
                // Delete old logo if exists
                if ($brand->logo && strpos($brand->logo, 'storage/') !== false) {
                    $oldPath = str_replace(asset('storage/'), '', $brand->logo);
                    $oldPath = str_replace(asset(''), '', $oldPath);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }
                $validated['logo'] = null;
            } else {
                // Direct URL or base64 data URI provided
                $validated['logo'] = $request->input('logo');
            }
        }

        $brand->update($validated);
        $brand->loadCount('products');

        return response()->json([
            'message' => 'Brand updated successfully',
            'data' => new BrandResource($brand)
        ]);
    }

    /**
     * Admin: Delete brand
     */
    public function destroyBrand(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json([
            'message' => 'Brand deleted successfully'
        ]);
    }

    /**
     * Admin: Get all brands
     */
    public function brands(Request $request): JsonResponse
    {
        $query = QueryBuilder::for(Brand::query()->withCount('products'))
            ->allowedFilters([
                'name',
                'is_active',
                AllowedFilter::exact('is_active'),
            ])
            ->allowedSorts(['name', 'sort_order', 'created_at', 'products_count'])
            ->defaultSort('sort_order');

        // Apply search filter
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $brands = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => BrandResource::collection($brands),
            'meta' => [
                'current_page' => $brands->currentPage(),
                'last_page' => $brands->lastPage(),
                'per_page' => $brands->perPage(),
                'total' => $brands->total(),
            ]
        ]);
    }

    /**
     * Admin: Show specific brand
     */
    public function showBrand(Brand $brand): JsonResponse
    {
        $brand->loadCount('products');

        return response()->json([
            'data' => new BrandResource($brand)
        ]);
    }
}
