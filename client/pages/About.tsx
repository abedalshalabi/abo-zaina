import { Link } from "react-router-dom";
import { Users, Target, Award, Heart, Zap, Shield, Clock } from "lucide-react";
import Header from "../components/Header";
import SEO from "../components/SEO";
import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";

interface AboutSettings {
  about_hero_title?: string;
  about_hero_description?: string;
  about_story_title?: string;
  about_story_content?: {
    title: string;
    description: string;
    image: string;
  };
  about_values?: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  about_achievements?: Array<{
    number: string;
    label: string;
  }>;
  about_team?: Array<{
    name: string;
    position: string;
    description: string;
    image: string;
  }>;
}

const iconMap: { [key: string]: any } = {
  target: Target,
  heart: Heart,
  zap: Zap,
  shield: Shield,
};

const About = () => {
  const [settings, setSettings] = useState<AboutSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings('about');
      if (response && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error loading about settings:", error);
      // Use default values
      setSettings({
        about_hero_title: "من نحن",
        about_hero_description: "نحن شركة رائدة في مجال الأجهزة الكهربائية والإلكترونية، نسعى لتقديم أفضل المنتجات والخدمات لعملائنا في فلسطين",
        about_story_title: "قصتنا",
        about_story_content: {
          title: "قصتنا",
          description: "بدأت رحلتنا في عام 2010 بهدف واحد: تقديم أفضل التقنيات والأجهزة الكهربائية لعملائنا في فلسطين.",
          image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
        },
        about_values: [
          { title: "الجودة والتميز", description: "نلتزم بتقديم أفضل المنتجات والخدمات لعملائنا الكرام", icon: "target" },
          { title: "رضا العملاء", description: "رضاكم هو هدفنا الأول ونسعى دائماً لتجاوز توقعاتكم", icon: "heart" },
          { title: "الابتكار والتطوير", description: "نواكب أحدث التقنيات ونقدم الحلول المبتكرة", icon: "zap" },
          { title: "الثقة والأمان", description: "نبني علاقات طويلة الأمد مع عملائنا على أساس الثقة", icon: "shield" }
        ],
        about_achievements: [
          { number: "50,000+", label: "عميل راضٍ" },
          { number: "15+", label: "سنة خبرة" },
          { number: "1000+", label: "منتج متنوع" },
          { number: "99%", label: "معدل الرضا" }
        ],
        about_team: [
          {
            name: "أحمد أبو زينة",
            position: "المؤسس والرئيس التنفيذي",
            description: "خبرة تزيد عن 20 عاماً في مجال التقنيات والأجهزة الكهربائية",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header showSearch={true} showActions={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const values = settings.about_values || [];
  const achievements = settings.about_achievements || [];
  const team = settings.about_team || [];
  const story = settings.about_story_content || { title: "قصتنا", description: "", image: "" };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "من نحن - أبو زينة للتقنيات",
    "description": settings.about_hero_description || "تعرف على قصة أبو زينة للتقنيات وقيمنا ومبادئنا",
    "url": `${siteUrl}/about`
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <SEO
        title="من نحن - أبو زينة للتقنيات"
        description={settings.about_hero_description || "تعرف على قصة أبو زينة للتقنيات، رؤيتنا، قيمنا، وفريقنا المتميز"}
        keywords="من نحن, أبو زينة, قصة الشركة, فريق العمل, رؤية الشركة"
        structuredData={structuredData}
      />
      <Header 
        showSearch={true}
        showActions={true}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{settings.about_hero_title || "من نحن"}</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            {settings.about_hero_description || "نحن شركة رائدة في مجال الأجهزة الكهربائية والإلكترونية"}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">{story.title || "قصتنا"}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {story.description || "بدأت رحلتنا في عام 2010 بهدف واحد: تقديم أفضل التقنيات والأجهزة الكهربائية لعملائنا في فلسطين."}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                عبر السنوات، نمونا لنتحول من متجر صغير إلى واحدة من أكبر الشركات في مجال التكنولوجيا في المنطقة. نحن نؤمن بأن الجودة والخدمة المتميزة هما أساس النجاح.
              </p>
            </div>
            <div>
              <img 
                src={story.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"} 
                alt="Our Story" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">قيمنا ومبادئنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Target;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="flex justify-center mb-4">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">إنجازاتنا بالأرقام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{achievement.number}</div>
                <div className="text-xl text-gray-700">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      {team.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">فريقنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
