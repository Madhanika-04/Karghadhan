import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './Button';

export interface PromoBanner {
  id: string;
  imageSrc: string;
  title: string;
  description: string;
  ctaText: string;
  onCtaClick: () => void;
  accentColor?: string; // Tailwind color class like 'from-indigo-600 to-indigo-800'
}

interface PromoCarouselProps {
  banners: PromoBanner[];
  autoSlideInterval?: number; // ms
}

export function PromoCarousel({ banners, autoSlideInterval = 5000 }: PromoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, banners.length, autoSlideInterval]);

  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const goToSlide = (index: number) => setCurrentIndex(index);

  if (!banners.length) return null;

  return (
    <div 
      className="relative w-full rounded-[24px] overflow-hidden shadow-lg shadow-slate-200/50 group h-[260px] sm:h-[340px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 bg-slate-900"
        >
          {/* Background Image */}
          <img 
            src={banners[currentIndex].imageSrc} 
            alt={banners[currentIndex].title}
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-contain sm:object-right transition-opacity duration-700 ease-out"
          />
          
          {/* Gradient Overlay for Text Readability */}
          <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentIndex].accentColor || 'from-indigo-900/95 via-indigo-900/80 to-transparent'} from-60%`} />

          {/* Content */}
          <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[85%] sm:max-w-[55%] text-white z-10">
            <h2 className="text-xl sm:text-3xl font-bold font-display leading-tight mb-2 sm:mb-3">
              {banners[currentIndex].title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mb-4 sm:mb-6 font-medium">
              {banners[currentIndex].description}
            </p>
            <div>
              <Button 
                variant="primary" 
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-50 border-none shadow-md px-6 rounded-xl font-bold transition-transform active:scale-95"
                onClick={banners[currentIndex].onCtaClick}
                rightIcon={<ChevronRight size={16} className="text-indigo-600" />}
              >
                {banners[currentIndex].ctaText}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows (visible on hover) */}
      <button 
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        onClick={goToPrev}
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
        onClick={goToNext}
      >
        <ChevronRight size={18} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full h-1.5 ${
              idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
