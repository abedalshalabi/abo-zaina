import { useState, useEffect, Fragment } from "react";
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
  Clock,
  X
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import { productsAPI, categoriesAPI } from "../services/api";

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

interface BreadcrumbCategory {
  id: number;
  name: string;
  parent_id: number | null;
  slug?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const deriveBreadcrumbCategories = (
  apiProduct: any,
  categoriesMap: Map<number, BreadcrumbCategory>
): { main?: BreadcrumbCategory; sub?: BreadcrumbCategory } => {
  const result: { main?: BreadcrumbCategory; sub?: BreadcrumbCategory } = {};

  if (!apiProduct || categoriesMap.size === 0) {
    return result;
  }

  const productCategories: BreadcrumbCategory[] = Array.isArray(apiProduct.categories)
    ? apiProduct.categories
        .map((cat: any) => categoriesMap.get(Number(cat.id)))
        .filter((cat): cat is BreadcrumbCategory => Boolean(cat))
    : [];

  let mainCategory: BreadcrumbCategory | undefined;
  let subCategory: BreadcrumbCategory | undefined;

  subCategory = productCategories.find((cat) => cat.parent_id !== null);

  if (subCategory && subCategory.parent_id !== null) {
    const parent = categoriesMap.get(subCategory.parent_id);
    if (parent) {
      mainCategory = parent;
    }
  }

  if (!mainCategory) {
    const primaryCategoryId = apiProduct.category?.id ?? apiProduct.category_id;
    if (primaryCategoryId) {
      const candidate = categoriesMap.get(Number(primaryCategoryId));
      if (candidate) {
        if (candidate.parent_id) {
          subCategory = subCategory || candidate;
          const parent = categoriesMap.get(candidate.parent_id);
          mainCategory = parent || candidate;
        } else {
          mainCategory = candidate;
        }
      }
    }
  }

  if (!mainCategory) {
    mainCategory = productCategories.find((cat) => cat.parent_id === null);
  }

  if (!subCategory && mainCategory) {
    subCategory = productCategories.find((cat) => cat.parent_id === mainCategory.id);
  }

  if (mainCategory) {
    result.main = mainCategory;
  }
  if (subCategory && (!mainCategory || subCategory.id !== mainCategory.id)) {
    result.sub = subCategory;
  }

  return result;
};

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, updateQuantity } = useCart();
  const { triggerAnimation } = useAnimation();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [breadcrumbCategories, setBreadcrumbCategories] = useState<{ main?: BreadcrumbCategory; sub?: BreadcrumbCategory }>({});

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          const [productResponse, categoriesResponse] = await Promise.all([
            productsAPI.getProduct(Number(id)),
            categoriesAPI.getCategories().catch((error) => {
              console.error("Error loading categories for breadcrumb:", error);
              return { data: [] };
            }),
          ]);

          const apiProduct = productResponse.data;
          const categoriesData = categoriesResponse?.data || [];

          const categoriesMap = new Map<number, BreadcrumbCategory>();
          if (Array.isArray(categoriesData)) {
            const addCategoryToMap = (cat: any) => {
              if (!cat) return;
              const categoryId = Number(cat.id);
              if (!Number.isNaN(categoryId)) {
                categoriesMap.set(categoryId, {
                  id: categoryId,
                  name: cat.name,
                  parent_id:
                    cat.parent_id !== undefined && cat.parent_id !== null
                      ? Number(cat.parent_id)
                      : null,
                  slug: cat.slug,
                });
              }

              if (Array.isArray(cat.children)) {
                cat.children.forEach(addCategoryToMap);
              }
            };

            categoriesData.forEach(addCategoryToMap);
          }
          
          console.log('Product from API:', apiProduct);
          console.log('Images from API:', apiProduct.images);
          
          // Transform images array from objects to URLs
          const transformedImages: string[] = [];
          if (apiProduct.images && Array.isArray(apiProduct.images)) {
            apiProduct.images.forEach((img: any) => {
              if (typeof img === 'string') {
                transformedImages.push(img);
              } else if (img && typeof img === 'object') {
                // Extract image_url from object
                if (img.image_url) {
                  transformedImages.push(img.image_url);
                } else if (img.image_path) {
                  // Build full URL if image_path exists
                  const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL || 'https://abozaina.ps/storage';
                  const imageUrl = img.image_path.startsWith('http') 
                    ? img.image_path 
                    : `${storageBaseUrl.replace(/\/$/, '')}/${img.image_path}`;
                  transformedImages.push(imageUrl);
                }
              }
            });
          }
          
          console.log('Original images from API:', apiProduct.images);
          console.log('Transformed images URLs:', transformedImages);
          
          // Transform API data to match ProductDetail interface
          const transformedProduct: ProductDetail = {
            id: apiProduct.id,
            name: apiProduct.name,
            price: apiProduct.price,
            originalPrice: apiProduct.original_price,
            images: transformedImages.length > 0 ? transformedImages : ['/placeholder.svg'],
            rating: apiProduct.rating || 0,
            reviews: apiProduct.reviews_count || 0,
            category: apiProduct.category?.name || '',
            brand: apiProduct.brand?.name || '',
            discount: apiProduct.discount_percentage,
            inStock: apiProduct.in_stock || apiProduct.stock_quantity > 0,
            stockCount: apiProduct.stock_quantity || 0,
            description: apiProduct.description || '',
            features: apiProduct.features || [],
            specifications: apiProduct.specifications || {},
            warranty: apiProduct.warranty || 'ضمان شامل',
            deliveryTime: apiProduct.delivery_time || '2-3 أيام عمل'
          };
          
          console.log('Transformed product:', transformedProduct);
          console.log('Transformed images count:', transformedProduct.images.length);
          
          if (categoriesMap.size > 0) {
            setBreadcrumbCategories(deriveBreadcrumbCategories(apiProduct, categoriesMap));
          } else {
            setBreadcrumbCategories({});
          }

          setProduct(transformedProduct);
        } catch (err) {
          console.error('Error loading product from API:', err);
          navigate('/products');
        }
      }
    };
    
    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (product) {
      const buttonElement = event.currentTarget;
      
      // Trigger animation
      triggerAnimation(buttonElement, {
        image: product.images && product.images[0] ? product.images[0] : '/placeholder.svg',
        name: product.name
      });
      
      // Add to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images[0] ? product.images[0] : '/placeholder.svg',
        brand: product.brand || ''
      });
      // Update quantity after adding
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "الرئيسية", href: "/" },
    { label: "المنتجات", href: "/products" },
  ];

  if (breadcrumbCategories.main) {
    breadcrumbItems.push({
      label: breadcrumbCategories.main.name,
      href: `/products?category_id=${breadcrumbCategories.main.id}`,
    });
  }

  if (
    breadcrumbCategories.sub &&
    breadcrumbCategories.sub.id !== breadcrumbCategories.main?.id
  ) {
    breadcrumbItems.push({
      label: breadcrumbCategories.sub.name,
      href: `/products?category_id=${breadcrumbCategories.sub.id}`,
    });
  }

  breadcrumbItems.push({ label: product.name });

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            {breadcrumbItems.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && <ChevronLeft className="w-4 h-4" />}
                {item.href ? (
                  <Link to={item.href} className="hover:text-blue-600">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-800">{item.label}</span>
                )}
              </Fragment>
            ))}
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
                src={product.images && product.images[selectedImage] ? product.images[selectedImage] : '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-96 object-contain bg-white cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
                onError={(e) => {
                  console.error('Image load error:', e.currentTarget.src);
                  e.currentTarget.src = '/placeholder.svg';
                }}
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
                    type="button"
                  >
                    <img 
                      src={image || '/placeholder.svg'} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setSelectedImage(index);
                        setIsImageModalOpen(true);
                      }}
                      onError={(e) => {
                        console.error('Thumbnail image load error:', e.currentTarget.src);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
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
                        comment: "أفضل منتج اشتريته هذا العام. يستحق كل شيكل دفعته فيه."
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

      {/* Image Modal/Lightbox */}
      {isImageModalOpen && product && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <img
              src={product.images && product.images[selectedImage] ? product.images[selectedImage] : '/placeholder.svg'}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />

            {/* Navigation Buttons */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all z-10"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                {selectedImage + 1} / {product.images.length}
              </div>
            )}

            {/* Thumbnail Strip (optional - at bottom) */}
            {product.images.length > 1 && product.images.length <= 10 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-4xl px-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-white border-opacity-100 scale-110' 
                        : 'border-white border-opacity-30 hover:border-opacity-60'
                    }`}
                  >
                    <img
                      src={image || '/placeholder.svg'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;