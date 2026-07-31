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
import { authApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, refreshUser } = useAppContext();
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isAlreadyLoggedIn] = useState(() => !!user);

  React.useEffect(() => {
    if (isAlreadyLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAlreadyLoggedIn, navigate]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsOtpSent(true);
      setError('');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setIsLoading(true);
      setError('');
      try {
        const fullPhoneNumber = `${countryCode}${phone}`;
        const synthEmail = `${phone}@karghadhan.com`;
        const synthPassword = `weaver${phone}`;
        
        try {
          // If using the demo number, bypass the backend to avoid 401 console errors
          if (phone === '9876543210') {
            throw new Error('DEMO_MODE');
          }

          const loginResponse = await authApi.login({
            email: synthEmail,
            password: synthPassword
          });

          const userId = loginResponse.user_id || loginResponse.id;
          localStorage.setItem('auth_token', loginResponse.access_token || 'demo_token_123');
          localStorage.setItem('user_profile', JSON.stringify({ id: userId, phone: fullPhoneNumber }));
          await refreshUser();
        } catch (backendErr) {
          // Demo fallback: allow sign in with demo profile if backend user is not registered
          localStorage.setItem('auth_token', 'demo_token_123');
          localStorage.setItem('user_profile', JSON.stringify({
            id: 'weaver-demo-001',
            name: 'Ramesh Kumar',
            phone: fullPhoneNumber || '+919876543210',
            pehchan_id: 'PEH-UP-2024-8842',
            cibil_score: 765
          }));
          await refreshUser();
        }

        // Navigate directly to Onboarding Verification flow
        navigate('/verify');
      } catch (err: any) {
        console.error(err);
        setError('Invalid OTP or verification error.');
      } finally {
        setIsLoading(false);
      }
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
                  <div className="flex rounded-xl shadow-sm">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-100 border border-r-0 border-slate-300 text-slate-800 text-sm font-bold rounded-l-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 cursor-pointer"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+94">🇱🇰 +94</option>
                    </select>
                    <Input
                      type="tel"
                      placeholder={t('auth.mobilePlaceholder', 'Enter 10-digit number')}
                      className="rounded-l-none pl-3"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('auth.enterOtp', 'Enter OTP sent to {{code}} {{phone}}', { code: countryCode, phone })}
                  </label>
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
                
                {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

                <Button fullWidth type="submit" size="lg" disabled={otp.length !== 6 || isLoading}>
                  {isLoading ? 'Verifying...' : t('auth.verifyLogin', 'Verify & Login')}
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
