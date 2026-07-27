import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface HeroProductCardProps {
  imageSrc: string;
  category: string;
  categoryColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'slate' | 'amber' | 'indigo' | 'purple' | 'orange';
  title: string;
  benefit: string;
  highlightLabel: string;
  highlightValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  isRecommended?: boolean;
  onLearnMore?: () => void;
  onApply?: () => void;
  applyLabel?: string;
  learnMoreLabel?: string;
}

export function HeroProductCard({
  imageSrc,
  category,
  categoryColor = 'indigo',
  title,
  benefit,
  highlightLabel,
  highlightValue,
  secondaryLabel,
  secondaryValue,
  isRecommended = false,
  onLearnMore,
  onApply,
  applyLabel = 'Apply Now',
  learnMoreLabel = 'Learn More',
}: HeroProductCardProps) {
  const { t } = useTranslation();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Card className="overflow-hidden group h-full flex flex-col cursor-pointer relative" onClick={onLearnMore}>
      {isRecommended && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="amber" className="bg-amber-400 text-amber-900 border-none shadow-md backdrop-blur-md font-bold px-3 py-1">
            <Star size={14} className="fill-amber-900 mr-1" />
            {t('common.aiRecommended', 'AI Recommended')}
          </Badge>
        </div>
      )}

      {/* Image Container with Skeleton */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}
        <motion.img
          src={imageSrc}
          alt={title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
           <Badge variant={categoryColor} className="shadow-sm backdrop-blur-md bg-white/90">{category}</Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
        <h3 className="font-bold text-slate-900 text-xl leading-tight mb-2 group-hover:text-indigo-600 transition-colors font-display">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
          {benefit}
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{highlightLabel}</p>
             <p className="text-sm font-bold text-slate-900 leading-tight">{highlightValue}</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
             <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">{secondaryLabel}</p>
             <p className="text-sm font-bold text-indigo-700 leading-tight">{secondaryValue}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          {onLearnMore && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onLearnMore(); }}
            >
              {learnMoreLabel}
            </Button>
          )}
          {onApply && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
              onClick={(e) => { e.stopPropagation(); onApply(); }}
              rightIcon={<ChevronRight size={16} />}
            >
              {applyLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
