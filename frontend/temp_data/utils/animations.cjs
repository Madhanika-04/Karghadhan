"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoverScale = exports.checkmarkVariants = exports.pulseVariants = exports.pageTransition = exports.staggerItem = exports.staggerContainer = exports.scaleIn = exports.slideInRight = exports.slideInLeft = exports.fadeIn = exports.fadeInUp = void 0;
exports.fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: { opacity: 0, y: -24, transition: { duration: 0.3 } },
};
exports.fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};
exports.slideInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
};
exports.slideInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: 40, transition: { duration: 0.3 } },
};
exports.scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'backOut' } },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.3 } },
};
exports.staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};
exports.staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
exports.pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.35, ease: 'easeInOut' },
};
exports.pulseVariants = {
    animate: {
        scale: [1, 1.08, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
};
exports.checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
    },
};
exports.hoverScale = {
    whileHover: { scale: 1.03, transition: { duration: 0.2 } },
    whileTap: { scale: 0.97 },
};
