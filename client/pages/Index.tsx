import { useState } from "react";
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
  Mail
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import Carousel from "../components/Carousel";
import SimpleCarousel3D from "../components/SimpleCarousel3D";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();

  // Main Categories - Updated with Sbitany categories and high-quality images
  const mainCategories = [
    { name: "الأجهزة المنزلية", image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop&auto=format&q=80", href: "/home-appliances", color: "bg-blue-500" },
    { name: "التلفزيونات", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&auto=format&q=80", href: "/television", color: "bg-cyan-500" },
    { name: "الحاسوب والأجهزة اللوحية", image: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=400&fit=crop&auto=format&q=80", href: "/computers-tablets", color: "bg-purple-500" },
    { name: "الهواتف المحمولة", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&auto=format&q=80", href: "/mobiles", color: "bg-green-500" },
    { name: "الأجهزة الصغيرة", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format&q=80", href: "/small-appliances", color: "bg-orange-500" },
    { name: "العناية الشخصية والجمال", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80", href: "/personal-beauty-care", color: "bg-indigo-500" },
    { name: "مستلزمات المكتب والمدرسة", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&auto=format&q=80", href: "/office-school-supplies", color: "bg-yellow-500" },
    { name: "الألعاب", image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop&auto=format&q=80", href: "/gaming", color: "bg-red-500" },
    { name: "الصوتيات", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format&q=80", href: "/audio", color: "bg-pink-500" },
    { name: "التدفئة والتبريد", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&auto=format&q=80", href: "/heating-cooling", color: "bg-teal-500" },
    { name: "الرياضة واللياقة والصحة", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&auto=format&q=80", href: "/sport-fitness-health", color: "bg-emerald-500" },
    { name: "المنزل والحديقة", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&auto=format&q=80", href: "/home-garden", color: "bg-lime-500" },
    { name: "حلول الطاقة", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=400&fit=crop&auto=format&q=80", href: "/power-solutions", color: "bg-amber-500" },
    { name: "العروض الشهرية", image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop&auto=format&q=80", href: "/monthly-offers", color: "bg-rose-500" },
  ];

  // Brand Categories
  const brandCategories = [
    { 
      name: "Samsung", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMxNDI4NTciIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNBTVNVTkc8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 245 
    },
    { 
      name: "LG", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjIwIiByPSIxNSIgZmlsbD0iI0E1MEUzNSIvPgo8dGV4dCB4PSI1MCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MRzwvdGV4dD4KPC9zdmc+Cg==", 
      productCount: 189 
    },
    { 
      name: "Apple", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNNTUgOGMtMi41IDAtNC41IDItNC41IDQuNXMxLjUgNC41IDQgNC41YzIuNSAwIDQuNS0yIDQuNS00LjVTNTcuNSA4IDU1IDh6bS0zIDEwYy0xIDAtMiAxLTIgMnY4YzAgMSAxIDIgMiAyaDZjMSAwIDItMSAyLTJ2LThjMC0xLTEtMi0yLTJoLTZ6IiBmaWxsPSIjMDAwIi8+Cjx0ZXh0IHg9IjUwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXBwbGU8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 156 
    },
    { 
      name: "Sony", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNPTlk8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 134 
    },
    { 
      name: "Panasonic", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDU1QUEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBhbmFzb25pYzwvdGV4dD4KPC9zdmc+Cg==", 
      productCount: 98 
    },
    { 
      name: "Philips", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDY2Q0MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBISUxJUFM8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 87 
    },
    { 
      name: "Bosch", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNFNjAwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJPU0NIPC90ZXh0Pgo8L3N2Zz4K", 
      productCount: 76 
    },
    { 
      name: "Whirlpool", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDY2OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPldoaXJscG9vbDwvdGV4dD4KPC9zdmc+Cg==", 
      productCount: 65 
    },
    { 
      name: "Siemens", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlNJRU1FTlM8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 54 
    },
    { 
      name: "Electrolux", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVsZWN0cm9sdXg8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 43 
    },
    { 
      name: "Haier", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDc3QkUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhBSUVSPC90ZXh0Pgo8L3N2Zz4K", 
      productCount: 38 
    },
    { 
      name: "Toshiba", 
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzE0M0MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlRPU0hJQkE8L3RleHQ+Cjwvc3ZnPgo=", 
      productCount: 32 
    },
  ];

  // Featured Offers
  const featuredOffers = [
    {
      id: 1,
      name: "ثلاجة Samsung الذكية 21 قدم",
      price: 3299,
      originalPrice: 4299,
      image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop",
      rating: 4.8,
      reviews: 156,
      discount: 23,
      category: "أجهزة المطبخ",
      isNew: false,
      isBestSeller: true,
    },
    {
      id: 2,
      name: "مكيف LG انفيرتر 24 وحدة",
      price: 2199,
      originalPrice: 2899,
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop",
      rating: 4.6,
      reviews: 89,
      discount: 24,
      category: "التكييف والتبريد",
      isNew: true,
      isBestSeller: false,
    },
    {
      id: 3,
      name: "غسالة أطباق Bosch الذكية",
      price: 1899,
      originalPrice: 2499,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
      rating: 4.7,
      reviews: 124,
      discount: 24,
      category: "أجهزة المطبخ",
      isNew: false,
      isBestSeller: true,
    },
    {
      id: 4,
      name: "تلفزيون Sony 65 بوصة 4K",
      price: 4499,
      originalPrice: 5999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      rating: 4.9,
      reviews: 203,
      discount: 25,
      category: "الإلكترونيات",
      isNew: true,
      isBestSeller: true,
    },
  ];

  // Latest Products
  const latestProducts = [
    {
      id: 5,
      name: "مكنسة Dyson اللاسلكية V15",
      price: 1299,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      rating: 4.8,
      reviews: 67,
      category: "أجهزة التنظيف",
      isNew: true,
    },
    {
      id: 6,
      name: "آيفون 15 برو ماكس 256 جيجا",
      price: 5299,
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
      rating: 4.9,
      reviews: 234,
      category: "الإلكترونيات",
      isNew: true,
    },
    {
      id: 7,
      name: "ماكينة قهوة DeLonghi الذكية",
      price: 899,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop",
      rating: 4.5,
      reviews: 45,
      category: "أجهزة المطبخ",
      isNew: true,
    },
    {
      id: 8,
      name: "سماعات Bose الذكية",
      price: 699,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300&h=300&fit=crop",
      rating: 4.7,
      reviews: 89,
      category: "الإلكترونيات",
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearch={true}
        showActions={true}
      />

      {/* Hero Slider Section */}
      <section className="relative w-full overflow-hidden">
        <div className="w-full">
          <Carousel
            slidesToShow={{ mobile: 1, tablet: 1, desktop: 1 }}
            showDots={true}
            showArrows={true}
            autoplay={true}
            rtl={true}
          >
            {/* Slide 1 */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-6 sm:py-8 lg:py-12 overflow-hidden min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-10 lg:left-10 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-pulse">⚡</div>
                <div className="absolute top-8 right-8 sm:top-12 sm:right-12 lg:top-20 lg:right-20 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-bounce">🔌</div>
                <div className="absolute bottom-4 left-1/4 text-xl sm:text-3xl lg:text-5xl opacity-10">💡</div>
                <div className="absolute bottom-8 right-1/3 text-sm sm:text-xl lg:text-3xl opacity-10">📱</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                    مرحباً بكم في
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                      أبو زينة للتقنيات
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-blue-100 leading-relaxed max-w-2xl">
                    وجهتكم الأولى للأجهزة الكهربائية والإلكترونية الحديثة. نوفر لكم أحدث التقنيات بأفضل الأسعار مع ضمان الجودة والخدمة المتميزة.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/products"
                      className="bg-white text-blue-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm lg:text-base"
                    >
                      تسوق الآن
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/offers"
                      className="border-2 border-white text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-colors text-center text-xs sm:text-sm lg:text-base"
                    >
                      العروض الخاصة
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 2 */}
            <div className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 text-white py-6 sm:py-8 lg:py-12 overflow-hidden min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-spin-slow">🏠</div>
                <div className="absolute top-10 left-10 sm:top-16 sm:left-16 lg:top-24 lg:left-24 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-pulse">❄️</div>
                <div className="absolute bottom-4 right-1/4 text-xl sm:text-3xl lg:text-5xl opacity-10">🧺</div>
                <div className="absolute bottom-10 left-1/3 text-sm sm:text-xl lg:text-3xl opacity-10">🍳</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                    أجهزة منزلية
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                      عصرية وذكية
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-purple-100 leading-relaxed max-w-2xl">
                    اكتشف مجموعتنا الواسعة من الأجهزة المنزلية الذكية التي تجعل حياتك أسهل وأكثر راحة. من المطبخ إلى غرفة المعيشة.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/kitchen"
                      className="bg-white text-purple-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm lg:text-base"
                    >
                      أجهزة المطبخ
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/cooling"
                      className="border-2 border-white text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-purple-900 transition-colors text-center text-xs sm:text-sm lg:text-base"
                    >
                      التكييف والتبريد
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3 */}
            <div className="relative bg-gradient-to-r from-green-900 via-green-800 to-teal-900 text-white py-6 sm:py-8 lg:py-12 overflow-hidden min-h-[250px] sm:min-h-[300px] lg:min-h-[350px]">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-12 lg:left-12 text-xl sm:text-3xl lg:text-6xl opacity-10 animate-bounce">🎯</div>
                <div className="absolute top-12 right-12 sm:top-20 sm:right-20 lg:top-32 lg:right-32 text-lg sm:text-2xl lg:text-4xl opacity-10 animate-pulse">💰</div>
                <div className="absolute bottom-6 left-1/3 text-xl sm:text-3xl lg:text-5xl opacity-10">🏷️</div>
                <div className="absolute bottom-12 right-1/4 text-sm sm:text-xl lg:text-3xl opacity-10">✨</div>
              </div>
              
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                <div className="max-w-4xl w-full">
                  <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight">
                    عروض حصرية
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-teal-200">
                      وخصومات مذهلة
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-green-100 leading-relaxed max-w-2xl">
                    لا تفوت فرصة الحصول على أفضل الأجهزة بأسعار لا تُقاوم. عروض محدودة الوقت على أشهر العلامات التجارية العالمية.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 max-w-md">
                    <Link
                      to="/offers"
                      className="bg-white text-green-900 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-xs sm:text-sm lg:text-base"
                    >
                      تصفح العروض
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </Link>
                    <Link
                      to="/products"
                      className="border-2 border-white text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full font-semibold hover:bg-white hover:text-green-900 transition-colors text-center text-xs sm:text-sm lg:text-base"
                    >
                      جميع المنتجات
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Section 1: Main Categories */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">التصنيفات الرئيسية</h2>
            <p className="text-lg text-gray-600">اختر من بين مجموعة واسعة من الفئات المتخصصة</p>
          </div>

          <SimpleCarousel3D
            autoplay={true}
            rtl={true}
            showNavigation={true}
            showPagination={false}
          >
            {mainCategories.map((category, index) => (
              <Link
                key={index}
                to={category.href}
                className="group block bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/50 hover:border-blue-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors leading-tight">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </SimpleCarousel3D>
        </div>
      </section>

      {/* Section 2: Brand Categories */}
      <section className="py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">تسوق حسب العلامة التجارية</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-2">نعمل مع أفضل العلامات التجارية العالمية</p>
            <p className="text-sm text-gray-500">اختر من بين مجموعة متنوعة من العلامات التجارية الموثوقة</p>
          </div>

          <Carousel
            slidesToShow={{ mobile: 3, tablet: 5, desktop: 6 }}
            showDots={false}
            showArrows={true}
            autoplay={true}
            rtl={true}
          >
            {brandCategories.map((brand, index) => (
              <Link
                key={index}
                to={`/brand/${brand.name.toLowerCase()}`}
                className="group bg-white p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block border border-gray-100 hover:border-blue-200"
              >
                <div className="text-center">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 md:p-4 mb-3 md:mb-4 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-10 md:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">{brand.productCount} منتج</p>
                </div>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Section 3: Featured Offers */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">العروض والأصناف المميزة</h2>
            <p className="text-xl text-gray-600">اغتنم الفرصة واحصل على أفضل الصفقات</p>
          </div>

          <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredOffers.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative p-2 md:p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 md:h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    {product.discount && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        خصم {product.discount}%
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        جديد
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        الأكثر مبيعاً
                      </span>
                    )}
                  </div>

                  <button className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
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

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{product.price} ₪</span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through">{product.originalPrice} ₪</span>
                )}
                  </div>

                  <button 
                    onClick={(e) => {
                      // Trigger animation
                      triggerAnimation(e.currentTarget, {
                        image: product.image,
                        name: product.name
                      });
                      
                      // Add to cart
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        brand: "متنوع"
                      });
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Latest Products */}
      <section className="py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">المنتجات الأحدث</h2>
            <p className="text-xl text-gray-600">اكتشف أحدث ما وصل إلى متجرنا</p>
          </div>

          <div className="product-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {latestProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <span className="absolute top-6 right-6 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    جديد
                  </span>

                  <button className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
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
                      {product.category}
                    </span>
                  </div>

                  <button 
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      brand: "متنوع"
                    })}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              عرض جميع المنتجات
              <ChevronRight className="w-5 h-5" />
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
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold">ف</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold">ت</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold">ي</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">من نحن</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">الشحن والتوصيل</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">ال��رجاع والاستبدال</Link></li>
                <li><Link to="/warranty" className="hover:text-white transition-colors">الضمان</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">الفئات</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/kitchen" className="hover:text-white transition-colors">أجهزة المطبخ</Link></li>
                <li><Link to="/cooling" className="hover:text-white transition-colors">التكييف والتبريد</Link></li>
                <li><Link to="/washing" className="hover:text-white transition-colors">أجهزة الغسيل</Link></li>
                <li><Link to="/cleaning" className="hover:text-white transition-colors">أجهزة التنظيف</Link></li>
                <li><Link to="/electronics" className="hover:text-white transition-colors">الإلكترونيات</Link></li>
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
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+966 11 456 7890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@abuzaina-tech.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 أبو زينة للتقنيات. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
