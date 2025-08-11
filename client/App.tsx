import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPlaceholder from "./pages/CategoryPlaceholder";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Warranty from "./pages/Warranty";
import Offers from "./pages/Offers";
import Product from "./pages/Product";
import { CartProvider } from "./context/CartContext";
import { AnimationProvider } from "./context/AnimationContext";

function App() {
  return (
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
        <Route path="/admin" element={<Admin />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
        </BrowserRouter>
      </AnimationProvider>
    </CartProvider>
  );
}

export default App;
