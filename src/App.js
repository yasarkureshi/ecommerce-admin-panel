import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import AboutPage from "@/pages/AboutPage";
import ReviewsPage from "@/pages/ReviewsPage";
import ContactPage from "@/pages/ContactPage";
import CartPage from "@/pages/CartPage";
import AdminPage from "@/pages/AdminPage";
import LoginPage from "@/pages/LoginPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ProfilePage from "@/pages/ProfilePage";
import OrdersPage from "@/pages/OrdersPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { BannerOffer, WelcomePopup, ExitIntentPopup } from "@/components/Popups";

function AppRouter() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-body">
      {!isAdmin && <BannerOffer />}
      {!isAdmin && <Header />}
      {!isAdmin && <WelcomePopup />}
      {!isAdmin && <ExitIntentPopup />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<LoginPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
