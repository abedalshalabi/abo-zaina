import { Link } from "react-router-dom";
import { Clock, Star, ShoppingCart, Heart, Eye, Zap, Gift, Percent, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import { offersAPI } from "../services/api";

interface Offer {
  id: number;
  title: string;
  description?: string;
  type: 'flash_deal' | 'weekly_deal' | 'bundle';
  image?: string;
  discount_percentage?: number;
  fixed_discount?: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  products?: Array<{
    id: number;
    name: string;
    slug: string;
    price: number;
    original_price?: number;
    image?: string;
    brand?: string;
    rating?: number;
    reviews_count?: number;
  }>;
  bundle_items?: Array<{
    product_id: number;
    product_name: string;
    product_slug: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  bundle_price?: number;
  original_bundle_price?: number;
  stock_limit?: number;
  sold_count: number;
  remaining_time: number;
  progress_percentage: number;
}

const Offers = () => {
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    // Calculate time left for the first flash deal
    const flashDeal = offers.find(o => o.type === 'flash_deal');
    if (flashDeal && flashDeal.remaining_time > 0) {
      const timer = setInterval(() => {
        const remaining = flashDeal.remaining_time - Math.floor((Date.now() - new Date(flashDeal.starts_at).getTime()) / 1000);
        if (remaining > 0) {
          const days = Math.floor(remaining / 86400);
          const hours = Math.floor((remaining % 86400) / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setTimeLeft({ days, hours, minutes, seconds });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [offers]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await offersAPI.getOffers();
      if (response.success && response.data) {
        setOffers(response.data);
        
        // Set initial time left for hero section
        const flashDeal = response.data.find((o: Offer) => o.type === 'flash_deal');
        if (flashDeal && flashDeal.remaining_time > 0) {
          const days = Math.floor(flashDeal.remaining_time / 86400);
          const hours = Math.floor((flashDeal.remaining_time % 86400) / 3600);
          const minutes = Math.floor((flashDeal.remaining_time % 3600) / 60);
          const seconds = flashDeal.remaining_time % 60;
          setTimeLeft({ days, hours, minutes, seconds });
        }
      }
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const flashDeals = offers.filter(o => o.type === 'flash_deal');
  const weeklyDeals = offers.filter(o => o.type === 'weekly_deal');
  const bundleOffers = offers.filter(o => o.type === 'bundle');

  const FlashDealCard = ({ offer }: { offer: Offer }) => {
    const product = offer.products?.[0];
    if (!product) return null;

    const progressPercentage = offer.stock_limit 
      ? offer.progress_percentage 
      : 0;
    
    const calculatePrice = () => {
      if (offer.discount_percentage) {
        const originalPrice = product.original_price || product.price;
        return originalPrice * (1 - offer.discount_percentage / 100);
      } else if (offer.fixed_discount) {
        const originalPrice = product.original_price || product.price;
        return Math.max(0, originalPrice - offer.fixed_discount);
      }
      return product.price;
    };

    const originalPrice = product.original_price || product.price;
    const discountedPrice = calculatePrice();
    const discount = originalPrice - discountedPrice;

    const formatTimeLeft = () => {
      const remaining = offer.remaining_time;
      if (remaining <= 0) return "0:00:00:00";
      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      return `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-red-200">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.image || '/placeholder-product.jpg'} 
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg';
              }}
            />
          </Link>
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">فلاش ديل</span>
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{offer.discount_percentage || Math.round((discount / originalPrice) * 100)}%
          </div>
          {offer.stock_limit && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">باقي:</span>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span className="font-mono text-sm">{formatTimeLeft()}</span>
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-center">
                تم بيع {offer.sold_count} من {offer.stock_limit}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {product.brand && (
              <span className="text-sm text-blue-600 font-semibold">{product.brand}</span>
            )}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                {product.reviews_count && (
                  <span className="text-sm text-gray-400">({product.reviews_count})</span>
                )}
              </div>
            )}
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-600">{discountedPrice.toFixed(2)} شيكل</span>
              </div>
              <span className="text-lg text-gray-400 line-through">{originalPrice.toFixed(2)} شيكل</span>
              <div className="text-sm text-green-600 font-semibold">
                وفر {discount.toFixed(2)} شيكل
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              triggerAnimation(e.currentTarget, {
                image: product.image,
                name: product.name
              });
              addItem({
                id: product.id,
                name: product.name,
                price: discountedPrice,
                image: product.image || '',
                brand: product.brand || ''
              });
            }}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            اشتري الآن
          </button>
        </div>
      </div>
    );
  };

  const ProductCard = ({ offer }: { offer: Offer }) => {
    const product = offer.products?.[0];
    if (!product) return null;

    const calculatePrice = () => {
      if (offer.discount_percentage) {
        const originalPrice = product.original_price || product.price;
        return originalPrice * (1 - offer.discount_percentage / 100);
      } else if (offer.fixed_discount) {
        const originalPrice = product.original_price || product.price;
        return Math.max(0, originalPrice - offer.fixed_discount);
      }
      return product.price;
    };

    const originalPrice = product.original_price || product.price;
    const discountedPrice = calculatePrice();
    const discount = originalPrice - discountedPrice;
    const discountPercent = offer.discount_percentage || Math.round((discount / originalPrice) * 100);

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <img 
              src={product.image || '/placeholder-product.jpg'} 
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg';
              }}
            />
          </Link>
          <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            عرض الأسبوع
          </span>
          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercent}%
          </div>
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{discountPercent}%
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
              </button>
              <Link to={`/product/${product.id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors">
                <Eye className="w-5 h-5 text-gray-600 hover:text-blue-500" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {product.brand && (
              <span className="text-sm text-blue-600 font-semibold">{product.brand}</span>
            )}
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                {product.reviews_count && (
                  <span className="text-sm text-gray-400">({product.reviews_count})</span>
                )}
              </div>
            )}
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{discountedPrice.toFixed(2)} شيكل</span>
              </div>
              <span className="text-lg text-gray-400 line-through">{originalPrice.toFixed(2)} شيكل</span>
              <div className="text-sm text-green-600 font-semibold">
                وفر {discount.toFixed(2)} شيكل
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              triggerAnimation(e.currentTarget, {
                image: product.image,
                name: product.name
              });
              addItem({
                id: product.id,
                name: product.name,
                price: discountedPrice,
                image: product.image || '',
                brand: product.brand || ''
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
  };

  const BundleCard = ({ offer }: { offer: Offer }) => {
    if (!offer.bundle_items || offer.bundle_items.length === 0) return null;

    const bundlePrice = offer.bundle_price || 0;
    const originalPrice = offer.original_bundle_price || bundlePrice;
    const discount = originalPrice - bundlePrice;
    const discountPercent = Math.round((discount / originalPrice) * 100);

    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-purple-200">
        <div className="relative">
          {offer.image ? (
            <img 
              src={offer.image} 
              alt={offer.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.jpg';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <Gift className="w-16 h-16 text-purple-400" />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-2 rounded-full">
            <div className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-bold">باقة حصرية</span>
            </div>
          </div>
          <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercent}%
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">{offer.title}</h3>
          {offer.description && (
            <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
          )}
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">يشمل:</p>
            <ul className="space-y-1">
              {offer.bundle_items.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <Link 
                    to={`/product/${item.product_id}`}
                    className="hover:text-purple-600 transition-colors"
                  >
                    {item.product_name} (x{item.quantity})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-purple-600">{bundlePrice.toFixed(2)} شيكل</span>
            </div>
            <span className="text-lg text-gray-400 line-through">{originalPrice.toFixed(2)} شيكل</span>
            <div className="text-lg text-green-600 font-bold">
              وفر {discount.toFixed(2)} شيكل
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              triggerAnimation(e.currentTarget, {
                image: offer.image,
                name: offer.title
              });
              addItem({
                id: offer.id,
                name: offer.title,
                price: bundlePrice,
                image: offer.image || '',
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
          {timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0 ? (
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
          ) : null}
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Flash Deals */}
        {flashDeals.length > 0 && (
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
              {flashDeals.map(offer => (
                <FlashDealCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Weekly Deals */}
        {weeklyDeals.length > 0 && (
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
              {weeklyDeals.map(offer => (
                <ProductCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {/* Bundle Offers */}
        {bundleOffers.length > 0 && (
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
              {bundleOffers.map(offer => (
                <BundleCard key={offer.id} offer={offer} />
              ))}
            </div>
          </section>
        )}

        {offers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">لا توجد عروض متاحة حالياً</p>
          </div>
        )}

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
