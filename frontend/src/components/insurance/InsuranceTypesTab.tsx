import { motion } from 'framer-motion';
import { ShieldAlert, Info, HeartPulse, Shield, Banknote, Briefcase, Factory, Package, Ship, ExternalLink } from 'lucide-react';
import type { InsuranceTypeDesc } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { tData } from '../../utils/i18nData';

interface Props {
  types: InsuranceTypeDesc[];
  onSelectType?: (type: InsuranceTypeDesc) => void;
}

export function InsuranceTypesTab({ types, onSelectType }: Props) {
  const { t } = useTranslation();

  const getIconForType = (id: string) => {
    switch (id) {
      case 'life': return <HeartPulse className="text-rose-500" />;
      case 'health': return <ShieldAlert className="text-teal-500" />;
      case 'accident': return <Shield className="text-amber-500" />;
      case 'loan-protection': return <Banknote className="text-indigo-500" />;
      case 'asset': return <Briefcase className="text-blue-500" />;
      case 'fire': return <Factory className="text-orange-500" />;
      case 'burglary': return <Package className="text-purple-500" />;
      case 'marine': return <Ship className="text-cyan-500" />;
      default: return <Info className="text-slate-500" />;
    }
  };

  const getColorForType = (id: string) => {
    switch (id) {
      case 'life': return 'bg-rose-50 border-rose-100';
      case 'health': return 'bg-teal-50 border-teal-100';
      case 'accident': return 'bg-amber-50 border-amber-100';
      case 'loan-protection': return 'bg-indigo-50 border-indigo-100';
      case 'asset': return 'bg-blue-50 border-blue-100';
      case 'fire': return 'bg-orange-50 border-orange-100';
      case 'burglary': return 'bg-purple-50 border-purple-100';
      case 'marine': return 'bg-cyan-50 border-cyan-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {types.map((type) => (
        <motion.div key={type.id} variants={staggerItem} className="h-full">
          <Card
            onClick={() => onSelectType?.(type)}
            className="h-full border-2 border-slate-100 hover:border-slate-300 transition-all shadow-sm hover:shadow-md group overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            <CardContent className="p-0 flex flex-col justify-between h-full">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${getColorForType(type.id)} transition-transform group-hover:scale-110`}>
                    {getIconForType(type.id)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{tData(type.title)}</h3>
                    <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
                      {t('insurance.recommendedFor', 'Recommended For:')} {tData(type.recommendedUsers)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('insurance.benefits', 'Key Benefits')}</p>
                    <ul className="space-y-1.5">
                      {type.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 flex-shrink-0" />
                          {tData(benefit)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('insurance.commonClaims', 'Common Claims')}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.commonClaims.map((claim, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md">
                          {tData(claim)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button & AI Recommendation */}
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-t border-indigo-100 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                    "{tData(type.aiRecommendation)}"
                  </p>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectType?.(type);
                  }}
                  rightIcon={<ExternalLink size={14} />}
                >
                  {t('insurance.learnMore', 'Learn More Details')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
