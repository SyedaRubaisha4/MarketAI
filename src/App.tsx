import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './store/AppContext';
import { AppShell } from './components/AppShell';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import BrandSetup from './pages/onboarding/BrandSetup';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import ProductForm from './pages/products/ProductForm';
import ProductDetail from './pages/products/ProductDetail';
import AiStudio from './pages/ai/AiStudio';
import Generate from './pages/ai/Generate';
import Review from './pages/ai/Review';
import Publish from './pages/publish/Publish';
import CalendarPage from './pages/calendar/CalendarPage';
import { SocialAccountsPage } from './pages/social/SocialAccounts';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import { ProfileSettings } from './pages/settings/ProfileSettings';
import { BrandSettings } from './pages/settings/BrandSettings';
import { SubscriptionSettings } from './pages/settings/SubscriptionSettings';
import { TrialEndingPage } from './pages/trial/TrialEnding';
import { TrialExpiredPage } from './pages/trial/TrialExpired';
import { useEffect } from 'react';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { session, loading } = useApp();
  const location = useLocation();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  
  return children;
}

function RequireOnboarded({ children }: { children: JSX.Element }) {
  const { user, loading, toast } = useApp();
  const location = useLocation();

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const hasBrandId = !!localStorage.getItem('brand_id');
  const isSkipped = localStorage.getItem('onboarding_skipped') === 'true';
  const isOnboarding = location.pathname.startsWith('/onboarding');
  const isAddingProduct = location.pathname === '/products/new' || location.pathname.includes('/edit');

  if (isAddingProduct && !hasBrandId) {
    setTimeout(() => {
      toast("Business Details Required", { 
        description: "Please complete your business profile before adding products.", 
        variant: "error" 
      });
    }, 100);
    
    return <Navigate to="/onboarding/brand" replace />;
  }

  if (user.onboarded && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.onboarded && !hasBrandId && !isSkipped && !isOnboarding) {
    return <Navigate to="/onboarding/brand" replace />;
  }

  return children;
}
function GuestOnly({ children }: { children: JSX.Element }) {
  const { session, loading } = useApp();
  
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>;
  if (session) return <Navigate to="/dashboard" replace />;
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

      {/* Onboarding Route */}
      <Route path="/onboarding/brand" element={
        <RequireAuth>
          <RequireOnboarded>
            <BrandSetup />
          </RequireOnboarded>
        </RequireAuth>
      } />

      <Route path="/trial-ending" element={<RequireAuth><TrialEndingPage /></RequireAuth>} />
      <Route path="/trial-expired" element={<RequireAuth><TrialExpiredPage /></RequireAuth>} />

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard" element={<RequireOnboarded><Dashboard /></RequireOnboarded>} />
        <Route path="/products" element={<RequireOnboarded><Products /></RequireOnboarded>} />
        <Route path="/products/new" element={<RequireOnboarded><ProductForm /></RequireOnboarded>} />
        <Route path="/products/:productId" element={<RequireOnboarded><ProductDetail /></RequireOnboarded>} />
        <Route path="/products/:productId/edit" element={<RequireOnboarded><ProductForm /></RequireOnboarded>} />
        <Route path="/ai-studio" element={<RequireOnboarded><AiStudio /></RequireOnboarded>} />
        <Route path="/products/:productId/generate" element={<RequireOnboarded><Generate /></RequireOnboarded>} />
        <Route path="/products/:productId/review" element={<RequireOnboarded><Review /></RequireOnboarded>} />
        <Route path="/publish/:productId" element={<RequireOnboarded><Publish /></RequireOnboarded>} />
        <Route path="/calendar" element={<RequireOnboarded><CalendarPage /></RequireOnboarded>} />
        <Route path="/social-accounts" element={<RequireOnboarded><SocialAccountsPage /></RequireOnboarded>} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<ProfileSettings />} />
          <Route path="brand" element={<BrandSettings />} />
          <Route path="subscription" element={<SubscriptionSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}