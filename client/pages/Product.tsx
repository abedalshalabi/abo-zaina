import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Clock
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  discount?: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  features: string[];
  specifications: { [key: string]: string };
  warranty: string;
  deliveryTime: string;
}

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Sample product data - in a real app, this would come from an API
  const sampleProducts: ProductDetail[] = [
    {
      id: 1,
      name: "ثلاجة LG 18 قدم مع فريزر علوي",
      price: 2500,
      originalPrice: 3000,
      images: [
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"
      ],
      rating: 4.5,
      reviews: 124,
      category: "أجهزة المطبخ",
      brand: "LG",
      discount: 17,
      inStock: true,
      stockCount: 15,
      description: "ثلاجة LG الحديثة بسعة 18 قدم مكعب مع تقنية التبريد المتقدمة وفريزر علوي واسع. تتميز بتصميم أنيق وكفاءة في استهلاك الطاقة مع ضمان شامل لمدة 5 سنوات.",
      features: [
        "تقنية التبريد الذكي",
        "فريزر علوي واسع",
        "رفوف قابلة للتعديل",
        "إضاءة LED داخلية",
        "باب قابل للعكس",
        "كفاءة في الطاقة A++"
      ],
      specifications: {
        "السعة الإجمالية": "18 قدم مكعب",
        "نوع الفريزر": "علوي",
        "استهلاك الطاقة": "150 واط/ساعة",
        "الأبعاد": "70 × 60 × 170 سم",
        "الوزن": "65 كيلو",
        "اللون": "فضي",
        "الضمان": "5 سنوات",
        "بلد المنشأ": "كوريا الجنوبية"
      },
      warranty: "ضمان شامل لمدة 5 سنوات",
      deliveryTime: "2-3 أيام عمل"
    },
    {
      id: 2,
      name: "غسالة Samsung أتوماتيك 8 كيلو",
      price: 1800,
      originalPrice: 2200,
      images: [
        "https://images.samsung.com/is/image/samsung/p6pim/levant/ww80j5555fx-fh/gallery/levant-front-loading-washer-ww80j5555fx-fh-ww80j5555fx-fh-frontinox-205395803?$650_519_PNG$",
        "https://images.samsung.com/is/image/samsung/p6pim/levant/ww80j5555fx-fh/gallery/levant-front-loading-washer-ww80j5555fx-fh-ww80j5555fx-fh-leftinox-205395803?$650_519_PNG$",
        "https://images.samsung.com/is/image/samsung/p6pim/levant/ww80j5555fx-fh/gallery/levant-front-loading-washer-ww80j5555fx-fh-ww80j5555fx-fh-rightinox-205395803?$650_519_PNG$"
      ],
      rating: 4.3,
      reviews: 89,
      category: "أجهزة الغسيل",
      brand: "Samsung",
      discount: 18,
      inStock: true,
      stockCount: 8,
      description: "غسالة Samsung الأتوماتيكية بسعة 8 كيلو مع تقنية الغسيل الذكي وبرامج متعددة للعناية بالملابس المختلفة.",
      features: [
        "سعة 8 كيلو",
        "12 برنامج غسيل",
        "تقنية الفقاعات",
        "توفير في الماء والطاقة",
        "شاشة رقمية",
        "حماية من التسريب"
      ],
      specifications: {
        "السعة": "8 كيلو",
        "النوع": "أتوماتيكية",
        "عدد البرامج": "12 برنامج",
        "استهلاك الماء": "45 لتر/دورة",
        "الأبعاد": "60 × 60 × 85 سم",
        "الوزن": "55 كيلو",
        "اللون": "أبيض",
        "الضمان": "سنتان"
      },
      warranty: "ضمان شامل لمدة سنتين",
      deliveryTime: "1-2 أيام عمل"
    }
  ];

  useEffect(() => {
    if (id) {
      const foundProduct = sampleProducts.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate('/products');
      }
    }
  }, [id, navigate]);

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (product) {
      const buttonElement = event.currentTarget;
      
      // Trigger animation
      triggerAnimation(buttonElement, {
        image: product.images[0],
        name: product.name
      });
      
      // Add to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity
      });
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stockCount || 1)) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">المنتج غير موجود</h2>
          <p className="text-gray-600 mb-4">عذراً، لم يتم العثور على المنتج المطلوب</p>
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={false}
        showActions={false}
        showBackButton={true}
        backButtonText="العودة للمنتجات"
        backButtonLink="/products"
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4" />
            <Link to="/products" className="hover:text-blue-600">المنتجات</Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {product.discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  خصم {product.discount}%
                </div>
              )}
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand and Rating */}
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-semibold text-lg">{product.brand}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews} تقييم)</span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600">{product.price.toLocaleString()} ₪</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">{product.originalPrice.toLocaleString()} ₪</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`font-medium ${
                product.inStock ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.inStock ? `متوفر (${product.stockCount} قطعة)` : 'غير متوفر'}
              </span>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">المميزات الرئيسية:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockCount}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    إضافة للسلة
                  </button>
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isWishlisted 
                        ? 'border-red-500 bg-red-50 text-red-500' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Service Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-800">توصيل سريع</p>
                  <p className="text-sm text-gray-600">{product.deliveryTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-medium text-gray-800">ضمان شامل</p>
                  <p className="text-sm text-gray-600">{product.warranty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-800">إرجاع مجاني</p>
                  <p className="text-sm text-gray-600">خلال 14 يوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b">
            <div className="flex">
              {[
                { key: 'description', label: 'الوصف' },
                { key: 'specifications', label: 'المواصفات' },
                { key: 'reviews', label: 'التقييمات' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 mb-4">وصف المنتج</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                
                <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">المميزات:</h4>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">المواصفات التقنية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">تقييمات العملاء</h3>
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{product.rating}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{product.reviews} تقييم</div>
                    </div>
                    
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-600 w-8">{stars} ⭐</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${Math.random() * 80 + 10}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "أحمد محمد",
                        rating: 5,
                        date: "منذ أسبوع",
                        comment: "منتج ممتاز وجودة عالية، أنصح به بشدة. التوصيل كان سريع والتعامل محترف."
                      },
                      {
                        name: "فاطمة علي",
                        rating: 4,
                        date: "منذ أسبوعين",
                        comment: "جيد جداً ولكن السعر مرتفع قليلاً. الجودة ممتازة والخدمة جيدة."
                      },
                      {
                        name: "محمد السعيد",
                        rating: 5,
                        date: "منذ شهر",
                        comment: "أفضل منتج اشتريته هذا العام. يستحق كل ريال دفعته فيه."
                      }
                    ].map((review, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{review.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{review.name}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${
                                      i < review.rating 
                                        ? 'text-yellow-400 fill-current' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">هل تحتاج مساعدة؟</h3>
            <p className="text-blue-100 mb-6">فريق خدمة العملاء جاهز لمساعدتك في أي وقت</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+966114567890" 
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                <Phone className="w-5 h-5" />
                اتصل بنا: 966+ 11 456 7890
              </a>
              <a 
                href="https://wa.me/966114567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;