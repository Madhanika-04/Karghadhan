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
  HandCoins,
  Building2,
  BookOpen,
  Star,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ProgressBar, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Toast } from '../components/ui/Modal';
import { useState } from 'react';

const eligibleServices = [
  { icon: HandCoins, label: 'Loans', count: 4, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield, label: 'Insurance', count: 3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { icon: Building2, label: 'Gov. Schemes', count: 5, color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: BookOpen, label: 'Literacy', count: 8, color: 'text-violet-600', bg: 'bg-violet-50' },
];

export default function ProfilePage() {
  const { user } = useAppContext();
  const [toast, setToast] = useState(false);

  if (!user) return null;

  const handleDownload = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full blur-[60px]" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              {user.name.charAt(0)}
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-2 border-slate-800 rounded-xl flex items-center justify-center"
            >
              <CheckCircle size={16} className="text-white" />
            </motion.div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-display">{user.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Star size={10} fill="currentColor" />
                Verified Weaver
              </span>
            </div>
            <p className="text-white/70 text-sm mb-3">{user.occupation}</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                🪪 {user.weaverIdNumber}
              </span>
              <span className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                📅 Joined {new Date(user.joinedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download size={16} />}
            className="border-white/30 text-white hover:bg-white/10"
          >
            Download ID
          </Button>
        </div>

        {/* Profile Completion */}
        <div className="relative mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-white/80">Profile Completion</span>
            <span className="text-xl font-bold text-emerald-400">{user.profileCompletion}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${user.profileCompletion}%` }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
            />
          </div>
          <p className="text-white/50 text-xs mt-2">Add bank account to reach 100%</p>
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
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-1"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>👤</span> Personal Information
          </h2>
          <div className="space-y-3">
            {[
              { icon: Calendar, label: 'Age', value: `${user.age} years` },
              { icon: Shield, label: 'Gender', value: user.gender },
              { icon: MapPin, label: 'District', value: user.district },
              { icon: MapPin, label: 'State', value: user.state },
              { icon: Briefcase, label: 'Occupation', value: user.occupation },
              { icon: Briefcase, label: 'Experience', value: `${user.yearsOfExperience} years` },
              { icon: IndianRupee, label: 'Monthly Income', value: `₹${user.monthlyIncome.toLocaleString('en-IN')}` },
              { icon: CreditCard, label: 'Bank Account', value: user.bankAccount || 'Not added' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* KYC Details */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🔐</span> Verified Documents
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Aadhaar Card', value: user.aadhaarNumber, status: 'Verified' },
                { label: 'Weaver ID', value: user.weaverIdNumber, status: 'Verified' },
                { label: 'Bank Account', value: user.bankAccount || 'Not Linked', status: user.bankAccount ? 'Linked' : 'Pending' },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{doc.label}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.value}</p>
                  </div>
                  <Badge variant={doc.status === 'Verified' || doc.status === 'Linked' ? 'emerald' : 'amber'} dot>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Eligible Services */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>🎯</span> Eligible Services
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {eligibleServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.label} className={`${service.bg} rounded-2xl p-4 text-center`}>
                    <Icon size={20} className={`${service.color} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-slate-800">{service.count}</p>
                    <p className="text-xs text-slate-500 font-medium">{service.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Trophy />
              <span>🏆</span> Achievements
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { emoji: '✅', text: 'Identity Verified' },
                { emoji: '🧵', text: 'Weaver ID Linked' },
                { emoji: '💳', text: 'Profile 95%' },
                { emoji: '📚', text: '2 Modules Done' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-amber-100">
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="text-xs font-bold text-slate-700">{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Toast message="Digital Weaver ID downloaded successfully!" isVisible={toast} type="success" />
    </div>
  );
}

// Fix Trophy import issue
function Trophy({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  );
}
