import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import logoKargha from '../../assets/logokargha.png';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <Link to="/" className="flex items-center gap-4 group">
            <img src={logoKargha} alt="Karghadhan Logo" className="w-12 h-12 md:w-[52px] md:h-[52px] lg:w-14 lg:h-14 object-contain shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[24px] md:text-[30px] text-[#111827] leading-tight">Karghadhan</span>
              <span className="text-[12px] md:text-[14px] text-[#2563EB] font-semibold tracking-wide uppercase">{t('common.brandTagline', 'AI Weaver Finance')}</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{t('common.home', 'Home')}</Link>
            <Link to="/loans" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{t('common.loans', 'Loans')}</Link>
            <Link to="/schemes" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{t('common.schemes', 'Schemes')}</Link>
            <Link to="/literacy" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">{t('common.learn', 'Learn')}</Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex"
            >
              {t('common.dashboard', 'Dashboard')}
            </Button>
            <Button size="sm" onClick={() => navigate('/language')}>
              {t('common.getStarted', 'Get Started')}
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
