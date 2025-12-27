<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ProductController extends Controller
{
    /**
     * Transform FormData string values to appropriate types
     */
    private function transformFormData(array $data): array
    {
        // Convert boolean strings to actual booleans
        $booleanFields = ['manage_stock', 'in_stock', 'is_active', 'is_featured'];
        foreach ($booleanFields as $field) {
            if (isset($data[$field])) {
                // Convert string 'true'/'false' to boolean
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                // If null (invalid), default to false
                if ($data[$field] === null) {
                    $data[$field] = false;
                }
            }
        }

        // Convert JSON strings to arrays
        $arrayFields = ['features', 'specifications', 'filter_values'];
        foreach ($arrayFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                $data[$field] = is_array($decoded) ? $decoded : [];
            }
        }

        return $data;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Start with base query - only show active products (including out of stock)
        $query = Product::query()
            ->where('is_active', true)
            ->with(['category', 'categories', 'brand']);

        // Apply search filter FIRST (before QueryBuilder)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('short_description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('sku', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function ($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  })
                  ->orWhereHas('brand', function ($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Apply category filter - include products from this category and all its subcategories
        if ($request->has('category_id') && $request->category_id) {
            $categoryId = $request->category_id;
            $categoryIds = Category::getAllDescendantIdsFor($categoryId);
            
            $query->where(function($q) use ($categoryIds) {
                // Check direct category_id column
                $q->whereIn('category_id', $categoryIds)
                  // OR check many-to-many categories relationship
                  ->orWhereHas('categories', function($categoryQuery) use ($categoryIds) {
                      $categoryQuery->whereIn('categories.id', $categoryIds);
                  });
            });
        }

        // Apply brand filter
        if ($request->has('brand_id') && $request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        // Apply price range filter
        if ($request->has('price_min') || $request->has('price_max')) {
            $query->whereBetween('price', [
                $request->price_min ?? 0,
                $request->price_max ?? 999999
            ]);
        }

        // Apply dynamic filter values (category-specific attributes)
        // Handle both formats: filters[AttributeName]=value OR filter_values as JSON string
        
        // Collect all filters from both possible sources
        $allFilters = [];
        
        // Source 1: filters parameter (array format)
        if ($request->has('filters') && is_array($request->input('filters'))) {
            $allFilters = array_merge($allFilters, $request->input('filters'));
        }
        
        // Source 2: filter_values parameter (JSON string format)
        if ($request->has('filter_values')) {
            $filterValues = is_string($request->filter_values) 
                ? json_decode($request->filter_values, true) 
                : $request->filter_values;
                
            if (is_array($filterValues)) {
                $allFilters = array_merge($allFilters, $filterValues);
            }
        }
        
        // Debug: Log what we're receiving
        \Log::info('Filter request data:', [
            'has_filters' => $request->has('filters'),
            'has_filter_values' => $request->has('filter_values'),
            'merged_filters' => $allFilters,
            'filter_count' => count($allFilters)
        ]);
        
        // Apply all collected filters
        if (!empty($allFilters)) {
            foreach ($allFilters as $filterKey => $filterValue) {
                if (empty($filterValue)) continue;
                
                $filterValue = trim($filterValue);
                
                // Handle multiple values separated by comma (for checkbox filters)
                $values = explode(',', $filterValue);
                $values = array_map('trim', $values);
                $values = array_filter($values); // Remove empty values
                
                if (empty($values)) continue;
                
                // Each filter must match (AND between filters)
                // But within a filter, any value can match (OR between values)
                $query->where(function($q) use ($filterKey, $values) {
                    // Correct JSON path extraction for MySQL: '$."Key Name"'
                    // Note: No backslash escaping needed for the double quotes inside the single-quoted string
                    $jsonPath = '$."' . $filterKey . '"';
                    
                    // For each value in the filter, check if it matches
                    foreach ($values as $value) {
                        $q->orWhere(function($subQ) use ($jsonPath, $value, $filterKey) {
                            // Validated JSON_CONTAINS logic
                            $jsonVal = json_encode([$filterKey => $value], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                            
                            // Exact match using JSON_CONTAINS
                            $subQ->whereRaw(
                                "JSON_CONTAINS(filter_values, ?)",
                                [$jsonVal]
                            );
                            
                            // OR partial match (fallback)
                            $subQ->orWhereRaw(
                                "JSON_UNQUOTE(JSON_EXTRACT(filter_values, ?)) LIKE ?",
                                [$jsonPath, '%' . $value . '%']
                            );

                            // OR Raw text match (Last resort for encoding/path issues)
                            // Matches "key":"value" patterns directly in the string
                            // OR Raw text match (Last resort for encoding/path issues)
                            // Matches "key":"value" patterns directly in the string
                            // Using standard JSON format variations (with and without space after colon)
                            $subQ->orWhereRaw("filter_values LIKE ?", ['%"' . $filterKey . '":"' . $value . '"%']);
                            $subQ->orWhereRaw("filter_values LIKE ?", ['%"' . $filterKey . '": "' . $value . '"%']);

                            // OR Escaped Unicode match (handles raw storage of \uXXXX)
                            // We must double backslashes for LIKE pattern matching if backslash is the escape char
                            $keyEscaped = substr(json_encode($filterKey), 1, -1);
                            $valueEscaped = substr(json_encode($value), 1, -1);
                            
                            // Escape backslashes for LIKE ( \ -> \\ )
                            $keyEscapedLike = str_replace('\\', '\\\\', $keyEscaped);
                            $valueEscapedLike = str_replace('\\', '\\\\', $valueEscaped);
                            
                            $subQ->orWhereRaw("filter_values LIKE ?", ['%"' . $keyEscapedLike . '":"' . $valueEscapedLike . '"%']);
                            $subQ->orWhereRaw("filter_values LIKE ?", ['%"' . $keyEscapedLike . '": "' . $valueEscapedLike . '"%']);
                        });
                    }
                });
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $sortMap = ['name' => 'name', 'price' => 'price', 'created_at' => 'created_at', 'rating' => 'rating', 'sales_count' => 'sales_count'];
        $sortField = $sortMap[$sortBy] ?? 'created_at';
        $query->orderBy($sortField, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Handle categories from FormData (may come as JSON string)
        if ($request->has('categories')) {
            $categoriesInput = $request->input('categories');
            if (is_string($categoriesInput)) {
                $decoded = json_decode($categoriesInput, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $request->merge(['categories' => $decoded]);
                }
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sku' => 'required|string|unique:products,sku',
            'stock_quantity' => 'required|integer|min:0',
            'manage_stock' => 'nullable|string|in:true,false,1,0',
            'stock_status' => 'nullable|string',
            'in_stock' => 'nullable|string|in:true,false,1,0',
            'category_id' => 'nullable|exists:categories,id', // Keep for backward compatibility
            'categories' => 'nullable|array', // New: multiple categories
            'categories.*' => 'exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'warranty' => 'nullable|string',
            'delivery_time' => 'nullable|string',
            'features' => 'nullable|string',
            'specifications' => 'nullable|string',
            'filter_values' => 'nullable|string',
            // Note: images validation is handled separately after main validation
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'views_count' => 'nullable|integer|min:0',
            'sales_count' => 'nullable|integer|min:0',
            'is_active' => 'nullable|string|in:true,false,1,0',
            'is_featured' => 'nullable|string|in:true,false,1,0',
            'sort_order' => 'nullable|integer',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
        ]);

        // Transform string values to appropriate types
        $validated = $this->transformFormData($validated);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        // Extract categories from validated data
        $categories = [];
        if (isset($validated['categories']) && is_array($validated['categories'])) {
            $categories = $validated['categories'];
            unset($validated['categories']);
        } elseif (isset($validated['category_id'])) {
            // Backward compatibility: if only category_id is provided, use it
            $categories = [$validated['category_id']];
        }

        // If stock_status is 'stock_based', update in_stock based on stock_quantity
        if (isset($validated['stock_status']) && $validated['stock_status'] === 'stock_based') {
            $validated['in_stock'] = ($validated['stock_quantity'] ?? 0) > 0;
        }

        $product = Product::create($validated);

        // Attach categories to product
        if (!empty($categories)) {
            $product->categories()->sync($categories);
        }

        // Handle images: new image URLs and new image file uploads
        Log::info('Checking for images in request for new product');
        
        // Get new image URLs (direct URLs)
        $newImageUrls = [];
        if ($request->has('image_urls')) {
            $imageUrlsJson = $request->input('image_urls');
            if (is_string($imageUrlsJson)) {
                $imageUrlsJson = json_decode($imageUrlsJson, true);
            }
            if (is_array($imageUrlsJson)) {
                $newImageUrls = $imageUrlsJson;
            }
            Log::info('New image URLs: ' . count($newImageUrls));
        }
        
        // Process new image URLs
        $urlImages = [];
        if (!empty($newImageUrls)) {
            foreach ($newImageUrls as $index => $url) {
                if (filter_var($url, FILTER_VALIDATE_URL)) {
                    $urlImages[] = [
                        'image_path' => $url,
                        'image_url' => $url,
                        'alt_text' => null,
                        'is_primary' => $index === 0,
                        'sort_order' => $index,
                    ];
                }
            }
        }
        
        // Check for new image file uploads
        $imageFiles = [];
        if ($request->hasFile('images')) {
            $imageFiles = $request->file('images');
            if (!is_array($imageFiles)) {
                $imageFiles = [$imageFiles];
            }
            Log::info('Found images via hasFile(images): ' . count($imageFiles));
        } else {
            // Try to get images[0], images[1], etc. (bracket notation)
            $index = 0;
            while ($request->hasFile("images[{$index}]")) {
                $imageFiles[] = $request->file("images[{$index}]");
                $index++;
            }
            // If no images found with bracket notation, try dot notation
            if (count($imageFiles) === 0) {
                $index = 0;
                while ($request->hasFile("images.{$index}")) {
                    $imageFiles[] = $request->file("images.{$index}");
                    $index++;
                }
                Log::info('Found images via images.X (dot notation): ' . count($imageFiles));
            } else {
                Log::info('Found images via images[X] (bracket notation): ' . count($imageFiles));
            }
        }
        
        // Process new image file uploads
        $uploadedImages = [];
        if (count($imageFiles) > 0) {
            // Validate each image file
            foreach ($imageFiles as $index => $imageFile) {
                if (!$imageFile || !$imageFile->isValid()) {
                    Log::warning('Invalid image file at index ' . $index);
                    continue;
                }
                
                // Validate file type and size
                $validator = Validator::make(
                    ['image' => $imageFile],
                    [
                        'image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
                    ]
                );
                
                if ($validator->fails()) {
                    Log::warning('Image validation failed at index ' . $index . ': ' . json_encode($validator->errors()));
                    continue;
                }
            }
            
            Log::info('Received ' . count($imageFiles) . ' image file(s) for new product');
            
            // Process new images
            foreach ($imageFiles as $index => $imageFile) {
                if (!$imageFile || !$imageFile->isValid()) {
                    continue; // Skip invalid files (already logged above)
                }
                
                // Generate unique filename
                $filename = time() . '_' . $index . '_' . Str::random(10) . '.' . $imageFile->getClientOriginalExtension();
                
                Log::info('Processing image ' . ($index + 1) . ': ' . $imageFile->getClientOriginalName() . ' -> ' . $filename);
                
                // Store the file
                $path = $imageFile->storeAs('products', $filename, 'public');
                
                // Create image data array
                $imageData = [
                    'image_path' => $path,
                    'image_url' => asset('storage/' . $path),
                    'alt_text' => null,
                    'is_primary' => false, // Will be set based on total images
                    'sort_order' => count($urlImages) + $index, // Continue from URL images
                ];
                
                $uploadedImages[] = $imageData;
                
                Log::info('Prepared image data for product ' . $product->id . ': ' . $path . ' (sort_order: ' . $imageData['sort_order'] . ')');
            }
        } else {
            Log::info('No image files received for new product');
            Log::info('Request all files: ' . json_encode($request->allFiles()));
        }
        
        // Merge all images: URL images + uploaded images
        $allImages = array_merge($urlImages, $uploadedImages);
        
        // Set is_primary for the first image
        if (count($allImages) > 0) {
            $allImages[0]['is_primary'] = true;
        }
        
        // Update product images column
        if (count($allImages) > 0) {
            $product->images = $allImages;
            $product->save();
            Log::info('Total images for product ' . $product->id . ': ' . count($allImages) . ' (URLs: ' . count($urlImages) . ', uploaded: ' . count($uploadedImages) . ')');
        } else {
            Log::info('No images to save for product ' . $product->id);
        }

        return response()->json([
            'message' => 'Product created successfully',
            'data' => new ProductResource($product->load(['category', 'categories', 'brand']))
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): JsonResponse
    {
        // Increment view count
        $product->increment('views_count');

        return response()->json([
            'data' => new ProductResource($product->load(['category', 'categories', 'brand', 'reviews.user']))
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        // Handle categories from FormData (may come as JSON string)
        if ($request->has('categories')) {
            $categoriesInput = $request->input('categories');
            if (is_string($categoriesInput)) {
                $decoded = json_decode($categoriesInput, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $request->merge(['categories' => $decoded]);
                }
            }
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'stock_quantity' => 'sometimes|integer|min:0',
            'manage_stock' => 'nullable|string|in:true,false,1,0',
            'stock_status' => 'nullable|string',
            'in_stock' => 'nullable|string|in:true,false,1,0',
            'category_id' => 'nullable|integer|exists:categories,id', // Keep for backward compatibility
            'categories' => 'nullable|array', // New: multiple categories
            'categories.*' => 'exists:categories,id',
            'brand_id' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'warranty' => 'nullable|string',
            'delivery_time' => 'nullable|string',
            // Note: images validation is handled separately after main validation
            'is_active' => 'sometimes|string|in:true,false,1,0',
            'is_featured' => 'sometimes|string|in:true,false,1,0',
            'sort_order' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews_count' => 'nullable|integer|min:0',
            'views_count' => 'nullable|integer|min:0',
            'sales_count' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'features' => 'nullable|string',
            'specifications' => 'nullable|string',
            'filter_values' => 'nullable|string',
        ]);

        // Transform string values to appropriate types
        $validated = $this->transformFormData($validated);

        // Handle brand_id = 0 by setting to null
        if (isset($validated['brand_id']) && $validated['brand_id'] == 0) {
            $validated['brand_id'] = null;
        }
        
        // Extract categories from validated data
        $categories = null;
        if (isset($validated['categories']) && is_array($validated['categories'])) {
            $categories = $validated['categories'];
            unset($validated['categories']);
        } elseif (isset($validated['category_id'])) {
            // Backward compatibility: if only category_id is provided, use it
            $categories = [$validated['category_id']];
        }

        // If stock_status is 'stock_based', update in_stock based on stock_quantity
        if (isset($validated['stock_status']) && $validated['stock_status'] === 'stock_based') {
            $stockQuantity = $validated['stock_quantity'] ?? $product->stock_quantity;
            $validated['in_stock'] = $stockQuantity > 0;
        }

        // Update product
        $product->update($validated);

        // Sync categories if provided
        if ($categories !== null) {
            $product->categories()->sync($categories);
        }

        // Handle images: existing images to keep, new image URLs, and new image file uploads
        Log::info('Checking for images in request for product ' . $product->id);
        
        // Get existing images that should be kept (sent from frontend)
        $imagesToKeep = [];
        if ($request->has('existing_images')) {
            $existingImagesJson = $request->input('existing_images');
            if (is_string($existingImagesJson)) {
                $existingImagesJson = json_decode($existingImagesJson, true);
            }
            if (is_array($existingImagesJson)) {
                $imagesToKeep = $existingImagesJson;
            }
            Log::info('Existing images to keep: ' . count($imagesToKeep));
        } else {
            // If no existing_images sent, keep all current images
            $imagesToKeep = $product->images ?? [];
            if (!is_array($imagesToKeep)) {
                $imagesToKeep = [];
            }
            Log::info('No existing_images sent, keeping all current images: ' . count($imagesToKeep));
        }
        
        // Get new image URLs (direct URLs)
        $newImageUrls = [];
        if ($request->has('image_urls')) {
            $imageUrlsJson = $request->input('image_urls');
            if (is_string($imageUrlsJson)) {
                $imageUrlsJson = json_decode($imageUrlsJson, true);
            }
            if (is_array($imageUrlsJson)) {
                $newImageUrls = $imageUrlsJson;
            }
            Log::info('New image URLs: ' . count($newImageUrls));
        }
        
        // Process new image URLs
        $urlImages = [];
        if (!empty($newImageUrls)) {
            $maxSortOrder = -1;
            if (!empty($imagesToKeep)) {
                $maxSortOrder = max(array_column($imagesToKeep, 'sort_order')) ?? -1;
            }
            
            foreach ($newImageUrls as $index => $url) {
                if (filter_var($url, FILTER_VALIDATE_URL)) {
                    $sortOrder = $maxSortOrder + 1 + $index;
                    $isPrimary = (count($imagesToKeep) === 0 && $index === 0);
                    
                    $urlImages[] = [
                        'image_path' => $url,
                        'image_url' => $url,
                        'alt_text' => null,
                        'is_primary' => $isPrimary,
                        'sort_order' => $sortOrder,
                    ];
                }
            }
        }
        
        // Check for new image file uploads
        $imageFiles = [];
        if ($request->hasFile('images')) {
            $imageFiles = $request->file('images');
            if (!is_array($imageFiles)) {
                $imageFiles = [$imageFiles];
            }
            Log::info('Found images via hasFile(images): ' . count($imageFiles));
        } else {
            // Try to get images[0], images[1], etc. (bracket notation)
            $index = 0;
            while ($request->hasFile("images[{$index}]")) {
                $imageFiles[] = $request->file("images[{$index}]");
                $index++;
            }
            // If no images found with bracket notation, try dot notation
            if (count($imageFiles) === 0) {
                $index = 0;
                while ($request->hasFile("images.{$index}")) {
                    $imageFiles[] = $request->file("images.{$index}");
                    $index++;
                }
                Log::info('Found images via images.X (dot notation): ' . count($imageFiles));
            } else {
                Log::info('Found images via images[X] (bracket notation): ' . count($imageFiles));
            }
        }
        
        // Process new image file uploads
        $uploadedImages = [];
        if (count($imageFiles) > 0) {
            // Validate each image file
            foreach ($imageFiles as $index => $imageFile) {
                if (!$imageFile || !$imageFile->isValid()) {
                    Log::warning('Invalid image file at index ' . $index);
                    continue;
                }
                
                // Validate file type and size
                $validator = Validator::make(
                    ['image' => $imageFile],
                    [
                        'image' => 'required|file|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
                    ]
                );
                
                if ($validator->fails()) {
                    Log::warning('Image validation failed at index ' . $index . ': ' . json_encode($validator->errors()));
                    continue;
                }
            }
            
            Log::info('Received ' . count($imageFiles) . ' image file(s) for product ' . $product->id);
            
            // Get the highest sort_order
            $maxSortOrder = -1;
            $allCurrentImages = array_merge($imagesToKeep, $urlImages);
            if (!empty($allCurrentImages)) {
                $maxSortOrder = max(array_column($allCurrentImages, 'sort_order')) ?? -1;
            }
            
            // Process new uploaded images
            foreach ($imageFiles as $index => $imageFile) {
                if (!$imageFile || !$imageFile->isValid()) {
                    continue;
                }
                
                // Generate unique filename
                $filename = time() . '_' . $index . '_' . Str::random(10) . '.' . $imageFile->getClientOriginalExtension();
                
                Log::info('Processing image ' . ($index + 1) . ': ' . $imageFile->getClientOriginalName() . ' -> ' . $filename);
                
                // Store the file
                $path = $imageFile->storeAs('products', $filename, 'public');
                
                // Calculate sort_order: start from maxSortOrder + 1
                $sortOrder = $maxSortOrder + 1 + $index;
                
                // Only set as primary if this is the first new image AND there are no existing images
                $isPrimary = (count($allCurrentImages) === 0 && $index === 0);
                
                // Create image data array
                $imageData = [
                    'image_path' => $path,
                    'image_url' => asset('storage/' . $path),
                    'alt_text' => null,
                    'is_primary' => $isPrimary,
                    'sort_order' => $sortOrder,
                ];
                
                $uploadedImages[] = $imageData;
                
                Log::info('Prepared image data for product ' . $product->id . ': ' . $path . ' (sort_order: ' . $sortOrder . ', is_primary: ' . ($isPrimary ? 'true' : 'false') . ')');
            }
        }
        
        // Merge all images: kept images + URL images + uploaded images
        $allImages = array_merge($imagesToKeep, $urlImages, $uploadedImages);
        
        // Update product images column
        $product->images = $allImages;
        $product->save();
        
        $finalImagesCount = count($allImages);
        Log::info('Total images for product ' . $product->id . ' after update: ' . $finalImagesCount . ' (kept: ' . count($imagesToKeep) . ', URLs: ' . count($urlImages) . ', uploaded: ' . count($uploadedImages) . ')');

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product->load(['category', 'categories', 'brand']))
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Get featured products
     */
    public function featured(): JsonResponse
    {
        $products = Product::with(['category', 'brand'])
            ->where('is_featured', true)
            ->where('is_active', true)
            ->where('in_stock', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($products)
        ]);
    }

    /**
     * Get latest products
     */
    public function latest(): JsonResponse
    {
        $products = Product::with(['category', 'brand'])
            ->where('is_active', true)
            ->where('in_stock', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => ProductResource::collection($products)
        ]);
    }

    /**
     * Get products by category
     */
    public function byCategory(Category $category): JsonResponse
    {
        // Get all category IDs including subcategories
        $categoryIds = $category->getAllDescendantIds();
        
        $products = Product::with(['category', 'brand'])
            ->where(function($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)
                  ->orWhereHas('categories', function($categoryQuery) use ($categoryIds) {
                      $categoryQuery->whereIn('categories.id', $categoryIds);
                  });
            })
            ->where('is_active', true)
            ->where('in_stock', true)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Get products by brand
     */
    public function byBrand(Brand $brand): JsonResponse
    {
        $products = Product::with(['category', 'brand'])
            ->where('brand_id', $brand->id)
            ->where('is_active', true)
            ->where('in_stock', true)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Admin: Display a listing of all products (including inactive)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Product::query()->with(['category', 'brand']);

        // Apply search filter FIRST (before QueryBuilder)
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('short_description', 'like', '%' . $searchTerm . '%')
                  ->orWhere('sku', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function ($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  })
                  ->orWhereHas('brand', function ($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Apply other filters
        $query = QueryBuilder::for($query)
            ->allowedFilters([
                'name',
                'price',
                'category_id',
                'brand_id',
                'is_featured',
                'in_stock',
                'is_active',
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('brand_id'),
                AllowedFilter::scope('price_range'),
            ])
            ->allowedSorts(['name', 'price', 'created_at', 'rating', 'sales_count'])
            ->defaultSort('-created_at');

        // Apply category filter - include products from this category and all its subcategories
        if ($request->has('category_id') && $request->category_id) {
            $categoryIds = Category::getAllDescendantIdsFor($request->category_id);
            $query->where(function($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)
                  ->orWhereHas('categories', function($categoryQuery) use ($categoryIds) {
                      $categoryQuery->whereIn('categories.id', $categoryIds);
                  });
            });
        }

        // Apply brand filter
        if ($request->has('brand_id') && $request->brand_id) {
            $query->where('brand_id', $request->brand_id);
        }

        // Apply stock status filter
        if ($request->has('stock_status') && $request->stock_status !== 'all') {
            if ($request->stock_status === 'in_stock') {
                $query->where('in_stock', true);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('in_stock', false);
            } elseif ($request->stock_status === 'low_stock') {
                $query->where('stock_quantity', '<=', 5);
            }
        }

        // Apply status filter
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Apply featured filter
        if ($request->has('featured') && $request->featured !== 'all') {
            if ($request->featured === 'featured') {
                $query->where('is_featured', true);
            } elseif ($request->featured === 'not_featured') {
                $query->where('is_featured', false);
            }
        }

        // Apply price range filter
        if ($request->has('price_min') || $request->has('price_max')) {
            $query->whereBetween('price', [
                $request->price_min ?? 0,
                $request->price_max ?? 999999
            ]);
        }

        $products = $query->with(['category', 'brand'])->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    /**
     * Admin: Display the specified product
     */
    public function adminShow(Product $product): JsonResponse
    {
        return response()->json([
            'data' => new ProductResource($product->load(['category', 'categories', 'brand', 'reviews.user']))
        ]);
    }
}
