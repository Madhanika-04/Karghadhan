import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { OnboardingLayout } from './layouts/OnboardingLayout';

// Pages — Public
import LandingPage from './pages/LandingPage';

// Pages — Onboarding
import LanguagePage from './pages/LanguagePage';
import WelcomePage from './pages/WelcomePage';
import VerifyPage from './pages/VerifyPage';
import ProfileDetailsPage from './pages/ProfileDetailsPage';
import UploadPage from './pages/UploadPage';
import VerifyingPage from './pages/VerifyingPage';

// Pages — Dashboard
import DashboardPage from './pages/DashboardPage';
import LoansPage from './pages/LoansPage';
import InsurancePage from './pages/InsurancePage';
import SchemesPage from './pages/SchemesPage';
import LiteracyPage from './pages/LiteracyPage';
import AssistantPage from './pages/AssistantPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Onboarding Flow */}
            <Route element={<OnboardingLayout step={0} />}>
              <Route path="/language" element={<LanguagePage />} />
            </Route>
            <Route element={<OnboardingLayout step={1} />}>
              <Route path="/welcome" element={<WelcomePage />} />
            </Route>
            <Route element={<OnboardingLayout step={2} />}>
              <Route path="/verify" element={<VerifyPage />} />
            </Route>
            <Route element={<OnboardingLayout step={3} />}>
              <Route path="/profile-details" element={<ProfileDetailsPage />} />
            </Route>
            <Route element={<OnboardingLayout step={4} />}>
              <Route path="/upload" element={<UploadPage />} />
            </Route>
            <Route element={<OnboardingLayout step={5} />}>
              <Route path="/verifying" element={<VerifyingPage />} />
            </Route>

            {/* Dashboard */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/literacy" element={<LiteracyPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
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
