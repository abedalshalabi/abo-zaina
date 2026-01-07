<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Get main categories (parent_id is null) with their children AND grandchildren
        $categories = Category::where('is_active', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)
                    ->orderBy('sort_order')
                    ->with(['children' => function ($q) {
                        $q->where('is_active', true)->orderBy('sort_order');
                    }]);
            }])
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
        
        // Also get subcategories that have show_in_slider = true
        // These should appear in the slider even though they're subcategories
        $sliderSubcategories = Category::where('is_active', true)
            ->where('show_in_slider', true)
            ->whereNotNull('parent_id')
            ->orderBy('sort_order')
            ->get();
        
        // Get IDs of main categories to avoid duplicates
        $mainCategoryIds = $categories->pluck('id')->toArray();
        
        // Filter out subcategories that are already included as children of main categories
        $uniqueSliderSubcategories = $sliderSubcategories->filter(function($subcat) use ($mainCategoryIds) {
            return !in_array($subcat->id, $mainCategoryIds);
        });
        
        // Merge subcategories that should appear in slider with main categories
        $allCategories = $categories->merge($uniqueSliderSubcategories);
        
        return response()->json([
            'data' => CategoryResource::collection($allCategories)
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        $category->load(['parent', 'children' => function ($query) {
            $query->where('is_active', true)->orderBy('sort_order');
        }]);
        
        return response()->json([
            'data' => new CategoryResource($category)
        ]);
    }
    
    // Get main categories only
    public function mainCategories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
        
        return response()->json([
            'data' => CategoryResource::collection($categories)
        ]);
    }
    
    // Get subcategories for a specific category
    public function subcategories(Category $category): JsonResponse
    {
        $subcategories = $category->children()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        
        return response()->json([
            'data' => CategoryResource::collection($subcategories)
        ]);
    }
    
    // Get category filters
    public function filters(Category $category): JsonResponse
    {
        return response()->json([
            'data' => [
                'category_id' => $category->id,
                'category_name' => $category->name,
                'filters' => $category->filters ?? [],
                'has_children' => $category->hasChildren(),
            ]
        ]);
    }

    public function brands(): JsonResponse
    {
        $brands = Brand::where('is_active', true)
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();
        
        return response()->json([
            'data' => $brands->map(function ($brand) {
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'logo' => $brand->logo,
                    'description' => $brand->description,
                    'products_count' => $brand->products_count ?? 0,
                ];
            })
        ]);
    }

    public function showBrand(Brand $brand): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->logo,
                'description' => $brand->description,
                'website' => $brand->website,
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Convert is_active from string to boolean before validation if provided
        if ($request->has('is_active') && is_string($request->input('is_active'))) {
            $request->merge(['is_active' => filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true]);
        }

        // Convert show_in_slider from string to boolean before validation if provided
        if ($request->has('show_in_slider') && is_string($request->input('show_in_slider'))) {
            $request->merge(['show_in_slider' => filter_var($request->input('show_in_slider'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'image_file' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'color' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'show_in_slider' => 'nullable|boolean',
            'parent_id' => 'nullable|integer|exists:categories,id',
        ]);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('categories', $filename, 'public');
            $imagePath = asset('storage/' . $path);
        } elseif ($request->has('image') && !empty($request->input('image'))) {
            // Direct URL provided
            $imagePath = $request->input('image');
        }

        // Set level based on parent
        $level = 0;
        if (isset($validated['parent_id']) && $validated['parent_id']) {
            $parent = Category::find($validated['parent_id']);
            $level = $parent ? $parent->level + 1 : 1;
        }

        // Generate slug from name
        $slug = Str::slug($validated['name']);
        
        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'color' => $validated['color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'parent_id' => $validated['parent_id'] ?? null,
            'level' => $level,
            'is_active' => $validated['is_active'] ?? true,
            'show_in_slider' => $validated['show_in_slider'] ?? false,
        ]);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category)
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        // Convert is_active from string to boolean before validation
        if ($request->has('is_active') && is_string($request->input('is_active'))) {
            $request->merge(['is_active' => filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
        }

        // Convert show_in_slider from string to boolean before validation
        if ($request->has('show_in_slider') && is_string($request->input('show_in_slider'))) {
            $request->merge(['show_in_slider' => filter_var($request->input('show_in_slider'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'image_file' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'color' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'sometimes|boolean',
            'show_in_slider' => 'sometimes|boolean',
            'parent_id' => 'nullable|integer|exists:categories,id',
        ]);

        // Handle image upload or deletion
        if ($request->hasFile('image_file')) {
            // Delete old image if exists
            if ($category->image) {
                $oldImagePath = str_replace(asset('storage/'), '', $category->image);
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            
            // Upload new image
            $file = $request->file('image_file');
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('categories', $filename, 'public');
            $validated['image'] = asset('storage/' . $path);
        } elseif ($request->has('image')) {
            // Check if image is being deleted (empty string or null)
            if (empty($request->input('image'))) {
                // Delete old image if exists
                if ($category->image) {
                    $oldImagePath = str_replace(asset('storage/'), '', $category->image);
                    if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                        Storage::disk('public')->delete($oldImagePath);
                    }
                }
                $validated['image'] = null;
            } else {
                // Direct URL provided
                $validated['image'] = $request->input('image');
            }
        }

        // Convert is_active from string to boolean if it's a string
        if (isset($validated['is_active']) && is_string($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
        }

            // Handle parent_id update
        if ($request->has('parent_id')) {
            $newParentId = $request->input('parent_id') ? (int)$request->input('parent_id') : null;
            
            // Prevent setting category as its own parent
            if ($newParentId === $category->id) {
                return response()->json([
                    'message' => 'Cannot set category as its own parent',
                    'errors' => ['parent_id' => ['لا يمكن تعيين الفئة كأب لنفسها']]
                ], 422);
            }
            
            // Prevent setting a descendant as parent (circular reference)
            if ($newParentId) {
                $descendantIds = $category->getAllDescendantIds();
                if (in_array($newParentId, $descendantIds)) {
                    return response()->json([
                        'message' => 'Cannot set a descendant category as parent',
                        'errors' => ['parent_id' => ['لا يمكن تعيين فئة فرعية كأب']]
                    ], 422);
                }
            }
            
            // Update level based on new parent
            if ($newParentId) {
                $parent = Category::find($newParentId);
                $validated['level'] = $parent ? $parent->level + 1 : 1;
            } else {
                $validated['level'] = 0;
            }
            
            $validated['parent_id'] = $newParentId;
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => new CategoryResource($category)
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        // Delete category image if exists
        if ($category->image) {
            $oldImagePath = str_replace(asset('storage/'), '', $category->image);
            if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                Storage::disk('public')->delete($oldImagePath);
            }
        }
        
        $category->delete();
        
        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }

    /**
     * Admin: Display a listing of all categories (including inactive)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = QueryBuilder::for(Category::class)
            ->allowedFilters([
                'name',
                'is_active',
                AllowedFilter::exact('is_active'),
                AllowedFilter::scope('search'),
            ])
            ->allowedSorts(['name', 'sort_order', 'created_at'])
            ->defaultSort('sort_order');

        // Apply search filter
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $categories = $query->with(['parent', 'children'])
            ->withCount('products')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => CategoryResource::collection($categories),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ]
        ]);
    }

    /**
     * Admin: Display the specified category
     */
    public function adminShow(Category $category): JsonResponse
    {
        $category->load(['parent', 'children']);
        return response()->json([
            'data' => new CategoryResource($category)
        ]);
    }

    public function updateFilters(Request $request, Category $category): JsonResponse
    {
        // Allow empty array for deleting all filters
        if (empty($request->filters)) {
            $category->update(['filters' => []]);
            return response()->json([
                'message' => 'تم حذف جميع الفلاتر بنجاح',
                'data' => new CategoryResource($category)
            ]);
        }

        $request->validate([
            'filters' => 'required|array',
            'filters.*.name' => 'required|string',
            'filters.*.type' => 'required|in:select,checkbox,range,text',
            'filters.*.options' => 'nullable|array',
            'filters.*.required' => 'nullable|boolean'
        ]);

        $category->update([
            'filters' => $request->filters
        ]);

        return response()->json([
            'message' => 'تم تحديث الفلاتر بنجاح',
            'data' => new CategoryResource($category)
        ]);
    }
}
