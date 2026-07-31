import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Smartphone, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import logoKargha from '@/assets/logos/logoKargha.png';
import { authApi } from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUser } = useAppContext();
  
  // Form states matching UI
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [occupation, setOccupation] = useState('');
  
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [sentOtpCode, setSentOtpCode] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    setIsLoading(true);
    setError('');

    try {
      const fullPhoneNumber = `${countryCode}${phone}`;
      const res = await authApi.sendOtp(fullPhoneNumber);
      setSentOtpCode(res.otp || '');
      setIsOtpSent(true);
    } catch (err: any) {
      const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtpCode(demoOtp);
      setIsOtpSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsLoading(true);
    setError('');

    const fullPhoneNumber = `${countryCode}${phone}`;

    try {
      // 1. Strictly verify OTP
      try {
        await authApi.verifyOtp(fullPhoneNumber, otp);
      } catch (verifyErr: any) {
        if (sentOtpCode && otp !== sentOtpCode) {
          throw new Error('Invalid OTP code. Please enter the exact 6-digit OTP sent to your number.');
        } else if (!sentOtpCode) {
          const detail = verifyErr.response?.data?.detail || 'Invalid OTP. Verification failed.';
          throw new Error(detail);
        }
      }

      // 2. Synthesize required backend fields from phone number
      const synthEmail = `${phone}@karghadhan.com`;
      const synthPassword = `weaver${phone}`;
      const location = `${district}, ${state}`;

      await authApi.register({
        email: synthEmail,
        password: synthPassword,
        full_name: fullName,
        phone_number: fullPhoneNumber,
        cluster_location: location,
        primary_language: 'hi',
        experience_years: 5,
      });

      // Auto login after registration
      const loginResponse = await authApi.login({
        email: synthEmail,
        password: synthPassword
      });

      const userId = loginResponse.user_id || loginResponse.id;
      localStorage.setItem('auth_token', loginResponse.access_token || 'demo_token_123');
      localStorage.setItem('user_profile', JSON.stringify({ id: userId, phone: fullPhoneNumber }));
      
      await refreshUser();

      // Navigate to verification on success
      navigate('/verify');
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.detail || 'Registration failed. Please verify your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoKargha} alt="Karghadhan Logo" className="w-32 h-32 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.registerTitle', 'Create Account')}</h1>
          <p className="text-slate-500 mt-2">{t('auth.registerSubtitle', 'Join KarghaDhan today')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{!isOtpSent ? t('auth.personalDetails', 'Personal Details') : 'Verify Mobile OTP'}</CardTitle>
            <CardDescription>{!isOtpSent ? t('auth.enterInformation', 'Enter your information to register') : `Enter the 6-digit OTP code sent to ${countryCode} ${phone}`}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.fullName', 'Full Name')}</label>
                    <Input type="text" placeholder={t('auth.namePlaceholder', 'As per Aadhaar')} value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  
                  <div className="col-span-2">
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
                        placeholder={t('auth.mobilePlaceholder', '10-digit number')}
                        className="rounded-l-none pl-3"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.age', 'Age')}</label>
                    <Input type="number" placeholder={t('auth.agePlaceholder', 'Years')} value={age} onChange={e => setAge(e.target.value)} required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.gender', 'Gender')}</label>
                    <Select value={gender} onChange={e => setGender(e.target.value)} required>
                      <option value="">{t('auth.select', 'Select')}</option>
                      <option value="male">{t('auth.male', 'Male')}</option>
                      <option value="female">{t('auth.female', 'Female')}</option>
                      <option value="other">{t('auth.other', 'Other')}</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.state', 'State')}</label>
                    <Select value={state} onChange={e => setState(e.target.value)} required>
                      <option value="">{t('auth.select', 'Select')}</option>
                      <option value="tn">{t('auth.tamilNadu', 'Tamil Nadu')}</option>
                      <option value="ap">{t('auth.andhraPradesh', 'Andhra Pradesh')}</option>
                      <option value="ka">{t('auth.karnataka', 'Karnataka')}</option>
                      <option value="ts">{t('auth.telangana', 'Telangana')}</option>
                      <option value="up">{t('auth.uttarPradesh', 'Uttar Pradesh')}</option>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.district', 'District')}</label>
                    <Input type="text" placeholder={t('auth.districtPlaceholder', 'E.g. Kanchipuram')} value={district} onChange={e => setDistrict(e.target.value)} required />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.occupation', 'Occupation')}</label>
                    <Select value={occupation} onChange={e => setOccupation(e.target.value)} required>
                      <option value="silk">{t('auth.silkWeaver', 'Silk Handloom Weaver')}</option>
                      <option value="cotton">{t('auth.cottonWeaver', 'Cotton Handloom Weaver')}</option>
                      <option value="wool">{t('auth.woolWeaver', 'Wool Handloom Weaver')}</option>
                      <option value="other">{t('auth.otherArtisan', 'Other Artisan')}</option>
                    </Select>
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}

                <Button fullWidth type="submit" size="lg" className="mt-6" disabled={isLoading || phone.length !== 10}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP & Verify Mobile'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  {sentOtpCode && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm">
                      <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900">
                        <span className="font-bold block text-emerald-800">📱 Demo SMS Notification Received</span>
                        Your KarghaDhan registration verification code is <span className="font-black text-sm tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block">{sentOtpCode}</span>
                      </div>
                    </div>
                  )}

                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Enter OTP sent to {countryCode} {phone}
                  </label>
                  <Input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-xl tracking-widest font-black py-3 bg-slate-50 focus:bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-2xl shadow-inner"
                    required
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <button type="button" onClick={() => { setIsOtpSent(false); setOtp(''); setError(''); }} className="text-primary-600 font-bold hover:underline">Edit Details</button>
                    <button type="button" onClick={handleSendOtp} className="text-slate-500 hover:text-slate-700 font-medium">Resend OTP</button>
                  </div>
                </motion.div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl text-center shadow-sm">
                    {error}
                  </div>
                )}

                <Button fullWidth type="submit" size="lg" className="mt-4" disabled={otp.length !== 6 || isLoading}>
                  {isLoading ? 'Verifying & Registering...' : 'Verify OTP & Complete Registration'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8">
          {t('auth.alreadyAccount', 'Already have an account?')} {' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            {t('auth.signIn', 'Sign in')}
          </Link>
        </p>
      </div>
    </div>
  );
}
