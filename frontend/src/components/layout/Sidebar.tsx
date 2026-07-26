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
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/insurance', icon: Shield, label: 'Insurance' },
  { to: '/schemes', icon: Building2, label: 'Gov Schemes' },
  { to: '/literacy', icon: BookOpen, label: 'Learn' },
  { to: '/assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 font-display text-sm">KarghaKadam</p>
            <p className="text-[10px] text-emerald-600 font-semibold">AI Weaver Finance</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
              ].join(' ')}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon size={18} className={isActive ? 'text-white' : 'text-current'} />
              <span className="text-sm font-semibold">{item.label}</span>
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
          <span className="text-sm font-semibold">Logout</span>
        </button>
        <div className="mt-3 px-4 py-3 bg-emerald-50 rounded-xl">
          <p className="text-xs font-bold text-emerald-700">✅ Verified Weaver</p>
          <p className="text-xs text-slate-500 mt-0.5">Profile 95% complete</p>
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
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
  const bottomItems = navItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-30 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
              {isActive && (
                <motion.div layoutId="bottomNav" className="w-1 h-1 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
