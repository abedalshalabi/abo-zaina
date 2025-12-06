import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, User, CreditCard, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ordersAPI, citiesAPI } from "../services/api";
import Header from "../components/Header";

interface City {
  id: number;
  name: string;
  name_en?: string;
  shipping_cost: number;
  delivery_time_days: number;
  is_active: boolean;
}

const Checkout = () => {
  const { state, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    street: "",
    building: "",
    additionalInfo: "",
    paymentMethod: "cod",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await citiesAPI.getCities();
        setCities(response.data || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (formData.city && cities.length > 0) {
      const city = cities.find(c => c.name === formData.city);
      setSelectedCity(city || null);
    } else {
      setSelectedCity(null);
    }
  }, [formData.city, cities]);

  // Calculate subtotal from items to ensure accuracy
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = selectedCity ? Number(selectedCity.shipping_cost) : (subtotal > 500 ? 0 : 25);
  const finalTotal = Number(subtotal) + Number(shippingCost);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare order items from cart
      const orderItems = state.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      // Create order
      const response = await ordersAPI.createOrder({
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email || `${formData.phone}@temp.com`,
        customer_phone: formData.phone,
        customer_city: formData.city,
        customer_district: formData.district,
        customer_street: formData.street || undefined,
        customer_building: formData.building || undefined,
        customer_additional_info: formData.additionalInfo || undefined,
        payment_method: formData.paymentMethod,
        items: orderItems,
      });

      // Clear cart and redirect to success page with order data
      clearCart();
      navigate("/order-success", { 
        state: { 
          order: response.data,
          orderNumber: response.data?.order_number 
        } 
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(error.message || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.');
      setIsSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">إتمام الطلب</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  البيانات الشخصية
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأول *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الأخير *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الجوال *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="05xxxxxxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  عنوان التوصيل
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدينة *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled={loadingCities}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{loadingCities ? 'جاري تحميل المدن...' : 'اختر المدينة'}</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.name}>
                          {city.name} {selectedCity?.id === city.id && `(${city.shipping_cost} شيكل - ${city.delivery_time_days} يوم)`}
                        </option>
                      ))}
                    </select>
                    {selectedCity && (
                      <p className="text-sm text-gray-600 mt-1">
                        تكلفة الشحن: {selectedCity.shipping_cost} شيكل | وقت التوصيل: {selectedCity.delivery_time_days} {selectedCity.delivery_time_days === 1 ? 'يوم' : 'أيام'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحي *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الشارع
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم المبنى
                    </label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      معلومات إضافية
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="تفاصيل إضافية لتسهيل الوصول..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  طريقة الدفع
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-brand-yellow bg-brand-yellow bg-opacity-10 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleInputChange}
                      className="ml-3"
                    />
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-brand-blue" />
                      <div>
                        <div className="font-semibold">الدفع عند الاستلام</div>
                        <div className="text-sm text-gray-600">ادفع نقداً عند وصول طلبك</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="ml-3"
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-semibold">البطاقة الائتمانية</div>
                        <div className="text-sm text-gray-600">قريباً...</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-8 sticky top-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">ملخص الطلب</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-8">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-base text-gray-900 mb-2">{item.name}</div>
                        <div className="text-sm text-gray-600">الكمية: {item.quantity}</div>
                        <div className="text-sm text-gray-500 mt-1">السعر الوحدة: {item.price.toLocaleString()} شيكل</div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-bold text-lg text-gray-900">{(item.price * item.quantity).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">شيكل</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-8 border-t pt-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-medium text-gray-700">المجموع الفرعي</span>
                    <span className="text-base font-semibold text-gray-900">{subtotal.toLocaleString()} شيكل</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base font-medium text-gray-700">الشحن</span>
                    <span className={`text-base font-semibold ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}>
                      {shippingCost === 0 ? "مجاني" : `${shippingCost.toLocaleString()} شيكل`}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">المجموع الكلي</span>
                    <span className="text-2xl font-bold text-green-600">{finalTotal.toLocaleString()} شيكل</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-blue text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "جاري إتمام الطلب..." : "تأكيد الطلب"}
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  🔒 بياناتك محمية ومشفرة بأعلى معايير الأمان
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
