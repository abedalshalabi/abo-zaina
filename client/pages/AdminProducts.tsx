import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Star,
  DollarSign,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Grid,
  List,
  Table,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Tag,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { adminProductsAPI, adminCategoriesAPI, adminBrandsAPI } from "../services/adminApi";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  compare_price?: number;
  cost_price?: number;
  discount_percentage?: number;
  stock_quantity: number;
  in_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
  };
  brand?: {
    id: number;
    name: string;
  };
  images?: Array<{
    id: number;
    image_path: string;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  sales_count: number;
  rating: number;
  reviews_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface FilterState {
  search: string;
  category: number | null;
  brand: number | null;
  priceMin: number | null;
  priceMax: number | null;
  stockStatus: 'all' | 'in_stock' | 'out_of_stock' | 'low_stock';
  status: 'all' | 'active' | 'inactive';
  featured: 'all' | 'featured' | 'not_featured';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("table"); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: null,
    brand: null,
    priceMin: null,
    priceMax: null,
    stockStatus: 'all',
    status: 'all',
    featured: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    console.log('Admin token:', token ? 'Present' : 'Missing');
    if (!token) {
      console.log('No admin token found, redirecting to login');
      navigate("/admin/login");
      return;
    }

    // تحميل البيانات الأولية والفلاتر في نفس الوقت
    loadInitialData();
    fetchProducts();
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, perPage]);


  const loadInitialData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        adminCategoriesAPI.getCategories(),
        adminBrandsAPI.getBrands()
      ]);
      
      setCategories(categoriesData.data || []);
      setBrands(brandsData.data || []);
    } catch (err: any) {
      console.error('Error loading categories/brands:', err);
      // لا نعرض خطأ هنا لأن المنتجات يمكن تحميلها بدون الفئات والماركات
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = {
        search: filters.search,
        category_id: filters.category,
        brand_id: filters.brand,
        price_min: filters.priceMin,
        price_max: filters.priceMax,
        stock_status: filters.stockStatus !== 'all' ? filters.stockStatus : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        featured: filters.featured !== 'all' ? filters.featured : undefined,
        sort: filters.sortBy,
        order: filters.sortOrder,
        page: currentPage,
        per_page: perPage
      };
      
      // إزالة القيم الفارغة
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof typeof queryParams] === undefined || 
            queryParams[key as keyof typeof queryParams] === null || 
            queryParams[key as keyof typeof queryParams] === '') {
          delete queryParams[key as keyof typeof queryParams];
        }
      });
      
      console.log('Filter Debug:', {
        filters,
        queryParams,
        currentPage
      });
      
      const data = await adminProductsAPI.getProducts(queryParams);
      
      setProducts(data.data || []);
      setTotalPages(data.meta?.last_page || 1);
      setTotalProducts(data.meta?.total || 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || "فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        await adminProductsAPI.deleteProduct(id.toString());
        setProducts(products.filter(p => p.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || "فشل في حذف المنتج");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`هل أنت متأكد من حذف ${selectedProducts.length} منتج؟`)) {
      try {
        await Promise.all(
          selectedProducts.map(id => adminProductsAPI.deleteProduct(id.toString()))
        );
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } catch (err: any) {
        setError(err.response?.data?.message || "فشل في حذف المنتجات");
      }
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // إعادة تعيين الصفحة عند تغيير الفلاتر
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: null,
      brand: null,
      priceMin: null,
      priceMax: null,
      stockStatus: 'all',
      status: 'all',
      featured: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setSearchInput("");
    setCurrentPage(1);
    setProducts([]);
  };

  const refreshProducts = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setProducts([]);
    await fetchProducts();
    setIsRefreshing(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing per page
  };

  // Debounce search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 500);
      };
    })(),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.stockStatus !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.featured !== 'all') count++;
    return count;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getStockStatus = (product: Product) => {
    if (!product.in_stock) return { status: 'out', label: 'نفد المخزون', color: 'text-red-600' };
    if (product.stock_quantity <= 5) return { status: 'low', label: 'مخزون منخفض', color: 'text-orange-600' };
    return { status: 'in', label: 'متوفر', color: 'text-green-600' };
  };


  return (
    <AdminLayout>
      <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
                <p className="text-sm text-gray-600 mt-1">
                  إجمالي المنتجات: {totalProducts.toLocaleString()} منتج
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <button
                onClick={refreshProducts}
                disabled={isRefreshing}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                title="تحديث"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => navigate("/admin/products/create")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
        {/* Search and Quick Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في المنتجات..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Per Page Selector */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm text-gray-600 whitespace-nowrap">عدد الصفوف:</label>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[80px]"
              >
                <option value={10}>10</option>
                <option value={12}>12</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => handleFilterChange('status', filters.status === 'active' ? 'all' : 'active')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  filters.status === 'active' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4 inline ml-1" />
                نشط فقط
              </button>
              
              <button
                onClick={() => handleFilterChange('featured', filters.featured === 'featured' ? 'all' : 'featured')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  filters.featured === 'featured' 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Star className="w-4 h-4 inline ml-1" />
                مميز
              </button>
              
              <button
                onClick={() => handleFilterChange('stockStatus', filters.stockStatus === 'low_stock' ? 'all' : 'low_stock')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  filters.stockStatus === 'low_stock' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 inline ml-1" />
                مخزون منخفض
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3 space-x-reverse">
              {/* Advanced Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center ${
                  showFilters || getActiveFiltersCount() > 0
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 ml-1" />
                فلاتر متقدمة
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 mr-2">
                    {getActiveFiltersCount()}
                  </span>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              </button>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="created_at">تاريخ الإنشاء</option>
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="sales_count">المبيعات</option>
                <option value="rating">التقييم</option>
                <option value="stock_quantity">المخزون</option>
              </select>

              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={filters.sortOrder === "asc" ? "ترتيب تصاعدي" : "ترتيب تنازلي"}
              >
                {filters.sortOrder === "asc" ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                  title="عرض شبكي"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                  title="عرض قائمة"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${viewMode === "table" ? "bg-blue-100 text-blue-600" : "text-gray-600"}`}
                  title="عرض جدول"
                >
                  <Table className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الماركة</label>
                  <select
                    value={filters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الماركات</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نطاق السعر</label>
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="number"
                      placeholder="من"
                      value={filters.priceMin || ''}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      value={filters.priceMax || ''}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة المخزون</label>
                  <select
                    value={filters.stockStatus}
                    onChange={(e) => handleFilterChange('stockStatus', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">الكل</option>
                    <option value="in_stock">متوفر</option>
                    <option value="out_of_stock">نفد</option>
                    <option value="low_stock">مخزون منخفض</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    <X className="w-4 h-4 ml-1" />
                    مسح جميع الفلاتر
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {products.length} من {totalProducts} منتج
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">
                  تم تحديد {selectedProducts.length} منتج
                </span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    حذف المحدد
                  </button>
                  <button
                    onClick={() => setSelectedProducts([])}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600 mb-4">
              {getActiveFiltersCount() > 0 
                ? "لم يتم العثور على منتجات تطابق معايير البحث" 
                : "لم يتم العثور على منتجات في النظام"
              }
            </p>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mr-4"
              >
                مسح الفلاتر
              </button>
            )}
            <button
              onClick={() => navigate("/admin/products/create")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              إضافة منتج جديد
            </button>
          </div>
        ) : (
          <>
            {/* Products */}
            {viewMode === "table" ? (
              /* Table View */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">جاري تحميل المنتجات...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === products.length && products.length > 0}
                            onChange={toggleAllSelection}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الفئة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المخزون
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المبيعات
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التقييم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product);
                        const hasDiscount = product.original_price && product.original_price > product.price;
                        const discountPercentage = hasDiscount 
                          ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
                          : 0;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            {/* Checkbox */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </td>

                            {/* Product */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  {product.images?.[0] ? (
                                    <img
                                      className="h-12 w-12 rounded-lg object-cover"
                                      src={product.images[0].image_url}
                                      alt={product.images[0].alt_text || product.name}
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                      }}
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {product.brand?.name}
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse mt-1">
                                    {product.is_featured && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <Star className="w-3 h-3 ml-1" />
                                        مميز
                                      </span>
                                    )}
                                    {hasDiscount && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        -{discountPercentage}%
                                      </span>
                                    )}
                                    {!product.is_active && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        غير نشط
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.category?.name || 'غير محدد'}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(product.price)}
                              </div>
                              {hasDiscount && (
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.original_price!)}
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${stockStatus.color}`}>
                                  {product.stock_quantity}
                                </span>
                                <span className="text-sm text-gray-500 mr-1">قطعة</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {stockStatus.label}
                              </div>
                            </td>

                            {/* Sales */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.sales_count}
                              </div>
                              <div className="text-xs text-gray-500">
                                مبيع
                              </div>
                            </td>

                            {/* Rating */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                                <span className="text-sm font-medium text-gray-900">
                                  {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                ({product.reviews_count} تقييم)
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.is_active ? 'نشط' : 'غير نشط'}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  stockStatus.status === 'out' ? 'bg-red-100 text-red-800' :
                                  stockStatus.status === 'low' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {stockStatus.label}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                  onClick={() => navigate(`/admin/products/${product.id}`)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="عرض التفاصيل"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            ) : (
              /* Grid/List View */
              loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل المنتجات...</p>
                  </div>
                </div>
              ) : (
                <div className={`${
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                    : "space-y-4"
                }`}>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const hasDiscount = product.original_price && product.original_price > product.price;
                const discountPercentage = hasDiscount 
                  ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
                  : 0;

                return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  {/* Product Image */}
                  <div className={`${viewMode === "grid" ? "aspect-square" : "w-32 h-32"} bg-gray-100 relative group`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].image_url}
                        alt={product.images[0].alt_text || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      {product.is_featured && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          <Star className="w-3 h-3 inline ml-1" />
                          مميز
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          -{discountPercentage}%
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          غير نشط
                        </span>
                      )}
                    </div>

                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Stock Status Overlay */}
                    <div className="absolute bottom-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        stockStatus.status === 'out' ? 'bg-red-100 text-red-700' :
                        stockStatus.status === 'low' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                        <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                          {product.category && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {product.category.name}
                            </span>
                          )}
                          {product.brand && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {product.brand.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">السعر:</span>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="font-bold text-lg text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.original_price!)}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-red-600 font-medium">
                          وفرت {formatPrice(product.original_price! - product.price)}
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <ShoppingCart className="w-4 h-4 text-blue-600 ml-1" />
                          <span className="text-sm font-medium text-gray-900">{product.sales_count}</span>
                        </div>
                        <div className="text-xs text-gray-500">مبيع</div>
                      </div>
                      
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">({product.reviews_count})</div>
                      </div>
                      
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Package className="w-4 h-4 text-green-600 ml-1" />
                          <span className="text-sm font-medium text-gray-900">{product.stock_quantity}</span>
                        </div>
                        <div className="text-xs text-gray-500">مخزون</div>
                      </div>
                      
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="w-4 h-4 text-purple-600 ml-1" />
                          <span className="text-sm font-medium text-gray-900">{product.views_count}</span>
                        </div>
                        <div className="text-xs text-gray-500">مشاهدة</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {new Date(product.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
                </div>
              )
            )}

            {/* Pagination and Stats */}
            <div className="mt-8">
              {/* Stats Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-600">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 ml-2" />
                    <span>إجمالي المنتجات: <strong>{totalProducts.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 ml-2" />
                    <span>المعروض: <strong>{products.length}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 ml-2" />
                    <span>المميز: <strong>{products.filter(p => p.is_featured).length}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 ml-2" />
                    <span>مخزون منخفض: <strong>{products.filter(p => p.stock_quantity <= 5).length}</strong></span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  تم تحميل {products.length.toLocaleString()} من {totalProducts.toLocaleString()} منتج
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
