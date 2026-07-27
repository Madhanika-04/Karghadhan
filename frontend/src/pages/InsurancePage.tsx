import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';

import { insurancePolicies, insuranceProviders, insuranceTypes } from '../data/insurance';
import type { InsurancePolicy } from '../types';

import { AIRecommendationEngine } from '../components/insurance/AIRecommendationEngine';
import { tData } from '../utils/i18nData';
import { GovernmentSchemesTab } from '../components/insurance/GovernmentSchemesTab';
import { InsuranceProvidersTab } from '../components/insurance/InsuranceProvidersTab';
import { InsuranceTypesTab } from '../components/insurance/InsuranceTypesTab';
import { DetailedInsuranceModal } from '../components/insurance/DetailedInsuranceModal';
import { CompareInsuranceModal } from '../components/insurance/CompareInsuranceModal';
import { Toast } from '../components/ui/Modal';
import { InsuranceHero } from '../components/hero/InsuranceHero';

export default function InsurancePage() {
  const { t } = useTranslation();
  const { user } = useAppContext();

  const [activeTab, setActiveTab] = useState<'schemes' | 'providers' | 'types'>('schemes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparePolicy1, setComparePolicy1] = useState<InsurancePolicy | null>(null);
  const [comparePolicy2, setComparePolicy2] = useState<InsurancePolicy | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Computed state
  const filteredPolicies = useMemo(() => {
    if (!searchQuery) return insurancePolicies;
    const lowerQ = searchQuery.toLowerCase();
    return insurancePolicies.filter(p => 
      tData(p.name).toLowerCase().includes(lowerQ) || 
      tData(p.provider).toLowerCase().includes(lowerQ) ||
      tData(p.type).toLowerCase().includes(lowerQ)
    );
  }, [searchQuery, t]); // depend on t to recompute when lang changes

  const handleEnroll = (policy: InsurancePolicy) => {
    setToastMessage(t('insurance.enrollInitiated', 'Insurance enrollment initiated! Visit your bank with Aadhaar.'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCompareClick = () => {
    // For demo purposes, auto-select first two government schemes
    const govSchemes = insurancePolicies.filter(p => p.category === 'Government');
    if (govSchemes.length >= 2) {
      setComparePolicy1(govSchemes[0]);
      setComparePolicy2(govSchemes[1]);
    }
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <InsuranceHero />

      {/* AI Recommendations */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AIRecommendationEngine user={user} policies={insurancePolicies} onEnroll={(p) => setSelectedPolicy(p)} />
        </motion.div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex overflow-x-auto scrollbar-hide gap-2">
        <TabButton 
          active={activeTab === 'schemes'} 
          onClick={() => setActiveTab('schemes')} 
          label={t('insurance.tabSchemes', 'Government Schemes')} 
        />
        <TabButton 
          active={activeTab === 'providers'} 
          onClick={() => setActiveTab('providers')} 
          label={t('insurance.tabProviders', 'Insurance Providers')} 
        />
        <TabButton 
          active={activeTab === 'types'} 
          onClick={() => setActiveTab('types')} 
          label={t('insurance.tabTypes', 'Insurance Types')} 
        />
      </div>

      {/* Search & Filter Bar (Only for Schemes currently) */}
      {activeTab === 'schemes' && (
        <div className="flex gap-3 items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('insurance.searchPlaceholder', 'Search insurance by name or provider...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm flex-shrink-0">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'schemes' && (
          <GovernmentSchemesTab policies={filteredPolicies} onViewDetails={setSelectedPolicy} />
        )}
        {activeTab === 'providers' && (
          <InsuranceProvidersTab providers={insuranceProviders} />
        )}
        {activeTab === 'types' && (
          <InsuranceTypesTab types={insuranceTypes} />
        )}
      </div>

      {/* Modals */}
      <DetailedInsuranceModal 
        isOpen={!!selectedPolicy} 
        onClose={() => setSelectedPolicy(null)} 
        policy={selectedPolicy} 
        onEnroll={(p) => { setSelectedPolicy(null); handleEnroll(p); }} 
      />

      <CompareInsuranceModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        policy1={comparePolicy1}
        policy2={comparePolicy2}
      />

      <Toast message={toastMessage} isVisible={showToast} type="info" />
    </div>
  );
}

// Tab Button Helper
function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex-1 text-center ${
        active 
          ? 'bg-slate-900 text-white shadow-md' 
          : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
