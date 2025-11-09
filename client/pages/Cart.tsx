import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";

const Cart = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();

  const shippingCost = state.total > 500 ? 0 : 25;
  const finalTotal = state.total + shippingCost;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header 
          showSearch={true}
          showActions={true}
        />

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">السلة فارغة</h1>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
            <Link
              to="/products"
              className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              تسوق الآن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">سلة التسوق</h1>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح السلة
                </button>
              </div>

              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                        <p className="text-lg font-bold text-brand-green">{item.price} ₪</p>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 rounded-r-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 border-r border-l border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 rounded-l-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-left mt-3 pt-3 border-t border-gray-200">
                      <span className="font-semibold">المجموع: {item.price * item.quantity} ₪</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{state.total} شيكل</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span className={shippingCost === 0 ? "text-brand-green" : ""}>
                    {shippingCost === 0 ? "مجاني" : `${shippingCost} شيكل`}
                  </span>
                </div>
                {state.total <= 500 && (
                  <p className="text-sm text-brand-orange">
                    أضف {500 - state.total} شيكل أكثر للحصول على شحن مجاني
                  </p>
                )}
                <div className="border-t pt-3 font-bold text-lg flex justify-between">
                  <span>المجموع الكلي</span>
                  <span className="text-brand-green">{finalTotal} شيكل</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-brand-blue text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-center block font-semibold"
                >
                  إتمام الطلب
                </Link>
                <Link
                  to="/products"
                  className="w-full border border-brand-blue text-brand-blue py-3 rounded-lg hover:bg-brand-blue hover:text-white transition-colors text-center block"
                >
                  متابعة التسوق
                </Link>
              </div>

              {/* Cash on Delivery Notice */}
              <div className="mt-6 p-4 bg-brand-yellow bg-opacity-20 rounded-lg">
                <h3 className="font-semibold text-brand-blue mb-2">الدفع عند الاستلام</h3>
                <p className="text-sm text-gray-700">
                  يمكنك الدفع نقداً عند استلام طلبك في المنزل
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
