import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Bell, Shield, Palette, Save, LogOut, GraduationCap, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  location: '',
  gender: '',
  studentId: '',
  universityName: '',
  joinDate: new Date().toISOString().split('T')[0],
};

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  pushNotifications: false,
  budgetAlerts: true,
  weeklyReport: true,
  currency: 'RM',
  theme: 'system',
  language: 'English',
};

export const Profile = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // User profile state - load from localStorage on mount
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('finbee_userProfile');
      console.log('Loading profile from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Parsed profile data:', parsed);
        return parsed;
      }
      console.log('No saved profile, using defaults');
      return DEFAULT_PROFILE;
    } catch (error) {
      console.error('Error loading profile:', error);
      return DEFAULT_PROFILE;
    }
  });

  // Settings state - load from localStorage on mount
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('finbee_userSettings');
      console.log('Loading settings from localStorage:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('Parsed settings data:', parsed);
        return parsed;
      }
      console.log('No saved settings, using defaults');
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  // Reload data when component mounts or when coming back to this page
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProfile = localStorage.getItem('finbee_userProfile');
        const savedSettings = localStorage.getItem('finbee_userSettings');

        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          console.log('Reloading profile on mount:', parsedProfile);
          setUserProfile(parsedProfile);
        }

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          console.log('Reloading settings on mount:', parsedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error reloading data:', error);
      }
    };

    loadData();
  }, []);

  const handleProfileSave = () => {
    try {
      localStorage.setItem('finbee_userProfile', JSON.stringify(userProfile));
      toast.success(t('profileUpdated'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleSettingsSave = () => {
    try {
      const settingsToSave = {
        ...settings,
        theme: theme, // Include current theme
        language: language, // Include current language
      };
      localStorage.setItem('finbee_userSettings', JSON.stringify(settingsToSave));
      toast.success(t('settingsSaved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleNotificationChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save notification settings
    try {
      const settingsToSave = {
        ...newSettings,
        theme: theme,
        language: language,
      };
      localStorage.setItem('finbee_userSettings', JSON.stringify(settingsToSave));
      toast.success(t('settingsSaved'));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings.');
    }
  };

  const handleLogout = () => {
    // Clear all FinBee data from localStorage
    localStorage.removeItem('finbee_userProfile');
    localStorage.removeItem('finbee_userSettings');
    localStorage.removeItem('finbee_authenticated');

    toast.success(t('loggedOut'));

    // Reload the page to show login page
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl tracking-tight text-neutral-900 dark:text-white">{t('profileAndSettings')}</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t('manageAccount')}
          </p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          {t('logOut')}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
          <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>{t('personalInformation')}</CardTitle>
                  <CardDescription>{t('updatePersonalDetails')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="name"
                      className="pl-10"
                      placeholder="Enter your full name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('emailAddress')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="Enter your email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">{t('studentId')}</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="studentId"
                      className="pl-10"
                      placeholder="Enter your student ID"
                      value={userProfile.studentId}
                      onChange={(e) => setUserProfile({ ...userProfile, studentId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityName">{t('universityName')}</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="universityName"
                      className="pl-10"
                      placeholder="Enter your university name"
                      value={userProfile.universityName}
                      onChange={(e) => setUserProfile({ ...userProfile, universityName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneNumber')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      placeholder="Enter your phone number"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="location"
                      className="pl-10"
                      placeholder="Enter your location"
                      value={userProfile.location}
                      onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t('gender')}</Label>
                  <Select value={userProfile.gender || ''} onValueChange={(value) => setUserProfile({ ...userProfile, gender: value })}>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinDate">{t('memberSince')}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    id="joinDate"
                    className="pl-10 bg-neutral-50 dark:bg-neutral-900"
                    value={new Date(userProfile.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleProfileSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  {t('saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle>{t('notifications')}</CardTitle>
                  <CardDescription>{t('manageNotifications')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif">{t('emailNotifications')}</Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('receiveEmailUpdates')}
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotif">{t('pushNotifications')}</Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('receivePushNotifications')}
                  </p>
                </div>
                <Switch
                  id="pushNotif"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budgetAlerts">{t('budgetAlerts')}</Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('budgetAlertsDesc')}
                  </p>
                </div>
                <Switch
                  id="budgetAlerts"
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('budgetAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyReport">{t('weeklyReport')}</Label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('weeklyReportDesc')}
                  </p>
                </div>
                <Switch
                  id="weeklyReport"
                  checked={settings.weeklyReport}
                  onCheckedChange={(checked) => handleNotificationChange('weeklyReport', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle>{t('preferences')}</CardTitle>
                  <CardDescription>{t('customizeExperience')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('currency')}</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                    <SelectTrigger id="currency">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t('language')}</Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">{t('theme')}</Label>
                <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('light')} ☀️</SelectItem>
                    <SelectItem value="dark">{t('dark')} 🌙</SelectItem>
                    <SelectItem value="system">{t('system')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t('themeChangesApply')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle>{t('privacySecurity')}</CardTitle>
                  <CardDescription>{t('manageAccountSecurity')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                {t('changePassword')}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                {t('enable2FA')}
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSettingsSave} className="gap-2">
              <Save className="w-4 h-4" />
              {t('saveLanguageCurrency')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
