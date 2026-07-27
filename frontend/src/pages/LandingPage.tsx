import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  HandCoins,
  BookOpen,
  Building2,
  Bot,
  CheckCircle,
  Users,
  TrendingUp,
  Star,
  Zap,
} from 'lucide-react';
import logoKargha from '../assets/logokargha.png';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';
import { fadeInUp, staggerContainer, staggerItem, hoverScale } from '../utils/animations';

const features = [
  {
    icon: Bot,
    title: 'AI Verification',
    desc: 'Instant identity verification using OCR and AI-powered document matching.',
    color: 'from-violet-500 to-indigo-600',
    bg: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
  {
    icon: HandCoins,
    title: 'Micro Loans',
    desc: 'Access government-backed loans with subsidised interest rates tailored for weavers.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Insurance',
    desc: 'Get life and health insurance coverage starting at just ₹20/year.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    icon: Building2,
    title: 'Government Schemes',
    desc: 'Discover and apply for all welfare schemes you are entitled to as a weaver.',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    icon: BookOpen,
    title: 'Financial Literacy',
    desc: 'Learn about savings, credit, UPI, and loan fraud prevention in your language.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    textColor: 'text-pink-600',
  },
  {
    icon: Zap,
    title: 'Instant Eligibility',
    desc: 'AI analyses your profile and instantly shows you personalised recommendations.',
    color: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
    textColor: 'text-teal-600',
  },
];

const stats = [
  { value: '10,000+', label: 'Verified Weavers', icon: Users, color: 'text-emerald-600' },
  { value: '₹50Cr+', label: 'Loans Facilitated', icon: TrendingUp, color: 'text-indigo-600' },
  { value: '98%', label: 'Verification Accuracy', icon: CheckCircle, color: 'text-amber-600' },
  { value: '6', label: 'Languages Supported', icon: Star, color: 'text-pink-600' },
];

const testimonials = [
  {
    name: 'Lakshmi Devi',
    role: 'Silk Weaver, Kanchipuram',
    text: 'Karghadhan helped me get a ₹1.2 lakh loan in just 2 weeks. The AI guidance was like having a financial advisor in my hand!',
    avatar: 'L',
  },
  {
    name: 'Rajan Kumar',
    role: 'Cotton Weaver, Varanasi',
    text: 'I discovered the Solar Loom Scheme through this app. My electricity costs dropped by 60%!',
    avatar: 'R',
  },
  {
    name: 'Meena Bai',
    role: 'Wool Weaver, Rajasthan',
    text: 'The PMJJBY insurance registration was done in 5 minutes. Now my family is protected for just ₹436 a year.',
    avatar: 'M',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-indigo-900 pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400 rounded-full blur-[80px]" />
        </div>

        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex-1 text-center lg:text-left"
            >
              <motion.div variants={staggerItem} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                <img src={logoKargha} alt="Icon" className="w-4 h-4 object-contain" />
                <span className="text-white/90 text-sm font-medium">{t('landing.aiPowered', 'AI-Powered Financial Inclusion')}</span>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight font-display mb-6"
              >
                {t('landing.heroTitle1', 'AI Financial')}
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  {t('landing.heroTitle2', 'Companion for')}
                </span>
                {t('landing.heroTitle3', 'Every Weaver')}
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed"
              >
                {t('landing.heroSubtitle', 'Helping handloom weavers across India access affordable loans, insurance, government schemes, and financial literacy — in their own language.')}
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button
                  size="xl"
                  onClick={() => navigate('/language')}
                  rightIcon={<ArrowRight size={20} />}
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-white shadow-2xl shadow-emerald-900/50 border border-emerald-300/20"
                >
                  {t('common.getStartedFree', 'Get Started Free')}
                </Button>
                <Button
                  size="xl"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-white border-2 border-white/30 hover:bg-white/10"
                >
                  {t('common.viewDashboard', 'View Dashboard')}
                </Button>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['L', 'R', 'M', 'H'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: ['#059669', '#6366f1', '#f59e0b', '#ef4444'][i] }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  <span className="text-white font-bold">10,000+</span> {t('landing.verifiedWeavers', 'weavers already verified')}
                </p>
              </motion.div>
            </motion.div>

            {/* Right — Floating Cards */}
            <div className="flex-1 relative w-full max-w-lg mx-auto lg:mx-0">
              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'backOut' }}
                className="glass rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={logoKargha} alt="Karghadhan Logo" className="w-12 h-12 object-contain shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Kargha AI</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-600 font-semibold">{t('landing.onlineReady', 'Online & Ready')}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 mb-3">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{t('landing.aiMessageLocal', 'நான் உங்கள் Kargha AI. உங்கள் Weaver ID சரிபார்க்கிறேன்...')}"
                  </p>
                  <p className="text-xs text-slate-500 mt-1 italic">{t('landing.aiMessageEn', "I'm your Kargha AI. Verifying your Weaver ID...")}</p>
                </div>
                <div className="space-y-2">
                  {[t('landing.status1', '✅ Aadhaar Verified'), t('landing.status2', '✅ Weaver ID Matched'), t('landing.status3', '🔍 Checking Eligibility...')].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.3 }}
                      className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white rounded-xl px-3 py-2"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Floating Badges */}
              <motion.div
                className="absolute -top-4 -right-4 bg-amber-400 text-white px-4 py-2 rounded-2xl shadow-lg text-sm font-bold float"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {t('landing.loanApproved', '🏆 ₹1.2L Loan Approved!')}
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 float"
                style={{ animationDelay: '2s' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <p className="text-xs font-bold text-slate-800">{t('landing.newScheme', 'New Scheme Available')}</p>
                <p className="text-xs text-emerald-600">{t('landing.solarLoom', 'Solar Loom Scheme 2025')}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="text-center"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 bg-slate-50 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-3xl font-bold text-slate-800 font-display">{tData(stat.value)}</p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{tData(stat.label)}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">{t('landing.everythingYouNeed', 'Everything You Need')}</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2 font-display">
              {t('landing.featuresTitle', "Built for India's Weavers")}
            </h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
              {t('landing.featuresSubtitle', 'From AI-powered identity verification to personalised financial recommendations — all in one platform.')}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={staggerItem}
                  {...hoverScale}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 card-hover"
                >
                  <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon size={22} className={f.textColor} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{tData(f.title)}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{tData(f.desc)}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">{t('landing.testimonials', 'Testimonials')}</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-2 font-display">
              {t('landing.weaversLove', 'Weavers Love Karghadhan')}
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={staggerItem}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 border border-emerald-100 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" className="text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{tData(t.text)}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {tData(t.avatar)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{tData(t.name)}</p>
                    <p className="text-xs text-slate-500">{tData(t.role)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-4">
              {t('landing.ctaTitle', 'Start Your Financial Journey Today')}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {t('landing.ctaSubtitle', 'Join 10,000+ verified weavers who have already unlocked loans, insurance, and government benefits.')}
            </p>
            <Button
              size="xl"
              onClick={() => navigate('/language')}
              rightIcon={<ArrowRight size={20} />}
              className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-2xl"
            >
              {t('common.getStartedFree', 'Get Started for Free')}
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
