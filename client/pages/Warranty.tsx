import { Link } from "react-router-dom";
import { Shield, Clock, CheckCircle, Settings, Phone, FileText, AlertTriangle, Award, Wrench, Zap } from "lucide-react";
import Header from "../components/Header";

const Warranty = () => {
  const warrantyTypes = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "ضمان الشركة المصنعة",
      duration: "حسب نوع المنتج",
      coverage: "عيوب التصنيع والمواد",
      description: "ضمان أصلي من الشركة المصنعة يغطي جميع عيوب التصنيع",
      features: ["إصلاح مجاني", "استبدال القطع", "دعم فني متخصص"]
    },
    {
      icon: <Award className="w-8 h-8 text-gold-600" />,
      title: "ضمان أبو زينة الممتد",
      duration: "سنة إضافية",
      coverage: "تغطية شاملة",
      description: "ضمان إضافي من أبو زينة للتقنيات يمتد لسنة كاملة",
      features: ["خدمة منزلية", "صيانة دورية", "استشارة فنية"]
    },
    {
      icon: <Wrench className="w-8 h-8 text-green-600" />,
      title: "ضمان التركيب",
      duration: "6 أشهر",
      coverage: "أخطاء التركيب",
      description: "ضمان خاص على خدمة التركيب والتشغيل الأولي",
      features: ["إعادة تركيب", "ضبط الإعدادات", "تدريب الاستخدام"]
    }
  ];

  const warrantyPeriods = [
    {
      category: "الأجهزة الكبيرة",
      items: ["الثلاجات", "الغسالات", "المكيفات", "الأفران"],
      period: "2-5 سنوات",
      color: "bg-blue-100 text-blue-800"
    },
    {
      category: "الأجهزة الصغيرة",
      items: ["الخلاطات", "المكانس", "أجهزة القهوة", "المكاوي"],
      period: "1-2 سنة",
      color: "bg-green-100 text-green-800"
    },
    {
      category: "الإلكترونيات",
      items: ["التلفزيونات", "أجهزة الصوت", "الحاسوب", "الهواتف"],
      period: "1-3 سنوات",
      color: "bg-purple-100 text-purple-800"
    },
    {
      category: "الإكسسوارات",
      items: ["الكابلات", "الشواحن", "السماعات", "الحقائب"],
      period: "6 أشهر - 1 سنة",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  const warrantyProcess = [
    {
      step: 1,
      title: "الإبلاغ عن المشكلة",
      description: "تواصل معنا عبر الهاتف أو الموقع الإلكتروني",
      icon: <Phone className="w-6 h-6" />
    },
    {
      step: 2,
      title: "التشخيص الأولي",
      description: "نقوم بتشخيص المشكلة وتحديد نوع الخدمة المطلوبة",
      icon: <Settings className="w-6 h-6" />
    },
    {
      step: 3,
      title: "جدولة الخدمة",
      description: "نحدد موعد مناسب للصيانة أو الاستبدال",
      icon: <Clock className="w-6 h-6" />
    },
    {
      step: 4,
      title: "تنفيذ الخدمة",
      description: "نقوم بالإصلاح أو الاستبدال حسب شروط الضمان",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const warrantyConditions = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "الاحتفاظ بالفاتورة",
      description: "يجب الاحتفاظ بالفاتورة الأصلية كإثبات للشراء",
      important: true
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "الاستخدام الصحيح",
      description: "يجب استخدام المنتج وفقاً لتعليمات الشركة المصنعة",
      important: true
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "عدم التلاعب",
      description: "عدم فتح أو إصلاح المنتج من قبل أشخاص غير مخولين",
      important: true
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-600" />,
      title: "الإبلاغ المبكر",
      description: "الإبلاغ عن المشاكل فور اكتشافها وعدم التأخير",
      important: false
    }
  ];

  const excludedItems = [
    "الأضرار الناتجة عن سوء الاستخدام أو الإهمال",
    "الأضرار الناتجة عن الكوارث الطبيعية",
    "البلى الطبيعي والاستهلاك العادي",
    "الأضرار الناتجة عن التيار الكهربائي غير المستقر",
    "الخدش أو الكسر الناتج عن الحوادث",
    "الأضرار الناتجة عن استخدام قطع غيار غير أصلية"
  ];

  const services = [
    {
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      title: "صيانة منزلية",
      description: "نأتي إلى منزلك لإصلاح الأجهزة الكبيرة",
      availability: "متاح في المدن الرئيسية"
    },
    {
      icon: <Settings className="w-8 h-8 text-green-600" />,
      title: "مركز الصيانة",
      description: "أحضر جهازك إلى مركز الصيانة المعتمد",
      availability: "متاح في جميع الفروع"
    },
    {
      icon: <Phone className="w-8 h-8 text-purple-600" />,
      title: "دعم فني هاتفي",
      description: "احصل على مساعدة فنية عبر الهاتف",
      availability: "24/7 متاح"
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-red-600" />,
      title: "استبدال فوري",
      description: "استبدال المنتج في حالة العيوب الجوهرية",
      availability: "حسب توفر المخزون"
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
          <h1 className="text-5xl font-bold mb-6">سياسة الضمان</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            نقدم ضمان شامل على جميع منتجاتنا لضمان راحة بالكم وثقتكم في مشترياتكم
          </p>
        </div>
      </section>

      {/* Warranty Types */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">أنواع الضمان</h2>
            <p className="text-xl text-gray-600">نقدم عدة أنواع من الضمان لحماية استثماركم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {warrantyTypes.map((warranty, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {warranty.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{warranty.title}</h3>
                  <div className="text-lg text-blue-600 font-semibold mb-1">{warranty.duration}</div>
                  <div className="text-sm text-green-600">{warranty.coverage}</div>
                </div>
                
                <p className="text-gray-600 text-center mb-6">{warranty.description}</p>
                
                <div className="space-y-3">
                  {warranty.features.map((feature, idx) => (
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

      {/* Warranty Periods */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">فترات الضمان</h2>
            <p className="text-xl text-gray-600">فترات الضمان حسب نوع المنتج</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {warrantyPeriods.map((period, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${period.color}`}>
                  {period.period}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{period.category}</h3>
                <div className="space-y-2">
                  {period.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">إجراءات الضمان</h2>
            <p className="text-xl text-gray-600">خطوات بسيطة للحصول على خدمة الضمان</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {warrantyProcess.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  {index < warrantyProcess.length - 1 && (
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

      {/* Warranty Conditions */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">شروط الضمان</h2>
            <p className="text-xl text-gray-600">يجب استيفاء الشروط التالية للاستفادة من الضمان</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {warrantyConditions.map((condition, index) => (
              <div key={index} className={`p-8 rounded-2xl ${condition.important ? 'bg-red-50 border-2 border-red-200' : 'bg-white'} hover:shadow-lg transition-all duration-300`}>
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

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">خدمات الضمان</h2>
            <p className="text-xl text-gray-600">نقدم خدمات متنوعة لضمان راحتكم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-3">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3 text-center">{service.description}</p>
                <div className="text-center">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                    {service.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Excluded Items */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">ما لا يشمله الضمان</h2>
            <p className="text-xl text-gray-600">الحالات التي لا يغطيها الضمان</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="space-y-4">
                {excludedItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
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
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">تسجيل الضمان</h3>
                  <p className="text-blue-700">يُنصح بتسجيل المنتج لدى الشركة المصنعة لضمان أفضل خدمة.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-green-800 mb-2">الصيانة الدورية</h3>
                  <p className="text-green-700">الصيانة الدورية تساعد في الحفاظ على الضمان وإطالة عمر المنتج.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">انتهاء الضمان</h3>
                  <p className="text-yellow-700">بعد انتهاء الضمان، نقدم خدمات الصيانة بأسعار تفضيلية لعملائنا.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">تحتاج خدمة ضمان؟</h2>
          <p className="text-xl text-blue-200 mb-8">
            تواصل معنا الآن للحصول على خدمة الضمان
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

export default Warranty;