import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, Zap, Shield, Clock } from "lucide-react";
import Header from "../components/Header";

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "الجودة والتميز",
      description: "نلتزم بتقديم أفضل المنتجات والخدمات لعملائنا الكرام"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "رضا العملاء",
      description: "رضاكم هو هدفنا الأول ونسعى دائماً لتجاوز توقعاتكم"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "الابتكار والتطوير",
      description: "نواكب أحدث التقنيات ونقدم الحلول المبتكرة"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "الثقة والأمان",
      description: "نبني علاقات طويلة الأمد مع عملائنا على أساس الثقة"
    }
  ];

  const team = [
    {
      name: "أحمد أبو زينة",
      position: "المؤسس والرئيس التنفيذي",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      description: "خبرة تزيد عن 20 عاماً في مجال التقنيات والأجهزة الكهربائية"
    },
    {
      name: "فاطمة السالم",
      position: "مديرة المبيعات",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      description: "متخصصة في خدمة العملاء وإدارة المبيعات لأكثر من 15 عاماً"
    },
    {
      name: "محمد العتيبي",
      position: "مدير التقنيات",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      description: "خبير في أحدث التقنيات والحلول الذكية للمنازل والمكاتب"
    },
    {
      name: "نورا الخالد",
      position: "مديرة خدمة العملاء",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
      description: "متخصصة في تقديم أفضل تجربة عملاء وحل المشاكل التقنية"
    }
  ];

  const achievements = [
    {
      number: "50,000+",
      label: "عميل راضٍ",
      icon: <Users className="w-8 h-8 text-blue-600" />
    },
    {
      number: "15+",
      label: "سنة خبرة",
      icon: <Clock className="w-8 h-8 text-green-600" />
    },
    {
      number: "1000+",
      label: "منتج متنوع",
      icon: <Award className="w-8 h-8 text-yellow-600" />
    },
    {
      number: "99%",
      label: "معدل الرضا",
      icon: <Heart className="w-8 h-8 text-red-600" />
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
          <h1 className="text-5xl font-bold mb-6">من نحن</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            نحن شركة رائدة في مجال الأجهزة الكهربائية والإلكترونية، نسعى لتقديم أفضل المنتجات والخدمات لعملائنا في فلسطين
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">قصتنا</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  بدأت رحلتنا في عام 2009 برؤية واضحة: جعل التكنولوجيا الحديثة في متناول الجميع. 
                  انطلقنا من متجر صغير في جنين بحلم كبير وإيمان راسخ بأن الجودة والخدمة المتميزة 
                  هما مفتاح النجاح.
                </p>
                <p>
                  على مدار السنوات، نمت شركتنا لتصبح واحدة من أبرز الأسماء في مجال الأجهزة 
                  الكهربائية والإلكترونية في فلسطين. نفخر بخدمة أكثر من 50,000 عميل راضٍ 
                  وتقديم أكثر من 1000 منتج متنوع من أفضل العلامات التجارية العالمية.
                </p>
                <p>
                  اليوم، نواصل رحلتنا بنفس الشغف والالتزام، مع التركيز على الابتكار والتطوير 
                  المستمر لخدماتنا ومنتجاتنا لنلبي احتياجات عملائنا المتطورة.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop" 
                alt="قصة أبو زينة للتقنيات"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm">سنة من التميز</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">قيمنا ومبادئنا</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نؤمن بمجموعة من القيم الأساسية التي توجه عملنا وتحدد هويتنا
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">إنجازاتنا بالأرقام</h2>
            <p className="text-xl text-blue-200">
              أرقام تعكس ثقة عملائنا وتميزنا في السوق
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white bg-opacity-20 rounded-full">
                    {achievement.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">{achievement.number}</div>
                <div className="text-blue-200">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">فريق العمل</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نفخر بفريق من الخبراء والمتخصصين الذين يعملون بشغف لخدمتكم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-center lg:text-right">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">رسالتنا</h3>
              <p className="text-blue-200 leading-relaxed">
                تقديم أفضل الأجهزة الكهربائية والإلكترونية بجودة عالية وأسعار تنافسية، 
                مع خدمة عملاء متميزة تضمن رضا وثقة عملائنا الكرام.
              </p>
            </div>
            <div className="text-center lg:text-right">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">رؤيتنا</h3>
              <p className="text-blue-200 leading-relaxed">
                أن نكون الخيار الأول والأفضل في فلسطين لكل من يبحث 
                عن الأجهزة الكهربائية والإلكترونية الحديثة والموثوقة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">انضم إلى عائلة أبو زينة للتقنيات</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            اكتشف مجموعتنا الواسعة من المنتجات واستمتع بتجربة تسوق فريدة
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-4 rounded-full hover:bg-blue-700 transition-colors font-semibold"
            >
              تسوق الآن
            </Link>
            <Link
              to="/contact"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full hover:bg-blue-600 hover:text-white transition-colors font-semibold"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;