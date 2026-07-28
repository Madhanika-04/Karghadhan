import { motion } from 'framer-motion';
import { Building2, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { InsuranceProvider } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { tData } from '../../utils/i18nData';

interface Props {
  providers: InsuranceProvider[];
}

export function InsuranceProvidersTab({ providers }: Props) {
  const { t } = useTranslation();

  const publicSector = providers.filter(p => p.category === 'Public Sector');
  const privateSector = providers.filter(p => p.category === 'Private Sector');

  const renderProviderGroup = (title: string, groupProviders: InsuranceProvider[], badgeVariant: 'purple' | 'orange') => (
    <div className="mb-8 last:mb-0">
      <h3 className="text-lg font-bold text-slate-800 font-display mb-4 flex items-center gap-2">
        <div className={`w-2 h-6 rounded-full ${badgeVariant === 'purple' ? 'bg-purple-500' : 'bg-orange-500'}`} />
        {title}
      </h3>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {groupProviders.map((provider) => (
          <motion.div key={provider.id} variants={staggerItem} className="h-full">
            <Card className="h-full border-2 border-slate-100 hover:border-slate-300 transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                      {provider.logo ? (
                        <img src={provider.logo} /* Assume logos are locally imported in data */ alt={tData(provider.name)} className="w-8 h-8 object-contain" />
                      ) : (
                        <Building2 size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight">{tData(provider.name)}</h4>
                      <Badge variant={badgeVariant} className="mt-1">{tData(provider.category)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('insurance.productsOffered', 'Products Offered')}</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.productsOffered.map(product => (
                        <span key={product} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {tData(product)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('insurance.suitableFor', 'Suitable For')}</p>
                    <p className="text-sm text-slate-700 font-medium">{tData(provider.suitableFor)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('insurance.applyThrough', 'Apply Through')}</p>
                    <ul className="space-y-1">
                      {provider.applyThrough.map(channel => (
                        <li key={channel} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 size={14} className="text-success-500" />
                          {tData(channel)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  className="mt-6 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  rightIcon={<ExternalLink size={16} />}
                >
                  {t('insurance.learnMore', 'Learn More')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );

  return (
    <div>
      {renderProviderGroup(t('insurance.publicSector', 'Public Sector'), publicSector, 'purple')}
      {renderProviderGroup(t('insurance.privateSector', 'Private Sector'), privateSector, 'orange')}
    </div>
  );
}
