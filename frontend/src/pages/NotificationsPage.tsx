import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, ShieldCheck, Zap, MoreHorizontal, Trash2, Sparkles } from 'lucide-react';
import { notifications } from '../data/mockUser';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Toast } from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import { agentsApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

const iconMap = {
  info: <Info size={20} className="text-primary-600" />,
  success: <ShieldCheck size={20} className="text-success-600" />,
  warning: <AlertTriangle size={20} className="text-amber-600" />,
};

const bgMap = {
  info: 'bg-primary-50 border-primary-100',
  success: 'bg-success-50 border-success-100',
  warning: 'bg-amber-50 border-amber-100',
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [notifs, setNotifs] = useState(notifications);
  const [toastMessage, setToastMessage] = useState('');
  const [agentAlerts, setAgentAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Trigger notification agent with plausible upcoming deadlines
      agentsApi.notification({
        upcoming_emi_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        upcoming_emi_amount: 2450,
        insurance_slice_due: true,
        passbook_renewal_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
        .then(r => setAgentAlerts(r.data?.notifications || []))
        .catch(console.error);
    }
  }, [user?.id]);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
    setToastMessage(t('notifications.markAllReadSuccess', 'All notifications marked as read'));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const markAsRead = (id: string) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifs(notifs.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shadow-sm relative">
            <Bell size={24} className="text-primary-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{t('notifications.title', 'Notifications')}</h1>
              {unreadCount > 0 && (
                <Badge variant="primary" className="h-6">
                  {unreadCount} {t('notifications.new', 'New')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">{t('notifications.subtitle', 'Stay updated on your applications and alerts')}</p>
          </div>
        </div>

        {notifs.length > 0 && (
          <Button 
            variant="outline" 
            leftIcon={<CheckCircle size={18} />}
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {t('notifications.markAllRead', 'Mark all read')}
          </Button>
        )}
      </motion.div>

      {/* Agent Live Alerts */}
      {agentAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center gap-2">
            <Sparkles size={16} className="text-white" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('notifications.liveAlerts', 'Live AI Alerts')}</h2>
            <span className="ml-auto text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{agentAlerts.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {agentAlerts.map((alert: any, i: number) => (
              <div key={i} className={`flex items-start gap-4 px-6 py-4 ${
                alert.urgency === 'HIGH' ? 'bg-red-50/50' :
                alert.urgency === 'MEDIUM' ? 'bg-amber-50/50' : 'bg-slate-50/50'
              }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert.urgency === 'HIGH' ? 'bg-red-100' :
                  alert.urgency === 'MEDIUM' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <AlertTriangle size={16} className={alert.urgency === 'HIGH' ? 'text-red-600' : alert.urgency === 'MEDIUM' ? 'text-amber-600' : 'text-slate-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      alert.urgency === 'HIGH' ? 'bg-red-100 text-red-700' :
                      alert.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{alert.urgency}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                  <p className="text-xs text-primary-600 font-semibold mt-1">{alert.action}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {notifs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-3xl border-2 border-slate-100 border-dashed"
            >
              <Bell size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">{t('notifications.allCaughtUp', 'All caught up!')}</h3>
              <p className="text-sm text-slate-500">{t('notifications.noNew', "You don't have any new notifications.")}</p>
            </motion.div>
          ) : (
            notifs.map((notification) => (
              <motion.div
                key={notification.id}
                variants={staggerItem}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              >
                <Card 
                  className={`border-2 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${
                    notification.isRead 
                      ? 'border-slate-100 bg-white' 
                      : 'border-primary-200 bg-primary-50/10'
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <CardContent className="p-5 flex gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm ${bgMap[notification.type]}`}>
                      {iconMap[notification.type]}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-bold text-base truncate ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {t(`mockData.${notification.id}_title`, notification.title)}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pt-1">
                          {formatTimeAgo(notification.timestamp, t)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                        {t(`mockData.${notification.id}_message`, notification.message)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pl-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      <Toast message={toastMessage} isVisible={!!toastMessage} type="success" />
    </div>
  );
}

function formatTimeAgo(date: Date, t: any): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return t('time.justNow', 'Just now');
  if (diffInHours < 24) return t('time.hoursAgo', '{{count}}h ago', { count: diffInHours });
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return t('time.yesterday', 'Yesterday');
  
  return t('time.daysAgo', '{{count}}d ago', { count: diffInDays });
}
