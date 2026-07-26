import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 ${
        transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-200 transition-shadow">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base text-slate-800 font-display">KarghaKadam</span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wide hidden sm:block">AI Weaver Finance</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/loans" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Loans</Link>
            <Link to="/schemes" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Schemes</Link>
            <Link to="/literacy" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Learn</Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex"
            >
              Dashboard
            </Button>
            <Button size="sm" onClick={() => navigate('/language')}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
