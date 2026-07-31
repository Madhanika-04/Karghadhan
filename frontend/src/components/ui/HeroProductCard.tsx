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
    <Card className="overflow-hidden group h-full flex flex-col cursor-pointer relative border-transparent hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 transform hover:-translate-y-1" onClick={onLearnMore}>
      {isRecommended && (
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="amber" className="bg-amber-400/90 text-amber-950 border border-amber-300 shadow-lg backdrop-blur-md font-bold px-3 py-1 uppercase tracking-widest text-[9px]">
            <Star size={12} className="fill-amber-950 mr-1.5" />
            {t('common.aiRecommended', 'Top Pick')}
          </Badge>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 flex-shrink-0">
        <motion.img
          src={imageSrc}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
           <Badge variant={categoryColor} className="shadow-lg backdrop-blur-md bg-white/95 border-none font-bold uppercase tracking-wider text-[10px] px-3 py-1 text-slate-800">{category}</Badge>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
        <h3 className="font-black text-slate-900 text-xl leading-tight mb-2 group-hover:text-indigo-600 transition-colors font-display tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">
          {benefit}
        </p>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 group-hover:bg-slate-50 transition-colors">
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">{highlightLabel}</p>
             <p className="text-sm font-black text-slate-800 leading-tight">{highlightValue}</p>
          </div>
          <div className="bg-indigo-50/50 border border-indigo-50 rounded-xl p-3.5 group-hover:bg-indigo-50 transition-colors">
             <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-1">{secondaryLabel}</p>
             <p className="text-sm font-black text-indigo-700 leading-tight">{secondaryValue}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          {onLearnMore && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 shadow-sm"
              onClick={(e) => { e.stopPropagation(); onLearnMore(); }}
            >
              {learnMoreLabel}
            </Button>
          )}
          {onApply && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-600/20"
              onClick={(e) => { e.stopPropagation(); onApply(); }}
              rightIcon={<ChevronRight size={16} strokeWidth={3} />}
            >
              {applyLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
