import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";

const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Customize = lazy(() => import("./pages/Customize"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner variant="fullPage" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/customize/:id" element={<AuthGuard><Customize /></AuthGuard>} />
            <Route path="/checkout/:id" element={<AuthGuard><Checkout /></AuthGuard>} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/admin" element={<AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
