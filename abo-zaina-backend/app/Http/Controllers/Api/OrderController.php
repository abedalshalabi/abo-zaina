<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_city' => 'required|string|max:100',
            'customer_district' => 'required|string|max:100',
            'customer_street' => 'required|string|max:255',
            'customer_building' => 'required|string|max:100',
            'customer_additional_info' => 'nullable|string',
            'payment_method' => 'required|in:cod,credit_card,paypal',
            'notes' => 'nullable|string',
        ]);

        // Get cart items
        $query = Cart::with('product');
        
        if (Auth::check()) {
            $query->where('user_id', Auth::id());
        } else {
            $query->where('session_id', $request->session()->getId());
        }

        $cartItems = $query->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        // Check stock availability
        foreach ($cartItems as $item) {
            if (!$item->product->in_stock || $item->product->stock_quantity < $item->quantity) {
                return response()->json([
                    'message' => "Product {$item->product->name} is out of stock or insufficient quantity"
                ], 400);
            }
        }

        DB::beginTransaction();

        try {
            // Create order
            $order = Order::create([
                'user_id' => Auth::id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'customer_city' => $validated['customer_city'],
                'customer_district' => $validated['customer_district'],
                'customer_street' => $validated['customer_street'],
                'customer_building' => $validated['customer_building'],
                'customer_additional_info' => $validated['customer_additional_info'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'],
                'subtotal' => $cartItems->sum('total'),
                'shipping_cost' => $cartItems->sum('total') > 500 ? 0 : 25,
                'total' => $cartItems->sum('total') + ($cartItems->sum('total') > 500 ? 0 : 25),
                'order_status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Create order items and update stock
            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_sku' => $item->product->sku,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'total' => $item->total,
                ]);

                // Update product stock
                $item->product->decrement('stock_quantity', $item->quantity);
                $item->product->increment('sales_count', $item->quantity);
            }

            // Clear cart
            $query->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'data' => new OrderResource($order->load('items.product'))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order): JsonResponse
    {
        // Check if user can view this order
        if (Auth::check() && $order->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => new OrderResource($order->load('items.product'))
        ]);
    }

    /**
     * Get user orders
     */
    public function userOrders(Request $request): JsonResponse
    {
        $orders = Order::with('items.product')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(15);

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
     * Update order status (admin only)
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'order_status' => 'sometimes|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded',
            'notes' => 'nullable|string',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => new OrderResource($order->load('items.product'))
        ]);
    }
}
