import { Link } from "react-router-dom";
import { Truck, Clock, MapPin, Package, Shield, CheckCircle, AlertCircle, Info } from "lucide-react";
import Header from "../components/Header";

const Shipping = () => {
  const shippingOptions = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "التوصيل العادي",
      duration: "3-5 أيام عمل",
      cost: "مجاني للطلبات أكثر من 500 شيكل",
      description: "خدمة التوصيل العادية لجميع أنحاء فلسطين",
      features: ["تتبع الشحنة", "التأمين الأساسي", "التوصيل للمنزل"]
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "التوصيل السريع",
      duration: "1-2 أيام عمل",
      cost: "50 شيكل إضافي",
      description: "خدمة التوصيل السريع للمدن الرئيسية",
      features: ["تتبع مباشر", "تأمين شامل", "أولوية في التوصيل"]
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      title: "التوصيل في نفس اليوم",
      duration: "خلال 6 ساعات",
      cost: "100 شيكل إضافي",
      description: "متاح في جنين والمدن المجاورة فقط",
      features: ["تتبع لحظي", "تأمين كامل", "خدمة VIP"]
    }
  ];

  const cities = [
    {
      name: "جنين",
      duration: "1-2 أيام",
      cost: "مجاني",
      sameDay: true
    },
    {
      name: "نابلس",
      duration: "2-3 أيام",
      cost: "مجاني",
      sameDay: true
    },
    {
      name: "طولكرم",
      duration: "2-3 أيام",
      cost: "مجاني",
      sameDay: true
    },
    {
      name: "رام الله",
      duration: "2-3 أيام",
      cost: "مجاني",
      sameDay: false
    },
    {
      name: "المدينة المنورة",
      duration: "3-4 أيام",
      cost: "مجاني",
      sameDay: false
    },
    {
      name: "الطائف",
      duration: "3-4 أيام",
      cost: "مجاني",
      sameDay: false
    },
    {
      name: "أبها",
      duration: "4-5 أيام",
      cost: "مجاني",
      sameDay: false
    },
    {
      name: "تبوك",
      duration: "4-5 أيام",
      cost: "مجاني",
      sameDay: false
    }
  ];

  const shippingSteps = [
    {
      step: 1,
      title: "تأكيد الطلب",
      description: "نراجع طلبك ونتأكد من توفر المنتجات",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: 2,
      title: "التحضير والتغليف",
      description: "نحضر منتجاتك ونغلفها بعناية فائقة",
      icon: <Package className="w-6 h-6" />
    },
    {
      step: 3,
      title: "الشحن",
      description: "نرسل الطلب مع شركة الشحن المختارة",
      icon: <Truck className="w-6 h-6" />
    },
    {
      step: 4,
      title: "التسليم",
      description: "يصلك الطلب في الموعد المحدد",
      icon: <MapPin className="w-6 h-6" />
    }
  ];

  const policies = [
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "ضمان الوصول الآمن",
      description: "نضمن وصول منتجاتك بحالة ممتازة أو نستبدلها مجاناً"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      title: "التسليم في الوقت المحدد",
      description: "نلتزم بمواعيد التسليم المحددة أو نقدم تعويض"
    },
    {
      icon: <Package className="w-6 h-6 text-purple-600" />,
      title: "تغليف احترافي",
      description: "نستخدم مواد تغليف عالية الجودة لحماية منتجاتك"
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      title: "تتبع مباشر",
      description: "تابع شحنتك لحظة بلحظة عبر رقم التتبع"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">سياسة الشحن والتوصيل</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            نقدم خدمات شحن وتوصيل متنوعة لضمان وصول منتجاتك بأمان وفي الوقت المناسب
          </p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">خيارات الشحن</h2>
            <p className="text-xl text-gray-600">اختر الخيار الأنسب لك</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {option.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{option.title}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{option.duration}</div>
                  <div className="text-lg text-green-600 font-semibold">{option.cost}</div>
                </div>
                
                <p className="text-gray-600 text-center mb-6">{option.description}</p>
                
                <div className="space-y-3">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">مراحل الشحن</h2>
            <p className="text-xl text-gray-600">كيف نضمن وصول طلبك بأمان</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {shippingSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < shippingSteps.length - 1 && (
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

      {/* Cities Coverage */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">التغطية الجغرافية</h2>
            <p className="text-xl text-gray-600">نصل إلى جميع مدن فلسطين</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{city.name}</h3>
                  {city.sameDay && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                      نفس اليوم
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{city.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{city.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">ضماناتنا</h2>
            <p className="text-xl text-gray-600">التزامنا تجاه عملائنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map((policy, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {policy.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{policy.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">ملاحظات مهمة</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">شروط الشحن المجاني</h3>
                  <p className="text-blue-700">الشحن مجاني للطلبات التي تزيد قيمتها عن 500 شيكل داخل المدن الرئيسية في فلسطين.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">الأجهزة الكبيرة</h3>
                  <p className="text-yellow-700">الأجهزة الكبيرة مثل الثلاجات والغسالات تحتاج موعد مسبق للتوصيل والتركيب.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-800 mb-2">خدمة التركيب</h3>
                  <p className="text-green-700">نقدم خدمة التركيب المجاني للأجهزة الكبيرة مع ضمان على التركيب لمدة 6 أشهر.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-800 mb-2">المناطق النائية</h3>
                  <p className="text-red-700">قد تحتاج المناطق النائية وقت إضافي للتوصيل (5-7 أيام عمل) مع رسوم شحن إضافية.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل لديك استفسار حول الشحن؟</h2>
          <p className="text-xl text-blue-200 mb-8">
            فريق خدمة العملاء جاهز لمساعدتك في أي وقت
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

export default Shipping;