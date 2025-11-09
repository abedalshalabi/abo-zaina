import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach admin token to requests
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If the data is FormData, delete Content-Type header to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor to handle token expiration
adminApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin Authentication API
export const adminAuthAPI = {
  async login(email: string, password: string) {
    const response = await adminApi.post('/v1/admin/login', { email, password });
    return response.data;
  },
  
  async logout() {
    const response = await adminApi.post('/v1/admin/logout');
    return response.data;
  },
  
  async getUser() {
    const response = await adminApi.get('/v1/admin/user');
    return response.data;
  },
  
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await adminApi.post('/v1/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};

// Admin Dashboard API
export const adminDashboardAPI = {
  async getDashboard() {
    const response = await adminApi.get('/v1/admin/dashboard');
    return response.data;
  },
  
  async getAnalytics() {
    const response = await adminApi.get('/v1/admin/analytics');
    return response.data;
  }
};

// Admin Users API
export const adminUsersAPI = {
  async getUsers() {
    const response = await adminApi.get('/v1/admin/users');
    return response.data;
  },
  
  async createUser(userData: any) {
    const response = await adminApi.post('/v1/admin/users', userData);
    return response.data;
  },
  
  async getUser(id: string) {
    const response = await adminApi.get(`/v1/admin/users/${id}`);
    return response.data;
  },
  
  async updateUser(id: string, userData: any) {
    const response = await adminApi.put(`/v1/admin/users/${id}`, userData);
    return response.data;
  },
  
  async deleteUser(id: string) {
    const response = await adminApi.delete(`/v1/admin/users/${id}`);
    return response.data;
  },
  
  async getRoles() {
    const response = await adminApi.get('/v1/admin/roles');
    return response.data;
  },
  
  async getPermissions() {
    const response = await adminApi.get('/v1/admin/permissions');
    return response.data;
  }
};

// Admin Products API
export const adminProductsAPI = {
  async getProducts(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/products', { params: filters });
    return response.data;
  },
  
  async getProduct(id: string) {
    const response = await adminApi.get(`/v1/admin/products/${id}`);
    return response.data;
  },
  
  async createProduct(productData: any) {
    // Check if productData is FormData
    const isFormData = productData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    // Don't set Content-Type for FormData - let browser/axios set it automatically with boundary
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await adminApi.post('/v1/admin/products', productData, config);
    return response.data;
  },
  
  async updateProduct(id: string, productData: any) {
    const isFormData = productData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    // For FormData with file uploads, use POST with _method=PUT
    // This is because Laravel doesn't handle multipart/form-data well with PUT requests
    if (isFormData) {
      // Add _method field to simulate PUT request
      productData.append('_method', 'PUT');
      const response = await adminApi.post(`/v1/admin/products/${id}`, productData, config);
      return response.data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      const response = await adminApi.put(`/v1/admin/products/${id}`, productData, config);
      return response.data;
    }
  },
  
  async deleteProduct(id: string) {
    const response = await adminApi.delete(`/v1/admin/products/${id}`);
    return response.data;
  }
};

// Admin Categories API
export const adminCategoriesAPI = {
  async getCategories(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/categories', { params: filters });
    return response.data;
  },
  
  async getCategory(id: string) {
    const response = await adminApi.get(`/v1/admin/categories/${id}`);
    return response.data;
  },
  
  async createCategory(categoryData: any) {
    const isFormData = categoryData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await adminApi.post('/v1/admin/categories', categoryData, config);
    return response.data;
  },
  
  async updateCategory(id: string, categoryData: any) {
    const isFormData = categoryData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    if (isFormData) {
      categoryData.append('_method', 'PUT');
      const response = await adminApi.post(`/v1/admin/categories/${id}`, categoryData, config);
      return response.data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      const response = await adminApi.put(`/v1/admin/categories/${id}`, categoryData, config);
      return response.data;
    }
  },
  
  async deleteCategory(id: string) {
    const response = await adminApi.delete(`/v1/admin/categories/${id}`);
    return response.data;
  },

  async updateCategoryFilters(id: string, filters: any) {
    const response = await adminApi.put(`/v1/admin/categories/${id}/filters`, { filters });
    return response.data;
  }
};

// Admin Brands API
export const adminBrandsAPI = {
  async getBrands(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/brands', { params: filters });
    return response.data;
  },
  
  async getBrand(id: string) {
    const response = await adminApi.get(`/v1/admin/brands/${id}`);
    return response.data.data;
  },
  
  async createBrand(brandData: any) {
    const isFormData = brandData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    // Don't set Content-Type for FormData - let browser/axios set it automatically with boundary
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await adminApi.post('/v1/admin/brands', brandData, config);
    return response.data;
  },
  
  async updateBrand(id: string, brandData: any) {
    const isFormData = brandData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    // For FormData with file uploads, use POST with _method=PUT
    // This is because Laravel doesn't handle multipart/form-data well with PUT requests
    if (isFormData) {
      // Add _method field to simulate PUT request
      brandData.append('_method', 'PUT');
      const response = await adminApi.post(`/v1/admin/brands/${id}`, brandData, config);
      return response.data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      const response = await adminApi.put(`/v1/admin/brands/${id}`, brandData, config);
      return response.data;
    }
  },
  
  async deleteBrand(id: string) {
    const response = await adminApi.delete(`/v1/admin/brands/${id}`);
    return response.data;
  }
};

// Admin Orders API
export const adminOrdersAPI = {
  async getOrders(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/orders', { params: filters });
    return response.data;
  },
  
  async getOrder(id: string) {
    const response = await adminApi.get(`/v1/admin/orders/${id}`);
    return response.data;
  },
  
  async updateOrder(id: string, orderData: any) {
    const response = await adminApi.put(`/v1/admin/orders/${id}`, orderData);
    return response.data;
  }
};

// Admin Reviews API
export const adminReviewsAPI = {
  async getReviews(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/reviews', { params: filters });
    return response.data;
  },
  
  async updateReview(id: string, reviewData: any) {
    const response = await adminApi.put(`/v1/admin/reviews/${id}`, reviewData);
    return response.data;
  },
  
  async deleteReview(id: string) {
    const response = await adminApi.delete(`/v1/admin/reviews/${id}`);
    return response.data;
  }
};

// Site Settings API
export const adminSettingsAPI = {
  async getSettings(group: string = 'header') {
    const response = await adminApi.get(`/v1/admin/settings?group=${group}`);
    return response.data;
  },
  async getSetting(key: string) {
    const response = await adminApi.get(`/v1/admin/settings/${key}`);
    return response.data;
  },
  async updateSetting(key: string, data: { value: any; type?: string; group?: string; description?: string }) {
    const response = await adminApi.put(`/v1/admin/settings/${key}`, data);
    return response.data;
  },
  async bulkUpdate(settings: Array<{ key: string; value: any }>) {
    const response = await adminApi.post('/v1/admin/settings/bulk-update', { settings });
    return response.data;
  },
  async uploadImage(key: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await adminApi.post(`/v1/admin/settings/${key}/upload-image`, formData);
    return response.data;
  },
  async uploadImageGeneral(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await adminApi.post(`/v1/admin/settings/upload-image`, formData);
    return response.data;
  }
};

// Admin Offers API
export const adminOffersAPI = {
  async getOffers(filters: any = {}) {
    const response = await adminApi.get('/v1/admin/offers', { params: filters });
    return response.data;
  },
  
  async getOffer(id: string) {
    const response = await adminApi.get(`/v1/admin/offers/${id}`);
    return response.data;
  },
  
  async createOffer(offerData: any) {
    const isFormData = offerData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await adminApi.post('/v1/admin/offers', offerData, config);
    return response.data;
  },
  
  async updateOffer(id: string, offerData: any) {
    const isFormData = offerData instanceof FormData;
    const config: any = {
      headers: {
        'Accept': 'application/json',
      }
    };
    
    if (isFormData) {
      offerData.append('_method', 'PUT');
      const response = await adminApi.post(`/v1/admin/offers/${id}`, offerData, config);
      return response.data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      const response = await adminApi.put(`/v1/admin/offers/${id}`, offerData, config);
      return response.data;
    }
  },
  
  async deleteOffer(id: string) {
    const response = await adminApi.delete(`/v1/admin/offers/${id}`);
    return response.data;
  }
};

export default adminApi;
