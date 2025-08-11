import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Headphones, Shield } from "lucide-react";
import { useState } from "react";
import Header from "../components/Header";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "الهاتف",
      details: ["+966 11 123 4567", "+966 50 123 4567"],
      color: "text-green-600"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "البريد الإلكتروني",
      details: ["info@abuzaina.com", "support@abuzaina.com"],
      color: "text-blue-600"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "العنوان",
      details: ["شارع الحرية، جنين", "فلسطين"],
      color: "text-red-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "ساعات العمل",
      details: ["السبت - الخميس: 9:00 ص - 10:00 م", "الجمعة: 2:00 م - 10:00 م"],
      color: "text-purple-600"
    }
  ];

  const services = [
    {
      icon: <Headphones className="w-8 h-8 text-blue-600" />,
      title: "دعم فني 24/7",
      description: "فريق الدعم الفني متاح على مدار الساعة لمساعدتك"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "ضمان شامل",
      description: "نقدم ضمان شامل على جميع منتجاتنا وخدماتنا"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
      title: "استشارة مجانية",
      description: "احصل على استشارة مجانية من خبرائنا المتخصصين"
    }
  ];

  const subjects = [
    "استفسار عام",
    "شكوى أو اقتراح",
    "دعم فني",
    "طلب عرض سعر",
    "خدمة ما بعد البيع",
    "شراكة تجارية",
    "أخرى"
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
          <h1 className="text-5xl font-bold mb-6">تواصل معنا</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            نحن هنا لمساعدتك! تواصل معنا في أي وقت وسنكون سعداء للإجابة على استفساراتك وتقديم أفضل الخدمات
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className={`${info.color} mb-4`}>
                  {info.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      موضوع الرسالة *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">اختر موضوع الرسالة</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    الرسالة *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال الرسالة
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">موقعنا</h3>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>خريطة الموقع</p>
                    <p className="text-sm">شارع الحرية، جنين</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">خدماتنا</h3>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{service.title}</h4>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">الأسئلة الشائعة</h2>
            <p className="text-xl text-gray-600">إجابات على أكثر الأسئلة شيوعاً</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">ما هي مدة الضمان على المنتجات؟</h3>
                <p className="text-gray-600 text-sm">نقدم ضمان لمدة سنتين على جميع الأجهزة الكهربائية وسنة واحدة على الإلكترونيات.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">هل تقدمون خدمة التوصيل؟</h3>
                <p className="text-gray-600 text-sm">نعم، نقدم خدمة التوصيل المجاني داخل جنين والمدن الرئيسية في فلسطين.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">كيف يمكنني إرجاع المنتج؟</h3>
                <p className="text-gray-600 text-sm">يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الشراء مع الاحتفاظ بالفاتورة والعبوة الأصلية.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">هل تقدمون خدمة التركيب؟</h3>
                <p className="text-gray-600 text-sm">نعم، نقدم خدمة التركيب المجاني للأجهزة الكبيرة مثل المكيفات والثلاجات.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">ما هي طرق الدفع المتاحة؟</h3>
                <p className="text-gray-600 text-sm">نقبل الدفع نقداً، بالبطاقات الائتمانية، التحويل البنكي، وخدمات الدفع الإلكتروني.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">هل يمكنني الحصول على خصم للكميات؟</h3>
                <p className="text-gray-600 text-sm">نعم، نقدم خصومات خاصة للمشتريات بالجملة والعملاء المؤسسيين.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل تحتاج مساعدة فورية؟</h2>
          <p className="text-xl text-blue-200 mb-8">
            تواصل معنا الآن عبر الهاتف أو الواتساب للحصول على مساعدة فورية
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="tel:+966111234567"
              className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              اتصل الآن
            </a>
            <a
              href="https://wa.me/966501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              واتساب
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;