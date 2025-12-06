<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cart::with(['product.category', 'product.brand', 'product.images']);

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $cartItems = $query->get();
        $total = $cartItems->sum('total');

        return response()->json([
            'data' => CartResource::collection($cartItems),
            'meta' => [
                'total_items' => $cartItems->count(),
                'total_amount' => $total,
                'shipping_cost' => $total > 500 ? 0 : 25,
                'final_total' => $total + ($total > 500 ? 0 : 25),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Check stock availability based on stock_status
        $isAvailable = false;
        if ($product->stock_status === 'out_of_stock') {
            // For out_of_stock, product is not available regardless of stock quantity
            $isAvailable = false;
        } elseif ($product->stock_status === 'in_stock' || $product->stock_status === 'on_backorder') {
            // For in_stock or on_backorder, allow purchase regardless of stock quantity (can go negative)
            $isAvailable = true;
        } elseif ($product->stock_status === 'stock_based') {
            // For stock_based, check if stock_quantity is sufficient
            $isAvailable = $product->stock_quantity >= $validated['quantity'];
        } else {
            // Default: not available
            $isAvailable = false;
        }

        if (!$isAvailable) {
            return response()->json([
                'message' => 'Product is out of stock or insufficient quantity'
            ], 400);
        }

        $query = Cart::where('product_id', $validated['product_id']);

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $existingItem = $query->first();

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $validated['quantity'],
                'price' => $product->price,
            ]);
            $cartItem = $existingItem;
        } else {
            $cartItem = Cart::create([
                'user_id' => Auth::id(),
                'session_id' => Auth::check() ? null : $request->session()->getId(),
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $product->price,
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart successfully',
            'data' => new CartResource($cartItem->load(['product.category', 'product.brand', 'product.images']))
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cart $cart): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // Check if user can update this cart item
        if (Auth::check() && $cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Auth::check() && $cart->session_id !== $request->session()->getId()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check stock availability based on stock_status
        $isAvailable = false;
        if ($cart->product->stock_status === 'out_of_stock') {
            // For out_of_stock, product is not available regardless of stock quantity
            $isAvailable = false;
        } elseif ($cart->product->stock_status === 'in_stock' || $cart->product->stock_status === 'on_backorder') {
            // For in_stock or on_backorder, allow purchase regardless of stock quantity (can go negative)
            $isAvailable = true;
        } elseif ($cart->product->stock_status === 'stock_based') {
            // For stock_based, check if stock_quantity is sufficient
            $isAvailable = $cart->product->stock_quantity >= $validated['quantity'];
        } else {
            // Default: not available
            $isAvailable = false;
        }

        if (!$isAvailable) {
            return response()->json([
                'message' => 'Product is out of stock or insufficient quantity'
            ], 400);
        }

        $cart->update([
            'quantity' => $validated['quantity'],
            'price' => $cart->product->price,
        ]);

        return response()->json([
            'message' => 'Cart item updated successfully',
            'data' => new CartResource($cart->load(['product.category', 'product.brand', 'product.images']))
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cart $cart, Request $request): JsonResponse
    {
        // Check if user can delete this cart item
        if (Auth::check() && $cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!Auth::check() && $cart->session_id !== $request->session()->getId()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cart->delete();

        return response()->json([
            'message' => 'Cart item removed successfully'
        ]);
    }

    /**
     * Clear all cart items
     */
    public function clear(Request $request): JsonResponse
    {
        $query = Cart::query();

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $query->delete();

        return response()->json([
            'message' => 'Cart cleared successfully'
        ]);
    }

    /**
     * Get cart summary
     */
    public function summary(Request $request): JsonResponse
    {
        $query = Cart::with('product');

        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $cartItems = $query->get();
        $total = $cartItems->sum('total');
        $shippingCost = $total > 500 ? 0 : 25;

        return response()->json([
            'data' => [
                'total_items' => $cartItems->count(),
                'total_amount' => $total,
                'shipping_cost' => $shippingCost,
                'final_total' => $total + $shippingCost,
            ]
        ]);
    }
}
