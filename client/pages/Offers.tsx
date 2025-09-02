import { Link } from "react-router-dom";
import { Clock, Star, ShoppingCart, Heart, Eye, Zap, Gift, Percent, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";

const Offers = () => {
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashDeals = [
    {
      id: 1,
      name: "ثلاجة سامسونج 21 قدم نو فروست",
      brand: "سامسونج",
      price: 2299,
      originalPrice: 3299,
      discount: 30,
      rating: 4.8,
      reviews: 156,
      image: "https://images.samsung.com/is/image/samsung/p6pim/levant/rt50k6000s8-sg/gallery/levant-side-by-side-rt50k6000s8-sg-rt50k6000s8-sg-frontsilver-205395803?$650_519_PNG$",
      timeLeft: "2:14:32:45",
      sold: 45,
      total: 100,
      features: ["نو فروست", "موفر للطاقة", "ضمان 5 سنوات"]
    },
    {
      id: 2,
      name: "تلفزيون إل جي 55 بوصة 4K OLED",
      brand: "إل جي",
      price: 3999,
      originalPrice: 5999,
      discount: 33,
      rating: 4.9,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
      timeLeft: "1:08:15:22",
      sold: 28,
      total: 50,
      features: ["4K OLED", "ذكي", "HDR10"]
    },
    {
      id: 3,
      name: "غسالة بوش 9 كيلو فرونت لودر",
      brand: "بوش",
      price: 1799,
      originalPrice: 2499,
      discount: 28,
      rating: 4.7,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      timeLeft: "3:22:45:12",
      sold: 67,
      total: 80,
      features: ["توفير الماء", "هادئة", "تحكم ذكي"]
    }
  ];

  const weeklyDeals = [
    {
      id: 4,
      name: "مكيف سبليت جري 18000 وحدة",
      brand: "جري",
      price: 1599,
      originalPrice: 2199,
      discount: 27,
      rating: 4.6,
      reviews: 167,
      image: "https://www.gree.com.eg/uploads/products/1679906516.png",
      badge: "عرض الأسبوع",
      features: ["انفرتر", "تبريد سريع", "موفر للطاقة"]
    },
    {
      id: 5,
      name: "مايكروويف سامسونج 32 لتر",
      brand: "سامسونج",
      price: 599,
      originalPrice: 799,
      discount: 25,
      rating: 4.5,
      reviews: 98,
      image: "https://images.samsung.com/is/image/samsung/p6pim/levant/ms32j5133at-sg/gallery/levant-solo-microwave-oven-ms32j5133at-sg-ms32j5133at-sg-frontblack-205395803?$650_519_PNG$",
      badge: "خصم حصري",
      features: ["جريل", "تحكم رقمي", "سيراميك"]
    },
    {
      id: 6,
      name: "مكنسة كهربائية فيليبس",
      brand: "فيليبس",
      price: 399,
      originalPrice: 599,
      discount: 33,
      rating: 4.4,
      reviews: 145,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIyMjAiIHJ4PSIxMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyB4PSIxMjUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1Y3QTIgMiAwIDAgMCAxOSA1SDVBMiAyIDAgMCAwIDMgN1oiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPtmF2YPZhti32Kkg2YHZitmE2YrYqNizPC90ZXh0Pgo8L3N2Zz4=",
      badge: "الأكثر مبيعاً",
      features: ["قوة شفط عالية", "فلتر HEPA", "خفيفة"]
    },
    {
      id: 7,
      name: "خلاط كينوود 1200 واط",
      brand: "كينوود",
      price: 449,
      originalPrice: 649,
      discount: 31,
      rating: 4.6,
      reviews: 87,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIyMjAiIHJ4PSIxMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyB4PSIxMjUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMkw0IDdWMTdBMiAyIDAgMCAwIDYgMTlIMThBMiAyIDAgMCAwIDIwIDE3VjdMMTIgMloiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPtiu2YTYp9i3INmD2YrZhtmI2YjYrzwvdGV4dD4KPC9zdmc+",
      badge: "جودة عالية",
      features: ["متعدد الوظائف", "ستانلس ستيل", "ضمان 3 سنوات"]
    }
  ];

  const bundleOffers = [
    {
      id: 8,
      name: "باقة المطبخ الذكي",
      items: ["ثلاجة سامسونج", "مايكروويف إل جي", "خلاط فيليبس"],
      price: 3299,
      originalPrice: 4599,
      discount: 28,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI0MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMjAiIHJ4PSIxMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMkw0IDdWMTdBMiAyIDAgMCAwIDYgMTlIMThBMiAyIDAgMCAwIDIwIDE3VjdMMTIgMloiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iOSIgY3k9IjEwIiByPSIyIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjEwIiByPSIyIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjE0IiByPSIyIiBzdHJva2U9IiM5NGEzYjgiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2MzczODEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+2KjYp9mC2Kkg2KfZhNmF2LfYqNiuPC90ZXh0Pgo8L3N2Zz4=",
      savings: 1300,
      badge: "باقة حصرية"
    },
    {
      id: 9,
      name: "باقة التنظيف الشاملة",
      items: ["مكنسة بوش", "مكنسة بخار", "منظف النوافذ"],
      price: 899,
      originalPrice: 1399,
      discount: 36,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI0MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMjAiIHJ4PSIxMCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1Y3QTIgMiAwIDAgMCAxOSA1SDVBMiAyIDAgMCAwIDMgN1oiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3MzgxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPtio2KfZgtipINin2YTYqtmG2LjZitmBPC90ZXh0Pgo8L3N2Zz4=",
      savings: 500,
      badge: "وفر أكثر"
    }
  ];

  const FlashDealCard = ({ product }: { product: any }) => {
    const progressPercentage = (product.sold / product.total) * 100;
    
    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-red-200">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">فلاش ديل</span>
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">باقي:</span>
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                <span className="font-mono text-sm">{product.timeLeft}</span>
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-center">
              تم بيع {product.sold} من {product.total}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-blue-600 font-semibold">{product.brand}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviews})</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{product.name}</h3>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {product.features.map((feature, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {feature}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-600">{product.price.toLocaleString()} شيكل</span>
              </div>
              <span className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString()} شيكل</span>
              <div className="text-sm text-green-600 font-semibold">
                وفر {(product.originalPrice - product.price).toLocaleString()} شيكل
              </div>
            </div>
          </div>
          
          <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            اشتري الآن
          </button>
        </div>
      </div>
    );
  };

  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {product.badge}
          </span>
        )}
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{product.discount}%
        </div>
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors">
              <Eye className="w-5 h-5 text-gray-600 hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-blue-600 font-semibold">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{product.name}</h3>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {product.features.map((feature, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              {feature}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{product.price.toLocaleString()} شيكل</span>
            </div>
            <span className="text-lg text-gray-400 line-through">{product.originalPrice.toLocaleString()} شيكل</span>
            <div className="text-sm text-green-600 font-semibold">
              وفر {(product.originalPrice - product.price).toLocaleString()} شيكل
            </div>
          </div>
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
              brand: product.brand
            });
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          أضف للسلة
        </button>
      </div>
    </div>
  );

  const BundleCard = ({ bundle }: { bundle: any }) => (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-purple-200">
      <div className="relative">
        <img 
          src={bundle.image} 
          alt={bundle.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-2 rounded-full">
          <div className="flex items-center gap-1">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-bold">{bundle.badge}</span>
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{bundle.discount}%
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{bundle.name}</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">يشمل:</p>
          <ul className="space-y-1">
            {bundle.items.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-purple-600">{bundle.price.toLocaleString()} شيكل</span>
          </div>
          <span className="text-lg text-gray-400 line-through">{bundle.originalPrice.toLocaleString()} شيكل</span>
          <div className="text-lg text-green-600 font-bold">
            وفر {bundle.savings.toLocaleString()} شيكل
          </div>
        </div>
        
        <button 
          onClick={(e) => {
            // Trigger animation
            triggerAnimation(e.currentTarget, {
              image: bundle.image,
              name: bundle.name
            });
            
            // Add bundle to cart
            addItem({
              id: bundle.id,
              name: bundle.name,
              price: bundle.price,
              image: bundle.image,
              brand: "باقة"
            });
          }}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          اشتري الباقة
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-900 to-pink-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">العروض الحصرية</h1>
          <p className="text-xl text-red-200 mb-8">اكتشف أفضل العروض والخصومات على جميع المنتجات</p>
          
          {/* Countdown Timer */}
          <div className="max-w-md mx-auto bg-black bg-opacity-30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">العرض ينتهي خلال:</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-white text-red-600 text-2xl font-bold py-3 px-2 rounded-lg">
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <div className="text-sm mt-2">يوم</div>
              </div>
              <div className="text-center">
                <div className="bg-white text-red-600 text-2xl font-bold py-3 px-2 rounded-lg">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-sm mt-2">ساعة</div>
              </div>
              <div className="text-center">
                <div className="bg-white text-red-600 text-2xl font-bold py-3 px-2 rounded-lg">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-sm mt-2">دقيقة</div>
              </div>
              <div className="text-center">
                <div className="bg-white text-red-600 text-2xl font-bold py-3 px-2 rounded-lg">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm mt-2">ثانية</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Flash Deals */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-red-500 p-3 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">عروض البرق</h2>
              <p className="text-gray-600">خصومات محدودة الوقت - اسرع قبل انتهاء الكمية!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {flashDeals.map(product => (
              <FlashDealCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Weekly Deals */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-500 p-3 rounded-full">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">عروض الأسبوع</h2>
              <p className="text-gray-600">خصومات مميزة تستمر طوال الأسبوع</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {weeklyDeals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Bundle Offers */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-500 p-3 rounded-full">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">الباقات الحصرية</h2>
              <p className="text-gray-600">وفر أكثر مع باقاتنا المتكاملة</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {bundleOffers.map(bundle => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">لا تفوت العروض القادمة!</h2>
          <p className="text-blue-100 mb-6">اشترك في نشرتنا البريدية لتصلك أحدث العروض والخصومات</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              اشتراك
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Offers;