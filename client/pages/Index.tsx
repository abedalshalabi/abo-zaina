import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ChevronRight,
  Zap,
  Shield,
  Truck,
  Clock,
  Tag,
  TrendingUp,
  Heart,
  MapPin,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import Carousel from "../components/Carousel";
import SimpleCarousel3D from "../components/SimpleCarousel3D";
import SEO from "../components/SEO";
import { productsAPI, categoriesAPI, brandsAPI, settingsAPI } from "../services/api";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();

  // API State
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [socialSettings, setSocialSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Load featured and latest products
        const [featuredResponse, latestResponse, categoriesResponse, brandsResponse, settingsResponse] = await Promise.all([
          productsAPI.getFeaturedProducts(),
          productsAPI.getLatestProducts(),
          categoriesAPI.getCategories(),
          brandsAPI.getBrands(),
          settingsAPI.getSettings('header')
        ]);
        
        setFeaturedProducts(featuredResponse.data || []);
        setLatestProducts(latestResponse.data || []);
        setCategories(categoriesResponse.data || []);
        setBrands(brandsResponse.data || []);
        setSocialSettings(settingsResponse.data || {});
        
        // Debug: Log categories to check show_in_slider
        console.log('Categories loaded:', categoriesResponse.data);
        console.log('Categories with show_in_slider:', categoriesResponse.data?.filter((cat: any) => cat.show_in_slider));
      } catch (err) {
        setError("حدث خطأ في تحميل البيانات");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

    // Use categories from API or fallback to static data
    // Filter categories to show only those with show_in_slider = true
  const mainCategories = categories.length > 0 ? (() => {
    const filtered = categories.filter(cat => {
      // Handle both boolean true and string "true" or "1"
      const showInSlider = cat.show_in_slider;
      const shouldShow = showInSlider === true || showInSlider === 1 || showInSlider === "true" || showInSlider === "1";
      console.log(`Category "${cat.name}": show_in_slider = ${showInSlider} (${typeof showInSlider}), shouldShow = ${shouldShow}`);
      return shouldShow;
    });
    console.log('Filtered categories for slider:', filtered);
    return filtered.map(cat => ({
      id: cat.id,
      name: cat.name,
      image: cat.image || "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&auto=format&q=80",
      href: `/products?category_id=${cat.id}`,
      color: cat.color || "bg-blue-500"
    }));
  })() : [
    { name: "الأجهزة المنزلية", image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&auto=format&q=80", href: "/home-appliances", color: "bg-blue-500" },
    { name: "التلفزيونات", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&auto=format&q=80", href: "/television", color: "bg-cyan-500" },
    { name: "الحاسوب والأجهزة اللوحية", image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=400&fit=crop&auto=format&q=80", href: "/computers-tablets", color: "bg-purple-500" },
    { name: "الهواتف المحمولة", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&auto=format&q=80", href: "/mobiles", color: "bg-green-500" },
    { name: "الأجهزة الصغيرة", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format&q=80", href: "/small-appliances", color: "bg-orange-500" },
  ];

  // Brand Categories - Load from API (only brands with products)
  const brandCategories = brands.length > 0 ? brands
    .filter(brand => (brand.products_count || 0) > 0) // Only show brands with products
    .map(brand => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo || '',
      productCount: brand.products_count || 0,
      slug: brand.slug || brand.name.toLowerCase(),
    })) : [];

  // Use featured products from API or fallback to static data
  const featuredOffers = featuredProducts.map((product) => {
    const firstImage = product.images?.[0] ?? {};
    const imageUrl =
      firstImage.image_url ||
      firstImage.image_path ||
      firstImage.url ||
      product.image ||
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop";

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: imageUrl,
      rating: product.rating || 0,
      reviews: product.reviews_count || 0,
      category: product.category?.name || "عام",
      discount: product.discount_percentage || 0,
      isNew: product.is_new || false,
      isBestSeller: Boolean(product.is_featured || product.is_best_seller),
    };
  });

  // Latest products from API (no fallback)
  const latestProductsData = latestProducts.map((product) => {
    const firstImage = product.images?.[0] ?? {};
    const imageUrl =
      firstImage.image_url ||
      firstImage.image_path ||
      firstImage.url ||
      product.image ||
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop";

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      image: imageUrl,
      rating: product.rating || 0,
      reviews: product.reviews_count || 0,
      brand: product.brand?.name || "",
      discount: product.discount_percentage || 0,
      isNew: product.is_new || true,
      stockStatus: product.stock_status || (product.in_stock ? "متوفر" : "غير متوفر"),
    };
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header 
        showSearch={true}
        showActions={true}
      />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 arabic">
        <Header 
        showSearch={true}
        showActions={true}
      />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-xl text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Structured Data for Homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "أبو زينة للتقنيات",
    "description": "متجر متخصص في بيع الأجهزة الكهربائية والإلكترونية في فلسطين",
    "url": siteUrl,
    "logo": `${siteUrl}/placeholder.svg`,
    "image": `${siteUrl}/placeholder.svg`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PS",
      "addressLocality": "فلسطين"
    },
    "sameAs": [],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "ILS",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <SEO
        title="أبو زينة للتقنيات - عالم التكنولوجيا والأجهزة الكهربائية"
        description="تسوق أونلاين من أبو زينة للتقنيات - أفضل متجر للأجهزة الكهربائية والإلكترونية في فلسطين. أفران، ثلاجات، غسالات، تلفزيونات، هواتف ذكية وأكثر. توصيل سريع وضمان شامل."
        keywords="أجهزة كهربائية, إلكترونيات, أفران, ثلاجات, غسالات, تلفزيونات, هواتف ذكية, تسوق أونلاين, أبو زينة, فلسطين"
        structuredData={structuredData}
      />
      <Header 
        showSearch={true}
        showActions={true}
      />

      {/* Hero Slider Section */}
      <section className="relative w-full overflow-hidden">
        <div className="w-full px-4 md:px-0 mt-4 md:mt-0">
          <div className="rounded-2xl md:rounded-none overflow-hidden shadow-md md:shadow-none relative z-0 transform-gpu">
            <Carousel
            slidesToShow={{ mobile: 1, tablet: 1, desktop: 1 }}
            showDots={false}
            showArrows={true}
            gap={0}
            autoplay={true}
            rtl={true}
          >
            {/* Slide 1 */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-6 sm:py-8 lg:py-4 overflow-hidden min-h-[180px] sm:min-h-[300px] lg:min-h-[180px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-10 lg:left-10 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-pulse">⚡</div>
                <div className="absolute top-8 right-8 sm:top-12 sm:right-12 lg:top-20 lg:right-20 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-bounce">🔌</div>
                <div className="absolute bottom-4 left-1/4 text-xl sm:text-3xl lg:text-5xl opacity-10">💡</div>
                <div className="absolute bottom-8 right-1/3 text-sm sm:text-xl lg:text-3xl opacity-10">📱</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6 leading-loose py-2 sm:py-4">
                    مرحباً بكم في
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 mt-2 sm:mt-6 py-1 sm:py-2">
                      أبو زينة للتقنيات
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-sm lg:text-xl mb-3 sm:mb-6 lg:mb-8 text-blue-100 leading-relaxed max-w-2xl mt-2 sm:mt-6">
                    وجهتكم الأولى للأجهزة الكهربائية والإلكترونية الحديثة. نوفر لكم أحدث التقنيات بأفضل الأسعار.
                  </p>
                  <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/products"
                      className="bg-white text-blue-900 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg text-[10px] sm:text-sm lg:text-base"
                    >
                      تسوق الآن
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/offers"
                      className="border-2 border-white text-white px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-colors text-center text-[10px] sm:text-sm lg:text-base"
                    >
                      العروض الخاصة
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white py-6 sm:py-8 lg:py-4 overflow-hidden min-h-[180px] sm:min-h-[300px] lg:min-h-[180px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-spin-slow">🏠</div>
                <div className="absolute top-10 left-10 sm:top-16 sm:left-16 lg:top-24 lg:left-24 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-pulse">❄️</div>
                <div className="absolute bottom-4 right-1/4 text-xl sm:text-3xl lg:text-5xl opacity-10">🧺</div>
                <div className="absolute bottom-10 left-1/3 text-sm sm:text-xl lg:text-3xl opacity-10">🍳</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6 leading-loose py-2 sm:py-4">
                    أجهزة منزلية
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mt-2 sm:mt-6 py-1 sm:py-2">
                      عصرية وذكية
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-sm lg:text-xl mb-3 sm:mb-6 lg:mb-8 text-purple-100 leading-relaxed max-w-2xl mt-2 sm:mt-6">
                    اكتشف مجموعتنا الواسعة من الأجهزة المنزلية الذكية التي تجعل حياتك أسهل وأكثر راحة.
                  </p>
                  <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/kitchen"
                      className="bg-white text-purple-900 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg text-[10px] sm:text-sm lg:text-base"
                    >
                      أجهزة المطبخ
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/cooling"
                      className="border-2 border-white text-white px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-purple-900 transition-colors text-center text-[10px] sm:text-sm lg:text-base"
                    >
                      التكييف والتبريد
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="relative bg-gradient-to-r from-green-900 via-green-800 to-teal-900 text-white py-6 sm:py-8 lg:py-4 overflow-hidden min-h-[180px] sm:min-h-[300px] lg:min-h-[180px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-12 lg:left-12 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-bounce">🎯</div>
                <div className="absolute top-12 right-12 sm:top-20 sm:right-20 lg:top-32 lg:right-32 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-pulse">💰</div>
                <div className="absolute bottom-6 left-1/3 text-xl sm:text-3xl lg:text-5xl opacity-10">🏷️</div>
                <div className="absolute bottom-12 right-1/4 text-sm sm:text-xl lg:text-3xl opacity-10">✨</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 lg:mb-6 leading-loose py-2 sm:py-4">
                    عروض حصرية
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-teal-200 mt-2 sm:mt-6 py-1 sm:py-2">
                      وخصومات مذهلة
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-sm lg:text-xl mb-3 sm:mb-6 lg:mb-8 text-green-100 leading-relaxed max-w-2xl mt-2 sm:mt-6">
                    لا تفوت فرصة الحصول على أفضل الأجهزة بأسعار لا تُقاوم. عروض محدودة الوقت.
                  </p>
                  <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/offers"
                      className="bg-white text-green-900 px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-1 sm:gap-2 shadow-lg text-[10px] sm:text-sm lg:text-base"
                    >
                      تصفح العروض
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/products"
                      className="border-2 border-white text-white px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-green-900 transition-colors text-center text-[10px] sm:text-sm lg:text-base"
                    >
                      جميع المنتجات
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Section 1: Main Categories */}
      <section className="pt-8 pb-4 md:pt-12 md:pb-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">التصنيفات الرئيسية</h2>
            <p className="text-xs md:text-lg text-gray-600">اختر من بين مجموعة واسعة من الفئات المتخصصة</p>
          </div>

          <SimpleCarousel3D
            autoplay={false}
            rtl={true}
            showNavigation={true}
            showPagination={false}
            slideDimensions={{
              smallMobile: { width: 140, height: 180, spacing: 15 },
              mobile: { width: 200, height: 240, spacing: 25 },
              desktop: { width: 280, height: 280, spacing: 50 }
            }}
          >
            {mainCategories.map((category, index) => {
              // Get isActive prop from SimpleCarousel3D (it will be passed via cloneElement)
              const CategorySlide = ({ isActive }: { isActive?: boolean }) => (
              <Link
                to={category.href}
                  className="group block bg-transparent transition-all duration-500"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div 
                    className={`relative h-28 sm:h-36 md:h-48 bg-transparent overflow-hidden transition-all duration-500 transform ${
                      isActive ? 'scale-110 -translate-y-3' : 'group-hover:scale-105 group-hover:-translate-y-3'
                    }`}
                    style={{
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                  <img
                    src={category.image}
                    alt={category.name}
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        isActive ? 'scale-125' : 'group-hover:scale-110'
                      }`}
                      style={{
                        transform: 'translateZ(30px)',
                        transformStyle: 'preserve-3d',
                        filter: isActive ? 'brightness(1.1) saturate(1.2)' : 'none'
                      }}
                    />
                </div>
                  <div className="pt-1 px-2 pb-0 mt-1">
                    <h3 className={`text-sm font-semibold text-center transition-all duration-500 leading-tight ${
                      isActive 
                        ? 'text-blue-600 scale-110 font-bold' 
                        : 'text-gray-800 group-hover:text-blue-600'
                    }`}>
                    {category.name}
                  </h3>
                </div>
              </Link>
              );
              
              return <CategorySlide key={index} />;
            })}
          </SimpleCarousel3D>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
          >
            عرض جميع التصنيفات
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Section 2: Brand Categories */}
      <section className="py-6 md:py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-10">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">تسوق حسب العلامة التجارية</h2>
            <p className="text-sm md:text-xl text-gray-600 mb-1 md:mb-2">نعمل مع أفضل العلامات التجارية العالمية</p>
            <p className="text-xs md:text-sm text-gray-500">اختر من بين مجموعة متنوعة من العلامات التجارية الموثوقة</p>
          </div>

          {brandCategories.length > 0 ? (
            <>
              <SimpleCarousel3D
                autoplay={false}
                rtl={true}
                showNavigation={true}
                showPagination={false}
                slideDimensions={{
                  smallMobile: { width: 100, height: 140, spacing: 10 },
                  mobile: { width: 140, height: 180, spacing: 20 },
                  desktop: { width: 180, height: 220, spacing: 30 }
                }}
              >
                {brandCategories.map((brand, index) => {
                  const BrandSlide = ({ isActive }: { isActive?: boolean }) => (
                    <Link
                      to={`/products?brand_id=${brand.id || ''}`}
                      className="group block bg-white p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-200 h-full w-full"
                    >
                      <div className="text-center h-full flex flex-col justify-center items-center">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 md:p-3 mb-2 md:mb-3 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300 w-full flex-grow flex items-center justify-center">
                            {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-10 md:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                            ) : (
                              <div className="w-full h-10 md:h-12 flex items-center justify-center">
                                <span className="text-gray-400 text-xs md:text-sm font-semibold">{brand.name}</span>
                              </div>
                            )}
                        </div>
                          <p className="text-[10px] md:text-xs text-gray-500">{brand.productCount || 0} منتج</p>
                      </div>
                    </Link>
                  );
                  return <BrandSlide key={brand.id || index} />;
                })}
              </SimpleCarousel3D>
              <div className="text-center mt-6 md:mt-8">
                <Link
                  to="/brands"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  عرض جميع الماركات
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">لا توجد علامات تجارية متاحة</div>
          )}
        </div>
      </section>

      {/* Section 3: Featured Offers */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">العروض والأصناف المميزة</h2>
            <p className="text-sm md:text-xl text-gray-600">اغتنم الفرصة واحصل على أفضل الصفقات</p>
          </div>

          {featuredOffers.length > 0 ? (
          <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredOffers.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <Link to={`/product/${product.id}`} className="block">
                <div className="relative p-2 md:p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 md:h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 md:top-6 md:right-6 flex flex-col gap-1 md:gap-2">
                        {product.originalPrice && product.originalPrice > product.price ? (
                      <span className="bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                            خصم {(product.originalPrice - product.price).toLocaleString()} ₪
                      </span>
                        ) : null}
                        {product.isNew ? (
                      <span className="bg-green-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                        جديد
                      </span>
                        ) : null}
                        {product.isBestSeller ? (
                      <span className="bg-blue-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-sm font-bold">
                        الأكثر مبيعاً
                      </span>
                        ) : null}
                  </div>

                  <button className="absolute top-3 left-3 md:top-6 md:left-6 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>
                </div>
                  </Link>

                <div className="p-3 md:p-6">
                    <Link to={`/product/${product.id}`} className="block">
                  <h3 className="font-bold text-gray-800 mb-1 md:mb-2 text-sm md:text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                    </Link>
                  
                  <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">({product.reviews})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
                    <span className="text-lg md:text-2xl font-bold text-blue-600">{product.price} ₪</span>
                      {product.originalPrice && product.originalPrice > 0 ? (
                  <span className="text-xs md:text-sm text-gray-500 line-through">{product.originalPrice} ₪</span>
                      ) : null}
                  </div>

                  <button 
                    onClick={(e) => {
                        e.preventDefault();
                      triggerAnimation(e.currentTarget, {
                        image: product.image,
                          name: product.name,
                      });
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                          brand: "متنوع",
                      });
                    }}
                    className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد عروض مميزة متاحة حالياً.
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              تصفح جميع المنتجات
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: Latest Products */}
      <section className="py-4 md:py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">المنتجات الأحدث</h2>
            <p className="text-sm md:text-xl text-gray-600">اكتشف أحدث ما وصل إلى متجرنا</p>
          </div>

          {latestProductsData.length > 0 ? (
          <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {latestProductsData.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <Link to={`/product/${product.id}`} className="block">
                <div className="relative p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                        className="w-full h-40 object-contain bg-white rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                      {product.isNew ? (
                  <span className="absolute top-6 right-6 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    جديد
                  </span>
                      ) : null}
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <span className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          خصم {(product.originalPrice - product.price).toLocaleString()} ₪
                        </span>
                      ) : null}

                  <button className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                  </Link>

                <div className="p-6">
                    <Link to={`/product/${product.id}`} className="block">
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                    </Link>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">{product.price} ₪</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {product.stockStatus}
                    </span>
                  </div>

                    <div className="flex items-center gap-2">
                  <button 
                        onClick={(e) => {
                          e.preventDefault();
                          triggerAnimation(e.currentTarget, {
                            image: product.image,
                            name: product.name,
                          });
                          addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                            brand: product.brand,
                          });
                        }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    أضف للسلة
                  </button>
                      <button className="p-3 bg-white text-blue-600 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              لا توجد منتجات جديدة متاحة حالياً.
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              استعرض المزيد من المنتجات
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-8 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا الإخبارية</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            كن أول من يعلم بالعروض الجديدة والمنتجات الحصرية
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-900 px-6 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
              اشتراك
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white bg-opacity-10 p-6 rounded-2xl">
              <Truck className="w-12 h-12 text-blue-200 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-xl font-semibold mb-2">شحن مجاني</h3>
                <p className="text-blue-200">للطلبات أكثر من 500 شيكل</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white bg-opacity-10 p-6 rounded-2xl">
              <Shield className="w-12 h-12 text-blue-200 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-xl font-semibold mb-2">ضمان شامل</h3>
                <p className="text-blue-200">على جميع المنتجات</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white bg-opacity-10 p-6 rounded-2xl">
              <Clock className="w-12 h-12 text-blue-200 flex-shrink-0" />
              <div className="text-center md:text-right">
                <h3 className="text-xl font-semibold mb-2">خدمة 24/7</h3>
                <p className="text-blue-200">دعم فني متواصل</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets%2F771ae719ebd54c27bd1a3d83e2201d6c%2Ff677e03217fa4fb894a0ecba683c6cb5?format=webp&width=800" 
                  alt="أبو زينة للتقنيات"
                  className="h-12 w-auto"
                />
                <div>
                  <h3 className="text-lg font-bold">أبو زينة للتقنيات</h3>
                  <p className="text-sm text-gray-400">عالم التكنولوجيا</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                وجهتكم الأولى للأجهزة الكهربائية والإلكترونية في فلسطين
              </p>
              {/* روابط التواصل الاجتماعي */}
              <div className="flex gap-4">
                {socialSettings.social_media_facebook && (
                  <a
                    href={socialSettings.social_media_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                    aria-label="فيسبوك"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M13.5 9H16l.5-3h-3V4.5c0-.86.22-1.5 1.5-1.5H17V0h-2.5C11.57 0 10 1.57 10 4.5V6H8v3h2v9h3.5V9z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_twitter && (
                  <a
                    href={socialSettings.social_media_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                    aria-label="تويتر"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M22.162 5.656c-.793.352-1.643.589-2.53.696a4.454 4.454 0 001.958-2.456 8.909 8.909 0 01-2.825 1.08 4.437 4.437 0 00-7.556 4.045A12.59 12.59 0 013.173 4.9a4.435 4.435 0 001.373 5.917 4.4 4.4 0 01-2.01-.555v.056a4.44 4.44 0 003.556 4.35 4.457 4.457 0 01-2.004.076 4.445 4.445 0 004.148 3.08A8.9 8.9 0 012 19.54a12.55 12.55 0 006.79 1.99c8.147 0 12.598-6.75 12.598-12.598 0-.192-.004-.383-.013-.573a9 9 0 002.22-2.303z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_instagram && (
                  <a
                    href={socialSettings.social_media_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer"
                    aria-label="إنستغرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm6.5-.25a1 1 0 100 2 1 1 0 000-2z" />
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_linkedin && (
                  <a
                    href={socialSettings.social_media_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer"
                    aria-label="لينكد إن"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_youtube && (
                  <a
                    href={socialSettings.social_media_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                    aria-label="يوتيوب"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {socialSettings.social_media_telegram && (
                  <a
                    href={socialSettings.social_media_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer"
                    aria-label="تيليجرام"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.174 1.858-.927 6.654-1.309 8.838-.17.968-.504 1.291-.828 1.323-.696.062-1.223-.459-1.897-.9-1.05-.692-1.644-1.123-2.664-1.798-1.18-.78-.415-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14a.49.49 0 01.168.343c.01.05.015.131.003.199z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">من نحن</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">الشحن والتوصيل</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">الإرجاع والاستبدال</Link></li>
                <li><Link to="/warranty" className="hover:text-white transition-colors">الضمان</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">الفئات</h3>
              <ul className="space-y-2 text-gray-400">
                {categories
                  .filter((cat: any) => !cat.parent_id && cat.is_active !== 0 && cat.is_active !== false)
                  .slice(0, 5)
                  .map((category: any) => (
                    <li key={category.id}>
                      <Link 
                        to={category.slug ? `/products?category_id=${category.id}` : `/products`}
                        className="hover:text-white transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                {categories.filter((cat: any) => !cat.parent_id && cat.is_active !== 0 && cat.is_active !== false).length === 0 && (
                  <>
                    <li><Link to="/products" className="hover:text-white transition-colors">جميع المنتجات</Link></li>
                    <li><Link to="/categories" className="hover:text-white transition-colors">جميع الفئات</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">تواصل معنا</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>جنين، فلسطين</span>
                </div>
                {socialSettings.header_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${socialSettings.header_phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                      <span dir="ltr" className="inline-block">{socialSettings.header_phone}</span>
                    </a>
                  </div>
                )}
                {socialSettings.header_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${socialSettings.header_email}`} className="hover:text-white transition-colors">
                      <span dir="ltr" className="inline-block">{socialSettings.header_email}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 أبو زينة للتقنيات. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
