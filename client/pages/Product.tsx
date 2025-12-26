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
import SEO from "../components/SEO";
import { productsAPI, categoriesAPI, settingsAPI } from "../services/api";
import { STORAGE_BASE_URL } from "../config/env";

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
  stockStatus: string;
  stockCount: number;
  description: string;
  features: string[];
  specifications: { [key: string]: string };
  warranty: string;
  deliveryTime: string;
  sku: string;
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

// Helper function to format price without trailing zeros
const formatPrice = (price: number | string): string => {
  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Check if it's a whole number
  if (numPrice % 1 === 0) {
    // Return as integer without decimals
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } else {
    // Return with decimals but remove trailing zeros
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).replace(/\.?0+$/, '');
  }
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
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [breadcrumbCategories, setBreadcrumbCategories] = useState<{ main?: BreadcrumbCategory; sub?: BreadcrumbCategory }>({});
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [headerSettings, setHeaderSettings] = useState<any>({});
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          const [productResponse, categoriesResponse, settingsResponse] = await Promise.all([
            productsAPI.getProduct(Number(id)),
            categoriesAPI.getCategories().catch((error) => {
              console.error("Error loading categories for breadcrumb:", error);
              return { data: [] };
            }),
            settingsAPI.getSettings('header').catch((error) => {
              console.error("Error loading settings:", error);
              return { data: {} };
            }),
          ]);

          // Set WhatsApp number and header settings from settings
          if (settingsResponse.data) {
            if (settingsResponse.data.whatsapp_number) {
              setWhatsappNumber(settingsResponse.data.whatsapp_number);
            }
            setHeaderSettings(settingsResponse.data);
          }

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
                const normalizedPath = String(img)
                  .replace(/^\/?storage\//, '')
                  .replace(/^\//, '');
                transformedImages.push(
                  img.startsWith('http')
                    ? img
                    : `${STORAGE_BASE_URL}/${normalizedPath}`
                );
              } else if (img && typeof img === 'object') {
                if (img.image_url) {
                  transformedImages.push(img.image_url);
                } else if (img.image_path) {
                  const normalizedPath = String(img.image_path)
                    .replace(/^\/?storage\//, '')
                    .replace(/^\//, '');
                  const imageUrl = img.image_path.startsWith('http')
                    ? img.image_path
                    : `${STORAGE_BASE_URL}/${normalizedPath}`;
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
            inStock: apiProduct.stock_status === 'stock_based'
              ? (apiProduct.stock_quantity || 0) > 0
              : (apiProduct.stock_status === 'in_stock' || (apiProduct.in_stock && apiProduct.stock_status !== 'out_of_stock')),
            stockStatus: apiProduct.stock_status || 'in_stock',
            stockCount: apiProduct.stock_quantity || 0,
            description: apiProduct.description || '',
            features: apiProduct.features || [],
            specifications: apiProduct.specifications || {},
            warranty: apiProduct.warranty || 'ضمان شامل',
            deliveryTime: apiProduct.delivery_time || '2-3 أيام عمل',
            sku: apiProduct.sku || ''
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
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    if (!whatsappNumber) {
      alert('رقم الواتساب غير متوفر حالياً');
      return;
    }

    // Clean phone number (remove any non-numeric characters)
    const phoneNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const productName = product.name;
    const productPrice = formatPrice(product.price);
    const productUrl = window.location.href;
    const quantityText = quantity > 1 ? `الكمية: ${quantity}` : '';

    const message = `مرحباً، أريد طلب المنتج التالي:\n\n${productName}\nالسعر: ${productPrice} ₪\n${quantityText}\n\nرابط المنتج: ${productUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (!product) return;

    const productUrl = window.location.href;
    const productName = product.name;
    const productPrice = formatPrice(product.price);
    const shareText = `${productName} - ${productPrice} ₪`;

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: productUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred, fall back to share menu
        if ((err as Error).name !== 'AbortError') {
          console.log('Share failed:', err);
        }
      }
    }

    // Show share menu
    setShowShareMenu(true);
  };

  const shareToPlatform = (platform: string) => {
    if (!product) return;

    const productUrl = window.location.href;
    const productName = product.name;
    const productPrice = formatPrice(product.price);
    const shareText = `${productName} - ${productPrice} ₪`;

    setShowShareMenu(false);

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(productUrl).then(() => {
          alert('تم نسخ رابط المنتج!');
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = productUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('تم نسخ رابط المنتج!');
        });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
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

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const productUrl = `${siteUrl}/product/${product.id}`;
  // Ensure product image URL is absolute and properly formatted
  let productImage = `${siteUrl}/placeholder.svg`;
  if (product.images && product.images[0]) {
    const img = product.images[0];
    if (img.startsWith('http')) {
      productImage = img;
    } else if (img.startsWith('/')) {
      productImage = `${STORAGE_BASE_URL}${img}`;
    } else {
      productImage = `${STORAGE_BASE_URL}/${img}`;
    }
  }

  // Build breadcrumb items for structured data
  const breadcrumbStructuredData = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": typeof window !== 'undefined' ? window.location.origin : ''
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "المنتجات",
      "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/products`
    }
  ];

  if (breadcrumbCategories.main) {
    breadcrumbStructuredData.push({
      "@type": "ListItem",
      "position": breadcrumbStructuredData.length + 1,
      "name": breadcrumbCategories.main.name,
      "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/products?category_id=${breadcrumbCategories.main.id}`
    });
  }

  if (breadcrumbCategories.sub) {
    breadcrumbStructuredData.push({
      "@type": "ListItem",
      "position": breadcrumbStructuredData.length + 1,
      "name": breadcrumbCategories.sub.name,
      "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/products?category_id=${breadcrumbCategories.sub.id}`
    });
  }

  breadcrumbStructuredData.push({
    "@type": "ListItem",
    "position": breadcrumbStructuredData.length + 1,
    "name": product.name,
    "item": productUrl
  });

  // Structured Data for Product - Multiple Schemas
  const structuredDataArray = [
    // Product Schema with enhanced details
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description || `${product.name} من ${product.brand} - متوفر في أبو زينة للتقنيات، جنين. ${product.category}`,
      "image": product.images?.map((img: string) => img.startsWith('http') ? img : `${STORAGE_BASE_URL}/${img}`) || [productImage],
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "category": product.category,
      "sku": product.id.toString(),
      "mpn": product.id.toString(),
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "ILS",
        "price": product.price.toString(),
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "أبو زينة للتقنيات"
        }
      },
      ...(product.rating > 0 && product.reviews > 0 ? {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating.toString(),
          "reviewCount": product.reviews.toString(),
          "bestRating": "5",
          "worstRating": "1"
        }
      } : {})
    },
    // BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbStructuredData
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <SEO
        title={`${product.name} - ${product.brand} | أبو زينة للتقنيات - أجهزة كهربائية في جنين`}
        description={product.description || `${product.name} من ${product.brand} - ${product.category} متوفر في أبو زينة للتقنيات، جنين. السعر: ${product.price} ₪. توصيل سريع وضمان شامل.`}
        keywords={`${product.name}, ${product.brand}, ${product.category}, أجهزة كهربائية, إلكترونيات, ثلاجات, غسالات, جنين, أبو زينة, أبو زينة للتقنيات, تفاصيل المنتجات`}
        image={productImage}
        type="product"
        url={productUrl}
        structuredData={structuredDataArray}
      />
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
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
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
            {/* Brand and SKU */}
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-semibold text-lg">{product.brand}</span>
              {product.sku && (
                <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                  كود المنتج: <span className="font-mono">{product.sku}</span>
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)} ₪</span>
              {product.originalPrice && product.originalPrice > 0 && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)} ₪</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.stockStatus === 'stock_based'
                ? (product.stockCount > 0 ? 'bg-green-500' : 'bg-red-500')
                : (product.stockStatus === 'in_stock' ? 'bg-green-500' :
                  product.stockStatus === 'out_of_stock' ? 'bg-red-500' :
                    'bg-orange-500')
                }`}></div>
              <span className={`font-medium ${product.stockStatus === 'stock_based'
                ? (product.stockCount > 0 ? 'text-green-600' : 'text-red-600')
                : (product.stockStatus === 'in_stock' ? 'text-green-600' :
                  product.stockStatus === 'out_of_stock' ? 'text-red-600' :
                    'text-orange-600')
                }`}>
                {product.stockStatus === 'stock_based'
                  ? (product.stockCount > 0 ? 'متوفر' : 'نفذت الكمية')
                  : (product.stockStatus === 'in_stock' ? 'متوفر' :
                    product.stockStatus === 'out_of_stock' ? 'غير متوفر' :
                      'طلب مسبق')}
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
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
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
                      className={`p-3 rounded-lg border-2 transition-colors ${isWishlisted
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-500'
                        }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-lg border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                        aria-label="مشاركة المنتج"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>

                      {/* Share Menu */}
                      {showShareMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowShareMenu(false)}
                          />
                          <div className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
                            <button
                              onClick={() => shareToPlatform('copy')}
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <span>📋</span>
                              <span>نسخ الرابط</span>
                            </button>
                            <button
                              onClick={() => shareToPlatform('facebook')}
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <span>📘</span>
                              <span>Facebook</span>
                            </button>
                            <button
                              onClick={() => shareToPlatform('twitter')}
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <span>🐦</span>
                              <span>Twitter</span>
                            </button>
                            <button
                              onClick={() => shareToPlatform('whatsapp')}
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <span>💬</span>
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => shareToPlatform('telegram')}
                              className="w-full text-right px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <span>✈️</span>
                              <span>Telegram</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    طلب عبر واتساب
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
                <Zap className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-800">دعم فني مجاني</p>
                  <p className="text-sm text-gray-600">خدمة عملاء متاحة</p>
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
                { key: 'specifications', label: 'المواصفات' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === tab.key
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

          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">هل تحتاج مساعدة؟</h3>
            <p className="text-blue-100 mb-6">فريق خدمة العملاء جاهز لمساعدتك في أي وقت</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {headerSettings.header_phone && (
                <a
                  href={`tel:${headerSettings.header_phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  <span>اتصل بنا: <span dir="ltr" className="inline-block">{headerSettings.header_phone}</span></span>
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  واتساب
                </a>
              )}
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
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
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