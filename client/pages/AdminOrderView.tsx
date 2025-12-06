import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X
} from "lucide-react";
import { adminOrdersAPI } from "../services/adminApi";
import Swal from "sweetalert2";

interface OrderItem {
  id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_city: string;
  customer_district: string;
  customer_street?: string;
  customer_building?: string;
  customer_additional_info?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const AdminOrderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    order_status: "",
    payment_status: "",
    notes: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchOrder();
  }, [id, navigate]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminOrdersAPI.getOrder(id!);
      setOrder(response.data);
      setEditData({
        order_status: response.data.order_status,
        payment_status: response.data.payment_status,
        notes: response.data.notes || ""
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في تحميل الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await adminOrdersAPI.updateOrder(id!, editData);
      setOrder(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "تم التحديث",
        text: "تم تحديث الطلب بنجاح",
        confirmButtonText: "حسناً"
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.response?.data?.message || "فشل في تحديث الطلب",
        confirmButtonText: "حسناً"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "shipped": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "معلق",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التسليم",
      cancelled: "ملغي"
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "مدفوع",
      pending: "معلق",
      failed: "فشل",
      refunded: "مسترد"
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cod: "الدفع عند الاستلام",
      bank_transfer: "تحويل بنكي",
      credit_card: "بطاقة ائتمانية",
      online: "دفع إلكتروني"
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">جاري تحميل الطلب...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">خطأ</h3>
            <p className="text-gray-600">{error || "الطلب غير موجود"}</p>
            <button
              onClick={() => navigate("/admin/orders")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              العودة إلى الطلبات
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => navigate("/admin/orders")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تفاصيل الطلب</h1>
              <p className="text-gray-600">#{order.order_number}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">عناصر الطلب</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 space-x-reverse border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                      <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {item.price.toLocaleString()} شيكل
                      </p>
                      <p className="text-sm text-gray-500">
                        الإجمالي: {item.total.toLocaleString()} شيكل
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات العميل</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900">{order.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">الهاتف</p>
                    <p className="font-medium text-gray-900" dir="ltr">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-x-reverse">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">العنوان</p>
                    <p className="font-medium text-gray-900">
                      {order.customer_city}، {order.customer_district}
                      {order.customer_street && `، ${order.customer_street}`}
                      {order.customer_building && `، مبنى ${order.customer_building}`}
                    </p>
                    {order.customer_additional_info && (
                      <p className="text-sm text-gray-500 mt-1">{order.customer_additional_info}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">حالة الطلب</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الطلب
                    </label>
                    <select
                      value={editData.order_status}
                      onChange={(e) => setEditData({ ...editData, order_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">معلق</option>
                      <option value="processing">قيد المعالجة</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التسليم</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الدفع
                    </label>
                    <select
                      value={editData.payment_status}
                      onChange={(e) => setEditData({ ...editData, payment_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">معلق</option>
                      <option value="paid">مدفوع</option>
                      <option value="failed">فشل</option>
                      <option value="refunded">مسترد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          order_status: order.order_status,
                          payment_status: order.payment_status,
                          notes: order.notes || ""
                        });
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      <X className="w-4 h-4" />
                      <span>إلغاء</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">حالة الطلب</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                      {getStatusIcon(order.order_status)}
                      <span className="mr-2">{getStatusLabel(order.order_status)}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">حالة الدفع</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">طريقة الدفع</p>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {getPaymentMethodLabel(order.payment_method)}
                      </span>
                    </div>
                  </div>
                  {order.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">ملاحظات</p>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-medium text-gray-900">
                    {order.subtotal.toLocaleString()} شيكل
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة الشحن</span>
                  <span className="font-medium text-gray-900">
                    {order.shipping_cost.toLocaleString()} شيكل
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">الإجمالي</span>
                  <span className="text-lg font-bold text-gray-900">
                    {order.total.toLocaleString()} شيكل
                  </span>
                </div>
              </div>
            </div>

            {/* Order Date */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات التاريخ</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الإنشاء</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">آخر تحديث</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.updated_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.updated_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderView;

