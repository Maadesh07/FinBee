import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, DollarSign, UserCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingModalProps {
  open: boolean;
  onComplete: (userData: UserData) => void;
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  location: string;
  currency: string;
  gender: string;
}

export const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    currency: 'RM',
    gender: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('Onboarding form submitted with data:', formData);
      onComplete(formData);
    } else {
      console.log('Form validation failed');
    }
  };

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to FinBee! 🐝</DialogTitle>
          <DialogDescription>
            Let's get started by setting up your profile. This information will help us personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('fullName')} *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="name"
                className="pl-10"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')} *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('phoneNumber')} *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="phone"
                type="tel"
                className="pl-10"
                placeholder="0123456789"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('location')} *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="location"
                className="pl-10"
                placeholder="Kuala Lumpur, Malaysia"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">{t('currency')} *</Label>
            <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RM">MYR (RM)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
            {errors.currency && <p className="text-sm text-red-500">{errors.currency}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">{t('gender')} *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t('male')}</SelectItem>
                <SelectItem value="female">{t('female')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
                <SelectItem value="prefer-not-to-say">{t('preferNotToSay')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
          </div>

          <Button type="submit" className="w-full mt-6">
            Get Started
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
