import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Step labels for onboarding progress
const steps = [
  'Language',
  'Welcome',
  'Verify',
  'Details',
  'Upload',
  'Verified',
];

interface OnboardingLayoutProps {
  step?: number; // 0-indexed, undefined = no stepper
}

export function OnboardingLayout({ step }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 flex flex-col">
      {/* Top Bar */}
      <div className="px-4 sm:px-8 pt-6 pb-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800">KarghaKadam</span>
        </div>
        {step !== undefined && (
          <span className="text-xs text-slate-400 font-semibold">
            Step {step + 1} of {steps.length}
          </span>
        )}
      </div>

      {/* Step Indicator */}
      {step !== undefined && (
        <div className="px-4 sm:px-8 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-1.5 mb-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i <= step
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">{steps[step]}</p>
        </div>
      )}

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
        className="flex-1 flex flex-col items-center px-4 py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
