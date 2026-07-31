import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, MapPin, Clock, ExternalLink, ArrowRight, CheckCircle2, HelpCircle, Building2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';

export default function PehchanGuidancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [appId, setAppId] = useState('');
  const [trackStatus, setTrackStatus] = useState<string | null>(null);

  const handleTrack = () => {
    if (appId.trim()) {
      setTrackStatus(t('pehchan.trackStatus', 'Application Under Review (Expected Completion in 5 Days)'));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
          <ShieldCheck size={30} />
        </div>
        <div>
          <Badge variant="amber" dot>{t('pehchan.govVerification', 'Government Verification')}</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t('pehchan.title', 'Weaver Pehchan ID Guidance')}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {t('pehchan.subtitle', 'Complete guide for first-time weavers to obtain official Ministry of Textiles ID')}
          </p>
        </div>
      </motion.div>

      {/* Welcome Card for First-Time Weavers */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-indigo-900 via-primary-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-300">{t('pehchan.newWeaverJourney', 'New Weaver Journey')}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{t('pehchan.getCard', 'Get Your Weaver Pehchan Card')}</h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl leading-relaxed">
              {t('pehchan.cardDesc', 'The Weaver Pehchan Card is a national photo identity card issued by the Office of Development Commissioner for Handlooms, Ministry of Textiles.')}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="secondary"
              leftIcon={<ExternalLink size={16} />}
              onClick={() => window.open('https://handlooms.nic.in', '_blank')}
            >
              {t('pehchan.applyPortal', 'Apply Online Portal')}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid: What is Pehchan ID & Why Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-100">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <HelpCircle size={20} /> {t('pehchan.whatIsId', 'What is Weaver Pehchan ID?')}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('pehchan.idDesc', 'It is a 14-digit unique registration number and photo identity card recognizing you as a certified artisan or handloom weaver under government schemes.')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
              <CheckCircle2 size={20} /> {t('pehchan.whyRequired', 'Why is it Required?')}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('pehchan.whyDesc', 'Required for Weaver Mudra loans, subsidized yarn purchases, free health insurance (PMJJBY), and raw material subventions under NHDP.')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Benefits */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary-600" /> {t('pehchan.majorBenefits', 'Major Benefits of Pehchan ID')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: t('pehchan.b1Title', 'Subsidized Raw Yarn'), desc: t('pehchan.b1Desc', '15% subvention on yarn purchase via NHDP') },
            { title: t('pehchan.b2Title', 'Mudra Micro Credit'), desc: t('pehchan.b2Desc', 'Concessional loans up to ₹2 Lakhs @ 6%') },
            { title: t('pehchan.b3Title', 'Social Security'), desc: t('pehchan.b3Desc', 'Free life & accidental insurance coverage') },
          ].map((b, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <p className="text-sm font-bold text-slate-900">{b.title}</p>
              <p className="text-xs text-slate-500 font-medium">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Apply & Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step-by-Step Application */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" /> {t('pehchan.appSteps', 'Application Steps')}
          </h3>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span>{t('pehchan.step1', 'Apply Online through Karghadhan portal.')}</span>
            </div>
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span>{t('pehchan.step2', 'Submit Aadhaar, passport photo & bank details.')}</span>
            </div>
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <span>{t('pehchan.step3', 'Digital verification via KarghaDhan.')}</span>
            </div>
            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <span>{t('pehchan.step4', 'Receive 14-digit Pehchan Card (7-10 working days).')}</span>
            </div>
          </div>
        </div>

        {/* Documents & Offices */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> {t('pehchan.reqDocs', 'Required Documents')}
          </h3>
          <ul className="space-y-2 text-xs font-medium text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {t('pehchan.doc1', 'Aadhaar Card (Mandatory)')}</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {t('pehchan.doc2', 'Bank Passbook copy')}</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {t('pehchan.doc3', '2 Passport Size Photos')}</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {t('pehchan.doc4', 'Loom Asset proof / Self-declaration')}</li>
          </ul>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} className="text-amber-500 shrink-0" /> {t('pehchan.procTime', 'Expected Processing Time:')} <strong className="text-slate-800">{t('pehchan.days7to10', '7 to 10 days')}</strong>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          fullWidth
          size="lg"
          variant="primary"
          leftIcon={<ExternalLink size={18} />}
          onClick={() => window.open('https://handlooms.nic.in', '_blank')}
        >
          {t('pehchan.applyId', 'Apply for Pehchan ID')}
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="outline"
          leftIcon={<Clock size={18} />}
          onClick={() => setIsTrackModalOpen(true)}
          className="border-slate-200 text-slate-700"
        >
          {t('pehchan.trackApp', 'Track Application')}
        </Button>
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          rightIcon={<ArrowRight size={18} />}
          onClick={() => navigate('/dashboard')}
        >
          {t('pehchan.goToDashboard', 'Go to New Weaver Dashboard')}
        </Button>
      </div>

      {/* Application Tracking Modal */}
      <Modal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} title={t('pehchan.trackModalTitle', 'Track Pehchan Application')} size="sm">
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600">{t('pehchan.trackInputLabel', 'Enter your 10-digit Application Reference Number or Mobile Number:')}</p>
          <input
            type="text"
            placeholder={t('pehchan.trackPlaceholder', 'e.g. APP-2024-9842')}
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none"
          />
          {trackStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
              {trackStatus}
            </div>
          )}
          <Button fullWidth onClick={handleTrack} disabled={!appId.trim()}>{t('pehchan.checkStatus', 'Check Status')}</Button>
        </div>
      </Modal>
    </div>
  );
}
