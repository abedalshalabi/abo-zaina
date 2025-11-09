import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Heart, User, ShoppingCart, Menu } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";

interface HeaderProps {
  showSearch?: boolean;
  showActions?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonLink?: string;
  title?: string;
  subtitle?: string;
}

interface HeaderSettings {
  header_phone?: string;
  header_email?: string;
  header_welcome_text?: string;
  header_logo?: string;
  header_title?: string;
  header_subtitle?: string;
  header_search_placeholder?: string;
  header_menu_items?: {
    main_pages?: Array<{ title: string; link: string }>;
    customer_service?: Array<{ title: string; link: string }>;
    account?: Array<{ title: string; link: string }>;
  };
}

const Header = ({ 
  showSearch = false, 
  showActions = false, 
  showBackButton = false,
  backButtonText = "العودة للرئيسية",
  backButtonLink = "/",
  title,
  subtitle
}: HeaderProps) => {
  const { state } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<HeaderSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getSettings('header');
      if (response && response.data) {
        setSettings(response.data);
      } else if (response) {
        // If response is the data directly
        setSettings(response);
      }
    } catch (error) {
      console.error("Error loading header settings:", error);
      // Use default values if API fails
      setSettings({
        header_phone: "966+ 11 456 7890",
        header_email: "info@abu-zaina.com",
        header_welcome_text: "مرحباً بكم في أبو زينة للتقنيات",
        header_logo: "https://cdn.builder.io/api/v1/image/assets%2F771ae719ebd54c27bd1a3d83e2201d6c%2Ff677e03217fa4fb894a0ecba683c6cb5?format=webp&width=800",
        header_title: "أبو زينة للتقنيات",
        header_subtitle: "عالم التكنولوجيا والأجهزة الكهربائية",
        header_search_placeholder: "ابحث عن المنتجات والعلامات التجارية...",
        header_menu_items: {
          main_pages: [
            { title: "الرئيسية", link: "/" },
            { title: "المنتجات", link: "/products" },
            { title: "العروض", link: "/offers" },
          ],
          customer_service: [
            { title: "من نحن", link: "/about" },
            { title: "اتصل بنا", link: "/contact" },
            { title: "الشحن والتوصيل", link: "/shipping" },
            { title: "الإرجاع والاستبدال", link: "/returns" },
            { title: "الضمان", link: "/warranty" },
          ],
          account: [
            { title: "تسجيل الدخول", link: "/login" },
            { title: "إنشاء حساب", link: "/register" },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Header */}
      <div className="bg-blue-50 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4 text-gray-600">
              <span className="text-xs sm:text-sm">📞 {settings.header_phone || "966+ 11 456 7890"}</span>
              <span className="hidden sm:inline text-xs sm:text-sm">✉️ {settings.header_email || "info@abu-zaina.com"}</span>
            </div>
            <div className="text-gray-600 text-xs sm:text-sm hidden xs:block">
              {settings.header_welcome_text || "مرحباً بكم في أبو زينة للتقنيات"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Back Button or Logo */}
          {showBackButton ? (
            <Link 
              to={backButtonLink} 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="hidden sm:inline">{backButtonText}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 sm:gap-4">
                <img 
                  src={settings.header_logo || "https://cdn.builder.io/api/v1/image/assets%2F771ae719ebd54c27bd1a3d83e2201d6c%2Ff677e03217fa4fb894a0ecba683c6cb5?format=webp&width=800"} 
                  alt={settings.header_title || "أبو زينة للتقنيات"}
                  className="h-10 sm:h-12 w-auto"
                />
                <div className="hidden md:block">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                    {title || settings.header_title || "أبو زينة للتقنيات"}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-600">
                    {subtitle || settings.header_subtitle || "عالم التكنولوجيا والأجهزة الكهربائية"}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Logo for back button pages */}
          {showBackButton && (
            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img 
                src={settings.header_logo || "https://cdn.builder.io/api/v1/image/assets%2F771ae719ebd54c27bd1a3d83e2201d6c%2Ff677e03217fa4fb894a0ecba683c6cb5?format=webp&width=800"} 
                alt={settings.header_title || "أبو زينة للتقنيات"}
                className="h-10 sm:h-12 w-auto"
              />
              <div className="hidden md:block">
                <div className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                  {title || settings.header_title || "أبو زينة للتقنيات"}
                </div>
                <div className="text-xs sm:text-sm text-blue-600">
                  {subtitle || settings.header_subtitle || "عالم التكنولوجيا"}
                </div>
              </div>
            </Link>
          )}

          {/* Search Bar */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-1 sm:mx-2 md:mx-4 lg:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={settings.header_search_placeholder || "ابحث عن المنتجات والعلامات التجارية..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
                />
                <button type="submit" className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </form>
          )}

          {/* Header Actions */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              <button className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-100 rounded-full transition-colors relative hidden sm:flex">
                <Heart className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600" />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 flex items-center justify-center">
                  0
                </span>
              </button>
              
              <button className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex">
                <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600" />
              </button>
              
              <Link to="/cart" className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-100 rounded-full transition-colors relative" data-cart-icon>
                <ShoppingCart className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 sm:p-2.5 md:p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && showActions && (
        <div className="bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Pages */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">الصفحات الرئيسية</h3>
                <div className="space-y-2">
                  {(settings.header_menu_items?.main_pages || [
                    { title: "الرئيسية", link: "/" },
                    { title: "المنتجات", link: "/products" },
                    { title: "العروض", link: "/offers" },
                  ]).map((item, index) => (
                    <Link key={index} to={item.link} className="block text-gray-600 hover:text-blue-600 transition-colors">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Customer Service */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">خدمة العملاء</h3>
                <div className="space-y-2">
                  {(settings.header_menu_items?.customer_service || [
                    { title: "من نحن", link: "/about" },
                    { title: "اتصل بنا", link: "/contact" },
                    { title: "الشحن والتوصيل", link: "/shipping" },
                    { title: "الإرجاع والاستبدال", link: "/returns" },
                    { title: "الضمان", link: "/warranty" },
                  ]).map((item, index) => (
                    <Link key={index} to={item.link} className="block text-gray-600 hover:text-blue-600 transition-colors">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Account */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">الحساب</h3>
                <div className="space-y-2">
                  {(settings.header_menu_items?.account || [
                    { title: "تسجيل الدخول", link: "/login" },
                    { title: "إنشاء حساب", link: "/register" },
                  ]).map((item, index) => (
                    <Link key={index} to={item.link} className="block text-gray-600 hover:text-blue-600 transition-colors">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
