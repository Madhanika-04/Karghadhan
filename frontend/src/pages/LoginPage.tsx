import React, { useState } from 'react';
import googleIcon from '@/assets/icons/google-color.svg';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsOtpSent(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      navigate('/verify'); // Go to Weaver Verification step next in our flow
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoKargha} alt="Karghadhan Logo" className="w-32 h-32 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.loginTitle', 'Welcome Back')}</h1>
          <p className="text-slate-500 mt-2">{t('auth.loginSubtitle', 'Sign in to KarghaDhan')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.signIn', 'Sign In')}</CardTitle>
            <CardDescription>{t('auth.useRegisteredMobile', 'Use your registered mobile number')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.mobileLabel', 'Mobile Number')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone size={18} className="text-slate-400" />
                    </div>
                    <Input
                      type="tel"
                      placeholder={t('auth.mobilePlaceholder', 'Enter 10-digit number')}
                      className="pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                    />
                  </div>
                </div>
                <Button fullWidth type="submit" size="lg" disabled={phone.length !== 10}>
                  {t('auth.sendOtp', 'Send OTP')}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">{t('auth.orContinueWith', 'Or continue with')}</span>
                  </div>
                </div>
                
                <Button variant="outline" fullWidth type="button" className="gap-2">
                  <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  {t('auth.signInGoogle', 'Sign in with Google')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.enterOtp', 'Enter OTP sent to +91 {{phone}}', { phone })}</label>
                  <Input
                    type="text"
                    placeholder={t('auth.otpPlaceholder', '6-digit OTP')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest font-bold"
                    required
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <button type="button" onClick={() => setIsOtpSent(false)} className="text-primary-600 hover:underline">{t('auth.changeNumber', 'Change Number')}</button>
                    <button type="button" className="text-slate-500 hover:text-slate-700">{t('auth.resendOtp', 'Resend OTP')}</button>
                  </div>
                </motion.div>
                <Button fullWidth type="submit" size="lg" disabled={otp.length !== 6}>
                  {t('auth.verifyContinue', 'Verify & Continue')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            {t('auth.registerNow', 'Register now')}
          </Link>
        </p>
      </div>
    </div>
  );
}
