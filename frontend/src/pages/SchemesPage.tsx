import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import businessLoanHero from '@/assets/illustrations/business_loan_hero.png';
import { Building2, CheckCircle, ExternalLink, Filter, Sparkles, Star } from 'lucide-react';
import { govtSchemes } from '../data/schemes';
import type { GovtScheme } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Modal';
import { HeroProductCard } from '../components/ui/HeroProductCard';
import { SchemesHero } from '../components/hero/SchemesHero';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';
import { agentsApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

const categoryColors: Record<string, string> = {
  'Raw Material': 'primary',
  'Subsidy': 'success',
  'Technology Upgrade': 'indigo',
  'Development Programme': 'secondary',
  'Skill Development': 'purple',
};

export default function SchemesPage() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);
  const [toast, setToast] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [agentSchemes, setAgentSchemes] = useState<any[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [selectedAgentScheme, setSelectedAgentScheme] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setAgentLoading(true);
      agentsApi.scheme({
        experience_years: user.yearsOfExperience,
        pehchan_id: user.pehchan_id,
        yarn_passbook_id: user.yarn_passbook_id,
      })
        .then(r => setAgentSchemes(r.data?.recommended_schemes || []))
        .catch(console.error)
        .finally(() => setAgentLoading(false));
    }
  }, [user?.id]);

  const categories = ['All', ...Array.from(new Set(govtSchemes.map((s) => s.category)))];
  const filtered = govtSchemes.filter((s) => activeCategory === 'All' || s.category === activeCategory);

  const [now] = useState(() => Date.now());

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6 pb-8">

      {/* AI Recommended Schemes */}
      {(agentLoading || agentSchemes.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-secondary-600 to-indigo-700 px-6 py-4 flex items-center gap-2">
            <Sparkles size={16} className="text-white" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t('schemes.aiRecommended', 'AI Recommended for You')}</h2>
            {agentLoading && <span className="ml-auto text-xs text-white/70 animate-pulse">Analysing your profile...</span>}
          </div>
          {!agentLoading && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agentSchemes.map((s: any) => (
                <motion.div
                  key={s.scheme_id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedAgentScheme(s)}
                  className="cursor-pointer bg-gradient-to-br from-indigo-50 to-secondary-50 border border-indigo-100 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-xs bg-secondary-100 text-secondary-700 font-bold px-2 py-0.5 rounded-full mb-2">
                        <Star size={10} fill="currentColor"/> {s.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">{s.scheme_name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-indigo-700 font-bold mb-2">{s.financial_benefit}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.eligibility_reason}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2">
        <Filter size={16} className="text-slate-400 flex-shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
              activeCategory === cat
                ? 'bg-secondary-500 text-white shadow-md shadow-secondary-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary-300 hover:bg-secondary-50',
            ].join(' ')}
          >
            {tData(cat)}
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((scheme) => {
          const daysLeft = getDaysLeft(scheme.deadline);
          const badgeVariant = (categoryColors[scheme.category] || 'slate') as 'primary' | 'secondary' | 'success' | 'danger' | 'slate' | 'amber' | 'indigo' | 'purple' | 'orange';
          
          return (
            <motion.div key={scheme.id} variants={staggerItem} className="h-full">
              <HeroProductCard
                title={tData(scheme.name)}
                category={tData(scheme.category)}
                categoryColor={badgeVariant}
                imageSrc={scheme.imageSrc || businessLoanHero}
                benefit={tData(scheme.description)}
                highlightLabel={t('schemes.ministry', 'Ministry')}
                highlightValue={tData(scheme.ministry).split(' ').slice(0,2).join(' ')}
                secondaryLabel={t('schemes.status', 'Status')}
                secondaryValue={daysLeft !== null && daysLeft <= 30 ? `${daysLeft} ${t('schemes.daysLeft', 'Days Left')}` : t('schemes.active', 'Active')}
                isRecommended={scheme.isActive}
                onLearnMore={() => setSelectedScheme(scheme)}
                onApply={() => setSelectedScheme(scheme)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Agent Scheme Detail Modal */}
      <Modal isOpen={!!selectedAgentScheme} onClose={() => setSelectedAgentScheme(null)} title={selectedAgentScheme?.scheme_name} size="md">
        {selectedAgentScheme && (
          <div className="space-y-5">
            <div className="bg-secondary-50 border border-secondary-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-secondary-700 mb-1">{selectedAgentScheme.category}</p>
              <p className="text-base font-black text-slate-900">{selectedAgentScheme.financial_benefit}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">{t('schemes.whyEligible', 'Why You Are Eligible')}</p>
              <p className="text-sm text-slate-600">{selectedAgentScheme.eligibility_reason}</p>
            </div>
            {selectedAgentScheme.key_benefits?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">{t('schemes.benefits', 'Key Benefits')}</p>
                <ul className="space-y-1">
                  {selectedAgentScheme.key_benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-success-500 mt-0.5 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <p className="text-xs text-primary-800 font-medium">{selectedAgentScheme.next_steps}</p>
            </div>
            <Button fullWidth variant="secondary" onClick={() => setSelectedAgentScheme(null)}>{t('common.understood', 'Understood')}</Button>
          </div>
        )}
      </Modal>

      {/* Apply Modal */}
      <Modal isOpen={!!selectedScheme} onClose={() => setSelectedScheme(null)} title={t('schemes.applyForScheme', 'Apply for Scheme')} size="md">
        {selectedScheme && (
          <div className="space-y-6">
            <div className="bg-secondary-50 border border-secondary-100 rounded-2xl p-5">
              <p className="text-lg font-bold text-slate-900 mb-1">{tData(selectedScheme.name)}</p>
              <p className="text-sm text-secondary-700 font-semibold">{tData(selectedScheme.ministry)}</p>
            </div>
            
            <div className="space-y-4">
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                   <CheckCircle size={14} className="text-success-500" /> {t('schemes.eligibility', 'Eligibility')}
                 </p>
                 <ul className="space-y-1">
                   {selectedScheme.eligibility.map((e) => (
                     <li key={e} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {tData(e)}
                     </li>
                   ))}
                 </ul>
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-800 tracking-wide mb-2 flex items-center gap-2">
                   <span className="text-secondary-500">✦</span> {t('schemes.allBenefits', 'Benefits')}
                 </p>
                 <ul className="space-y-1">
                   {selectedScheme.benefits.map((b) => (
                     <li key={b} className="text-sm text-slate-600 pl-6 relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-slate-300 before:rounded-full before:absolute before:left-2 before:top-2">
                       {tData(b)}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-800 mb-3">{t('schemes.docsToCarry', 'Documents to Carry:')}</p>
              <ul className="space-y-2">
                {selectedScheme.documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-secondary-500 flex-shrink-0" />
                    {tData(doc)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p className="text-sm text-primary-800 font-medium leading-relaxed">
                {t('schemes.applyInstruction', 'Apply seamlessly online via Karghadhan or through the official government portal at')} <span className="font-bold underline decoration-primary-300 underline-offset-2">handlooms.nic.in</span>
              </p>
            </div>
            <Button fullWidth size="lg" variant="secondary" onClick={() => setSelectedScheme(null)} className="shadow-md shadow-secondary-200">
              {t('common.understoodApply', "Understood, I'll Apply")}
            </Button>
          </div>
        )}
      </Modal>

      <Toast message={t('schemes.applyInitiated', 'Scheme application guidance sent to your registered number!')} isVisible={toast} type="success" />
    </div>
  );
}
