import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import adminApi, { adminProductsAPI, adminCategoriesAPI, adminBrandsAPI } from '@/services/adminApi';
import Swal from 'sweetalert2';

interface Category {
  id: number;
  name: string;
  filters?: Filter[];
}

interface Filter {
  name: string;
  type: 'select' | 'checkbox' | 'range' | 'text';
  options?: string[];
  required?: boolean;
}

interface Brand {
  id: number;
  name: string;
}

const AdminProductCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [availableFilters, setAvailableFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    sku: '',
    price: 0,
    original_price: 0,
    compare_price: 0,
    cost_price: 0,
    discount_percentage: 0,
    stock_quantity: 0,
    manage_stock: true,
    stock_status: 'in_stock',
    in_stock: true,
    weight: 0,
    dimensions: '',
    warranty: '',
    delivery_time: '',
    images: [] as Array<string | { image_url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }>,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    rating: 0,
    reviews_count: 0,
    views_count: 0,
    sales_count: 0,
    meta_title: '',
    meta_description: '',
    category_id: null, // Keep for backward compatibility
    categories: [] as number[], // New: multiple categories
    brand_id: null,
    features: [] as string[],
    specifications: {} as Record<string, string>,
    filter_values: {} as Record<string, string>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, brandsResponse] = await Promise.all([
        adminCategoriesAPI.getCategories(),
        adminBrandsAPI.getBrands()
      ]);

      setCategories(categoriesResponse.data);
      setBrands(brandsResponse.data);
      
      console.log('Categories loaded:', categoriesResponse.data);
      console.log('Brands loaded:', brandsResponse.data);
    } catch (err: any) {
      console.error('Error loading data:', err);
      
      let errorMessage = 'فشل في تحميل البيانات';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 500) {
          errorMessage = `خطأ في الخادم (500): ${data.message || 'خطأ غير معروف'}`;
        } else {
          errorMessage = `خطأ في تحميل البيانات (${status}): ${data.message || 'خطأ غير معروف'}`;
        }
      } else if (err.request) {
        errorMessage = 'مشكلة في الاتصال بالخادم. تأكد من أن الخادم يعمل.';
      } else {
        errorMessage = `خطأ غير متوقع: ${err.message || 'خطأ غير معروف'}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCategoryChange = (categoryId: number) => {
    setFormData(prev => ({ ...prev, category_id: categoryId }));
    
    // تحميل الفلاتر المتاحة للفئة المختارة
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    console.log('Category changed to:', categoryId);
    console.log('Selected category:', selectedCategory);
    console.log('Category filters:', selectedCategory?.filters);
    if (selectedCategory && selectedCategory.filters) {
      console.log('Setting available filters:', selectedCategory.filters);
      setAvailableFilters(selectedCategory.filters);
    } else {
      console.log('No filters found, using empty filters array');
      setAvailableFilters([]);
    }
  };

  // Function to update filters from multiple categories
  const updateFiltersFromCategories = (categoryIds: number[]) => {
    const allFilters: Filter[] = [];
    categoryIds.forEach(catId => {
      const selectedCategory = categories.find(cat => cat.id === catId);
      if (selectedCategory && selectedCategory.filters) {
        // Merge filters, avoiding duplicates by name
        selectedCategory.filters.forEach(filter => {
          const existingFilter = allFilters.find(f => f.name === filter.name);
          if (!existingFilter) {
            // Add new filter
            allFilters.push({ ...filter });
          } else {
            // If filter exists, merge options (for select/range types)
            if (filter.type === 'select' && filter.options && existingFilter.options) {
              // Merge options, avoiding duplicates
              const mergedOptions = [...existingFilter.options];
              filter.options.forEach(option => {
                if (!mergedOptions.includes(option)) {
                  mergedOptions.push(option);
                }
              });
              existingFilter.options = mergedOptions;
            }
          }
        });
      }
    });
    console.log('Merged filters from categories:', categoryIds, 'Result:', allFilters);
    setAvailableFilters(allFilters);
  };

  const handleFilterValueChange = (filterName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      filter_values: {
        ...prev.filter_values,
        [filterName]: value === "__clear__" ? "" : value
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreviews(prev => [...prev, result]);
          // Add to formData.images as well
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('handleRemoveImage called with index:', index);
    console.log('Current imagePreviews length:', imagePreviews.length);
    console.log('Current imageFiles length:', imageFiles.length);
    console.log('Current formData.images length:', formData.images.length);
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Remove from formData.images as well (only remove data URLs, not regular URLs)
    setFormData(prev => {
      // Separate data URLs (from file uploads) from regular URLs (from text input)
      const dataUrls = prev.images.filter(img => typeof img === 'string' && img.startsWith('data:'));
      const regularUrls = prev.images.filter(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')));
      
      // Remove the data URL at the specified index
      const updatedDataUrls = dataUrls.filter((_, i) => i !== index);
      
      console.log('Removing image. Data URLs before:', dataUrls.length, 'after:', updatedDataUrls.length);
      
      return {
        ...prev,
        images: [...updatedDataUrls, ...regularUrls]
      };
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_id') ? Number(value) : value
    }));

    // إذا تم تغيير الفئة، قم بتحميل الفلاتر المتاحة
    if (name === 'category_id') {
      handleCategoryChange(Number(value));
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const imageUrls = value.split(',').map(img => img.trim()).filter(img => img);
    
    // Separate data URLs (from file uploads) from regular URLs (from text input)
    setFormData(prev => {
      const dataUrls = prev.images.filter(img => typeof img === 'string' && img.startsWith('data:'));
      
      // Combine data URLs with new URLs
      return {
        ...prev,
        images: [...dataUrls, ...imageUrls]
      };
    });
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const features = value.split(',').map(feature => feature.trim()).filter(feature => feature);
    setFormData(prev => ({
      ...prev,
      features
    }));
  };

  const validateFilters = () => {
    const errors: string[] = [];
    
    availableFilters.forEach(filter => {
      const value = formData.filter_values[filter.name];
      
      if (filter.required && (!value || value.trim() === '')) {
        errors.push(`الفلتر "${filter.name}" مطلوب`);
        return;
      }
      
      if (value && filter.type === 'select' && filter.options) {
        if (!filter.options.includes(value)) {
          errors.push(`القيمة "${value}" غير صحيحة للفلتر "${filter.name}". القيم المتاحة: ${filter.options.join(', ')}`);
        }
      }
      
      // Checkbox with options (multiple values)
      if (value && filter.type === 'checkbox' && filter.options && filter.options.length > 0) {
        const selectedValues = value.split(',').map(v => v.trim()).filter(v => v);
        const invalidValues = selectedValues.filter(v => !filter.options!.includes(v));
        if (invalidValues.length > 0) {
          errors.push(`القيم "${invalidValues.join(', ')}" غير صحيحة للفلتر "${filter.name}". القيم المتاحة: ${filter.options.join(', ')}`);
        }
      }
      
      // Checkbox without options (true/false only)
      if (value && filter.type === 'checkbox' && (!filter.options || filter.options.length === 0)) {
        if (value !== 'true' && value !== 'false') {
          errors.push(`القيمة "${value}" غير صحيحة للفلتر "${filter.name}". القيم المتاحة: true, false`);
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== Form Submit Started ===');
    console.log('FormData state:', formData);
    
    try {
      setSaving(true);
      setError(null);
      
      // التحقق من صحة الفلاتر
      console.log('Validating filters...');
      const filterErrors = validateFilters();
      console.log('Filter errors:', filterErrors);
      
      if (filterErrors.length > 0) {
        console.log('Filter validation failed, stopping submit');
        setError(filterErrors.join('\n'));
        setSaving(false);
        return;
      }
      
      console.log('Filter validation passed, creating FormData...');
      
      // Create FormData for file uploads
      const uploadFormData = new FormData();
      
      // Add all product data
      uploadFormData.append('name', formData.name);
      uploadFormData.append('slug', formData.slug);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('short_description', formData.short_description);
      uploadFormData.append('sku', formData.sku);
      uploadFormData.append('price', String(Number(formData.price)));
      uploadFormData.append('original_price', String(Number(formData.original_price) || 0));
      uploadFormData.append('compare_price', String(Number(formData.compare_price) || 0));
      uploadFormData.append('cost_price', String(Number(formData.cost_price) || 0));
      uploadFormData.append('discount_percentage', String(Number(formData.discount_percentage) || 0));
      uploadFormData.append('stock_quantity', String(Number(formData.stock_quantity)));
      uploadFormData.append('stock_status', formData.stock_status);
      uploadFormData.append('weight', String(Number(formData.weight) || 0));
      uploadFormData.append('sort_order', String(Number(formData.sort_order) || 0));
      uploadFormData.append('rating', String(Number(formData.rating) || 0));
      uploadFormData.append('dimensions', formData.dimensions);
      uploadFormData.append('warranty', formData.warranty);
      uploadFormData.append('delivery_time', formData.delivery_time);
      
      // Send categories (multiple) - prefer categories array over category_id
      console.log('Categories before sending:', formData.categories, 'Category ID:', formData.category_id);
      if (formData.categories && formData.categories.length > 0) {
        uploadFormData.append('categories', JSON.stringify(formData.categories));
        console.log('Categories added to FormData:', formData.categories);
        // Also send category_id for backward compatibility (use first selected category)
        uploadFormData.append('category_id', String(formData.categories[0]));
      } else if (formData.category_id !== undefined && formData.category_id !== null) {
        // Backward compatibility: if no categories array, use category_id
        uploadFormData.append('category_id', String(formData.category_id));
        console.log('Category ID added to FormData (backward compatibility):', formData.category_id);
      } else {
        console.log('No categories or category_id in formData');
      }
      
      // Add brand_id if it has a value
      if (formData.brand_id) {
        uploadFormData.append('brand_id', String(formData.brand_id));
      }
      
      // Convert boolean fields to strings ('true' or 'false')
      const boolToString = (value: boolean): string => value ? 'true' : 'false';
      
      console.log('Boolean values before sending:', {
        manage_stock: formData.manage_stock,
        in_stock: formData.in_stock,
        is_active: formData.is_active,
        is_featured: formData.is_featured
      });
      
      uploadFormData.append('manage_stock', boolToString(formData.manage_stock));
      uploadFormData.append('in_stock', boolToString(formData.in_stock));
      uploadFormData.append('is_active', boolToString(formData.is_active));
      uploadFormData.append('is_featured', boolToString(formData.is_featured));
      
      // Convert array/object fields to JSON strings
      uploadFormData.append('features', JSON.stringify(formData.features));
      uploadFormData.append('specifications', JSON.stringify(formData.specifications));
      uploadFormData.append('filter_values', JSON.stringify(formData.filter_values));
      
      // Handle images: new image URLs and new image file uploads
      // Extract new image URLs (strings that are URLs, not data URLs)
      const newImageUrls = formData.images.filter(img => 
        typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))
      );
      
      console.log('All formData.images:', formData.images);
      console.log('Extracted newImageUrls:', newImageUrls);
      
      // Send new image URLs
      if (newImageUrls.length > 0) {
        uploadFormData.append('image_urls', JSON.stringify(newImageUrls));
        console.log('Added image_urls to FormData:', JSON.stringify(newImageUrls));
      } else {
        console.log('No image URLs to send');
      }
      
      // Add new image files
      console.log('Image files state:', imageFiles);
      console.log('Image files length:', imageFiles.length);
      console.log('New image URLs:', newImageUrls.length);
      
      if (imageFiles.length > 0) {
        console.log('Adding', imageFiles.length, 'image files to FormData');
        imageFiles.forEach((file, index) => {
          console.log(`Adding image ${index + 1}:`, file.name, file.type, file.size, 'bytes');
          // Use indexed array format: images[0], images[1], etc.
          uploadFormData.append(`images[${index}]`, file);
        });
        console.log('FormData after adding images:', Array.from(uploadFormData.entries()).filter(([key]) => key.startsWith('images')));
      } else {
        console.log('No new image files to upload');
      }
      
      console.log('Sending create request with FormData...');
      console.log('FormData keys:', Array.from(uploadFormData.keys()));
      
      console.log('Calling createProduct API...');
      const response = await adminProductsAPI.createProduct(uploadFormData);
      console.log('Create response received:', response);
      console.log('=== Create Successful ===');
      
      // Show success toast
      Swal.fire({
        icon: 'success',
        title: 'تم بنجاح!',
        text: 'تم إنشاء المنتج بنجاح',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      
      // Navigate to edit page of the newly created product
      if (response.data && response.data.id) {
        setTimeout(() => {
          navigate(`/admin/products/${response.data.id}/edit`);
        }, 1000);
      } else {
        // If no ID, navigate to products list
        setTimeout(() => {
          navigate('/admin/products');
        }, 1000);
      }
      
    } catch (err: any) {
      console.error('=== Error in handleSubmit ===');
      console.error('Error creating product:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request
      });
      
      // Show error toast
      let errorMessage = 'فشل في إنشاء المنتج';
      
      if (err.response) {
        // خطأ من الخادم
        const status = err.response.status;
        const data = err.response.data;
        
        console.log('Server error response:', data);
        
        if (status === 422) {
          // خطأ في التحقق من صحة البيانات
          errorMessage = 'خطأ في البيانات المدخلة:\n';
          if (data.errors) {
            Object.keys(data.errors).forEach(field => {
              errorMessage += `• ${field}: ${data.errors[field].join(', ')}\n`;
            });
          } else if (data.message) {
            errorMessage += data.message;
          }
        } else if (status === 500) {
          // خطأ في الخادم
          errorMessage = `خطأ في الخادم (500): ${data.message || 'خطأ غير معروف'}`;
        } else if (status === 409) {
          // تضارب في البيانات (مثل SKU مكرر)
          errorMessage = `تضارب في البيانات: ${data.message || 'البيانات المدخلة موجودة مسبقاً'}`;
        } else {
          errorMessage = `خطأ في الخادم (${status}): ${data.message || 'خطأ غير معروف'}`;
        }
      } else if (err.request) {
        // مشكلة في الاتصال
        errorMessage = 'مشكلة في الاتصال بالخادم. تأكد من أن الخادم يعمل.';
      } else {
        // خطأ آخر
        errorMessage = `خطأ غير متوقع: ${err.message || 'خطأ غير معروف'}`;
      }
      
      // Show error toast
      Swal.fire({
        icon: 'error',
        title: 'خطأ!',
        text: errorMessage,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error && !saving) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-2xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
            <div className="whitespace-pre-line">
              {error}
            </div>
          </div>
          <Button onClick={() => navigate('/admin/products')}>
            العودة للمنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/products')}
              className="flex items-center space-x-2 rtl:space-x-reverse"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إنشاء منتج جديد</h1>
              <p className="text-gray-600">إضافة منتج جديد إلى المتجر</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات المنتج الجديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <div className="whitespace-pre-line">
                    {error}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">الرابط المختصر *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    placeholder="product-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">كود المنتج *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    placeholder="SKU-001"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>الفئات *</Label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500">لا توجد فئات متاحة</p>
                    ) : (
                      <div className="space-y-2">
                        {categories.map(category => (
                          <div key={category.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                            <input
                              type="checkbox"
                              id={`category-${category.id}`}
                              checked={formData.categories.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newCategories = [...formData.categories, category.id];
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: newCategories,
                                    category_id: prev.category_id || category.id // Set category_id to first if not set
                                  }));
                                  
                                  // Update filters by merging all selected categories
                                  updateFiltersFromCategories(newCategories);
                                } else {
                                  const newCategories = formData.categories.filter(id => id !== category.id);
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: newCategories,
                                    category_id: newCategories.length > 0 ? newCategories[0] : null
                                  }));
                                  
                                  // Update filters based on remaining categories
                                  if (newCategories.length > 0) {
                                    updateFiltersFromCategories(newCategories);
                                  } else {
                                    setAvailableFilters([]);
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`category-${category.id}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">يمكنك اختيار أكثر من فئة للمنتج</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_id">العلامة التجارية</Label>
                  <Select
                    value={formData.brand_id?.toString() || ''}
                    onValueChange={(value) => handleSelectChange('brand_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العلامة التجارية" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <Label htmlFor="price">السعر *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">السعر الأصلي</Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compare_price">سعر المقارنة</Label>
                  <Input
                    id="compare_price"
                    name="compare_price"
                    type="number"
                    step="0.01"
                    value={formData.compare_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_price">سعر التكلفة</Label>
                  <Input
                    id="cost_price"
                    name="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">نسبة الخصم (%)</Label>
                  <Input
                    id="discount_percentage"
                    name="discount_percentage"
                    type="number"
                    step="0.01"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">الكمية المتاحة</Label>
                  <Input
                    id="stock_quantity"
                    name="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manage_stock">إدارة المخزون</Label>
                  <div className="flex items-center justify-between" dir="ltr">
                    <span className="text-sm text-gray-600">
                      {formData.manage_stock ? 'مفعل' : 'معطل'}
                    </span>
                    <Switch
                      id="manage_stock"
                      checked={formData.manage_stock}
                      onCheckedChange={(checked) => handleSwitchChange('manage_stock', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="in_stock">متوفر في المخزون</Label>
                  <div className="flex items-center justify-between" dir="ltr">
                    <span className="text-sm text-gray-600">
                      {formData.in_stock ? 'متوفر' : 'غير متوفر'}
                    </span>
                    <Switch
                      id="in_stock"
                      checked={formData.in_stock}
                      onCheckedChange={(checked) => handleSwitchChange('in_stock', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_status">حالة المخزون</Label>
                  <Select
                    value={formData.stock_status}
                    onValueChange={(value) => handleSelectChange('stock_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">متوفر</SelectItem>
                      <SelectItem value="out_of_stock">غير متوفر</SelectItem>
                      <SelectItem value="on_backorder">طلب مسبق</SelectItem>
                      <SelectItem value="stock_based">حسب الكمية المتوفرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Shipping & Product Details */}
                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن (كجم)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">الأبعاد (سم)</Label>
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="مثال: 50 × 30 × 20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">الضمان</Label>
                  <Input
                    id="warranty"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="مثال: ضمان شامل لمدة سنتين"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_time">وقت التوصيل</Label>
                  <Input
                    id="delivery_time"
                    name="delivery_time"
                    value={formData.delivery_time}
                    onChange={handleInputChange}
                    placeholder="مثال: 2-3 أيام عمل"
                  />
                </div>

                {/* Stats (Optional for new products) */}
                <div className="space-y-2">
                  <Label htmlFor="rating">التقييم</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.01"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviews_count">عدد المراجعات</Label>
                  <Input
                    id="reviews_count"
                    name="reviews_count"
                    type="number"
                    value={formData.reviews_count}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="views_count">عدد المشاهدات</Label>
                  <Input
                    id="views_count"
                    name="views_count"
                    type="number"
                    value={formData.views_count}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sales_count">عدد المبيعات</Label>
                  <Input
                    id="sales_count"
                    name="sales_count"
                    type="number"
                    value={formData.sales_count}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                {/* Descriptions */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="short_description">الوصف المختصر</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="وصف مختصر للمنتج"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">الوصف التفصيلي</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="وصف تفصيلي للمنتج"
                  />
                </div>

                {/* Images */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="images">صور المنتج</Label>
                  
                  {/* Image URLs (from text input) */}
                  {formData.images.filter(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))).length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700">الصور المضافة عبر الروابط:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {formData.images
                          .filter(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')))
                          .map((imageUrl, index) => (
                            <div key={`url-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                              <img
                                src={imageUrl as string}
                                alt={`صورة من رابط ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const dataUrls = formData.images.filter(img => typeof img === 'string' && img.startsWith('data:'));
                                  const regularUrls = formData.images.filter(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')));
                                  const updatedUrls = regularUrls.filter((_, i) => i !== index);
                                  setFormData(prev => ({
                                    ...prev,
                                    images: [...dataUrls, ...updatedUrls]
                                  }));
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Image Previews (from file uploads) */}
                  {imagePreviews.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700">الصور المرفوعة:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                            <img
                              src={preview}
                              alt={`صورة جديدة ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('images')?.click()}
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <Upload className="h-4 w-4" />
                        <span>إضافة صور</span>
                      </Button>
                    </div>
                    
                    {/* URL Input as fallback */}
                    <div className="mt-2">
                      <Label htmlFor="images_url" className="text-sm text-gray-500">
                        أو أدخل روابط الصور مفصولة بفواصل:
                      </Label>
                      <Input
                        id="images_url"
                        value={formData.images.filter(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))).join(', ')}
                        onChange={handleImagesChange}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <Label>المميزات</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      أضف المميزات الرئيسية للمنتج
                    </p>
                  </div>
                  
                  {/* Current Features Display */}
                  {formData.features.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2">المميزات المضافة:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                            <span>{feature}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFeatures = formData.features.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, features: newFeatures }));
                              }}
                              className="mr-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add New Feature */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أدخل ميزة جديدة..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newFeature = e.currentTarget.value.trim();
                          if (newFeature && !formData.features.includes(newFeature)) {
                            setFormData(prev => ({
                              ...prev,
                              features: [...prev.features, newFeature]
                            }));
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const newFeature = input.value.trim();
                        if (newFeature && !formData.features.includes(newFeature)) {
                          setFormData(prev => ({
                            ...prev,
                            features: [...prev.features, newFeature]
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      إضافة
                    </button>
                  </div>
                  
                  {/* Bulk Add Features */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2">أو أضف عدة مميزات مرة واحدة:</Label>
                    <Textarea
                      placeholder="أدخل المميزات مفصولة بفاصلة... مثال: توفير الطاقة, تقنية التبريد السريع, تصميم عصري"
                      rows={2}
                      onChange={(e) => {
                        const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
                        setFormData(prev => ({ ...prev, features }));
                      }}
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <Label>المواصفات التقنية</Label>
                    <p className="text-sm text-gray-600 mb-4">
                      أضف المواصفات التقنية للمنتج
                    </p>
                  </div>
                  
                  {/* Current Specifications Display */}
                  {Object.keys(formData.specifications).length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2">المواصفات المضافة:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(formData.specifications).map(([key, value], index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700">{key}</div>
                                <div className="text-sm text-gray-600">{String(value)}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSpecs = { ...formData.specifications };
                                  delete newSpecs[key];
                                  setFormData(prev => ({ ...prev, specifications: newSpecs }));
                                }}
                                className="text-red-600 hover:text-red-800 mr-2"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add New Specification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="اسم المواصفة (مثل: السعة)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="spec_key"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="القيمة (مثل: 10-15 قدم)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="spec_value"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const keyInput = document.getElementById('spec_key') as HTMLInputElement;
                          const valueInput = document.getElementById('spec_value') as HTMLInputElement;
                          const key = keyInput.value.trim();
                          const value = valueInput.value.trim();
                          
                          if (key && value) {
                            setFormData(prev => ({
                              ...prev,
                              specifications: {
                                ...prev.specifications,
                                [key]: value
                              }
                            }));
                            keyInput.value = '';
                            valueInput.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                  
                  {/* JSON Editor for Advanced Users */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 mb-2">محرر JSON متقدم:</Label>
                    <Textarea
                      value={JSON.stringify(formData.specifications, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, specifications: parsed }));
                        } catch (err) {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder='{"السعة": "10-15 قدم", "نوع الفريزر": "علوي", "تقنية No Frost": "true"}'
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      للمستخدمين المتقدمين: يمكنك تعديل المواصفات مباشرة بصيغة JSON
                    </p>
                  </div>
                </div>

                {/* Filter Values */}
                {availableFilters.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <Label>الفلاتر المتاحة</Label>
                      <p className="text-sm text-gray-600 mb-4">
                        اختر القيم المناسبة من الفلاتر المتاحة للفئة المختارة
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {availableFilters.map((filter, index) => {
                        const currentValue = formData.filter_values[filter.name];
                        const hasValue = currentValue && currentValue !== '';
                        
                        return (
                          <div key={index} className={`border rounded-lg p-4 ${hasValue ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <Label className="text-sm font-medium text-gray-900">
                                {filter.name}
                                {hasValue && <span className="text-blue-600 mr-2">✓</span>}
                              </Label>
                              <div className="flex items-center gap-2">
                                {filter.required && (
                                  <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                    مطلوب
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {filter.type}
                                </span>
                              </div>
                            </div>
                          
                          {filter.type === 'select' && filter.options && (
                            <div className="space-y-2">
                              <Select
                                value={formData.filter_values[filter.name] || ''}
                                onValueChange={(value) => handleFilterValueChange(filter.name, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر قيمة..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__clear__">إزالة التحديد</SelectItem>
                                  {filter.options.map((option, optionIndex) => (
                                    <SelectItem key={optionIndex} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formData.filter_values[filter.name] && (
                                <button
                                  type="button"
                                  onClick={() => handleFilterValueChange(filter.name, '')}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  حذف التحديد
                                </button>
                              )}
                              {!formData.filter_values[filter.name] && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // إضافة الفلتر بقيمة فارغة للبدء
                                    setFormData(prev => ({
                                      ...prev,
                                      filter_values: {
                                        ...prev.filter_values,
                                        [filter.name]: ''
                                      }
                                    }));
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                                >
                                  إضافة هذا الفلتر
                                </button>
                              )}
                            </div>
                          )}
                          
                          {filter.type === 'checkbox' && filter.options && filter.options.length > 0 && (
                            <div className="space-y-2">
                              {filter.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.filter_values[filter.name]?.includes(option) || false}
                                    onChange={(e) => {
                                      const currentValues = formData.filter_values[filter.name]?.split(',') || [];
                                      let newValues;
                                      if (e.target.checked) {
                                        newValues = [...currentValues, option].filter(v => v.trim());
                                      } else {
                                        newValues = currentValues.filter(v => v !== option);
                                      }
                                      handleFilterValueChange(filter.name, newValues.join(','));
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="mr-2 text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {filter.type === 'checkbox' && (!filter.options || filter.options.length === 0) && (
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.filter_values[filter.name] === 'true'}
                                  onChange={(e) => {
                                    handleFilterValueChange(filter.name, e.target.checked ? 'true' : 'false');
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="mr-2 text-sm text-gray-700">نعم</span>
                              </label>
                              {formData.filter_values[filter.name] === 'true' && (
                                <button
                                  type="button"
                                  onClick={() => handleFilterValueChange(filter.name, 'false')}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  حذف التحديد
                                </button>
                              )}
                              {formData.filter_values[filter.name] !== 'true' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    // إضافة الفلتر بقيمة true للبدء
                                    setFormData(prev => ({
                                      ...prev,
                                      filter_values: {
                                        ...prev.filter_values,
                                        [filter.name]: 'true'
                                      }
                                    }));
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                                >
                                  إضافة هذا الفلتر
                                </button>
                              )}
                            </div>
                          )}
                          
                          {filter.type === 'range' && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={formData.filter_values[filter.name] || ''}
                                  onChange={(e) => handleFilterValueChange(filter.name, e.target.value)}
                                  placeholder="مثال: 10-15 قدم"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.filter_values[filter.name] && (
                                  <button
                                    type="button"
                                    onClick={() => handleFilterValueChange(filter.name, '')}
                                    className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                                    title="حذف قيمة الفلتر"
                                  >
                                    حذف
                                  </button>
                                )}
                                {!formData.filter_values[filter.name] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // إضافة الفلتر بقيمة فارغة للبدء
                                      setFormData(prev => ({
                                        ...prev,
                                        filter_values: {
                                          ...prev.filter_values,
                                          [filter.name]: ''
                                        }
                                      }));
                                    }}
                                    className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                                    title="إضافة هذا الفلتر"
                                  >
                                    إضافة
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                أدخل النطاق بصيغة: من - إلى (مثال: 10-15 قدم)
                              </p>
                            </div>
                          )}
                          
                          {filter.type === 'text' && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={formData.filter_values[filter.name] || ''}
                                  onChange={(e) => handleFilterValueChange(filter.name, e.target.value)}
                                  placeholder="أدخل النص..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.filter_values[filter.name] && (
                                  <button
                                    type="button"
                                    onClick={() => handleFilterValueChange(filter.name, '')}
                                    className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                                    title="حذف النص"
                                  >
                                    حذف
                                  </button>
                                )}
                                {!formData.filter_values[filter.name] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // إضافة الفلتر بقيمة فارغة للبدء
                                      setFormData(prev => ({
                                        ...prev,
                                        filter_values: {
                                          ...prev.filter_values,
                                          [filter.name]: ''
                                        }
                                      }));
                                    }}
                                    className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                                    title="إضافة هذا الفلتر"
                                  >
                                    إضافة
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                أدخل النص المطلوب
                              </p>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fallback JSON Editor - Only show if there are filter values but no available filters */}
                {availableFilters.length === 0 && Object.keys(formData.filter_values || {}).length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="filter_values">قيم الفلاتر (JSON)</Label>
                    <Textarea
                      id="filter_values"
                      value={JSON.stringify(formData.filter_values, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, filter_values: parsed }));
                        } catch (err) {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={6}
                      placeholder='{"السعة": "10-15 قدم", "نوع الفريزر": "علوي", "تقنية No Frost": "true"}'
                      dir="ltr"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      قيم الفلاتر الخاصة بهذا المنتج بصيغة JSON. مثال: {`{"اسم الفلتر": "القيمة"}`}
                    </p>
                  </div>
                )}

                {/* SEO */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meta_title">عنوان SEO</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    placeholder="عنوان SEO للمنتج"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meta_description">وصف SEO</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="وصف SEO للمنتج"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="is_active">حالة النشاط</Label>
                  <div className="flex items-center justify-between" dir="ltr">
                    <span className="text-sm text-gray-600">
                      {formData.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_featured">منتج مميز</Label>
                  <div className="flex items-center justify-between" dir="ltr">
                    <span className="text-sm text-gray-600">
                      {formData.is_featured ? 'مميز' : 'عادي'}
                    </span>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <X className="h-4 w-4" />
                  <span>إلغاء</span>
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'إنشاء المنتج'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProductCreate;
