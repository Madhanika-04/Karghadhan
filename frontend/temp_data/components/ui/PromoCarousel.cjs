"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoCarousel = PromoCarousel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const Button_1 = require("./Button");
function PromoCarousel({ banners, autoSlideInterval = 5000 }) {
    const [currentIndex, setCurrentIndex] = (0, react_1.useState)(0);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (isPaused || banners.length <= 1)
            return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, autoSlideInterval);
        return () => clearInterval(interval);
    }, [currentIndex, isPaused, banners.length, autoSlideInterval]);
    const goToNext = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
    const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    const goToSlide = (index) => setCurrentIndex(index);
    if (!banners.length)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative w-full rounded-[24px] overflow-hidden shadow-lg shadow-slate-200/50 group h-[260px] sm:h-[340px] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10", onMouseEnter: () => setIsPaused(true), onMouseLeave: () => setIsPaused(false), children: [(0, jsx_runtime_1.jsx)(framer_motion_1.AnimatePresence, { initial: false, children: (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.8, ease: 'easeInOut' }, className: "absolute inset-0 bg-slate-900", children: [(0, jsx_runtime_1.jsx)("img", { src: banners[currentIndex].imageSrc, alt: banners[currentIndex].title, className: "absolute inset-0 w-full h-full object-cover object-right sm:object-contain sm:object-right transition-opacity duration-700 ease-out" }), (0, jsx_runtime_1.jsx)("div", { className: `absolute inset-0 bg-gradient-to-r ${banners[currentIndex].accentColor || 'from-indigo-900/95 via-indigo-900/80 to-transparent'} from-60%` }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-[85%] sm:max-w-[55%] text-white z-10", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl sm:text-3xl font-bold font-display leading-tight mb-2 sm:mb-3", children: banners[currentIndex].title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs sm:text-sm text-white/80 line-clamp-2 mb-4 sm:mb-6 font-medium", children: banners[currentIndex].description }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "primary", size: "sm", className: "bg-white text-slate-900 hover:bg-slate-50 border-none shadow-md px-6 rounded-xl font-bold transition-transform active:scale-95", onClick: banners[currentIndex].onCtaClick, rightIcon: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 16, className: "text-indigo-600" }), children: banners[currentIndex].ctaText }) })] })] }, currentIndex) }), (0, jsx_runtime_1.jsx)("button", { className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40", onClick: goToPrev, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 18 }) }), (0, jsx_runtime_1.jsx)("button", { className: "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40", onClick: goToNext, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18 }) }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2", children: banners.map((_, idx) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => goToSlide(idx), className: `transition-all duration-300 rounded-full h-1.5 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}` }, idx))) })] }));
}
