import { motion } from 'framer-motion';
import {
  CheckCircle,
  Download,
  MapPin,
  Briefcase,
  Calendar,
  IndianRupee,
  CreditCard,
  Shield,
  Building2,
  BookOpen,
  Star,
  Globe,
  HandCoins,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProgressBar, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Toast } from '../components/ui/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages } from '../data/languages';

const eligibleServices = [
  { icon: HandCoins, label: 'Loans', count: 4, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
  { icon: Shield, label: 'Insurance', count: 3, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { icon: Building2, label: 'Gov. Schemes', count: 5, color: 'text-secondary-600', bg: 'bg-secondary-50', border: 'border-secondary-100' },
  { icon: BookOpen, label: 'Literacy', count: 8, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
];

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, setLanguage, language } = useAppContext();
  const [toast, setToast] = useState(false);

  if (!user) return null;

  const handleDownload = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = e.target.value;
    const selectedLang = languages.find(l => l.code === langCode);
    if (selectedLang) {
      setLanguage(selectedLang);
      i18n.changeLanguage(langCode);
    }
  };

  const eligibleServicesTranslated = [
    { icon: HandCoins, label: t('profile.loans', 'Loans'), count: 4, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
    { icon: Shield, label: t('profile.insurance', 'Insurance'), count: 3, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { icon: Building2, label: t('profile.govtSchemes', 'Gov. Schemes'), count: 5, color: 'text-secondary-600', bg: 'bg-secondary-50', border: 'border-secondary-100' },
    { icon: BookOpen, label: t('profile.literacy', 'Literacy'), count: 8, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-slate-900/20"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500 rounded-full blur-[60px]" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl border border-primary-300/30">
              {user.name.charAt(0)}
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 border-2 border-slate-800 rounded-xl flex items-center justify-center shadow-sm"
            >
              <CheckCircle size={16} className="text-white" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-display tracking-tight">{user.name}</h1>
              <span className="bg-success-500/20 text-success-400 text-xs font-bold px-2.5 py-1 rounded-full border border-success-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Star size={10} fill="currentColor" />
                {t('profile.verifiedWeaver', 'Verified Weaver')}
              </span>
            </div>
            <p className="text-white/70 text-sm mb-4 font-medium">{t(`mockData.${user.id}_occupation`, user.occupation)}</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 border border-white/10">
                🪪 {user.weaverIdNumber}
              </span>
              <span className="bg-white/10 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 border border-white/10">
                📅 {t('profile.joined', 'Joined')} {new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download size={16} />}
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm shadow-sm"
          >
            {t('profile.downloadId', 'Download ID')}
          </Button>
        </div>

        {/* Profile Completion */}
        <div className="relative mt-8 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">{t('profile.profileCompletion', 'Profile Completion')}</span>
            <span className="text-xl font-bold text-success-400">{user.profileCompletion}%</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${user.profileCompletion}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-success-400 to-emerald-300 rounded-full"
            />
          </div>
          <p className="text-white/50 text-xs mt-3 font-medium">{t('profile.addBankToReach100', 'Add bank account to reach 100%')}</p>
        </div>
      </motion.div>

      {/* Grid: Personal Details + Eligible Services */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Personal Details */}
        <motion.div variants={staggerItem} className="h-full">
          <Card className="h-full border-2 border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <span>👤</span> {t('profile.personalInfo', 'Personal Information')}
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Calendar, label: t('profile.age', 'Age'), value: t('profile.years', '{{count}} years', { count: user.age }) },
                  { icon: Shield, label: t('profile.gender', 'Gender'), value: t(`profile.gender_${user.gender}`, user.gender) },
                  { icon: MapPin, label: t('profile.district', 'District'), value: t(`mockData.${user.id}_district`, user.district) },
                  { icon: MapPin, label: t('profile.state', 'State'), value: t(`mockData.${user.id}_state`, user.state) },
                  { icon: Briefcase, label: t('profile.occupation', 'Occupation'), value: t(`mockData.${user.id}_occupation`, user.occupation) },
                  { icon: Briefcase, label: t('profile.experience', 'Experience'), value: t('profile.years', '{{count}} years', { count: user.yearsOfExperience }) },
                  { icon: IndianRupee, label: t('profile.monthlyIncome', 'Monthly Income'), value: `₹${user.monthlyIncome.toLocaleString('en-IN')}` },
                  { icon: CreditCard, label: t('profile.bankAccount', 'Bank Account'), value: user.bankAccount || t('profile.notAdded', 'Not added') },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`flex items-center gap-4 ${index !== 7 ? 'pb-4 border-b border-slate-100' : ''}`}>
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-slate-500" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{item.label}</span>
                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* KYC Details */}
          <motion.div variants={staggerItem}>
            <Card className="border-2 border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span>🔐</span> {t('profile.verifiedDocs', 'Verified Documents')}
                </h2>
                <div className="space-y-4">
                  {[
                    { label: t('profile.aadhaarCard', 'Aadhaar Card'), value: user.aadhaarNumber, status: 'Verified' },
                    { label: t('profile.weaverId', 'Weaver ID'), value: user.weaverIdNumber, status: 'Verified' },
                    { label: t('profile.bankAccount', 'Bank Account'), value: user.bankAccount || t('profile.notLinked', 'Not Linked'), status: user.bankAccount ? 'Linked' : 'Pending' },
                  ].map((doc, index) => (
                    <div key={doc.label} className={`flex items-center justify-between ${index !== 2 ? 'pb-4 border-b border-slate-100' : ''}`}>
                      <div>
                        <p className="text-sm font-bold text-slate-700 mb-0.5">{doc.label}</p>
                        <p className="text-xs text-slate-400 font-mono font-medium">{doc.value}</p>
                      </div>
                      <Badge variant={doc.status === 'Verified' || doc.status === 'Linked' ? 'success' : 'amber'} dot>
                        {t(`profile.status${doc.status}`, doc.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Eligible Services */}
          <motion.div variants={staggerItem}>
            <Card className="border-2 border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <span>🎯</span> {t('profile.eligibleServices', 'Eligible Services')}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {eligibleServicesTranslated.map((service) => {
                    const Icon = service.icon;
                    return (
                      <div key={service.label} className={`${service.bg} border ${service.border} rounded-2xl p-4 text-center transition-all duration-300 hover:shadow-md`}>
                        <Icon size={22} className={`${service.color} mx-auto mb-2`} />
                        <p className="text-2xl font-bold text-slate-800 mb-0.5">{service.count}</p>
                        <p className="text-xs text-slate-600 font-semibold">{service.label}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div variants={staggerItem}>
            <div className="bg-gradient-to-br from-secondary-50 to-orange-50 rounded-3xl p-6 border-2 border-secondary-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Trophy />
                <span>🏆</span> {t('profile.achievements', 'Achievements')}
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { emoji: '✅', text: t('profile.identityVerified', 'Identity Verified') },
                  { emoji: '🧵', text: t('profile.weaverIdLinked', 'Weaver ID Linked') },
                  { emoji: '💳', text: t('profile.profile95', 'Profile 95%') },
                  { emoji: '📚', text: t('profile.modulesDone', '2 Modules Done') },
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 shadow-sm border border-secondary-100 hover:border-secondary-300 transition-colors">
                    <span className="text-lg">{badge.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Preferences Settings */}
          <motion.div variants={staggerItem}>
            <Card className="border-2 border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Globe className="text-slate-500" size={20} />
                  <span>{t('profile.preferences', 'Preferences')}</span>
                </h2>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{t('profile.language', 'Language')}</p>
                    <p className="text-xs text-slate-500">{t('profile.languageDesc', 'Change the app language')}</p>
                  </div>
                  <select
                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-medium"
                    value={language.code}
                    onChange={handleLanguageChange}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <Toast message={t('profile.downloadSuccess', 'Digital Weaver ID downloaded successfully!')} isVisible={toast} type="success" />
    </div>
  );
}

// Fix Trophy import issue
function Trophy({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary-500">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}
