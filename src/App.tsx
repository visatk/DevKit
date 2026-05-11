import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Loader2 } from 'lucide-react';

// Code-splitting strategy applied to all heavyweight vectors
const Forum = lazy(() => import('@/pages/Forum'));
const Thread = lazy(() => import('@/pages/Thread'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const Profile = lazy(() => import('@/pages/Profile'));
const Messages = lazy(() => import('@/pages/Messages'));
const TestCards = lazy(() => import('@/pages/TestCards'));
const FakeAddress = lazy(() => import('@/pages/FakeAddress'));
const CardChecker = lazy(() => import('@/pages/CardChecker'));
const BinChecker = lazy(() => import('@/pages/BinChecker'));
const VIPPlan = lazy(() => import('@/pages/VIP'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const IpCheck = lazy(() => import('@/pages/IpCheck'));

// UX Improvement: Accessible, smooth loader to reduce cognitive friction
const PageLoader = () => (
  <div 
    className="flex min-h-[50dvh] items-center justify-center animate-fade-in-up"
    role="status"
    aria-label="Loading content..."
  >
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="size-8 text-orange-500 animate-spin" />
      <span className="text-sm font-medium text-zinc-500 tracking-wide uppercase">Loading</span>
    </div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Forum />} />
              <Route path="forum/:id" element={<Thread />} />
              <Route path="vip" element={<VIPPlan />} />
              
              {/* Tooling Routes */}
              <Route path="test-cards" element={<TestCards />} />
              <Route path="fake-address" element={<FakeAddress />} />
              <Route path="fake-address/:locale" element={<FakeAddress />} />
              <Route path="card-checker" element={<CardChecker />} />
              <Route path="bin-checker" element={<BinChecker />} />
              <Route path="ip" element={<IpCheck />} />
              
              {/* Legal Routes */}
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              
              {/* User Identity & Comms Routes */}
              <Route path="messages" element={<Messages />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="profile/:username" element={<Profile />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </ToastProvider>
  );
}
