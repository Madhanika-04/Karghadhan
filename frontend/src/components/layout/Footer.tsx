import { Link } from 'react-router-dom';
import { Sparkles, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">KarghaKadam</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering every handloom weaver through AI-powered financial inclusion.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1.5 bg-emerald-900/50 text-emerald-400 text-xs rounded-full font-semibold">
                DPDP Compliant
              </span>
              <span className="px-3 py-1.5 bg-indigo-900/50 text-indigo-400 text-xs rounded-full font-semibold">
                RBI Registered
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Services</h3>
            <ul className="space-y-2.5">
              {['Micro Loans', 'Insurance', 'Government Schemes', 'Financial Literacy'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Resources</h3>
            <ul className="space-y-2.5">
              {['Weaver ID Registration', 'MUDRA Loan Guide', 'Insurance Basics', 'UPI Tutorial'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                    {item}
                    <ExternalLink size={11} className="opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Support</h3>
            <ul className="space-y-2.5">
              <li className="text-sm text-slate-400">📞 1800-XXX-XXXX (Toll-free)</li>
              <li className="text-sm text-slate-400">📧 support@karghakadam.in</li>
              <li className="text-sm text-slate-400">🕐 Mon–Sat, 9am–6pm IST</li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Available In</p>
              <div className="flex flex-wrap gap-1.5">
                {['EN', 'TA', 'HI', 'TE', 'KN', 'ML'].map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded-lg font-mono">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2025 KarghaKadam. All rights reserved. NBFC licensed under RBI regulations.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            Made with <Heart size={12} className="text-red-400" /> for India's weavers
          </p>
        </div>
      </div>
    </footer>
  );
}
