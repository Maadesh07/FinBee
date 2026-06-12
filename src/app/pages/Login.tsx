import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, GraduationCap, Building2, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    location: '',
    currency: 'RM',
    gender: '',
    universityName: '',
    password: '',
    confirmPassword: '',
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!loginData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};

    if (!registerData.name.trim()) newErrors.name = 'Name is required';
    if (!registerData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!registerData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!registerData.location.trim()) newErrors.location = 'Location is required';
    if (!registerData.currency) newErrors.currency = 'Currency is required';
    if (!registerData.gender) newErrors.gender = 'Gender is required';
    if (!registerData.universityName.trim()) newErrors.universityName = 'University name is required';
    if (!registerData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLogin()) return;

    // For demo purposes, accept any valid email/password
    const userData = {
      name: registerData.name || 'Demo User',
      email: loginData.email,
      phone: '',
      location: '',
      gender: '',
      studentId: '',
      universityName: '',
      joinDate: new Date().toISOString().split('T')[0],
    };

    const settingsData = {
      emailNotifications: true,
      pushNotifications: false,
      budgetAlerts: true,
      weeklyReport: true,
      currency: 'RM',
      theme: 'system',
      language: 'English',
    };

    localStorage.setItem('finbee_userProfile', JSON.stringify(userData));
    localStorage.setItem('finbee_userSettings', JSON.stringify(settingsData));
    localStorage.setItem('finbee_authenticated', 'true');

    toast.success(t('loginSuccess'));
    onLoginSuccess(userData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegister()) return;

    const userData = {
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      location: registerData.location,
      gender: registerData.gender,
      studentId: registerData.studentId,
      universityName: registerData.universityName,
      joinDate: new Date().toISOString().split('T')[0],
    };

    const settingsData = {
      emailNotifications: true,
      pushNotifications: false,
      budgetAlerts: true,
      weeklyReport: true,
      currency: registerData.currency,
      theme: 'system',
      language: 'English',
    };

    localStorage.setItem('finbee_userProfile', JSON.stringify(userData));
    localStorage.setItem('finbee_userSettings', JSON.stringify(settingsData));
    localStorage.setItem('finbee_authenticated', 'true');

    toast.success(t('registrationSuccess'));
    onLoginSuccess(userData);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ email: 'Invalid email format' });
      return;
    }

    toast.success(t('resetLinkSent'));
    setForgotEmail('');
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-2xl">🐝</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{t('welcomeToFinBee')}</CardTitle>
          <CardDescription>
            {activeTab === 'login' && t('loginSubtitle')}
            {activeTab === 'register' && t('registerSubtitle')}
            {activeTab === 'forgot' && t('forgotPasswordSubtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {activeTab === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t('emailAddress')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    className="pl-10"
                    placeholder="student@university.edu"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setErrors({});
                    }}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full">
                {t('sendResetLink')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setActiveTab('login');
                  setErrors({});
                }}
              >
                {t('backToLogin')}
              </Button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{t('login')}</TabsTrigger>
                <TabsTrigger value="register">{t('register')}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('emailAddress')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="login-email"
                        type="email"
                        className="pl-10"
                        placeholder="student@university.edu"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({ ...loginData, email: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          setErrors({});
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-sm"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrors({});
                    }}
                  >
                    {t('forgotPassword')}
                  </Button>

                  <Button type="submit" className="w-full">
                    {t('signIn')}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{t('fullName')} *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-name"
                        className="pl-10"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, name: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-studentId">{t('studentId')} *</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-studentId"
                        className="pl-10"
                        placeholder="STU123456"
                        value={registerData.studentId}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, studentId: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('studentEmail')} *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-email"
                        type="email"
                        className="pl-10"
                        placeholder="student@university.edu"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, email: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-university">{t('universityName')} *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-university"
                        className="pl-10"
                        placeholder="University of Example"
                        value={registerData.universityName}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, universityName: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.universityName && <p className="text-sm text-red-500">{errors.universityName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">{t('phoneNumber')} *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-phone"
                        type="tel"
                        className="pl-10"
                        placeholder="0123456789"
                        value={registerData.phone}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, phone: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-location">{t('location')} *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-location"
                        className="pl-10"
                        placeholder="Kuala Lumpur, Malaysia"
                        value={registerData.location}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, location: e.target.value });
                          setErrors({});
                        }}
                      />
                    </div>
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-currency">{t('currency')} *</Label>
                      <Select
                        value={registerData.currency}
                        onValueChange={(value) => {
                          setRegisterData({ ...registerData, currency: value });
                          setErrors({});
                        }}
                      >
                        <SelectTrigger id="register-currency">
                          <SelectValue />
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
                      <Label htmlFor="register-gender">{t('gender')} *</Label>
                      <Select
                        value={registerData.gender}
                        onValueChange={(value) => {
                          setRegisterData({ ...registerData, gender: value });
                          setErrors({});
                        }}
                      >
                        <SelectTrigger id="register-gender">
                          <SelectValue placeholder="Select" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t('password')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, password: e.target.value });
                          setErrors({});
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">{t('confirmPassword')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, confirmPassword: e.target.value });
                          setErrors({});
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full">
                    {t('createAccount')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
