<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Load products if products array exists
        $productsData = [];
        if ($this->products && is_array($this->products)) {
            $products = \App\Models\Product::whereIn('id', $this->products)
                ->where('is_active', true)
                ->get();
            
            foreach ($products as $product) {
                $firstImage = null;
                if ($product->images && is_array($product->images) && count($product->images) > 0) {
                    $firstImageObj = $product->images[0];
                    if (is_string($firstImageObj)) {
                        $firstImage = $firstImageObj;
                    } elseif (is_array($firstImageObj) && isset($firstImageObj['image_url'])) {
                        $firstImage = $firstImageObj['image_url'];
                    } elseif (is_array($firstImageObj) && isset($firstImageObj['image_path'])) {
                        $firstImage = asset('storage/' . $firstImageObj['image_path']);
                    }
                }
                
                $productsData[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'original_price' => $product->original_price ? (float) $product->original_price : null,
                    'image' => $firstImage,
                    'brand' => $product->brand ? $product->brand->name : null,
                    'rating' => (float) $product->rating,
                    'reviews_count' => $product->reviews_count,
                ];
            }
        }

        // Load bundle items if bundle_items exists
        $bundleItemsData = [];
        if ($this->bundle_items && is_array($this->bundle_items)) {
            foreach ($this->bundle_items as $item) {
                $productId = is_array($item) ? ($item['product_id'] ?? $item['id'] ?? null) : $item;
                if ($productId) {
                    $product = \App\Models\Product::find($productId);
                    if ($product && $product->is_active) {
                        $firstImage = null;
                        if ($product->images && is_array($product->images) && count($product->images) > 0) {
                            $firstImageObj = $product->images[0];
                            if (is_string($firstImageObj)) {
                                $firstImage = $firstImageObj;
                            } elseif (is_array($firstImageObj) && isset($firstImageObj['image_url'])) {
                                $firstImage = $firstImageObj['image_url'];
                            } elseif (is_array($firstImageObj) && isset($firstImageObj['image_path'])) {
                                $firstImage = asset('storage/' . $firstImageObj['image_path']);
                            }
                        }
                        
                        $bundleItemsData[] = [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'product_slug' => $product->slug,
                            'quantity' => $item['quantity'] ?? 1,
                            'price' => (float) $product->price,
                            'image' => $firstImage,
                        ];
                    }
                }
            }
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'image' => $this->image,
            'discount_percentage' => $this->discount_percentage ? (float) $this->discount_percentage : null,
            'fixed_discount' => $this->fixed_discount ? (float) $this->fixed_discount : null,
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'products' => $productsData,
            'bundle_items' => $bundleItemsData,
            'bundle_price' => $this->bundle_price ? (float) $this->bundle_price : null,
            'original_bundle_price' => $this->original_bundle_price ? (float) $this->original_bundle_price : null,
            'stock_limit' => $this->stock_limit,
            'sold_count' => $this->sold_count,
            'is_currently_active' => $this->isActive(),
            'remaining_time' => $this->getRemainingTime(),
            'progress_percentage' => $this->getProgressPercentage(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

