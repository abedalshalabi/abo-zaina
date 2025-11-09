<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'price' => $this->price,
            'original_price' => $this->original_price,
            'compare_price' => $this->compare_price,
            'cost_price' => $this->cost_price,
            'discount_percentage' => $this->discount_percentage,
            'sku' => $this->sku,
            'stock_quantity' => $this->stock_quantity,
            'manage_stock' => $this->manage_stock,
            'stock_status' => $this->stock_status,
            'in_stock' => $this->in_stock,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'weight' => $this->weight,
            'dimensions' => $this->dimensions,
            'warranty' => $this->warranty,
            'delivery_time' => $this->delivery_time,
            'features' => $this->features,
            'specifications' => $this->specifications,
            'filter_values' => $this->filter_values,
            'rating' => $this->rating ? (float) $this->rating : 0.0,
            'reviews_count' => $this->reviews_count,
            'views_count' => $this->views_count,
            'sales_count' => $this->sales_count,
            'category_id' => $this->category_id, // Keep for backward compatibility
            'category' => $this->whenLoaded('category', function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                    'color' => $this->category->color,
                ] : null;
            }),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'color' => $category->color,
                    ];
                });
            }, function () {
                // If not loaded, load it
                if (!$this->relationLoaded('categories')) {
                    $this->load('categories');
                }
                return $this->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'color' => $category->color,
                    ];
                });
            }),
            'brand_id' => $this->brand_id,
            'brand' => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
                'logo' => $this->brand->logo,
            ] : null,
            'images' => $this->when($this->images, function () {
                $images = $this->images;
                
                // Handle array (from JSON column)
                if (is_array($images)) {
                    $result = [];
                    foreach ($images as $image) {
                        // Skip null or empty values
                        if (empty($image) || (!is_array($image) && !is_object($image))) {
                            continue;
                        }
                        
                        // Convert object to array if needed
                        if (is_object($image)) {
                            $image = (array) $image;
                        }
                        
                        // Ensure we have an array
                        if (!is_array($image)) {
                            continue;
                        }
                        
                        // Extract values with safe defaults
                        $imagePath = $image['image_path'] ?? $image['path'] ?? '';
                        $imageUrl = $image['image_url'] ?? '';
                        if (empty($imageUrl) && !empty($imagePath)) {
                            $imageUrl = asset('storage/' . $imagePath);
                        }
                        
                        $result[] = [
                            'id' => $image['id'] ?? null,
                            'image_path' => $imagePath,
                            'image_url' => $imageUrl,
                            'alt_text' => $image['alt_text'] ?? null,
                            'is_primary' => (bool) ($image['is_primary'] ?? false),
                            'sort_order' => (int) ($image['sort_order'] ?? 0),
                        ];
                    }
                    return $result;
                }
                
                // Handle Collection (from relationship - backward compatibility)
                if ($images instanceof \Illuminate\Database\Eloquent\Collection) {
                    return $images->map(function ($image) {
                        if (is_array($image)) {
                            $imagePath = $image['image_path'] ?? $image['path'] ?? '';
                            $imageUrl = $image['image_url'] ?? '';
                            if (empty($imageUrl) && !empty($imagePath)) {
                                $imageUrl = asset('storage/' . $imagePath);
                            }
                            return [
                                'id' => $image['id'] ?? null,
                                'image_path' => $imagePath,
                                'image_url' => $imageUrl,
                                'alt_text' => $image['alt_text'] ?? null,
                                'is_primary' => (bool) ($image['is_primary'] ?? false),
                                'sort_order' => (int) ($image['sort_order'] ?? 0),
                            ];
                        }
                        if (!is_object($image) || !isset($image->id)) {
                            return null;
                        }
                        return [
                            'id' => $image->id,
                            'image_path' => $image->image_path ?? '',
                            'image_url' => $image->image_path ? asset('storage/' . $image->image_path) : '',
                            'alt_text' => $image->alt_text ?? null,
                            'is_primary' => (bool) ($image->is_primary ?? false),
                            'sort_order' => (int) ($image->sort_order ?? 0),
                        ];
                    })->filter()->values()->toArray();
                }
                
                return [];
            }, []),
            'reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'customer_name' => $review->customer_name,
                        'created_at' => $review->created_at,
                        'user' => $review->user ? [
                            'id' => $review->user->id,
                            'name' => $review->user->name,
                        ] : null,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
