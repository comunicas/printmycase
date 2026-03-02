import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Product from "./pages/Product";
import Catalog from "./pages/Catalog";
import Landing from "./pages/Landing";
import Customize from "./pages/Customize";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Orders from "./pages/Orders";
import AuthGuard from "./components/AuthGuard";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/customize/:id" element={<AuthGuard><Customize /></AuthGuard>} />
        <Route path="/checkout/success" element={<AuthGuard><CheckoutSuccess /></AuthGuard>} />
        <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
