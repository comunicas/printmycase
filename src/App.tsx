import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Landing from "./pages/Landing";
import AuthGuard from "./components/AuthGuard";
import AdminGuard from "./components/AdminGuard";
import { ClarityFunnelTracker } from "@/hooks/useClarityFunnel";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Catalog = lazy(() => import("./pages/Catalog"));
const Product = lazy(() => import("./pages/Product"));
const Customize = lazy(() => import("./pages/Customize"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const RequestModel = lazy(() => import("./pages/RequestModel"));
const Coins = lazy(() => import("./pages/Coins"));
const LegalDocument = lazy(() => import("./pages/LegalDocument"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KbCategory = lazy(() => import("./pages/KbCategory"));
const KbArticle = lazy(() => import("./pages/KbArticle"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const DesignPage = lazy(() => import("./pages/DesignPage"));
const SelectModel = lazy(() => import("./pages/SelectModel"));
const MyGenerations = lazy(() => import("./pages/MyGenerations"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <ClarityFunnelTracker />
        <Suspense fallback={<LoadingSpinner variant="fullPage" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/customize" element={<SelectModel />} />
            <Route path="/customize/:id" element={<Customize />} />
            <Route path="/checkout/:id" element={<AuthGuard><Checkout /></AuthGuard>} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/coins" element={<AuthGuard><Coins /></AuthGuard>} />
            <Route path="/minhas-geracoes" element={<AuthGuard><MyGenerations /></AuthGuard>} />
            <Route path="/admin" element={<AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard>} />
            <Route path="/solicitar-modelo" element={<RequestModel />} />
            <Route path="/colecoes" element={<Collections />} />
            <Route path="/colecao/:slug" element={<CollectionPage />} />
            <Route path="/colecao/:collectionSlug/:designSlug" element={<DesignPage />} />
            <Route path="/ajuda" element={<KnowledgeBase />} />
            <Route path="/ajuda/:categorySlug" element={<KbCategory />} />
            <Route path="/ajuda/:categorySlug/:articleSlug" element={<KbArticle />} />
            <Route path="/termos" element={<LegalDocument />} />
            <Route path="/privacidade" element={<LegalDocument />} />
            <Route path="/compras" element={<LegalDocument />} />
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
