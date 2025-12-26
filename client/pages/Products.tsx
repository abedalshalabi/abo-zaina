import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
import SEO from "../components/SEO";
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
  stockStatus?: string;
  categoryId?: number;
  categoryIds?: number[];
  filterValues?: Record<string, any>;
}

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

const Products = () => {
  const { addItem } = useCart();
  const { triggerAnimation } = useAnimation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
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
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string }>({});
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistProcessing, setWishlistProcessing] = useState<Record<number, boolean>>({});

  const selectedParentCategory = useMemo(() => {
    if (selectedCategoryId === null) {
      return null;
    }

    const numericId = Number(selectedCategoryId);
    if (Number.isNaN(numericId)) {
      return null;
    }

    const fromMain = categories.find((cat) => Number(cat.id) === numericId);
    if (fromMain) {
      return fromMain;
    }

    const fromAll = allCategoriesList.find((cat) => Number(cat.id) === numericId);
    return fromAll || null;
  }, [selectedCategoryId, categories, allCategoriesList]);

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

  const flattenCategories = useCallback((categoriesData: any[]): any[] => {
    const result: any[] = [];

    const traverse = (nodes: any[], parentId: number | null = null) => {
      if (!Array.isArray(nodes)) {
        return;
      }

      nodes.forEach((node) => {
        if (!node) return;

        const currentIdRaw = node.id;
        const currentId = currentIdRaw !== undefined && currentIdRaw !== null ? Number(currentIdRaw) : NaN;
        const normalizedCurrentId = Number.isNaN(currentId) ? null : currentId;

        const parentIdRaw =
          node.parent_id !== undefined && node.parent_id !== null ? node.parent_id : parentId;
        const normalizedParentId =
          parentIdRaw !== undefined && parentIdRaw !== null && !Number.isNaN(Number(parentIdRaw))
            ? Number(parentIdRaw)
            : null;

        const normalizedNode = {
          ...node,
          id: normalizedCurrentId ?? node.id,
          parent_id: normalizedParentId,
        };

        result.push(normalizedNode);

        if (Array.isArray(node.children) && node.children.length > 0 && normalizedCurrentId !== null) {
          traverse(node.children, normalizedCurrentId);
        }
      });
    };

    traverse(categoriesData);
    return result;
  }, []);

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

        const mainCategories = categoriesResponse.data || [];
        const allCategoriesData = allCategoriesResponse.data || [];

        setCategories(
          Array.isArray(mainCategories)
            ? mainCategories.map((category) => ({
              ...category,
              id: Number(category.id),
              parent_id:
                category.parent_id !== undefined && category.parent_id !== null
                  ? Number(category.parent_id)
                  : null,
            }))
            : []
        );
        setAllCategoriesList(flattenCategories(allCategoriesData));
        const allBrandsData = brandsResponse.data || [];
        setAllBrands(allBrandsData);
        setBrands(allBrandsData);

        // Load products (will be triggered by the filters useEffect)
      } catch (err) {
        setError("حدث خطأ في تحميل البيانات");
        console.error("Error loading data:", err);
        setLoading(false); // Only stop loading on error, otherwise wait for product load
      }
      // Removed finally block to prevent loading flash
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

  // Products will be loaded by the filters useEffect below

  // Read category_id, brand_id, and search from URL and set selected values
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle search query from URL
    const searchFromUrl = params.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    } else {
      // Reset search query if not in URL
      setSearchQuery("");
    }

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
      setSelectedCategoryId(null);
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
    setSelectedCategoryId(null);
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
      const parentCategoryId = Number(category.parent_id);
      const parentCategory =
        categories.find(cat => Number(cat.id) === parentCategoryId) ||
        allCategoriesList.find(cat => Number(cat.id) === parentCategoryId);
      if (parentCategory) {
        setSelectedCategoryId(Number(parentCategory.id));
        setSelectedSubcategory(category);

        // Load subcategories for the parent
        await loadSubcategories(Number(parentCategory.id));

        // Load filters for the child category
        await loadCategoryFilters(Number(category.id));
      }
    } else {
      // If it's a parent category
      setSelectedCategoryId(Number(category.id));
      setSelectedSubcategory(null);
      setSubcategories([]);
      setCategoryFilters([]);
      setSelectedFilters({});

      // Load subcategories or filters if needed
      if (category.has_children) {
        await loadSubcategories(Number(category.id));
      } else {
        await loadCategoryFilters(Number(category.id));
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
          filters.category_id = Number(selectedSubcategory.id);
        } else if (selectedCategoryId !== null) {
          filters.category_id = selectedCategoryId;
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

        const primaryCategoryIdRaw =
          product.category_id !== undefined && product.category_id !== null
            ? product.category_id
            : product.category?.id;
        const normalizedPrimaryCategoryId =
          primaryCategoryIdRaw !== undefined && primaryCategoryIdRaw !== null
            ? Number(primaryCategoryIdRaw)
            : undefined;

        const mappedCategoryIds = Array.isArray(product.categories)
          ? product.categories
            .map((cat: any) => {
              const catId = cat?.id;
              const numericId = catId !== undefined && catId !== null ? Number(catId) : NaN;
              return Number.isNaN(numericId) ? null : numericId;
            })
            .filter((id: number | null): id is number => id !== null)
          : [];

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
          inStock: product.stock_status === 'stock_based'
            ? (product.stock_quantity || 0) > 0
            : (product.stock_status === 'in_stock' || (product.in_stock !== false && product.stock_status !== 'out_of_stock')),
          stockStatus: product.stock_status || 'in_stock',
          categoryId:
            normalizedPrimaryCategoryId !== undefined && !Number.isNaN(normalizedPrimaryCategoryId)
              ? normalizedPrimaryCategoryId
              : undefined,
          categoryIds: mappedCategoryIds,
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

      const isMainCategorySelected = !selectedSubcategory && selectedCategoryId === null;
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

  // Track loading state with ref to avoid closure staleness in Observer
  const loadingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    loadingRef.current = loading || loadingMore;
  }, [loading, loadingMore]);

  // Load more products (for infinity scroll)
  const loadMoreProducts = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      loadProducts(currentPage + 1, true);
    }
  }, [currentPage, hasMore]); // Removed loading/loadingMore from deps to avoid recreating function constantly

  // Track if initial load has happened
  const initialLoadRef = useRef(false);

  // Reload products when filters change (reset to page 1)
  useEffect(() => {
    // Wait for categories/brands to be loaded before first load
    if (!initialLoadRef.current && (categories.length === 0 && brands.length === 0)) {
      return;
    }

    initialLoadRef.current = true;

    // Debounce increased to 500ms to allow user to finish typing/clicking
    const timeoutId = setTimeout(() => {
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      loadProducts(1, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategoryId, selectedSubcategory, selectedBrand, priceRange, sortBy, selectedFilters, categories.length, brands.length]);

  // Infinity scroll observer - تحميل تلقائي عند التمرير
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const loadMoreTrigger = document.getElementById('load-more-trigger');

    // Only attach observer if we have more to load and the trigger exists
    if (loadMoreTrigger && hasMore) {
      observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0];
          if (target.isIntersecting && !loadingRef.current) {
            console.log('Intersection detected, triggering loadMore');
            loadMoreProducts();
          }
        },
        {
          root: null,
          rootMargin: '200px', // Pre-load well before reaching bottom
          threshold: 0,
        }
      );

      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMore, loadMoreProducts, products.length]); // Re-attach when products change (position changes)

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

    if (selectedCategoryId !== null) {
      const relevantIds = getDescendantCategoryIds(selectedCategoryId);

      const categoryFiltered = products.filter((product) => {
        const primaryMatches =
          product.categoryId !== undefined && product.categoryId !== null
            ? relevantIds.has(Number(product.categoryId))
            : false;
        const additionalMatches = Array.isArray(product.categoryIds)
          ? product.categoryIds.some((id) => relevantIds.has(Number(id)))
          : false;
        return primaryMatches || additionalMatches;
      });

      return applyAttributeFilters(categoryFiltered);
    }

    return applyAttributeFilters(products);
  }, [products, selectedSubcategory, selectedCategoryId, getDescendantCategoryIds, applyAttributeFilters]);

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
        className="product-card p-2 md:p-4 group block hover:transform hover:scale-105 transition-all duration-300"
      >
        <div className="relative mb-2 md:mb-4">
          <img
            src={product.image || product.images?.[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-32 md:h-48 object-contain bg-white rounded-lg"
            onError={(e) => {
              console.error("Image load error for product", product.id, ":", e.currentTarget.src);
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold">
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
            className={`absolute top-1 left-1 md:top-2 md:left-2 p-1.5 md:p-2 rounded-full shadow-md transition-colors ${isInWishlist ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-gray-50"
              }`}
            aria-pressed={isInWishlist}
            aria-label={isInWishlist ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            disabled={isProcessingWishlist}
          >
            <Heart
              className={`w-3 h-3 md:w-4 md:h-4 ${isInWishlist ? "text-red-500" : "text-gray-600"}`}
              fill={isInWishlist ? "currentColor" : "none"}
            />
          </button>
        </div>

        <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 group-hover:text-brand-blue transition-colors line-clamp-2 text-sm md:text-base">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-1 md:mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs md:text-sm text-gray-600">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="text-lg md:text-xl font-bold text-brand-green">{formatPrice(product.price)} ₪</span>
          {product.originalPrice && product.originalPrice > 0 && product.originalPrice > product.price && (
            <span className="text-sm md:text-base text-gray-500 line-through">{formatPrice(product.originalPrice)} ₪</span>
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
          className={`w-full py-1.5 md:py-2 rounded-lg transition-colors text-sm md:text-base ${product.inStock ? "bg-brand-blue text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          disabled={!product.inStock}
        >
          {product.inStock ? "أضف للسلة" : "نفدت الكمية"}
        </button>
      </Link>
    );
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = `${siteUrl}${location.pathname}${location.search}`;

  // Get category name for SEO
  const categoryName = selectedParentCategory?.name || selectedSubcategory?.name || '';
  const pageTitle = categoryName
    ? `${categoryName} - منتجات | أبو زينة للتقنيات - أجهزة كهربائية في جنين`
    : 'جميع المنتجات | أبو زينة للتقنيات - أجهزة كهربائية وإلكترونيات في جنين';
  const pageDescription = categoryName
    ? `تصفح مجموعة واسعة من منتجات ${categoryName} في أبو زينة للتقنيات، جنين. أفضل الأسعار والجودة المضمونة. توصيل سريع وضمان شامل.`
    : 'تصفح جميع منتجاتنا من الأجهزة الكهربائية والإلكترونية في أبو زينة للتقنيات، جنين. أفران، ثلاجات، غسالات، تلفزيونات، هواتف ذكية وأكثر. توصيل سريع وضمان شامل.';

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": siteUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "المنتجات",
      "item": currentUrl
    }
  ];

  if (selectedParentCategory) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": breadcrumbItems.length + 1,
      "name": selectedParentCategory.name,
      "item": `${siteUrl}/products?category_id=${selectedParentCategory.id}`
    });
  }

  if (selectedSubcategory) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": breadcrumbItems.length + 1,
      "name": selectedSubcategory.name,
      "item": `${siteUrl}/products?category_id=${selectedSubcategory.id}`
    });
  }

  // Structured Data for Product Collection - Multiple Schemas
  const structuredDataArray = [
    // CollectionPage Schema
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": pageTitle,
      "description": pageDescription,
      "url": currentUrl,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": products.length
      }
    },
    // BreadcrumbList Schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${categoryName}, منتجات, أجهزة كهربائية, إلكترونيات, ثلاجات, غسالات, جنين, أبو زينة, أبو زينة للتقنيات, تسوق أونلاين, تفاصيل المنتجات`}
        url={currentUrl}
        structuredData={structuredDataArray}
      />
      <Header
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 space-y-6 ${showFilters ? 'mb-6' : ''} lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:scrollbar-hide`}>
            {/* Mobile Overlay */}
            {showFilters && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
            )}

            {/* Filters Panel */}
            <div className={`lg:relative fixed lg:top-auto top-32 right-4 lg:right-auto h-[70vh] lg:h-auto w-[75vw] lg:w-auto max-w-xs lg:max-w-none z-50 lg:z-auto transform transition-transform duration-300 ease-in-out ${showFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
              }`}>
              <div className="bg-white h-full lg:h-auto p-4 sm:p-6 rounded-xl lg:rounded-lg shadow-2xl lg:shadow-sm overflow-y-auto">
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
                    value={selectedCategoryId !== null ? selectedCategoryId.toString() : ""}
                    onChange={async (e) => {
                      const categoryIdValue = e.target.value;

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
                      if (categoryIdValue) {
                        const category = categories.find(cat => cat.id.toString() === categoryIdValue);
                        if (category) {
                          const numericId = Number(category.id);
                          setSelectedCategoryId(numericId);
                          params.set('category_id', numericId.toString());

                          // Remove brand_id if exists (reset when category changes)
                          params.delete('brand_id');

                          // Load subcategories or filters
                          if (category.has_children) {
                            await loadSubcategories(numericId);
                          } else {
                            await loadCategoryFilters(numericId);
                          }
                        }
                      } else {
                        setSelectedCategoryId(null);
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
                    <option value="">الكل</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>{category.name}</option>
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
                          if (selectedParentCategory) {
                            params.set('category_id', selectedParentCategory.id.toString());
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
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow text-sm ${filter.required
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
                                  className={`rounded text-brand-blue focus:ring-brand-yellow ${filter.required
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
                              className={`rounded text-brand-blue focus:ring-brand-yellow ${filter.required
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
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${filter.required
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

                {/* Reset Filters Button - Show when any filter is active */}
                {(() => {
                  const hasActiveFilters =
                    selectedCategoryId !== null ||
                    selectedSubcategory !== null ||
                    selectedBrand !== "الكل" ||
                    Object.keys(selectedFilters).length > 0 ||
                    searchQuery !== "" ||
                    (priceRange[0] !== 0 || priceRange[1] !== 50000) ||
                    sortBy !== "default" ||
                    location.search.includes('category_id') ||
                    location.search.includes('brand_id');

                  return hasActiveFilters ? (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={resetAllFilters}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
                      >
                        إعادة تعيين جميع الفلاتر
                      </button>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* Products Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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
                <div className={`grid gap-3 md:gap-6 ${viewMode === "grid"
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
                    <div
                      className="flex flex-col items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        loadMoreProducts();
                      }}
                    >
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-500 hover:text-blue-600 underline">جاري التحميل... (اضغط هنا للتحميل اليدوي)</p>
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

      {/* Floating Filter Button - Mobile Only */}
      {(() => {
        // Check if any filters are applied
        const hasActiveFilters =
          searchQuery.trim() !== "" ||
          selectedCategoryId !== null ||
          selectedSubcategory !== null ||
          selectedBrand !== "الكل" ||
          priceRange[0] !== 0 ||
          priceRange[1] !== 50000 ||
          Object.keys(selectedFilters).length > 0;

        return (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden fixed bottom-6 left-6 z-50 ${hasActiveFilters
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-600 hover:bg-blue-700'
              } text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 relative flex items-center justify-center`}
            style={{ position: 'fixed', bottom: '24px', left: '24px' }}
            aria-label="فتح الفلاتر"
          >
            <SlidersHorizontal className="w-6 h-6 flex-shrink-0" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                !
              </span>
            )}
            {showFilters && !hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                ×
              </span>
            )}
          </button>
        );
      })()}
    </div>
  );
};

export default Products;
