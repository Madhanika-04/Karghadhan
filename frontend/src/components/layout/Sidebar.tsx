import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  HandCoins,
  Shield,
  Building2,
  BookOpen,
  Bot,
  User,
  LogOut,
  ChevronRight,
  FileText,
  PiggyBank,
  QrCode,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: 'common.dashboard' },
  { to: '/finances', icon: Activity, label: 'Financial Activity', key: 'common.financialActivity' },
  { to: '/savings', icon: PiggyBank, label: 'Savings', key: 'common.savings' },
  { to: '/loans', icon: HandCoins, label: 'Loans', key: 'common.loans' },
  { to: '/insurance', icon: Shield, label: 'Insurance', key: 'common.insurance' },
  { to: '/schemes', icon: Building2, label: 'Gov Schemes', key: 'common.schemes' },
  { to: '/literacy', icon: BookOpen, label: 'Learn', key: 'common.learn' },
  { to: '/assistant', icon: Bot, label: 'AI Assistant', key: 'common.askKargha' },
  { to: '/documents', icon: FileText, label: 'Documents', key: 'common.documents' },
  { to: '/profile', icon: User, label: 'Profile', key: 'common.profile' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <img src={logoKargha} alt="Karghadhan Logo" className="w-[68px] h-[68px] object-contain shrink-0" />
          <div className="flex flex-col justify-center">
            <span className="font-bold text-[22px] text-[#111827] leading-tight">Karghadhan</span>
            <span className="text-[10px] text-[#2563EB] font-semibold tracking-wide uppercase">{t('common.brandTagline', 'Weaver Finance')}</span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-200'
                  : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl"
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon size={18} className={isActive ? 'text-white' : 'text-current'} />
              <span className="text-sm font-semibold">{t(item.key, item.label)}</span>
              {isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
        >
          <LogOut size={18} />
          <span className="text-sm font-bold">{t('common.logout', 'Logout')}</span>
        </button>
        <div className="mt-3 px-4 py-3 bg-success-50 rounded-xl border border-success-100">
          <p className="text-xs font-bold text-success-700 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-success-500 rounded-full"></span> {t('common.verified', 'Verified')}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{t('sidebar.profileComplete', 'Profile 95% complete')}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-full fixed top-0 left-0 shadow-sm z-30">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Bottom Navigation for Mobile
export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const bottomItems = navItems.slice(0, 5); // Show first 5 items on mobile bottom nav

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-30 lg:hidden pb-safe">
      <div className="flex items-center justify-around py-2 px-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-primary-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
              <span className="text-[10px] font-bold">{(t(item.key, item.label) as string).split(' ')[0]}</span>
              {isActive && (
                <motion.div layoutId="bottomNav" className="w-1 h-1 bg-primary-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
