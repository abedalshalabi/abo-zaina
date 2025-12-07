import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Heart, User, ShoppingCart, Menu, Package, Grid3x3, Award, Tag } from "lucide-react";
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
  social_media_facebook?: string;
  social_media_twitter?: string;
  social_media_instagram?: string;
  social_media_linkedin?: string;
  social_media_youtube?: string;
  social_media_telegram?: string;
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
      console.log("Header settings response:", response);
      
      // The API returns { data: { header_phone: ..., header_menu_items: ... } }
      if (response && response.data) {
        console.log("Header settings data:", response.data);
        console.log("Header menu items:", response.data.header_menu_items);
        setSettings(response.data);
      } else if (response) {
        // If response is the data directly
        console.log("Header settings (direct):", response);
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
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
      // Clear search input after navigation
      setSearchQuery("");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Header */}
      <div className="bg-blue-50 border-b">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 sm:gap-4 text-gray-600">
              {settings.header_phone && (
                <a href={`tel:${settings.header_phone.replace(/[^0-9+]/g, '')}`} className="text-xs sm:text-sm hover:text-blue-600 transition-colors">
                  <span dir="ltr" className="inline-block">📞 {settings.header_phone}</span>
                </a>
              )}
              {settings.header_email && (
                <a href={`mailto:${settings.header_email}`} className="hidden sm:inline text-xs sm:text-sm hover:text-blue-600 transition-colors">
                  <span dir="ltr" className="inline-block">✉️ {settings.header_email}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-gray-600 text-xs sm:text-sm hidden xs:block">
                {settings.header_welcome_text || "مرحباً بكم في أبو زينة للتقنيات"}
              </div>
              {/* Social Media Links */}
              <div className="flex items-center gap-1 sm:gap-2">
                {settings.social_media_facebook && (
                  <a
                    href={settings.social_media_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                    aria-label="فيسبوك"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M13.5 9H16l.5-3h-3V4.5c0-.86.22-1.5 1.5-1.5H17V0h-2.5C11.57 0 10 1.57 10 4.5V6H8v3h2v9h3.5V9z" />
                    </svg>
                  </a>
                )}
                {settings.social_media_twitter && (
                  <a
                    href={settings.social_media_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    aria-label="تويتر"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M22.162 5.656c-.793.352-1.643.589-2.53.696a4.454 4.454 0 001.958-2.456 8.909 8.909 0 01-2.825 1.08 4.437 4.437 0 00-7.556 4.045A12.59 12.59 0 013.173 4.9a4.435 4.435 0 001.373 5.917 4.4 4.4 0 01-2.01-.555v.056a4.44 4.44 0 003.556 4.35 4.457 4.457 0 01-2.004.076 4.445 4.445 0 004.148 3.08A8.9 8.9 0 012 19.54a12.55 12.55 0 006.79 1.99c8.147 0 12.598-6.75 12.598-12.598 0-.192-.004-.383-.013-.573a9 9 0 002.22-2.303z" />
                    </svg>
                  </a>
                )}
                {settings.social_media_instagram && (
                  <a
                    href={settings.social_media_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                    aria-label="إنستغرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm6.5-.25a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                  </a>
                )}
                {settings.social_media_linkedin && (
                  <a
                    href={settings.social_media_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                    aria-label="لينكد إن"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {settings.social_media_youtube && (
                  <a
                    href={settings.social_media_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                    aria-label="يوتيوب"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {settings.social_media_telegram && (
                  <a
                    href={settings.social_media_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                    aria-label="تيليجرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.927 6.654-1.309 8.838-.17.968-.504 1.291-.828 1.323-.696.062-1.223-.459-1.897-.9-1.05-.692-1.644-1.123-2.664-1.798-1.18-.78-.415-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14a.49.49 0 01.168.343c.01.05.015.131.003.199z"/>
                    </svg>
                  </a>
                )}
              </div>
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

      {/* Navigation Links Row - Separate Line */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <nav className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
            <Link
              to="/products"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline">عرض جميع المنتجات</span>
              <span className="xs:hidden">المنتجات</span>
            </Link>
            <div className="h-4 sm:h-5 w-px bg-blue-200 flex-shrink-0"></div>
            <Link
              to="/categories"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline">عرض جميع التصنيفات</span>
              <span className="xs:hidden">التصنيفات</span>
            </Link>
            <div className="h-4 sm:h-5 w-px bg-blue-200 flex-shrink-0"></div>
            <Link
              to="/brands"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline">عرض جميع الماركات</span>
              <span className="xs:hidden">الماركات</span>
            </Link>
            <div className="h-4 sm:h-5 w-px bg-blue-200 flex-shrink-0"></div>
            <Link
              to="/offers"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0"
            >
              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden xs:inline">العروض الخاصة</span>
              <span className="xs:hidden">العروض</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && showActions && (
        <div className="bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Pages */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">الصفحات الرئيسية</h3>
                <div className="space-y-2">
                  {(settings.header_menu_items?.main_pages || [
                    { title: "الرئيسية", link: "/" },
                    { title: "المنتجات", link: "/products" },
                    { title: "العروض", link: "/offers" },
                  ]).map((item, index) => (
                    <Link key={index} to={item.link} className="block text-gray-600 hover:text-blue-600 transition-colors py-1">
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
                    { title: "الضمان", link: "/warranty" },
                  ])
                  .filter((item: { title: string; link: string }) => 
                    item.title !== "الشحن والتوصيل" && 
                    item.title !== "الإرجاع والاستبدال"
                  )
                  .map((item, index) => (
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
