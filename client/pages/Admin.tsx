import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Search
} from "lucide-react";
import Header from "../components/Header";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  image: string;
  status: "active" | "inactive";
  sales: number;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const products: Product[] = [
    {
      id: 1,
      name: "ثلاجة LG 18 قدم مع فريزر علوي",
      price: 2500,
      stock: 15,
      category: "أجهزة المطبخ",
      brand: "LG",
      image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=300&fit=crop",
      status: "active",
      sales: 45,
    },
    {
      id: 2,
      name: "غسالة Samsung أتوماتيك 8 كيلو",
      price: 1800,
      stock: 8,
      category: "أجهزة الغسيل",
      brand: "Samsung",
      image: "https://images.samsung.com/is/image/samsung/p6pim/levant/ww80j5555fx-fh/gallery/levant-front-loading-washer-ww80j5555fx-fh-ww80j5555fx-fh-frontinox-205395803?$650_519_PNG$",
      status: "active",
      sales: 32,
    },
    {
      id: 3,
      name: "مكيف شارب 18 وحدة بارد حار",
      price: 1200,
      stock: 2,
      category: "التكييف والتبريد",
      brand: "Sharp",
      image: "https://www.sharp.com/health-and-home/air-conditioners/images/split-ac-hero.jpg",
      status: "active",
      sales: 28,
    },
    {
      id: 4,
      name: "ميكروويف Panasonic 25 لتر",
      price: 450,
      stock: 0,
      category: "الأجهزة الصغيرة",
      brand: "Panasonic",
      image: "https://panasonic.net/cns/microwave/products/nn-st34h/img/nn-st34h_main.png",
      status: "inactive",
      sales: 67,
    },
  ];

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalRevenue: 125000,
    totalOrders: 342,
    totalCustomers: 1250,
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-brand-blue" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مخزون منخفض</p>
              <p className="text-2xl font-bold text-brand-orange">{stats.lowStock}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-brand-orange" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">نفدت الكمية</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-brand-green">{stats.totalRevenue.toLocaleString()} ر.س</p>
            </div>
            <DollarSign className="w-8 h-8 text-brand-green" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-brand-blue" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-brand-blue" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-3">
            {products.sort((a, b) => b.sales - a.sales).slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.brand}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold">{product.sales}</p>
                  <p className="text-xs text-gray-600">مبيعات</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">تنبيهات المخزون</h3>
          <div className="space-y-3">
            {products.filter(p => p.stock <= 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${product.stock === 0 ? 'bg-red-600' : 'bg-brand-orange'}`}></div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.brand}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-brand-orange'}`}>
                    {product.stock === 0 ? 'نفدت الكمية' : `${product.stock} متبقي`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => (
    <div className="space-y-6">
      {/* Products Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
          <p className="text-gray-600">إدارة مخزون المنتجات وتحديث البيانات</p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-brand-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="البحث في المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{product.price} ₪</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock === 0 
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= 5 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock} قطعة
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{product.sales}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button className="text-brand-blue hover:text-blue-700 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 arabic">
      <Header 
        showSearch={true}
        showActions={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 space-x-reverse">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === "dashboard"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              ��وحة التحكم
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              إدارة المنتجات
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === "orders"
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              إدارة الطلبات
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">إدارة الطلبات</h3>
            <p className="text-gray-600">هذا القسم قيد التطوير وسيتم إضافته قريباً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
