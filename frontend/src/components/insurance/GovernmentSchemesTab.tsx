import { motion } from 'framer-motion';
import type { InsurancePolicy } from '../../types';
import { HeroProductCard } from '../ui/HeroProductCard';
import { useTranslation } from 'react-i18next';
import lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { tData } from '../../utils/i18nData';

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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {govPolicies.map((policy) => (
        <motion.div key={policy.id} variants={staggerItem} className="h-full">
          <HeroProductCard
            title={tData(policy.name)}
            category={tData(policy.type)}
            categoryColor="indigo"
            imageSrc={policy.imageSrc || lifeInsuranceHero}
            benefit={tData(policy.shortDescription)}
            highlightLabel={t('insurance.coverage', 'Coverage')}
            highlightValue={policy.coverage.split(' ')[0]}
            secondaryLabel={t('insurance.premium', 'Premium')}
            secondaryValue={policy.annualPremium === 0 ? t('common.free', 'FREE') : `₹${policy.annualPremium.toLocaleString('en-IN')}`}
            isRecommended={policy.isRecommended}
            onLearnMore={() => onViewDetails(policy)}
            onApply={() => onViewDetails(policy)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
