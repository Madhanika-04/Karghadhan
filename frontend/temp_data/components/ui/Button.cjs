"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const framer_motion_1 = require("framer-motion");
const animations_1 = require("../../utils/animations");
const cn_1 = require("../../utils/cn");
const variantStyles = {
    default: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-200/50',
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-300/30',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg shadow-secondary-300/30',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary-700 bg-white shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-sm shadow-danger-200/50',
    amber: 'bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 text-white shadow-lg shadow-secondary-300/30',
};
const sizeStyles = {
    sm: 'h-9 px-4 text-xs rounded-xl gap-1.5',
    md: 'h-11 px-6 text-sm rounded-xl gap-2',
    lg: 'h-12 px-8 text-base rounded-2xl gap-2',
    xl: 'h-14 px-10 text-lg rounded-2xl gap-3',
    icon: 'h-10 w-10 rounded-xl justify-center',
};
exports.Button = react_1.default.forwardRef(({ variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, fullWidth = false, children, className, disabled, ...rest }, ref) => {
    return ((0, jsx_runtime_1.jsxs)(framer_motion_1.motion.button, { ref: ref, ...(disabled || isLoading ? {} : animations_1.hoverScale), className: (0, cn_1.cn)('inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2', variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className), disabled: disabled || isLoading, ...rest, children: [isLoading ? ((0, jsx_runtime_1.jsx)("span", { className: "inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" })) : (leftIcon && (0, jsx_runtime_1.jsx)("span", { className: "mr-1", children: leftIcon })), children, !isLoading && rightIcon && (0, jsx_runtime_1.jsx)("span", { className: "ml-1", children: rightIcon })] }));
});
exports.Button.displayName = 'Button';
