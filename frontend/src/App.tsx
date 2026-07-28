import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { OnboardingLayout } from './layouts/OnboardingLayout';

// Pages — Public & Auth
import SplashPage from './pages/SplashPage';
import LanguagePage from './pages/LanguagePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages — Onboarding
import VerifyPage from './pages/VerifyPage';
import UploadPage from './pages/UploadPage';
import VerifyingPage from './pages/VerifyingPage';
import OnboardingProfilePage from './pages/OnboardingProfilePage';

// Pages — Dashboard
import DashboardPage from './pages/DashboardPage';
import SavingsPage from './pages/SavingsPage';
import FinancialActivityPage from './pages/FinancialActivityPage';
import LoansPage from './pages/LoansPage';
import InsurancePage from './pages/InsurancePage';
import SchemesPage from './pages/SchemesPage';
import LiteracyPage from './pages/LiteracyPage';
import AssistantPage from './pages/AssistantPage';
import ProfilePage from './pages/ProfilePage';
import DocumentsPage from './pages/DocumentsPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<SplashPage />} />
            <Route path="/language" element={<LanguagePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Onboarding Flow */}
            <Route element={<OnboardingLayout step={0} />}>
              <Route path="/verify" element={<VerifyPage />} />
            </Route>
            <Route element={<OnboardingLayout step={1} />}>
              <Route path="/upload" element={<UploadPage />} />
            </Route>
            <Route element={<OnboardingLayout step={2} />}>
              <Route path="/verifying" element={<VerifyingPage />} />
            </Route>
            <Route element={<OnboardingLayout step={3} />}>
              <Route path="/onboarding-profile" element={<OnboardingProfilePage />} />
            </Route>

            {/* Dashboard */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/finances" element={<FinancialActivityPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/literacy" element={<LiteracyPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AppProvider>
  );
}
