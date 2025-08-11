import { Link } from "react-router-dom";
import { CheckCircle, Home, Package, Phone } from "lucide-react";
import Header from "../components/Header";

const OrderSuccess = () => {
  const orderNumber = `ORD-${Date.now()}`;

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="w-24 h-24 text-brand-green mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">تم تأكيد طلبك بنجاح!</h1>
            <p className="text-lg text-gray-600">شكراً لك على التسوق معنا</p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Package className="w-6 h-6 text-brand-blue" />
              <h2 className="text-xl font-semibold">تفاصيل الطلب</h2>
            </div>

            <div className="space-y-4 text-right">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">رقم الطلب:</span>
                <span className="text-brand-blue font-mono">{orderNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">طريقة الدفع:</span>
                <span>الدفع عند الاستلام</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">موعد التوصيل المتوقع:</span>
                <span>2-3 أيام عمل</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">حالة الطلب:</span>
                <span className="text-brand-orange">قيد التحضير</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-brand-yellow bg-opacity-20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-brand-blue mb-4">الخطوات التالية</h3>
            <div className="space-y-3 text-right">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <div className="font-medium">تحضير الطلب</div>
                  <div className="text-sm text-gray-600">سنقوم بتحضير طلبك وتعبئته بعناية</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <div className="font-medium">الشحن</div>
                  <div className="text-sm text-gray-600">سيتم شحن طلبك خلال 24 ساعة</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <div className="font-medium">التوصيل</div>
                  <div className="text-sm text-gray-600">سيصلك الطلب في العنوان المحدد خلال 2-3 أيام</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Phone className="w-8 h-8 text-brand-blue mx-auto mb-3" />
              <h3 className="font-semibold mb-2">تواصل معنا</h3>
              <p className="text-sm text-gray-600 mb-3">
                لأي استفسارات حول طلبك
              </p>
              <p className="font-semibold text-brand-blue">+966 11 234 5678</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <Package className="w-8 h-8 text-brand-blue mx-auto mb-3" />
              <h3 className="font-semibold mb-2">تتبع الطلب</h3>
              <p className="text-sm text-gray-600 mb-3">
                تابع حالة طلبك أول بأول
              </p>
              <button className="text-brand-blue hover:text-brand-orange transition-colors font-semibold">
                تتبع الطلب
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Link>
            <Link
              to="/products"
              className="border border-brand-blue text-brand-blue px-8 py-3 rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
            >
              متابعة التسوق
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="mt-12 p-6 bg-gradient-to-l from-brand-blue to-brand-green text-white rounded-lg">
            <h3 className="text-xl font-bold mb-2">شكراً لثقتك بنا!</h3>
            <p>
              نقدر اختيارك لمتجر الكهربائيات ونتطلع لخدمتك مرة أخرى
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
