import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  SlidersHorizontal
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAnimation } from "../context/AnimationContext";
import Header from "../components/Header";
import { productsAPI, categoriesAPI, brandsAPI, wishlistAPI } from "../services/api";
import { STORAGE_BASE_URL } from "../config/env";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  discount?: number;
  inStock: boolean;
  categoryId?: number;
  categoryIds?: number[];
  filterValues?: Record<string, any>;
}

const Products = () => {
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedBrand, setSelectedBrand] = useState("الكل");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // API State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategoriesList, setAllCategoriesList] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [categoryFilters, setCategoryFilters] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string}>({});
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistProcessing, setWishlistProcessing] = useState<Record<number, boolean>>({});
  
  // Pagination state for infinity scroll
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Load subcategories when category changes
  const loadSubcategories = async (categoryId: number) => {
    try {
      const response = await categoriesAPI.getSubcategories(categoryId);
      setSubcategories(response.data || []);
    } catch (err) {
      console.error("Error loading subcategories:", err);
      setSubcategories([]);
    }
  };

  // Load filters when subcategory changes
  const loadCategoryFilters = async (categoryId: number) => {
    try {
      const response = await categoriesAPI.getCategoryFilters(categoryId);
      setCategoryFilters(response.data.filters || []);
    } catch (err) {
      console.error("Error loading filters:", err);
      setCategoryFilters([]);
    }
  };

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Load main categories, all categories, and all brands
        const [categoriesResponse, allCategoriesResponse, brandsResponse] = await Promise.all([
          categoriesAPI.getMainCategories(),
          categoriesAPI.getCategories(),
          brandsAPI.getBrands()
        ]);
        
        setCategories(categoriesResponse.data || []);
        setAllCategoriesList(allCategoriesResponse.data || []);
        const allBrandsData = brandsResponse.data || [];
        setAllBrands(allBrandsData);
        setBrands(allBrandsData);
        
        // Load products (will be triggered by the filters useEffect)
      } catch (err) {
        setError("حدث خطأ في تحميل البيانات");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await wishlistAPI.getWishlist();
        const idsFromResponse = Array.isArray(response?.ids)
          ? response.ids
          : Array.isArray(response?.data)
            ? response.data
                .map((item: any) =>
                  typeof item === "number"
                    ? item
                    : item?.id ?? item?.product_id ?? item?.product?.id ?? null
                )
                .filter((id: number | null) => typeof id === "number")
            : [];
        setWishlistIds(idsFromResponse.map((id: number) => Number(id)));
      } catch (err) {
        console.error("Error loading wishlist:", err);
      }
    };

    loadWishlist();
  }, []);
  
  // Load products on initial mount (after categories/brands are loaded)
  useEffect(() => {
    if (!loading && (categories.length > 0 || brands.length > 0)) {
      loadProducts(1, false);
    }
  }, []);

  // Read category_id and brand_id from URL and set selected values
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Handle category_id from URL
    const categoryIdFromUrl = params.get('category_id');
    if (categoryIdFromUrl && (categories.length > 0 || allCategoriesList.length > 0)) {
      // Search in main categories first, then in the full categories list
      const category =
        categories.find(cat => cat.id === Number(categoryIdFromUrl)) ||
        allCategoriesList.find(cat => cat.id === Number(categoryIdFromUrl));
      
      if (category) {
        handleCategorySelection(category);
      }
    } else if (!categoryIdFromUrl) {
      // Reset to "الكل" if no category_id in URL
      setSelectedCategory("الكل");
      setSelectedSubcategory(null);
      setSubcategories([]);
      setCategoryFilters([]);
      setSelectedFilters({});
    }
    
    // Handle brand_id from URL
    const brandIdFromUrl = params.get('brand_id');
    if (brandIdFromUrl && allBrands.length > 0) {
      const brand = allBrands.find(b => b.id === Number(brandIdFromUrl));
      if (brand) {
        setSelectedBrand(brand.name);
      }
    }
  }, [location.search, categories, allCategoriesList, allBrands]);

  const resetAllFilters = useCallback(() => {
    setSelectedFilters({});
    setSelectedCategory("الكل");
    setSelectedSubcategory(null);
    setSubcategories([]);
    setCategoryFilters([]);
    setSelectedBrand("الكل");
    setPriceRange([0, 50000]);
    setSearchQuery("");
    setSortBy("default");

    const params = new URLSearchParams(location.search);
    params.delete("category_id");
    params.delete("brand_id");
    const newUrl = params.toString() ? `${location.pathname}?${params.toString()}` : location.pathname;
    navigate(newUrl, { replace: true });
  }, [location.pathname, location.search, navigate]);

  // Helper function to handle category selection
  const handleCategorySelection = async (category: any) => {
    // Check if category is a parent (parent_id is null) or child (parent_id is not null)
    const isChildCategory = category.parent_id !== null && category.parent_id !== undefined;
    
    if (isChildCategory) {
      // If it's a child category, find the parent category
      const parentCategory =
        categories.find(cat => cat.id === category.parent_id) ||
        allCategoriesList.find(cat => cat.id === category.parent_id);
      if (parentCategory) {
        setSelectedCategory(parentCategory.name);
        setSelectedSubcategory(category);
        
        // Load subcategories for the parent
        await loadSubcategories(parentCategory.id);
        
        // Load filters for the child category
        await loadCategoryFilters(category.id);
      }
    } else {
      // If it's a parent category
      setSelectedCategory(category.name);
      setSelectedSubcategory(null);
      setSubcategories([]);
      setCategoryFilters([]);
      setSelectedFilters({});
      
      // Load subcategories or filters if needed
      if (category.has_children) {
        await loadSubcategories(category.id);
      } else {
        await loadCategoryFilters(category.id);
      }
    }
  };

  // Load products function with pagination support
  const loadProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Build filters object
      const filters: any = {
        search: searchQuery || undefined,
        // Send price_min only if it's greater than 0 (user has set a minimum)
        price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
        // Send price_max only if it's less than 50000 (user has set a maximum)
        price_max: priceRange[1] < 50000 ? priceRange[1] : undefined,
        page: page,
        per_page: 15, // Load 15 products per page
      };
      
      // Map sortBy to API sort parameters
      if (sortBy !== "default") {
    switch (sortBy) {
      case "price-low":
            filters.sort = 'price';
            filters.order = 'asc';
        break;
      case "price-high":
            filters.sort = 'price';
            filters.order = 'desc';
        break;
      case "rating":
            filters.sort = 'rating';
            filters.order = 'desc';
        break;
      case "name":
            filters.sort = 'name';
            filters.order = 'asc';
        break;
          default:
            filters.sort = 'created_at';
            filters.order = 'desc';
        }
      } else {
        filters.sort = 'created_at';
        filters.order = 'desc';
      }

      // Handle category filter - check URL first, then selected values
      const params = new URLSearchParams(location.search);
      const categoryIdFromUrl = params.get('category_id');
      
      if (categoryIdFromUrl) {
        // Prefer using the category ID from the URL directly (could be parent or child)
        filters.category_id = Number(categoryIdFromUrl);
      } else {
        // Use subcategory if selected, otherwise use main category
        if (selectedSubcategory) {
          filters.category_id = selectedSubcategory.id;
        } else if (selectedCategory !== "الكل") {
          const category = categories.find(cat => cat.name === selectedCategory);
          if (category) {
            filters.category_id = category.id;
          }
        }
      }

      // Add brand filter - check URL first, then selected brand
      const brandIdFromUrl = params.get('brand_id');
      if (brandIdFromUrl) {
        filters.brand_id = Number(brandIdFromUrl);
      } else if (selectedBrand !== "الكل") {
        const brand = brands.find(b => b.name === selectedBrand) || 
                      allBrands.find(b => b.name === selectedBrand);
        if (brand) {
          filters.brand_id = brand.id;
        }
      }

      console.log('Filters being sent to API:', filters);
      
      const response = await productsAPI.getProducts(filters);
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      console.log('Response meta:', response.meta);
      
      // Handle paginated response structure
      const productsData = response.data || [];
      const meta = response.meta || {};
      const currentPageNum = meta.current_page || page;
      const lastPageNum = meta.last_page || 1;
      
      console.log('Number of products from API:', productsData.length);
      console.log('Current page:', currentPageNum, 'Last page:', lastPageNum);
      
      // Transform API data to match Product interface
      const transformedProducts = productsData.map((product: any) => {
        const collectedImages: string[] = Array.isArray(product.images)
          ? product.images
              .map((img: any) => {
                if (!img) return '';
                if (typeof img === 'string') {
                  return img;
                }
                if (typeof img === 'object') {
                  if (img.image_url) {
                    return img.image_url;
                  }
                  if (img.image_path) {
                    const normalizedPath = String(img.image_path)
                      .replace(/^\/?storage\//, '')
                      .replace(/^\//, '');
                    return img.image_path.startsWith('http')
                      ? img.image_path
                      : `${STORAGE_BASE_URL}/${normalizedPath}`;
                  }
                }
                return '';
              })
              .filter((url: string) => !!url)
          : [];

        let imageUrl = '';

        const firstImageSource =
          product.rawImages?.[0] ??
          (Array.isArray(product.images) ? product.images[0] : undefined);

        if (firstImageSource) {
          if (typeof firstImageSource === 'string') {
            imageUrl = firstImageSource;
          } else if (typeof firstImageSource === 'object') {
            if (firstImageSource.image_url) {
              imageUrl = firstImageSource.image_url;
            } else if (firstImageSource.image_path) {
              const normalizedPath = String(firstImageSource.image_path)
                .replace(/^\/?storage\//, '')
                .replace(/^\//, '');
              imageUrl = firstImageSource.image_path.startsWith('http')
                ? firstImageSource.image_path
                : `${STORAGE_BASE_URL}/${normalizedPath}`;
            }
          }
        }

        if (!imageUrl && typeof product.image === 'string' && product.image.trim() !== '') {
          imageUrl = product.image;
        }

        if (!imageUrl && collectedImages.length > 0) {
          imageUrl = collectedImages[0];
        }

        if (!imageUrl) {
          imageUrl = '/placeholder.svg';
        }

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          images: collectedImages,
          image: imageUrl,
          rating: product.rating || 0,
          reviews: product.reviews_count || 0,
          category: product.category?.name || '',
          brand: product.brand?.name || '',
          discount: product.discount_percentage,
          inStock: product.in_stock !== false,
          categoryId: product.category_id ?? product.category?.id,
          categoryIds: (product.categories || []).map((cat: any) => cat.id),
          filterValues: product.filter_values || {}
        };
      });
      
      console.log('Transformed products count:', transformedProducts.length);
      
      // Extract unique brands from loaded products (use original product data)
      const uniqueBrands = new Map<string, { id: number; name: string }>();
      productsData.forEach((product: any) => {
        if (product.brand && product.brand.id && product.brand.name) {
          uniqueBrands.set(product.brand.name, {
            id: product.brand.id,
            name: product.brand.name
          });
        }
      });
      
      // Also check existing products if appending
      if (append) {
        products.forEach((product: any) => {
          if (product.brand && product.brand.trim() !== '') {
            const existingBrand = brands.find(b => b.name === product.brand);
            if (existingBrand) {
              uniqueBrands.set(existingBrand.name, {
                id: existingBrand.id || 0,
                name: existingBrand.name
              });
            }
          }
        });
      }
      
      const isMainCategorySelected = !selectedSubcategory && selectedCategory === "الكل";
      const uniqueBrandsArray = Array.from(uniqueBrands.values());
      const brandListForMainCategory = allBrands.length > 0 ? allBrands : uniqueBrandsArray;

      // Update brands list with unique brands from filtered products
      if (!append) {
        if (isMainCategorySelected) {
          setBrands(brandListForMainCategory);
        } else {
          setBrands(uniqueBrandsArray);
        }
      } else {
        if (isMainCategorySelected) {
          setBrands(brandListForMainCategory);
        } else {
          // For pagination, merge with existing brands
          setBrands(prev => {
            const merged = new Map<string, { id: number; name: string }>();
            prev.forEach(b => merged.set(b.name, b));
            uniqueBrands.forEach((brand, name) => {
              if (!merged.has(name)) {
                merged.set(name, brand);
              }
            });
            return Array.from(merged.values());
          });
        }
      }
      
      if (append) {
        // Append new products to existing ones
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        // Replace products (new search/filter)
        setProducts(transformedProducts);
        setCurrentPage(1);
      }
      
      // Check if there are more pages
      setHasMore(currentPageNum < lastPageNum);
      setCurrentPage(currentPageNum);
      
    } catch (err) {
      setError("حدث خطأ في تحميل المنتجات");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  // Load more products (for infinity scroll)
  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      loadProducts(currentPage + 1, true);
    }
  };

  // Reload products when filters change (reset to page 1)
  useEffect(() => {
    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      loadProducts(1, false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedBrand, priceRange, sortBy, selectedFilters]);
  
  // Infinity scroll observer - تحميل تلقائي عند التمرير
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let loadMoreTrigger: HTMLElement | null = null;
    
    // Wait a bit for DOM to be ready
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          if (target.isIntersecting && hasMore && !loadingMore && !loading) {
            console.log('Auto-loading more products...');
            loadMoreProducts();
          }
        },
        {
          root: null,
          rootMargin: '200px', // Start loading 200px before reaching the trigger
          threshold: 0.01, // Trigger as soon as any part is visible
        }
      );

      loadMoreTrigger = document.getElementById('load-more-trigger');
      if (loadMoreTrigger) {
        observer.observe(loadMoreTrigger);
        console.log('Infinity scroll observer attached');
      } else {
        console.warn('load-more-trigger element not found');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer && loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage, products.length]);

  // Use categories and brands from API
  const categoriesList = categories.length > 0 ? ["الكل", ...categories.map(cat => cat.name)] : ["الكل"];
  const brandsList = brands.length > 0 ? ["الكل", ...brands.map(brand => brand.name)] : ["الكل"];

  // Apply additional client-side filtering to ensure subcategory selection is respected
  const applyAttributeFilters = useCallback(
    (list: Product[]) => {
      const activeFilters = Object.entries(selectedFilters).filter(([, value]) => value && value.trim() !== "");
      if (!activeFilters.length) {
        return list;
      }

      return list.filter((product) => {
        const productFilterValues = product.filterValues || {};

        return activeFilters.some(([filterName, filterValue]) => {
          const selectedValues = filterValue
            .split(",")
            .map((val) => val.trim())
            .filter(Boolean);

          if (!selectedValues.length) {
            return true;
          }

          const productValue = productFilterValues[filterName];
          if (productValue === undefined || productValue === null) {
            return false;
          }

          const productValuesArray = Array.isArray(productValue)
            ? productValue.map((val) => String(val).trim())
            : [String(productValue).trim()];

          return selectedValues.some((selectedVal) =>
            productValuesArray.some((productVal) => productVal.toLowerCase() === selectedVal.toLowerCase())
          );
        });
      });
    },
    [selectedFilters]
  );

  const getDescendantCategoryIds = useCallback(
    (rootCategoryId: number) => {
      const result = new Set<number>();
      const queue: number[] = [rootCategoryId];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (result.has(currentId)) {
          continue;
        }

        result.add(currentId);

        allCategoriesList
          .filter((cat) => Number(cat.parent_id) === currentId)
          .forEach((child) => {
            const childId = Number(child.id);
            if (!Number.isNaN(childId) && !result.has(childId)) {
              queue.push(childId);
            }
          });
      }

      return result;
    },
    [allCategoriesList]
  );

  const productsToShow = useMemo(() => {
    if (selectedSubcategory) {
      const subcategoryId = Number(selectedSubcategory.id);
      const subcategoryProducts = products.filter((product) => {
        const matchesPrimary = product.categoryId === subcategoryId;
        const matchesAdditional = Array.isArray(product.categoryIds)
          ? product.categoryIds.includes(subcategoryId)
          : false;
        return matchesPrimary || matchesAdditional;
      });

      return applyAttributeFilters(subcategoryProducts);
    }

    if (selectedCategory !== "الكل") {
      const selectedCategoryData = categories.find((cat) => cat.name === selectedCategory);
      if (selectedCategoryData) {
        const selectedCategoryId = Number(selectedCategoryData.id);
        const relevantIds = getDescendantCategoryIds(selectedCategoryId);

        const categoryFiltered = products.filter((product) => {
          const primaryMatches = product.categoryId && relevantIds.has(product.categoryId);
          const additionalMatches = Array.isArray(product.categoryIds)
            ? product.categoryIds.some((id) => relevantIds.has(id))
            : false;
          return primaryMatches || additionalMatches;
        });

        return applyAttributeFilters(categoryFiltered);
      }
    }

    return applyAttributeFilters(products);
  }, [products, selectedSubcategory, selectedCategory, categories, getDescendantCategoryIds, applyAttributeFilters]);

  const toggleWishlist = useCallback(
    async (product: Product) => {
      const isInWishlist = wishlistIds.includes(product.id);

      setWishlistProcessing((prev) => ({ ...prev, [product.id]: true }));
      try {
        if (isInWishlist) {
          await wishlistAPI.removeFromWishlist(product.id);
          setWishlistIds((prev) => prev.filter((id) => id !== product.id));
        } else {
          await wishlistAPI.addToWishlist(product.id);
          setWishlistIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
        }
      } catch (err) {
        console.error("Error updating wishlist:", err);
      } finally {
        setWishlistProcessing((prev) => {
          const updated = { ...prev };
          delete updated[product.id];
          return updated;
        });
      }
    },
    [wishlistIds]
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const isInWishlist = wishlistIds.includes(product.id);
    const isProcessingWishlist = !!wishlistProcessing[product.id];

    return (
      <Link
        to={`/product/${product.id}`}
        className="product-card p-4 group block hover:transform hover:scale-105 transition-all duration-300"
      >
      <div className="relative mb-4">
        <img
          src={product.image || product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-48 object-contain bg-white rounded-lg"
          onError={(e) => {
            console.error("Image load error for product", product.id, ":", e.currentTarget.src);
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            خصم {(product.originalPrice - product.price).toLocaleString()} ₪
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
            if (!isProcessingWishlist) {
              toggleWishlist(product);
            }
          }}
          className={`absolute top-2 left-2 p-2 rounded-full shadow-md transition-colors ${
            isInWishlist ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-gray-50"
          }`}
          aria-pressed={isInWishlist}
          aria-label={isInWishlist ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          disabled={isProcessingWishlist}
        >
          <Heart
            className={`w-4 h-4 ${isInWishlist ? "text-red-500" : "text-gray-600"}`}
            fill={isInWishlist ? "currentColor" : "none"}
          />
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
                i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({product.reviews})</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl font-bold text-brand-green">{product.price} ₪</span>
        {product.originalPrice && product.originalPrice > 0 && (
          <span className="text-gray-500 line-through">{product.originalPrice} ₪</span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!product.inStock) return;

          const imageForAnimation = product.image || product.images?.[0] || "/placeholder.svg";
          triggerAnimation(e.currentTarget, {
            image: imageForAnimation,
            name: product.name
          });

          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageForAnimation,
            brand: product.brand
          });
        }}
        className={`w-full py-2 rounded-lg transition-colors ${
          product.inStock ? "bg-brand-blue text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={!product.inStock}
      >
        {product.inStock ? "أضف للسلة" : "نفدت الكمية"}
      </button>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-6 ${showFilters ? 'mb-6' : ''} lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:scrollbar-hide`}>
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
                <label className="block text-sm font-medium mb-2">الفئة الرئيسية</label>
                <select
                  value={selectedCategory}
                  onChange={async (e) => {
                    const categoryName = e.target.value;
                    
                    // Reset all filters and selections
                    setSelectedSubcategory(null);
                    setSubcategories([]);
                    setCategoryFilters([]);
                    setSelectedFilters({});
                    setSelectedBrand("الكل");
                    setPriceRange([0, 50000]);
                    setSearchQuery("");
                    
                    // Update URL based on selection
                    const params = new URLSearchParams(location.search);
                    if (categoryName !== "الكل") {
                      const category = categories.find(cat => cat.name === categoryName);
                      if (category) {
                        setSelectedCategory(categoryName);
                        params.set('category_id', category.id.toString());
                        
                        // Remove brand_id if exists (reset when category changes)
                        params.delete('brand_id');
                        
                        // Load subcategories or filters
                        if (category.has_children) {
                          await loadSubcategories(category.id);
                        } else {
                          await loadCategoryFilters(category.id);
                        }
                      }
                    } else {
                      setSelectedCategory("الكل");
                      params.delete('category_id');
                      params.delete('brand_id');
                    }
                    
                    // Update URL
                    const newUrl = params.toString() 
                      ? `${location.pathname}?${params.toString()}` 
                      : location.pathname;
                    navigate(newUrl, { replace: true });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  <option value="الكل">الكل</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">الفئة الفرعية</label>
                  <select
                    value={selectedSubcategory?.id || ''}
                    onChange={async (e) => {
                      const subcategoryId = e.target.value;
                      if (subcategoryId) {
                        const subcategory = subcategories.find(sub => sub.id.toString() === subcategoryId);
                        if (subcategory) {
                          setSelectedSubcategory(subcategory);
                          setSelectedFilters({});
                          // Load filters for this subcategory
                          await loadCategoryFilters(subcategory.id);
                          
                          const params = new URLSearchParams(location.search);
                          params.set('category_id', subcategory.id.toString());
                          params.delete('brand_id');
                          const newUrl = params.toString()
                            ? `${location.pathname}?${params.toString()}`
                            : location.pathname;
                          navigate(newUrl, { replace: true });
                        }
                      } else {
                        setSelectedSubcategory(null);
                        setCategoryFilters([]);
                        setSelectedFilters({});
                        
                         const params = new URLSearchParams(location.search);
                         const parentCategory = categories.find(cat => cat.name === selectedCategory);
                         if (parentCategory) {
                           params.set('category_id', parentCategory.id.toString());
                         } else {
                           params.delete('category_id');
                         }
                         const newUrl = params.toString()
                           ? `${location.pathname}?${params.toString()}`
                           : location.pathname;
                         navigate(newUrl, { replace: true });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                  >
                    <option value="">اختر الفئة الفرعية...</option>
                    {subcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Category Filters */}
              {categoryFilters.length > 0 && (
                <div className="mb-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-md">فلاتر الفئة</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      اختر القيم المناسبة لتضييق نتائج البحث
                    </p>
                  </div>
                  {categoryFilters.map((filter, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-sm font-medium">
                        {filter.name}
                        {filter.required && (
                          <span className="text-red-500 mr-1">*</span>
                        )}
                      </label>
                      {filter.type === 'select' && (
                        <select
                          value={selectedFilters[filter.name] || ''}
                          onChange={(e) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              [filter.name]: e.target.value
                            }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm ${
                            filter.required 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                        >
                          <option value="">
                            {filter.required ? 'اختر...' : 'الكل'}
                          </option>
                          {filter.options.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {filter.type === 'checkbox' && filter.options && filter.options.length > 0 && (
                        <div className="space-y-2">
                          {filter.options.map((option: string, optionIndex: number) => (
                            <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFilters[filter.name]?.split(',').includes(option) || false}
                                onChange={(e) => {
                                  const currentValues = selectedFilters[filter.name]?.split(',').filter(v => v.trim()) || [];
                                  let newValues;
                                  if (e.target.checked) {
                                    newValues = [...currentValues, option].filter(v => v.trim());
                                  } else {
                                    newValues = currentValues.filter(v => v !== option);
                                  }
                                  setSelectedFilters(prev => ({
                                    ...prev,
                                    [filter.name]: newValues.join(',')
                                  }));
                                }}
                                className={`rounded text-brand-blue focus:ring-brand-yellow ${
                                  filter.required 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : 'border-gray-300'
                                }`}
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {filter.type === 'checkbox' && (!filter.options || filter.options.length === 0) && (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters[filter.name] === 'true'}
                            onChange={(e) => {
                              setSelectedFilters(prev => ({
                                ...prev,
                                [filter.name]: e.target.checked ? 'true' : ''
                              }));
                            }}
                            className={`rounded text-brand-blue focus:ring-brand-yellow ${
                              filter.required 
                                ? 'border-red-300 focus:ring-red-500' 
                                : 'border-gray-300'
                            }`}
                          />
                          <span className="text-sm text-gray-700">نعم</span>
                        </label>
                      )}
                      {filter.type === 'range' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={selectedFilters[filter.name] || ''}
                            onChange={(e) => {
                              setSelectedFilters(prev => ({
                                ...prev,
                                [filter.name]: e.target.value
                              }));
                            }}
                            placeholder="مثال: 10-15 قدم"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                              filter.required 
                                ? 'border-red-300 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-brand-yellow'
                            }`}
                          />
                          {filter.required && (
                            <p className="text-xs text-red-500">هذا الفلتر مطلوب</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Reset Filters Button */}
                  <div className="pt-2">
                    <button
                      onClick={resetAllFilters}
                      className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">العلامة التجارية</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    
                    // Remove brand_id from URL when brand filter changes
                    const params = new URLSearchParams(location.search);
                    if (params.has('brand_id')) {
                      params.delete('brand_id');
                      const newUrl = params.toString() 
                        ? `${location.pathname}?${params.toString()}` 
                        : location.pathname;
                      navigate(newUrl, { replace: true });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  {brandsList.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">السعر</label>
                <div className="space-y-3">
                  {/* Min and Max Price Inputs */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">من</label>
                      <input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        step="100"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const minValue = Math.max(0, Math.min(parseInt(e.target.value) || 0, priceRange[1]));
                          setPriceRange([minValue, priceRange[1]]);
                        }}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">إلى</label>
                      <input
                        type="number"
                        min={priceRange[0]}
                        max="50000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const maxValue = Math.max(priceRange[0], Math.min(parseInt(e.target.value) || 50000, 50000));
                          setPriceRange([priceRange[0], maxValue]);
                        }}
                        placeholder="50000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Currency Display */}
                  <div className="text-center text-xs text-gray-500">
                    <span>النطاق: {priceRange[0]} ₪ - {priceRange[1]} ₪</span>
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
                    {productsToShow.length} منتج
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
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">جاري تحميل المنتجات...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">حدث خطأ في التحميل</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : productsToShow.length > 0 ? (
              <>
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                  : "grid-cols-1"
              }`}>
                  {productsToShow.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
                
                {/* Infinity Scroll Trigger - يتم التحميل تلقائياً عند الوصول لهذا العنصر */}
                <div id="load-more-trigger" className="py-8 text-center min-h-[100px]">
                  {loadingMore ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="mr-2 text-gray-600">جاري تحميل المزيد...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-500">جاري التحميل تلقائياً...</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">تم عرض جميع المنتجات</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600 mb-4">لم يتم العثور على منتجات تطابق معايير البحث</p>
                <button
                  onClick={resetAllFilters}
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
