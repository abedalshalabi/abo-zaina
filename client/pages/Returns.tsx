import { Link } from "react-router-dom";
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, Package, Shield, FileText, Phone } from "lucide-react";
import Header from "../components/Header";

const Returns = () => {
  const returnReasons = [
    {
      icon: <Package className="w-6 h-6 text-blue-600" />,
      title: "المنتج معيب أو تالف",
      description: "إذا وصل المنتج تالفاً أو به عيب تصنيع",
      eligible: true
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-green-600" />,
      title: "عدم الرضا عن المنتج",
      description: "إذا لم يلبي المنتج توقعاتك",
      eligible: true
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      title: "المنتج مختلف عن الوصف",
      description: "إذا كان المنتج مختلفاً عن الوصف في الموقع",
      eligible: true
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      title: "خطأ في الطلب",
      description: "إذا تم إرسال منتج خاطئ",
      eligible: true
    }
  ];

  const returnSteps = [
    {
      step: 1,
      title: "تقديم طلب الإرجاع",
      description: "تواصل معنا خلال 14 يوم من تاريخ الاستلام",
      icon: <Phone className="w-6 h-6" />
    },
    {
      step: 2,
      title: "مراجعة الطلب",
      description: "نراجع طلبك ونرسل تعليمات الإرجاع",
      icon: <FileText className="w-6 h-6" />
    },
    {
      step: 3,
      title: "إرسال المنتج",
      description: "أرسل المنتج في العبوة الأصلية",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: 4,
      title: "الفحص والاسترداد",
      description: "نفحص المنتج ونسترد المبلغ خلال 7 أيام",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const conditions = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "المدة الزمنية",
      description: "يجب تقديم طلب الإرجاع خلال 14 يوم من تاريخ الاستلام",
      important: true
    },
    {
      icon: <Package className="w-6 h-6 text-green-600" />,
      title: "حالة المنتج",
      description: "يجب أن يكون المنتج في حالته الأصلية وغير مستخدم",
      important: true
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      title: "الفاتورة الأصلية",
      description: "يجب الاحتفاظ بالفاتورة الأصلية أو إيصال الشراء",
      important: true
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "العبوة الأصلية",
      description: "يجب إرجاع المنتج في عبوته الأصلية مع جميع الملحقات",
      important: true
    }
  ];

  const nonReturnableItems = [
    "المنتجات المخصصة أو المصنوعة حسب الطلب",
    "المنتجات الصحية والشخصية",
    "البرمجيات والألعاب الرقمية المفتوحة",
    "المنتجات القابلة للتلف أو سريعة الانتهاء",
    "المنتجات المستخدمة أو التالفة بسبب سوء الاستخدام"
  ];

  const refundMethods = [
    {
      method: "البطاقة الائتمانية",
      duration: "3-5 أيام عمل",
      description: "يتم الاسترداد إلى نفس البطاقة المستخدمة في الدفع"
    },
    {
      method: "التحويل البنكي",
      duration: "5-7 أيام عمل",
      description: "يتم التحويل إلى الحساب البنكي المحدد"
    },
    {
      method: "المحفظة الإلكترونية",
      duration: "1-3 أيام عمل",
      description: "يتم الاسترداد إلى المحفظة الإلكترونية المستخدمة"
    },
    {
      method: "رصيد المتجر",
      duration: "فوري",
      description: "يمكن استخدامه في أي عملية شراء مستقبلية"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={false}
        showActions={false}
        showBackButton={true}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">سياسة الإرجاع والاستبدال</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            نحن ملتزمون برضاكم التام. إذا لم تكونوا راضين عن مشترياتكم، يمكنكم إرجاعها أو استبدالها بسهولة
          </p>
        </div>
      </section>

      {/* Return Reasons */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">أسباب الإرجاع المقبولة</h2>
            <p className="text-xl text-gray-600">نقبل الإرجاع في الحالات التالية</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {returnReasons.map((reason, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {reason.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{reason.title}</h3>
                    <p className="text-gray-600 mb-4">{reason.description}</p>
                    {reason.eligible && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-semibold">مؤهل للإرجاع</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">خطوات الإرجاع</h2>
            <p className="text-xl text-gray-600">عملية بسيطة وسريعة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < returnSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 transform translate-x-4"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Conditions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">شروط الإرجاع</h2>
            <p className="text-xl text-gray-600">يجب استيفاء الشروط التالية</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {conditions.map((condition, index) => (
              <div key={index} className={`p-8 rounded-2xl ${condition.important ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'} hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {condition.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{condition.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{condition.description}</p>
                    {condition.important && (
                      <div className="mt-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-semibold text-sm">شرط إجباري</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Non-Returnable Items */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">المنتجات غير القابلة للإرجاع</h2>
            <p className="text-xl text-gray-600">لأسباب صحية وأمنية، لا يمكن إرجاع المنتجات التالية</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-4">
                {nonReturnableItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">طرق الاسترداد</h2>
            <p className="text-xl text-gray-600">نقدم عدة خيارات لاسترداد أموالكم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {refundMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{method.method}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">{method.duration}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">ملاحظات مهمة</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">الاستبدال</h3>
                  <p className="text-blue-700">يمكن استبدال المنتج بآخر من نفس القيمة أو أعلى مع دفع الفرق.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-800 mb-2">الضمان</h3>
                  <p className="text-green-700">المنتجات المعيبة تحت الضمان يتم إصلاحها أو استبدالها مجاناً.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">رسوم الشحن</h3>
                  <p className="text-yellow-700">في حالة الإرجاع بسبب عيب في المنتج، نتحمل رسوم الشحن. في الحالات الأخرى، يتحمل العميل رسوم الإرجاع.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-purple-800 mb-2">الأجهزة الكبيرة</h3>
                  <p className="text-purple-700">الأجهزة الكبيرة مثل الثلاجات والغسالات تحتاج ترتيب موعد مسبق لاستلامها من منزلكم.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">تحتاج مساعدة في الإرجاع؟</h2>
          <p className="text-xl text-blue-200 mb-8">
            فريق خدمة العملاء جاهز لمساعدتك في عملية الإرجاع
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-semibold"
            >
              تواصل معنا
            </Link>
            <a
              href="tel:+966111234567"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-colors font-semibold"
            >
              اتصل الآن
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Returns;