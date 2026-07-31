import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Scale, Sparkles, CheckCircle, Shield, Building2, ExternalLink, HeartPulse, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { financeApi, agentsApi, productsApi } from '../services/api';

import { insurancePolicies, insuranceProviders, insuranceTypes } from '../data/insurance';
import type { InsurancePolicy, InsuranceProvider, InsuranceTypeDesc } from '../types';

import { AIRecommendationEngine } from '../components/insurance/AIRecommendationEngine';
import { tData } from '../utils/i18nData';
import { GovernmentSchemesTab } from '../components/insurance/GovernmentSchemesTab';
import { InsuranceProvidersTab } from '../components/insurance/InsuranceProvidersTab';
import { InsuranceTypesTab } from '../components/insurance/InsuranceTypesTab';
import { DetailedInsuranceModal } from '../components/insurance/DetailedInsuranceModal';
import { CompareInsuranceModal } from '../components/insurance/CompareInsuranceModal';
import { Toast, Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { InsuranceHero } from '../components/hero/InsuranceHero';

export default function InsurancePage() {
  const { t } = useTranslation();
  const { user } = useAppContext();

  const [activeTab, setActiveTab] = useState<'schemes' | 'providers' | 'types'>('schemes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider | null>(null);
  const [selectedType, setSelectedType] = useState<InsuranceTypeDesc | null>(null);

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparePolicy1, setComparePolicy1] = useState<InsurancePolicy | null>(null);
  const [comparePolicy2, setComparePolicy2] = useState<InsurancePolicy | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Agent state
  const [agentInsurance, setAgentInsurance] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Dynamic policies state
  const [dynamicPolicies, setDynamicPolicies] = useState<InsurancePolicy[]>(insurancePolicies);

  useEffect(() => {
    if (user?.id) {
      // 1. Fetch AI agent summary
      setAgentLoading(true);
      agentsApi.insurance({ active_policies: [] })
        .then(r => setAgentInsurance(r.data))
        .catch(console.error)
        .finally(() => setAgentLoading(false));
        
      // 2. Fetch backend product recommendations
      productsApi.getRecommendations(user.id).then(res => {
        if (res.recommended_insurance && res.recommended_insurance.length > 0) {
          const mapped = res.recommended_insurance.map((p: any) => ({
             id: p.id,
             name: p.name,
             provider: p.provider,
             type: 'Life & Health',
             coverage: `₹${p.coverage_amount.toLocaleString()}`,
             annualPremium: p.annual_premium,
             description: p.description,
             benefits: p.benefits || [],
             eligibility: [],
             claimProcess: [],
             category: 'Government',
             isRecommended: true,
             enrollmentLink: p.portal_url,
             shortDescription: p.description.substring(0, 50) + '...',
             suitableFor: 'All Weavers',
             policyPeriod: '1 Year',
             renewal: 'Annual',
             requiredDocuments: ['Aadhaar', 'Bank Passbook'],
             enrollmentChannel: p.portal_name,
             officialStatus: 'Active',
             aiRecommendation: ''
          }));
          setDynamicPolicies(mapped);
        }
      }).catch(console.error);
    }
  }, [user?.id]);

  // Computed state
  const filteredPolicies = dynamicPolicies.filter(p => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return tData(p.name).toLowerCase().includes(lowerQ) ||
      tData(p.provider).toLowerCase().includes(lowerQ) ||
      tData(p.type).toLowerCase().includes(lowerQ);
  });

  const handleEnroll = async (policy: InsurancePolicy) => {
    if (user?.id) {
      try {
        await financeApi.enrollInsurance(user.id, policy.id);
      } catch (error) {
        console.error('Enrollment error', error);
      }
    }
    setToastMessage(t('insurance.enrollInitiated', 'Insurance enrollment initiated! Complete e-KYC online to enroll.'));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <InsuranceHero onExplore={() => setSelectedPolicy(insurancePolicies[0])} />

      {/* AI Recommendations */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AIRecommendationEngine user={user} policies={dynamicPolicies} agentInsurance={agentInsurance} agentLoading={agentLoading} onEnroll={(p) => setSelectedPolicy(p)} />
        </motion.div>
      )}

      {/* Main Tabs Navigation */}
      <div className="bg-slate-100/80 backdrop-blur p-1.5 rounded-2xl flex overflow-x-auto scrollbar-hide gap-1 mb-8 shadow-inner border border-slate-200/60 max-w-2xl mx-auto">
        <TabButton 
          active={activeTab === 'schemes'} 
          onClick={() => setActiveTab('schemes')} 
          label={t('insurance.tabSchemes', 'Government Schemes')} 
          icon={<Shield size={16} />}
        />
        <TabButton 
          active={activeTab === 'providers'} 
          onClick={() => setActiveTab('providers')} 
          label={t('insurance.tabProviders', 'Insurance Providers')} 
          icon={<Building2 size={16} />}
        />
        <TabButton 
          active={activeTab === 'types'} 
          onClick={() => setActiveTab('types')} 
          label={t('insurance.tabTypes', 'Insurance Types')} 
          icon={<HeartPulse size={16} />}
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
          <InsuranceProvidersTab providers={insuranceProviders} onSelectProvider={setSelectedProvider} />
        )}
        {activeTab === 'types' && (
          <InsuranceTypesTab types={insuranceTypes} onSelectType={setSelectedType} />
        )}
      </div>

      {/* Policy Details Modal */}
      <DetailedInsuranceModal 
        isOpen={!!selectedPolicy} 
        onClose={() => setSelectedPolicy(null)} 
        policy={selectedPolicy} 
        onEnroll={(p) => { setSelectedPolicy(null); handleEnroll(p); }} 
      />

      {/* Provider Details Modal */}
      <Modal
        isOpen={!!selectedProvider}
        onClose={() => setSelectedProvider(null)}
        title={selectedProvider ? tData(selectedProvider.name) : 'Provider Details'}
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                <Building2 size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{tData(selectedProvider.name)}</h3>
                <p className="text-xs text-indigo-700 font-semibold">{tData(selectedProvider.category)} Partner Institution</p>
                <p className="text-xs text-slate-600 mt-1">{tData(selectedProvider.suitableFor)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Products & Schemes Offered</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.productsOffered.map((prod, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-bold">
                    {tData(prod)}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Official Enrollment Channels</h4>
              <ul className="space-y-2">
                {selectedProvider.applyThrough.map((channel, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    {tData(channel)}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              fullWidth
              size="lg"
              rightIcon={<ExternalLink size={18} />}
              onClick={() => {
                const match = dynamicPolicies.find(p => p.provider.includes(selectedProvider.name) || selectedProvider.name.includes(p.provider));
                setSelectedProvider(null);
                if (match) {
                  setSelectedPolicy(match);
                } else {
                  setSelectedPolicy(dynamicPolicies[0]);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Explore {tData(selectedProvider.name)} Schemes
            </Button>
          </div>
        )}
      </Modal>

      {/* Insurance Type Details Modal */}
      <Modal
        isOpen={!!selectedType}
        onClose={() => setSelectedType(null)}
        title={selectedType ? tData(selectedType.title) : 'Insurance Type'}
        size="lg"
      >
        {selectedType && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{tData(selectedType.title)}</h3>
              <p className="text-xs text-indigo-700 font-semibold">Recommended for: {tData(selectedType.recommendedUsers)}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Coverage & Benefits</h4>
              <ul className="space-y-2">
                {selectedType.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    {tData(b)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Common Claims Covered</h4>
              <div className="flex flex-wrap gap-2">
                {selectedType.commonClaims.map((claim, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                    {tData(claim)}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">KarghaDhan AI Advisory</p>
              <p className="text-xs text-indigo-800 leading-relaxed italic">"{tData(selectedType.aiRecommendation)}"</p>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => {
                setSelectedType(null);
                setActiveTab('schemes');
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Browse Government Schemes for {tData(selectedType.title)}
            </Button>
          </div>
        )}
      </Modal>

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
function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex-1 flex items-center justify-center gap-2 cursor-pointer relative ${
        active 
          ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
          : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
      }`}
    >
      {icon && <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>}
      {label}
    </button>
  );
}
