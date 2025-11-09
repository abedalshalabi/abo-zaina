import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Filter,
  Settings,
  Check,
  AlertCircle
} from "lucide-react";
import { adminCategoriesAPI } from "../services/adminApi";

interface Filter {
  name: string;
  type: 'select' | 'checkbox' | 'range' | 'text';
  options?: string[];
  required?: boolean;
}

interface Category {
  id: number;
  name: string;
  filters?: Filter[];
}

const AdminCategoryFilters = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingFilter, setEditingFilter] = useState<number | null>(null);
  const [newFilter, setNewFilter] = useState<Filter>({
    name: "",
    type: "select",
    options: [],
    required: false
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (id) {
      fetchCategory();
    }
  }, [id, navigate]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await adminCategoriesAPI.getCategory(id!);
      console.log('Category response:', response);
      const data = response.data || response;
      console.log('Category data:', data);
      setCategory(data);
      const filtersData = data.filters || [];
      setFilters(filtersData);
      console.log('Filters loaded:', filtersData);
      console.log('Filters length:', filtersData.length);
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(err.response?.data?.message || "فشل في تحميل الفئة");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFilter = () => {
    if (newFilter.name.trim()) {
      setFilters([...filters, { ...newFilter }]);
      setNewFilter({
        name: "",
        type: "select",
        options: [],
        required: false
      });
    }
  };

  const handleEditFilter = (index: number) => {
    setEditingFilter(index);
  };

  const handleUpdateFilter = (index: number, updatedFilter: Filter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    setFilters(newFilters);
    setEditingFilter(null);
  };

  const handleDeleteFilter = async (index: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الفلتر؟")) {
      try {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
        
        // Auto-save after deletion
        const formattedFilters = newFilters.map(filter => ({
          name: filter.name,
          type: filter.type,
          options: filter.options || [],
          required: Boolean(filter.required)
        }));
        
        await adminCategoriesAPI.updateCategoryFilters(id!, formattedFilters);
        setSuccess("تم حذف الفلتر بنجاح");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        console.error('Delete error:', err);
        setError(err.response?.data?.message || "فشل في حذف الفلتر");
      }
    }
  };

  const handleDeleteAllFilters = async () => {
    if (window.confirm(`هل أنت متأكد من حذف جميع الفلاتر (${filters.length} فلتر)؟`)) {
      try {
        setFilters([]);
        console.log('Deleting all filters, sending empty array:', []);
        await adminCategoriesAPI.updateCategoryFilters(id!, []);
        setSuccess("تم حذف جميع الفلاتر بنجاح");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err: any) {
        console.error('Delete all error:', err);
        setError(err.response?.data?.message || "فشل في حذف جميع الفلاتر");
      }
    }
  };

  const handleSaveFilters = async () => {
    try {
      setSaving(true);
      setError("");
      
      // Ensure all required fields are properly formatted
      const formattedFilters = filters.map(filter => ({
        name: filter.name,
        type: filter.type,
        options: filter.options || [],
        required: Boolean(filter.required)
      }));
      
      console.log('Sending filters:', formattedFilters);
      
      await adminCategoriesAPI.updateCategoryFilters(id!, formattedFilters);
      
      setSuccess("تم حفظ الفلاتر بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || "فشل في حفظ الفلاتر");
    } finally {
      setSaving(false);
    }
  };

  const addOption = (filterIndex: number, option: string) => {
    if (option.trim()) {
      const newFilters = [...filters];
      if (!newFilters[filterIndex].options) {
        newFilters[filterIndex].options = [];
      }
      newFilters[filterIndex].options!.push(option.trim());
      setFilters(newFilters);
    }
  };

  const removeOption = (filterIndex: number, optionIndex: number) => {
    const newFilters = [...filters];
    newFilters[filterIndex].options!.splice(optionIndex, 1);
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/categories")}
                className="p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إدارة فلاتر الفئة</h1>
                <p className="text-gray-600">{category?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={handleSaveFilters}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "جاري الحفظ..." : "حفظ الفلاتر"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-600">{success}</p>
            </div>
          </div>
        )}

        {/* Add New Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">إضافة فلتر جديد</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الفلتر
              </label>
              <input
                type="text"
                value={newFilter.name}
                onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: السعة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الفلتر
              </label>
              <select
                value={newFilter.type}
                onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value as Filter['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="select">قائمة منسدلة</option>
                <option value="checkbox">خانات اختيار</option>
                <option value="range">نطاق</option>
                <option value="text">حقل نص</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newFilter.required}
                  onChange={(e) => setNewFilter({ ...newFilter, required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="mr-2 text-sm text-gray-700">مطلوب</span>
              </label>
            </div>

            <div>
              <button
                onClick={handleAddFilter}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة فلتر
              </button>
            </div>
          </div>
        </div>

        {/* Filters List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">فلاتر الفئة ({filters.length})</h2>
            {filters.length > 0 && (
              <button
                onClick={handleDeleteAllFilters}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                حذف جميع الفلاتر
              </button>
            )}
          </div>

          {filters.length === 0 ? (
            <div className="p-6 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فلاتر</h3>
              <p className="text-gray-600">أضف فلاتر جديدة لإدارة المنتجات في هذه الفئة</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filters.map((filter, index) => {
                console.log('Rendering filter:', filter);
                return (
                <div key={index} className="p-6">
                  {editingFilter === index ? (
                    <EditFilterForm
                      filter={filter}
                      onSave={(updatedFilter) => handleUpdateFilter(index, updatedFilter)}
                      onCancel={() => setEditingFilter(null)}
                      onAddOption={(option) => addOption(index, option)}
                      onRemoveOption={(optionIndex) => removeOption(index, optionIndex)}
                    />
                  ) : (
                    <FilterDisplay
                      filter={filter}
                      onEdit={() => handleEditFilter(index)}
                      onDelete={() => handleDeleteFilter(index)}
                    />
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EditFilterFormProps {
  filter: Filter;
  onSave: (filter: Filter) => void;
  onCancel: () => void;
  onAddOption: (option: string) => void;
  onRemoveOption: (optionIndex: number) => void;
}

const EditFilterForm = ({ filter, onSave, onCancel, onAddOption, onRemoveOption }: EditFilterFormProps) => {
  const [editedFilter, setEditedFilter] = useState<Filter>({ ...filter });
  const [newOption, setNewOption] = useState("");

  const handleSave = () => {
    onSave(editedFilter);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      onAddOption(newOption);
      setNewOption("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم الفلتر
          </label>
          <input
            type="text"
            value={editedFilter.name}
            onChange={(e) => setEditedFilter({ ...editedFilter, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الفلتر
          </label>
          <select
            value={editedFilter.type}
            onChange={(e) => setEditedFilter({ ...editedFilter, type: e.target.value as Filter['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="select">قائمة منسدلة</option>
            <option value="checkbox">خانات اختيار</option>
            <option value="range">نطاق</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedFilter.required}
              onChange={(e) => setEditedFilter({ ...editedFilter, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-700">مطلوب</span>
          </label>
        </div>
      </div>

      {(editedFilter.type === 'select' || editedFilter.type === 'checkbox') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الخيارات المتاحة
          </label>
          <div className="space-y-2">
            {editedFilter.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{option}</span>
                <button
                  onClick={() => onRemoveOption(optionIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="أضف خيار جديد"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
              />
              <button
                onClick={handleAddOption}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 space-x-reverse">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          حفظ
        </button>
      </div>
    </div>
  );
};

interface FilterDisplayProps {
  filter: Filter;
  onEdit: () => void;
  onDelete: () => void;
}

const FilterDisplay = ({ filter, onEdit, onDelete }: FilterDisplayProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4 space-x-reverse">
          <h3 className="text-lg font-medium text-gray-900">{filter.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            filter.type === 'select' ? 'bg-blue-100 text-blue-800' :
            filter.type === 'checkbox' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {filter.type === 'select' ? 'قائمة منسدلة' :
             filter.type === 'checkbox' ? 'خانات اختيار' : 'نطاق'}
          </span>
          {filter.required && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
              مطلوب
            </span>
          )}
        </div>
        
        {filter.options && filter.options.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-1">الخيارات المتاحة:</p>
            <div className="flex flex-wrap gap-1">
              {filter.options.map((option, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="تعديل الفلتر"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          title="حذف الفلتر"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AdminCategoryFilters;
