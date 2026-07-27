import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Smartphone, MapPin, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useTranslation } from 'react-i18next';
import logoKargha from '../assets/logokargha.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/verify'); // Go to Document Verification next
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoKargha} alt="Karghadhan Logo" className="w-24 h-24 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.registerTitle', 'Create Account')}</h1>
          <p className="text-slate-500 mt-2">{t('auth.registerSubtitle', 'Join KarghaDhan today')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.personalDetails', 'Personal Details')}</CardTitle>
            <CardDescription>{t('auth.enterInformation', 'Enter your information to register')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.fullName', 'Full Name')}</label>
                  <Input type="text" placeholder={t('auth.namePlaceholder', 'As per Aadhaar')} required />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.mobileLabel', 'Mobile Number')}</label>
                  <Input type="tel" placeholder={t('auth.mobilePlaceholder', '10-digit number')} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.age', 'Age')}</label>
                  <Input type="number" placeholder={t('auth.agePlaceholder', 'Years')} required />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.gender', 'Gender')}</label>
                  <Select required>
                    <option value="">{t('auth.select', 'Select')}</option>
                    <option value="male">{t('auth.male', 'Male')}</option>
                    <option value="female">{t('auth.female', 'Female')}</option>
                    <option value="other">{t('auth.other', 'Other')}</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.state', 'State')}</label>
                  <Select required>
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
                  <Input type="text" placeholder={t('auth.districtPlaceholder', 'E.g. Kanchipuram')} required />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.occupation', 'Occupation')}</label>
                  <Select required>
                    <option value="silk">{t('auth.silkWeaver', 'Silk Handloom Weaver')}</option>
                    <option value="cotton">{t('auth.cottonWeaver', 'Cotton Handloom Weaver')}</option>
                    <option value="wool">{t('auth.woolWeaver', 'Wool Handloom Weaver')}</option>
                    <option value="other">{t('auth.otherArtisan', 'Other Artisan')}</option>
                  </Select>
                </div>
              </div>

              <Button fullWidth type="submit" size="lg" className="mt-6">
                {t('auth.registerAccount', 'Register Account')}
              </Button>
            </form>
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
