import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';
import { Sidebar, BottomNav } from '../components/layout/Sidebar';
import { useAppContext } from '../context/AppContext';
import { pageTransition } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markNotificationRead, user } = useAppContext();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleNotificationClick = () => {
    // If on mobile or prefer a dedicated page, we could navigate to /notifications
    // But since the dropdown exists, let's keep it for desktop, or maybe navigate if we prefer.
    // For now, let's toggle dropdown, but also provide a "View All" link inside it.
    setNotifOpen(!notifOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search */}
          <div className="flex-1 relative hidden sm:block max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder', 'Search schemes, loans...')}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">{t('notifications.title', 'Notifications')}</h3>
                    <span className="text-xs text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-full">{unreadCount} {t('notifications.new', 'new')}</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        {t('notifications.empty', 'No notifications yet.')}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            // navigate('/notifications');
                          }}
                          className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50/30' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-slate-300' : 'bg-primary-500'}`} />
                            <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">{tData(n.title)}</p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tData(n.message)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/notifications');
                      }}
                      className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors w-full"
                    >
                      {t('notifications.viewAll', 'View all notifications')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 hover:bg-slate-100 rounded-xl px-2 py-1.5 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle size={10} className="text-success-500" />
                  <p className="text-[10px] text-success-600 font-bold uppercase tracking-wider">{t('common.verified', 'Verified')}</p>
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 relative overflow-x-hidden">
          <motion.div {...(pageTransition as any)} key={location.pathname} className="h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Bottom Nav Mobile */}
      <BottomNav />
    </div>
  );
}
