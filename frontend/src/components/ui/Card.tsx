import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale } from '../../utils/animations';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  gradient?: string;
  onClick?: () => void;
  padding?: string;
}

export function Card({
  children,
  className = '',
  glass = false,
  hover = false,
  gradient,
  onClick,
  padding = 'p-6',
}: CardProps) {
  const base =
    'rounded-2xl shadow-sm border border-white/60 transition-all duration-200';
  const glassStyle = glass
    ? 'bg-white/70 backdrop-blur-xl border-white/40'
    : 'bg-white';
  const hoverStyle = hover ? 'card-hover cursor-pointer' : '';
  const gradientStyle = gradient ? gradient : '';

  const Wrapper = onClick ? motion.div : 'div';
  const motionProps = onClick ? { ...hoverScale, onClick } : { onClick };

  return (
    <Wrapper
      className={[base, glassStyle, hoverStyle, gradientStyle, padding, className].join(' ')}
      {...(motionProps as any)}
    >
      {children}
    </Wrapper>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  bgColor?: string;
}

export function StatCard({ icon, label, value, subValue, color = 'text-emerald-600', bgColor = 'bg-emerald-50' }: StatCardProps) {
  return (
    <motion.div
      {...hoverScale}
      className="bg-white rounded-2xl p-5 shadow-sm border border-white/60 flex items-center gap-4"
    >
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <div className={color}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {subValue && <p className="text-xs text-emerald-600 font-medium">{subValue}</p>}
      </div>
    </motion.div>
  );
}
