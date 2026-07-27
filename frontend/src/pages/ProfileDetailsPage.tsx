import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Briefcase,
  IndianRupee,
  ArrowRight,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { staggerContainer, staggerItem } from '../utils/animations';
import { useTranslation } from 'react-i18next';
import { tData } from '../utils/i18nData';

const indianStates = [
  { value: '', label: 'Select State' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'WB', label: 'West Bengal' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'OD', label: 'Odisha' },
];

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other / Prefer not to say' },
];

const occupationOptions = [
  { value: '', label: 'Select Occupation' },
  { value: 'Silk Handloom Weaver', label: 'Silk Handloom Weaver' },
  { value: 'Cotton Handloom Weaver', label: 'Cotton Handloom Weaver' },
  { value: 'Wool Weaver', label: 'Wool Weaver' },
  { value: 'Zari Artisan', label: 'Zari Artisan' },
  { value: 'Block Printer', label: 'Block Printer' },
  { value: 'Embroidery Artisan', label: 'Embroidery Artisan' },
  { value: 'Other Textile Worker', label: 'Other Textile Worker' },
];

export default function ProfileDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, user } = useAppContext();

  const [form, setForm] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    district: user?.district || '',
    state: 'TN',
    occupation: user?.occupation || '',
    yearsOfExperience: user?.yearsOfExperience?.toString() || '',
    monthlyIncome: user?.monthlyIncome?.toString() || '',
    bankAccount: user?.bankAccount || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('validation.nameRequired', 'Full name is required');
    if (!form.age || Number(form.age) < 18) errs.age = t('validation.ageRequired', 'Age must be 18 or above');
    if (!form.gender) errs.gender = t('validation.genderRequired', 'Please select gender');
    if (!form.district.trim()) errs.district = t('validation.districtRequired', 'District is required');
    if (!form.state) errs.state = t('validation.stateRequired', 'Please select state');
    if (!form.occupation) errs.occupation = t('validation.occupationRequired', 'Please select occupation');
    if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0)
      errs.monthlyIncome = t('validation.incomeRequired', 'Please enter monthly income');
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setUser({
      ...user!,
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      district: form.district,
      state: form.state,
      occupation: form.occupation,
      yearsOfExperience: Number(form.yearsOfExperience),
      monthlyIncome: Number(form.monthlyIncome),
      bankAccount: form.bankAccount || undefined,
    });
    navigate('/upload');
  };

  return (
    <div className="w-full max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl">
          <User size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 font-display">{t('profileDetails.title', 'Personal Details')}</h1>
        <p className="text-slate-500 text-sm mt-2">{t('profileDetails.subtitle', 'Help us build your financial profile')}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5"
      >
        {/* Row 1: Name + Age */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Input
            label={t('profileDetails.fullName', 'Full Name')}
            placeholder="Hari Krishnan"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            leftIcon={<User size={16} />}
          />
          <Input
            label={t('profileDetails.age', 'Age')}
            type="number"
            placeholder="34"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
            error={errors.age}
            leftIcon={<Calendar size={16} />}
          />
        </motion.div>

        {/* Gender */}
        <motion.div variants={staggerItem}>
          <Select
            label={t('profileDetails.gender', 'Gender')}
            options={genderOptions.map(opt => ({ ...opt, label: t(`profileDetails.gender_${opt.value}`, opt.label) }))}
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
            error={errors.gender}
          />
        </motion.div>

        {/* District + State */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Input
            label={t('profileDetails.district', 'District')}
            placeholder="Kanchipuram"
            value={form.district}
            onChange={(e) => update('district', e.target.value)}
            error={errors.district}
            leftIcon={<MapPin size={16} />}
          />
          <Select
            label={t('profileDetails.state', 'State')}
            options={indianStates.map(opt => ({ ...opt, label: opt.value ? tData(opt.label) : t('profileDetails.selectState', opt.label) }))}
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            error={errors.state}
          />
        </motion.div>

        {/* Occupation */}
        <motion.div variants={staggerItem}>
          <Select
            label={t('profileDetails.occupation', 'Occupation')}
            options={occupationOptions.map(opt => ({ ...opt, label: t(`profileDetails.occupation_${opt.value}`, opt.label) }))}
            value={form.occupation}
            onChange={(e) => update('occupation', e.target.value)}
            error={errors.occupation}
            leftIcon={<Briefcase size={16} />}
          />
        </motion.div>

        {/* Experience + Income */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Input
            label={t('profileDetails.yearsOfExperience', 'Years of Experience')}
            type="number"
            placeholder="12"
            value={form.yearsOfExperience}
            onChange={(e) => update('yearsOfExperience', e.target.value)}
            leftIcon={<Briefcase size={16} />}
          />
          <Input
            label={t('profileDetails.monthlyIncome', 'Monthly Income (₹)')}
            type="number"
            placeholder="18000"
            value={form.monthlyIncome}
            onChange={(e) => update('monthlyIncome', e.target.value)}
            error={errors.monthlyIncome}
            leftIcon={<IndianRupee size={16} />}
          />
        </motion.div>

        {/* Bank Account */}
        <motion.div variants={staggerItem}>
          <Input
            label={t('profileDetails.bankAccountOptional', 'Bank Account Number (Optional)')}
            placeholder={t('profileDetails.leaveBlank', 'Leave blank if none')}
            value={form.bankAccount}
            onChange={(e) => update('bankAccount', e.target.value)}
            leftIcon={<CreditCard size={16} />}
            helperText={t('profileDetails.bankHelperText', 'This helps us verify your bank account for loan disbursement')}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Button fullWidth size="lg" onClick={handleSubmit} rightIcon={<ArrowRight size={18} />}>
            {t('common.saveContinue', 'Save & Continue')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
