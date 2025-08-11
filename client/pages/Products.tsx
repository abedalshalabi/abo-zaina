import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  discount?: number;
  inStock: boolean;
}

const Products = () => {
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedBrand, setSelectedBrand] = useState("الكل");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Map URL paths to category names
  const pathToCategoryMap: { [key: string]: string } = {
    "/kitchen": "أجهزة المطبخ",
    "/cooling": "التكييف والتبريد",
    "/small-appliances": "الأجهزة الصغيرة",
    "/washing": "أجهزة الغسيل",
    "/cleaning": "أجهزة التنظيف",
    "/electronics": "الإلكترونيات",
    "/lighting": "الإلكترونيات", // Map lighting to electronics for now
    "/tools": "الأجهزة الصغيرة" // Map tools to small appliances for now
  };

  // Auto-select category based on current route
  useEffect(() => {
    const categoryFromPath = pathToCategoryMap[location.pathname];
    if (categoryFromPath) {
      setSelectedCategory(categoryFromPath);
    } else {
      setSelectedCategory("الكل");
    }
  }, [location.pathname]);

  const categories = [
    "الكل",
    "أجهزة المطبخ",
    "التكييف والتبريد", 
    "الأجهزة الصغيرة",
    "أجهزة الغسيل",
    "أجهزة التنظيف",
    "الإلكترونيات"
  ];

  const brands = [
    "الكل",
    "LG",
    "Samsung", 
    "Whirlpool",
    "Bosch",
    "Panasonic",
    "Philips",
    "Siemens"
  ];

  const allProducts: Product[] = [
    {
      id: 1,
      name: "ثلاجة LG 18 قدم مع فريزر علوي",
      price: 2500,
      originalPrice: 3000,
      image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop",
      rating: 4.5,
      reviews: 124,
      category: "أجهزة المطبخ",
      brand: "LG",
      discount: 17,
      inStock: true,
    },
    {
      id: 2,
      name: "غسالة Samsung أتوماتيك 8 كيلو",
      price: 1800,
      originalPrice: 2200,
      image: "https://images.samsung.com/is/image/samsung/p6pim/levant/ww80j5555fx-sg/gallery/levant-front-loading-washer-ww80j5555fx-sg-ww80j5555fx-sg-frontinox-205395767?$650_519_PNG$",
      rating: 4.3,
      reviews: 89,
      category: "أجهزة الغسيل",
      brand: "Samsung",
      discount: 18,
      inStock: true,
    },
    {
      id: 3,
      name: "مكيف شارب 18 وحدة بارد حار",
      price: 1200,
      originalPrice: 1500,
      image: "https://www.sharp-me.com/content/dam/sites/sharp-me/product/air-conditioner/split-ac/ah-ap18uhea/AH-AP18UHEA_001.png",
      rating: 4.7,
      reviews: 67,
      category: "التكييف والتبريد",
      brand: "Sharp",
      discount: 20,
      inStock: true,
    },
    {
      id: 4,
      name: "ميكروويف Panasonic 25 لتر",
      price: 450,
      originalPrice: 600,
      image: "https://panasonic.net/cns/microwave/products/nn-st34h/img/nn-st34h_main.png",
      rating: 4.2,
      reviews: 156,
      category: "الأجهزة الصغيرة",
      brand: "Panasonic",
      discount: 25,
      inStock: true,
    },
    {
      id: 5,
      name: "مكنسة كهربائية Bosch بدون كيس",
      price: 680,
      originalPrice: 800,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
      rating: 4.4,
      reviews: 93,
      category: "أجهزة التنظيف",
      brand: "Bosch",
      discount: 15,
      inStock: false,
    },
    {
      id: 6,
      name: "تلفزيون Samsung 55 بوصة 4K",
      price: 2200,
      originalPrice: 2800,
      image: "https://images.samsung.com/is/image/samsung/p6pim/levant/ua55au7000uxzn/gallery/levant-uhd-4k-smart-tv-au7000-ua55au7000uxzn-531425220?$650_519_PNG$",
      rating: 4.6,
      reviews: 201,
      category: "الإلكترونيات",
      brand: "Samsung",
      discount: 21,
      inStock: true,
    },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "الكل" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "الكل" || product.brand === selectedBrand;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy]);

  const ProductCard = ({ product }: { product: Product }) => (
    <Link to={`/product/${product.id}`} className="product-card p-4 group block hover:transform hover:scale-105 transition-all duration-300">
      <div className="relative mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        {product.discount && (
          <span className="absolute top-2 right-2 bg-brand-orange text-white px-2 py-1 rounded-lg text-sm font-semibold">
            خصم {product.discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <span className="text-white font-semibold">نفدت الكمية</span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-brand-blue transition-colors line-clamp-2">
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
        <span className="text-xl font-bold text-brand-green">{product.price} ₪</span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through">{product.originalPrice} ₪</span>
                )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (product.inStock) {
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
          }
        }}
        className={`w-full py-2 rounded-lg transition-colors ${
          product.inStock
            ? "bg-brand-blue text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!product.inStock}
      >
        {product.inStock ? "أضف للسلة" : "نفدت الكمية"}
      </button>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-6 ${showFilters ? 'mb-6' : ''}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4">البحث والفلترة</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن المنتجات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">الفئة</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">العلامة التجارية</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">السعر</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0 ₪</span>
                    <span>{priceRange[1]} ₪</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    الفلاتر
                  </button>
                  
                  <span className="text-gray-600">
                    {filteredProducts.length} منتج
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                  >
                    <option value="default">ترتيب افتراضي</option>
                    <option value="price-low">السعر: من الأقل للأعلى</option>
                    <option value="price-high">السعر: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="name">الاسم</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden self-start">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-brand-blue text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-brand-blue text-white" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-2 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600 mb-4">لم يتم العثور على منتجات تطابق معايير البحث</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("الكل");
                    setSelectedBrand("الكل");
                    setPriceRange([0, 10000]);
                  }}
                  className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
