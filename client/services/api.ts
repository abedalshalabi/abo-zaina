// API Service for Abu Zaina Technologies
import { API_V1_BASE_URL } from "../config/env";

const API_BASE_URL = API_V1_BASE_URL;

// Site Settings API (public)
export const settingsAPI = {
  getSettings: async (group: string = 'header') => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings?group=${group}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching settings:", error);
      throw error;
    }
  },
};

// Types
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  sku: string;
  stock_quantity: number;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  images: Array<{
    id: number;
    image_path: string;
    is_primary: boolean;
  }>;
}

interface CartItem {
  id: number;
  quantity: number;
  price: number;
  total: number;
  product: Product;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  order_status: string;
  payment_status: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

// Auth API
export const authAPI = {
  // Register user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    city?: string;
    district?: string;
    street?: string;
    building?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Logout user
  logout: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Get current user
  getUser: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: async (filters: {
    page?: number;
    per_page?: number;
    search?: string;
    category_id?: number;
    brand_id?: number;
    price_min?: number;
    price_max?: number;
    sort?: string;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/products?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.json();
  },

  // Get single product
  getProduct: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/featured`);
    return response.json();
  },

  // Get latest products
  getLatestProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/latest`);
    return response.json();
  },

  // Get products by category
  getProductsByCategory: async (categorySlug: string) => {
    const response = await fetch(`${API_BASE_URL}/products/category/${categorySlug}`);
    return response.json();
  },

  // Get products by brand
  getProductsByBrand: async (brandSlug: string) => {
    const response = await fetch(`${API_BASE_URL}/products/brand/${brandSlug}`);
    return response.json();
  },
};

// Cart API
export const cartAPI = {
  // Get cart items
  getCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`);
    return response.json();
  },

  // Add to cart
  addToCart: async (productId: number, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return response.json();
  },

  // Update cart item
  updateCartItem: async (cartId: number, quantity: number) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  },

  // Remove from cart
  removeFromCart: async (cartId: number) => {
    const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Clear cart
  clearCart: async () => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get cart summary
  getCartSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/cart/summary`);
    return response.json();
  },
};

// Orders API
export const ordersAPI = {
  // Create order
  createOrder: async (orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_city: string;
    customer_district: string;
    customer_street: string;
    customer_building: string;
    customer_additional_info?: string;
    payment_method: string;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
      price: number;
    }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Include session cookie
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'فشل في إنشاء الطلب');
    }

    return response.json();
  },

  // Get order details
  getOrder: async (orderId: number) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    return response.json();
  },

  // Get user orders
  getUserOrders: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/user/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories (with children)
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  // Get main categories only
  getMainCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/main`);
    return response.json();
  },

  // Get single category
  getCategory: async (categorySlug: string) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categorySlug}`);
    return response.json();
  },

  // Get subcategories for a category
  getSubcategories: async (categoryId: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/subcategories`);
    return response.json();
  },

  // Get filters for a category
  getCategoryFilters: async (categoryId: number) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/filters`);
    return response.json();
  },
};

// Brands API
export const brandsAPI = {
  // Get all brands
  getBrands: async () => {
    const response = await fetch(`${API_BASE_URL}/brands`);
    return response.json();
  },

  // Get single brand
  getBrand: async (brandSlug: string) => {
    const response = await fetch(`${API_BASE_URL}/brands/${brandSlug}`);
    return response.json();
  },
};

// Wishlist API
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Add to wishlist
  addToWishlist: async (productId: number) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  // Remove from wishlist
  removeFromWishlist: async (productId: number) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },
};

// Reviews API
export const reviewsAPI = {
  // Get product reviews
  getProductReviews: async (productId: number) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
    return response.json();
  },

  // Add review
  addReview: async (productId: number, reviewData: {
    rating: number;
    comment: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  },
};

// Offers API (public)
export const offersAPI = {
  // Get all active offers
  getOffers: async (type?: string) => {
    const url = type
      ? `${API_BASE_URL}/offers?type=${type}`
      : `${API_BASE_URL}/offers`;
    const response = await fetch(url);
    return response.json();
  },
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submitContact: async (formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'حدث خطأ أثناء إرسال الرسالة');
    }

    return response.json();
  },
};

// Cities API (public)
export const citiesAPI = {
  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    return response.json();
  },
};

export const sliderAPI = {
  getSliderItems: async () => {
    const response = await fetch(`${API_BASE_URL}/slider`);
    if (!response.ok) {
      throw new Error('Failed to fetch slider items');
    }
    return response.json();
  },
};

// Export types
export type { User, Product, CartItem, Order };
