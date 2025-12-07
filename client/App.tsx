import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPlaceholder from "./pages/CategoryPlaceholder";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderView from "./pages/AdminOrderView";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminBrands from "./pages/AdminBrands";
import AdminReviews from "./pages/AdminReviews";
import AdminCategoryEdit from "./pages/AdminCategoryEdit";
import AdminCategoryCreate from "./pages/AdminCategoryCreate";
import AdminCategoryFilters from "./pages/AdminCategoryFilters";
import AdminBrandEdit from "./pages/AdminBrandEdit";
import AdminBrandCreate from "./pages/AdminBrandCreate";
import AdminBrandView from "./pages/AdminBrandView";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminProductCreate from "./pages/AdminProductCreate";
import AdminProductView from "./pages/AdminProductView";
import AdminUserEdit from "./pages/AdminUserEdit";
import AdminUserCreate from "./pages/AdminUserCreate";
import AdminUserView from "./pages/AdminUserView";
import AdminSiteSettings from "./pages/AdminSiteSettings";
import AdminOffers from "./pages/AdminOffers";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminCities from "./pages/AdminCities";
import AdminSlider from "./pages/AdminSlider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Warranty from "./pages/Warranty";
import Offers from "./pages/Offers";
import CategoriesPage from "./pages/Categories";
import BrandsPage from "./pages/Brands";
import Product from "./pages/Product";
import { CartProvider } from "./context/CartContext";
import { AnimationProvider } from "./context/AnimationContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AnimationProvider>
          <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Category Routes - All redirect to Products page with category filter */}
        <Route 
          path="/kitchen" 
          element={<Products />} 
        />
        <Route 
          path="/cooling" 
          element={<Products />} 
        />
        <Route 
          path="/small-appliances" 
          element={<Products />} 
        />
        <Route 
          path="/washing" 
          element={<Products />} 
        />
        <Route 
          path="/cleaning" 
          element={<Products />} 
        />
        <Route 
          path="/electronics" 
          element={<Products />} 
        />
        <Route 
          path="/lighting" 
          element={<Products />} 
        />
        <Route 
          path="/tools" 
          element={<Products />} 
        />

        {/* Other routes */}
        <Route
          path="/products"
          element={<Products />}
        />
        <Route
          path="/product/:id"
          element={<Product />}
        />
        <Route 
          path="/offers" 
          element={<Offers />} 
        />
        <Route 
          path="/categories" 
          element={<CategoriesPage />} 
        />
        <Route 
          path="/brands" 
          element={<BrandsPage />} 
        />
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/register" 
          element={<Register />} 
        />
        <Route 
          path="/about" 
          element={<About />} 
        />
        <Route 
          path="/contact" 
          element={<Contact />} 
        />
        <Route 
          path="/shipping" 
          element={<Shipping />} 
        />
        <Route 
          path="/returns" 
          element={<Returns />} 
        />
        <Route 
          path="/warranty" 
          element={<Warranty />} 
        />
        
        {/* Cart and Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/create" element={<AdminProductCreate />} />
        <Route path="/admin/products/:id" element={<AdminProductView />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderView />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/create" element={<AdminUserCreate />} />
        <Route path="/admin/users/:id" element={<AdminUserView />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/categories/create" element={<AdminCategoryCreate />} />
        <Route path="/admin/categories/:id/edit" element={<AdminCategoryEdit />} />
        <Route path="/admin/categories/:id/filters" element={<AdminCategoryFilters />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/brands/create" element={<AdminBrandCreate />} />
        <Route path="/admin/brands/:id" element={<AdminBrandView />} />
        <Route path="/admin/brands/:id/edit" element={<AdminBrandEdit />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/site-settings" element={<AdminSiteSettings />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
        <Route path="/admin/cities" element={<AdminCities />} />
        <Route path="/admin/slider" element={<AdminSlider />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
          </BrowserRouter>
        </AnimationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
