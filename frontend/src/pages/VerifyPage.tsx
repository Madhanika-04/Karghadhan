import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function VerifyPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setOtpSent(true);
    setLoading(false);
    // Start timer
    let t = 30;
    const interval = setInterval(() => {
      t--;
      setTimer(t);
      if (t <= 0) clearInterval(interval);
    }, 1000);
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join('').length < 6) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setVerified(true);
    setLoading(false);
    setTimeout(() => navigate('/profile-details'), 1800);
  };

  return (
    <div className="w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <Phone size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">
          {otpSent ? 'Enter OTP' : 'Verify Your Phone'}
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          {otpSent
            ? `OTP sent to +91 ${phone}. Enter the 6-digit code.`
            : 'Enter your mobile number to receive a verification code.'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!otpSent ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5"
          >
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 whitespace-nowrap">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-800 text-sm font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={handleSendOtp}
              isLoading={loading}
              disabled={phone.length < 10}
              rightIcon={<ArrowRight size={18} />}
            >
              Send OTP
            </Button>
            <p className="text-xs text-center text-slate-400">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        ) : verified ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={44} className="text-emerald-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Phone Verified!</h2>
            <p className="text-sm text-slate-500">Redirecting to profile setup...</p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5"
          >
            {/* OTP Inputs */}
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>

            {/* Hint */}
            <p className="text-xs text-center text-slate-400 bg-slate-50 rounded-xl px-4 py-2">
              💡 Use <span className="font-bold text-slate-600">123456</span> as test OTP
            </p>

            <Button
              fullWidth
              size="lg"
              onClick={handleVerify}
              isLoading={loading}
              disabled={otp.join('').length < 6}
              rightIcon={<CheckCircle size={18} />}
            >
              Verify OTP
            </Button>

            {/* Resend */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-slate-400">
                  Resend OTP in <span className="font-bold text-emerald-600">{timer}s</span>
                </p>
              ) : (
                <button
                  onClick={() => { setTimer(30); }}
                  className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mx-auto hover:underline"
                >
                  <RefreshCw size={12} />
                  Resend OTP
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
