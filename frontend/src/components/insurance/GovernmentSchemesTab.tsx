import { motion } from 'framer-motion';
import { Shield, ChevronRight, Star } from 'lucide-react';
import type { InsurancePolicy } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '../../utils/animations';

interface Props {
  policies: InsurancePolicy[];
  onViewDetails: (policy: InsurancePolicy) => void;
}

export function GovernmentSchemesTab({ policies, onViewDetails }: Props) {
  const { t } = useTranslation();

  const govPolicies = policies.filter(p => p.category === 'Government');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-5"
    >
      {govPolicies.map((policy) => (
        <motion.div key={policy.id} variants={staggerItem} className="h-full">
          <Card className="h-full border-2 transition-all duration-300 border-slate-100 hover:border-indigo-300 hover:shadow-md cursor-pointer group">
            <CardContent className="p-0">
              {policy.isRecommended && (
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold px-5 py-2 flex items-center justify-between rounded-t-[1.3rem]">
                  <div className="flex items-center gap-1.5">
                    <Star size={12} fill="currentColor" className="text-amber-300" />
                    {t('insurance.aiRecommended', 'AI Recommended')}
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-indigo-700 transition-colors">{policy.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="success" dot>{t('insurance.active', 'Active')}</Badge>
                      <Badge variant="indigo">{t('insurance.govScheme', 'Gov. Scheme')}</Badge>
                      <Badge variant="slate">{policy.type.split(' ')[0]}</Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100">
                    <Shield size={22} className="text-indigo-600" />
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-5 leading-relaxed">
                  {policy.shortDescription}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-base font-bold text-slate-900 leading-tight">{policy.coverage}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{t('insurance.coverage', 'Coverage')}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                    <p className="text-base font-bold text-indigo-700">
                      {policy.annualPremium === 0 ? `🆓 ${t('common.free', 'FREE')}` : `₹${policy.annualPremium.toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-[10px] text-indigo-500 mt-0.5 font-medium uppercase tracking-wider">{t('insurance.premium', 'Premium')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <p className="text-xs text-slate-500 font-medium">
                    <span className="text-slate-400 mr-1">{t('insurance.suitableFor', 'For:')}</span>
                    <span className="text-slate-700">{policy.suitableFor}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={(e) => { e.stopPropagation(); onViewDetails(policy); }}
                    rightIcon={<ChevronRight size={14} />}
                  >
                    {t('common.viewDetails', 'View Details')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
