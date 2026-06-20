import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, GraduationCap, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

// Google logo SVG
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function saveUserData(userData: any, settingsData: any) {
  // Only set profile/settings if they don't already exist (preserve existing data on re-login)
  if (!localStorage.getItem('finbee_userProfile')) {
    localStorage.setItem('finbee_userProfile', JSON.stringify(userData));
  }
  if (!localStorage.getItem('finbee_userSettings')) {
    localStorage.setItem('finbee_userSettings', JSON.stringify(settingsData));
  }
  localStorage.setItem('finbee_authenticated', 'true');
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google sign-in dialog state
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleStep, setGoogleStep] = useState<'email' | 'details'>('email');
  const [googleData, setGoogleData] = useState({ email: '', name: '', currency: 'RM' });
  const [googleError, setGoogleError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', studentId: '', email: '', phone: '',
    location: '', currency: 'RM', gender: '', universityName: '',
    password: '', confirmPassword: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) e.email = 'Invalid email format';
    if (!loginData.password.trim()) e.password = 'Password is required';
    else if (loginData.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: Record<string, string> = {};
    if (!registerData.name.trim()) e.name = 'Name is required';
    if (!registerData.studentId.trim()) e.studentId = 'Student ID is required';
    if (!registerData.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) e.email = 'Invalid email format';
    if (!registerData.phone.trim()) e.phone = 'Phone number is required';
    if (!registerData.location.trim()) e.location = 'Location is required';
    if (!registerData.currency) e.currency = 'Currency is required';
    if (!registerData.gender) e.gender = 'Gender is required';
    if (!registerData.universityName.trim()) e.universityName = 'University name is required';
    if (!registerData.password.trim()) e.password = 'Password is required';
    else if (registerData.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (registerData.password !== registerData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    const existingProfile = localStorage.getItem('finbee_userProfile');
    const userData = existingProfile ? JSON.parse(existingProfile) : {
      name: 'Demo User', email: loginData.email, phone: '',
      location: '', gender: '', studentId: '', universityName: '',
      joinDate: new Date().toISOString().split('T')[0],
    };
    const settingsData = {
      emailNotifications: true, pushNotifications: false,
      budgetAlerts: true, weeklyReport: true,
      currency: 'RM', theme: 'system', language: 'English',
    };

    saveUserData(userData, settingsData);
    toast.success(t('loginSuccess'));
    onLoginSuccess(userData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    const userData = {
      name: registerData.name, email: registerData.email, phone: registerData.phone,
      location: registerData.location, gender: registerData.gender,
      studentId: registerData.studentId, universityName: registerData.universityName,
      joinDate: new Date().toISOString().split('T')[0],
    };
    const settingsData = {
      emailNotifications: true, pushNotifications: false,
      budgetAlerts: true, weeklyReport: true,
      currency: registerData.currency, theme: 'system', language: 'English',
    };

    // Always save full profile on fresh registration
    localStorage.setItem('finbee_userProfile', JSON.stringify(userData));
    localStorage.setItem('finbee_userSettings', JSON.stringify(settingsData));
    localStorage.setItem('finbee_authenticated', 'true');

    toast.success(t('registrationSuccess'));
    onLoginSuccess(userData);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setErrors({ email: 'Email is required' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setErrors({ email: 'Invalid email format' }); return; }
    toast.success(t('resetLinkSent'));
    setForgotEmail('');
    setActiveTab('login');
  };

  // ── Google sign-in flow ──────────────────────────────────────────────────

  const handleGoogleEmailNext = () => {
    if (!googleData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(googleData.email)) {
      setGoogleError('Enter a valid Google email address');
      return;
    }
    setGoogleError('');
    // Pre-fill name from email prefix if empty
    if (!googleData.name) {
      const namePart = googleData.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setGoogleData(d => ({ ...d, name: namePart }));
    }
    setGoogleStep('details');
  };

  const handleGoogleSignIn = () => {
    if (!googleData.name.trim()) { setGoogleError('Name is required'); return; }

    const userData = {
      name: googleData.name,
      email: googleData.email,
      phone: '', location: '', gender: '', studentId: '', universityName: '',
      joinDate: new Date().toISOString().split('T')[0],
      authProvider: 'google',
    };
    const settingsData = {
      emailNotifications: true, pushNotifications: false,
      budgetAlerts: true, weeklyReport: true,
      currency: googleData.currency, theme: 'system', language: 'English',
    };

    saveUserData(userData, settingsData);
    setGoogleDialogOpen(false);
    toast.success(`Welcome, ${googleData.name}!`);
    onLoginSuccess(userData);
  };

  const openGoogleDialog = () => {
    setGoogleStep('email');
    setGoogleData({ email: '', name: '', currency: 'RM' });
    setGoogleError('');
    setGoogleDialogOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
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
                  <Input id="forgot-email" type="email" className="pl-10" placeholder="student@university.edu"
                    value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setErrors({}); }} />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <Button type="submit" className="w-full">{t('sendResetLink')}</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => { setActiveTab('login'); setErrors({}); }}>
                {t('backToLogin')}
              </Button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">{t('login')}</TabsTrigger>
                <TabsTrigger value="register">{t('register')}</TabsTrigger>
              </TabsList>

              {/* ── Login Tab ── */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('emailAddress')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="login-email" type="email" className="pl-10" placeholder="student@university.edu"
                        value={loginData.email} onChange={e => { setLoginData({ ...loginData, email: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} className="pl-10 pr-10"
                        placeholder="••••••••" value={loginData.password}
                        onChange={e => { setLoginData({ ...loginData, password: e.target.value }); setErrors({}); }} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <Button type="button" variant="link" className="px-0 text-sm"
                    onClick={() => { setActiveTab('forgot'); setErrors({}); }}>
                    {t('forgotPassword')}
                  </Button>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {t('signIn')}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-500">or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openGoogleDialog}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                  >
                    <GoogleLogo />
                    Sign in with Google
                  </button>
                </form>
              </TabsContent>

              {/* ── Register Tab ── */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">{t('fullName')} *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-name" className="pl-10" placeholder="John Doe"
                        value={registerData.name} onChange={e => { setRegisterData({ ...registerData, name: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-studentId">{t('studentId')} *</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-studentId" className="pl-10" placeholder="STU123456"
                        value={registerData.studentId} onChange={e => { setRegisterData({ ...registerData, studentId: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t('studentEmail')} *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-email" type="email" className="pl-10" placeholder="student@university.edu"
                        value={registerData.email} onChange={e => { setRegisterData({ ...registerData, email: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-university">{t('universityName')} *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-university" className="pl-10" placeholder="University of Example"
                        value={registerData.universityName} onChange={e => { setRegisterData({ ...registerData, universityName: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.universityName && <p className="text-sm text-red-500">{errors.universityName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">{t('phoneNumber')} *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-phone" type="tel" className="pl-10" placeholder="0123456789"
                        value={registerData.phone} onChange={e => { setRegisterData({ ...registerData, phone: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-location">{t('location')} *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-location" className="pl-10" placeholder="Kuala Lumpur, Malaysia"
                        value={registerData.location} onChange={e => { setRegisterData({ ...registerData, location: e.target.value }); setErrors({}); }} />
                    </div>
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('currency')} *</Label>
                      <Select value={registerData.currency} onValueChange={v => { setRegisterData({ ...registerData, currency: v }); setErrors({}); }}>
                        <SelectTrigger id="register-currency"><SelectValue /></SelectTrigger>
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
                      <Label>{t('gender')} *</Label>
                      <Select value={registerData.gender} onValueChange={v => { setRegisterData({ ...registerData, gender: v }); setErrors({}); }}>
                        <SelectTrigger id="register-gender"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <Input id="register-password" type={showPassword ? 'text' : 'password'} className="pl-10 pr-10"
                        placeholder="••••••••" value={registerData.password}
                        onChange={e => { setRegisterData({ ...registerData, password: e.target.value }); setErrors({}); }} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">{t('confirmPassword')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} className="pl-10 pr-10"
                        placeholder="••••••••" value={registerData.confirmPassword}
                        onChange={e => { setRegisterData({ ...registerData, confirmPassword: e.target.value }); setErrors({}); }} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    {t('createAccount')}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-500">or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openGoogleDialog}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 shadow-sm"
                  >
                    <GoogleLogo />
                    Sign up with Google
                  </button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* ── Google Sign-In Dialog ── */}
      <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center space-y-3">
            <GoogleLogo />
            <DialogTitle className="text-xl">Sign in with Google</DialogTitle>
            <DialogDescription>
              {googleStep === 'email'
                ? 'Enter your Google account email to continue'
                : `Welcome! Confirm your details to finish setting up FinBee`}
            </DialogDescription>
          </DialogHeader>

          {googleStep === 'email' ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="google-email">Google Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="google-email"
                    type="email"
                    className="pl-10"
                    placeholder="you@gmail.com"
                    value={googleData.email}
                    onChange={e => { setGoogleData(d => ({ ...d, email: e.target.value })); setGoogleError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleGoogleEmailNext()}
                    autoFocus
                  />
                </div>
                {googleError && <p className="text-sm text-red-500">{googleError}</p>}
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleGoogleEmailNext}>
                Next
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {googleData.name.charAt(0).toUpperCase() || googleData.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{googleData.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-name">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="google-name"
                    className="pl-10"
                    placeholder="Your full name"
                    value={googleData.name}
                    onChange={e => { setGoogleData(d => ({ ...d, name: e.target.value })); setGoogleError(''); }}
                    autoFocus
                  />
                </div>
                {googleError && <p className="text-sm text-red-500">{googleError}</p>}
              </div>

              <div className="space-y-2">
                <Label>Preferred currency</Label>
                <Select value={googleData.currency} onValueChange={v => setGoogleData(d => ({ ...d, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RM">MYR (RM)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setGoogleStep('email')}>
                  Back
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleGoogleSignIn}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
