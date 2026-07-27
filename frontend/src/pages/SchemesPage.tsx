import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, CheckCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { govtSchemes } from '../data/schemes';
import type { GovtScheme } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Modal';
import { Card, CardContent } from '../components/ui/Card';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useTranslation } from 'react-i18next';

const categoryColors: Record<string, string> = {
  'Raw Material': 'primary',
  'Subsidy': 'success',
  'Technology Upgrade': 'indigo',
  'Development Programme': 'secondary',
  'Skill Development': 'purple',
};

export default function SchemesPage() {
  const { t } = useTranslation();
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(govtSchemes.map((s) => s.category)))];
  const filtered = govtSchemes.filter((s) => activeCategory === 'All' || s.category === activeCategory);

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center shadow-sm">
            <Building2 size={24} className="text-secondary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">{t('schemes.title', 'Government Schemes')}</h1>
            <p className="text-sm text-slate-500">{t('schemes.subtitle', "Welfare programmes you're eligible for")}</p>
          </div>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-secondary-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-secondary-200/50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">{t('schemes.eligibleFor', "You're eligible for")}</p>
            <p className="text-4xl font-bold">{govtSchemes.length} <span className="text-2xl font-medium">{t('schemes.activeSchemes', 'Active Schemes')}</span></p>
            <p className="text-white/80 text-sm mt-2 font-medium">{t('schemes.bannerSub', 'Ministry of Textiles & other departments')}</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex-1 sm:flex-none border border-white/10">
              <p className="text-2xl font-bold">90%</p>
              <p className="text-xs text-white/80 font-medium">{t('schemes.subsidyMax', 'Subsidy Max')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 flex-1 sm:flex-none border border-white/10">
              <p className="text-2xl font-bold">₹3K/mo</p>
              <p className="text-xs text-white/80 font-medium">{t('schemes.trainingStipend', 'Training Stipend')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-hide">
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
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {filtered.map((scheme) => {
          const daysLeft = getDaysLeft(scheme.deadline);
          const isExpanded = expandedId === scheme.id;
          const badgeVariant = (categoryColors[scheme.category] || 'slate') as 'primary' | 'success' | 'indigo' | 'secondary' | 'purple' | 'slate';

          return (
            <motion.div key={scheme.id} variants={staggerItem} className="h-full">
              <Card className="h-full border-2 border-secondary-100 hover:border-secondary-300 transition-all duration-300">
                <CardContent className="p-0">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-secondary-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-secondary-100/50">
                        <Building2 size={22} className="text-secondary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{scheme.name}</h3>
                          <Badge variant={badgeVariant} className="flex-shrink-0">{scheme.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{scheme.ministry}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-5 leading-relaxed line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {scheme.description}
                    </p>

                    {/* Benefits Preview */}
                    <div className="space-y-2 mb-5">
                      {scheme.benefits.slice(0, 2).map((b) => (
                        <div key={b} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                          <CheckCircle size={14} className="text-secondary-500 flex-shrink-0 mt-0.5" />
                          {b}
                        </div>
                      ))}
                    </div>

                    {daysLeft !== null && (
                      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm font-bold ${
                        daysLeft <= 30 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-secondary-50 text-secondary-700 border border-secondary-100'
                      }`}>
                        <Calendar size={16} />
                        {daysLeft === 0 ? t('schemes.deadlineToday', 'Deadline today!') : t('schemes.daysLeft', '{{count}} days left to apply', { count: daysLeft })}
                        {scheme.deadline && (
                          <span className="ml-1 opacity-70 font-medium">
                            ({new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                        onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                        rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      >
                        {isExpanded ? t('common.hideDetails', 'Hide Details') : t('common.viewDetails', 'View Details')}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 shadow-sm shadow-secondary-200"
                        onClick={() => { setSelectedScheme(scheme); setToast(true); setTimeout(() => setToast(false), 3000); }}
                        rightIcon={<ExternalLink size={14} />}
                      >
                        {t('common.apply', 'Apply')}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-5 space-y-5 rounded-b-3xl"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                          <CheckCircle size={14} className="text-secondary-500" /> {t('schemes.allBenefits', 'All Benefits')}
                        </p>
                        <ul className="space-y-2">
                          {scheme.benefits.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3 flex items-center gap-2">
                          <span className="text-primary-500">✦</span> {t('schemes.eligibility', 'Eligibility')}
                        </p>
                        <ul className="space-y-2">
                          {scheme.eligibility.map((e) => (
                            <li key={e} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 tracking-wide mb-3">{t('schemes.requiredDocs', 'Required Documents')}</p>
                        <div className="flex flex-wrap gap-2">
                          {scheme.documents.map((doc) => (
                            <span key={doc} className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Apply Modal */}
      <Modal isOpen={!!selectedScheme} onClose={() => setSelectedScheme(null)} title={t('schemes.applyForScheme', 'Apply for Scheme')} size="md">
        {selectedScheme && (
          <div className="space-y-6">
            <div className="bg-secondary-50 border border-secondary-100 rounded-2xl p-5">
              <p className="text-lg font-bold text-slate-900 mb-1">{selectedScheme.name}</p>
              <p className="text-sm text-secondary-700 font-semibold">{selectedScheme.ministry}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-800 mb-3">{t('schemes.docsToCarry', 'Documents to Carry:')}</p>
              <ul className="space-y-2">
                {selectedScheme.documents.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-secondary-500 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p className="text-sm text-primary-800 font-medium leading-relaxed">
                {t('schemes.applyInstruction', 'Visit your nearest District Handloom Office or apply through the official government portal at')} <span className="font-bold underline decoration-primary-300 underline-offset-2">handlooms.nic.in</span>
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
