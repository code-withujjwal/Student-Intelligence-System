import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Shield, Palette, Bell, BookOpen,
  Lock, BarChart2, Link2, Accessibility, CreditCard,
  AlertTriangle, Eye, EyeOff, Sun, Moon, Loader2,
  Check, X, ExternalLink, Trash2, RefreshCw, Save,
  ChevronRight, Globe, Mail, Volume2, Zap, Target,
  Calendar, Clock, Star, Award, TrendingUp
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserSettings {
  username: string;
  email: string;
  fullName: string;
  institution: string;
  role: string;
  memberSince: string;
  xp: number;
  emailNotifications: boolean;
  securityAlerts: boolean;
  dailyReminders: boolean;
  weeklyDigest: boolean;
  achievementAlerts: boolean;
  profilePublic: boolean;
  showOnLeaderboard: boolean;
  shareAnalytics: boolean;
  difficultyPreference: string;
  dailyGoalMinutes: number;
}

// ── Helper components ──────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, disabled = false }: { value: boolean; onChange: () => void; disabled?: boolean }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        value
          ? isDark ? 'bg-violet-600' : 'bg-blue-600'
          : isDark ? 'bg-slate-700' : 'bg-slate-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
};

const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl border p-6 ${isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white border-slate-200 shadow-sm'} ${className}`}>
      {children}
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) => {
  const { isDark } = useTheme();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-blue-50 text-blue-600'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 ml-9">{description}</p>}
    </div>
  );
};

const Row = ({ label, description, action }: { label: string; description?: string; action: React.ReactNode }) => {
  const { isDark } = useTheme();
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 border-b last:border-b-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
      <div className="min-w-0">
        <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
        {description && <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
};

const FieldInput = ({ label, value, onChange, type = 'text', disabled = false, readOnly = false }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean; readOnly?: boolean;
}) => {
  const { isDark } = useTheme();
  return (
    <div className="space-y-1.5">
      <label className={`text-[0.68rem] font-bold uppercase tracking-widest block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 ${
          disabled || readOnly
            ? isDark ? 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
            : isDark ? 'bg-black/25 border-white/8 text-slate-200 focus:border-violet-500/50 focus:ring-violet-500/20' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-200'
        }`}
      />
    </div>
  );
};

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'profile',    icon: User,          label: 'Profile',            color: 'violet' },
  { id: 'security',   icon: Shield,         label: 'Security',           color: 'red' },
  { id: 'appearance', icon: Palette,        label: 'Appearance',         color: 'sky' },
  { id: 'notifications', icon: Bell,        label: 'Notifications',      color: 'amber' },
  { id: 'learning',   icon: BookOpen,       label: 'Learning',           color: 'emerald' },
  { id: 'privacy',    icon: Lock,           label: 'Privacy',            color: 'indigo' },
  { id: 'analytics',  icon: BarChart2,      label: 'Analytics',          color: 'cyan' },
  { id: 'connected',  icon: Link2,          label: 'Connected Accounts', color: 'orange' },
  { id: 'accessibility', icon: Accessibility, label: 'Accessibility',   color: 'pink' },
  { id: 'billing',    icon: CreditCard,     label: 'Billing',            color: 'green' },
  { id: 'danger',     icon: AlertTriangle,  label: 'Danger Zone',        color: 'red' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AegisSettings() {
  const navigate = useNavigate();
  const { theme, isDark, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const [active, setActive] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User data
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Profile form
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [username, setUsername] = useState('');

  // Password
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  // Learning
  const [difficultyPref, setDifficultyPref] = useState('ADAPTIVE');
  const [dailyGoal, setDailyGoal] = useState(30);

  // Accessibility
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  // Danger zone
  const [deleteConfirmPwd, setDeleteConfirmPwd] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/user/profile/settings');
        const data = res.data.data;
        setSettings(data);
        setFullName(data.fullName || '');
        setInstitution(data.institution || '');
        setUsername(data.username || '');
        setEmailNotif(data.emailNotifications ?? true);
        setSecurityAlerts(data.securityAlerts ?? true);
        setDailyReminders(data.dailyReminders ?? false);
        setWeeklyDigest(data.weeklyDigest ?? true);
        setAchievementAlerts(data.achievementAlerts ?? true);
        setProfilePublic(data.profilePublic ?? true);
        setShowOnLeaderboard(data.showOnLeaderboard ?? true);
        setShareAnalytics(data.shareAnalytics ?? false);
        setDifficultyPref(data.difficultyPreference || 'ADAPTIVE');
        setDailyGoal(data.dailyGoalMinutes || 30);
      } catch {
        // Fallback to auth store data
        if (user) {
          setUsername(user.username || '');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/user/profile', { username, fullName, institution });
      toast.success('Profile updated successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return; }
    if (newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setPwdSaving(true);
    try {
      await axiosInstance.post('/user/profile/change-password', { currentPassword: curPwd, newPassword: newPwd });
      toast.success('Password changed! Please log in again.');
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => { logout(); navigate('/auth'); }, 2000);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!deleteConfirmPwd) { toast.error('Please enter your password to confirm'); return; }
    setDeleting(true);
    try {
      await axiosInstance.delete('/user/profile/account', { data: { password: deleteConfirmPwd } });
      toast.success('Account deleted. Goodbye!');
      logout();
      navigate('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  // ── Rendering helpers ────────────────────────────────────────────────────────
  const bg = isDark ? 'bg-[#060912]' : 'bg-[#f4f6fa]';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  const navIconColor: Record<string, string> = {
    violet: isDark ? 'text-violet-400 bg-violet-500/15' : 'text-violet-600 bg-violet-50',
    red: isDark ? 'text-red-400 bg-red-500/15' : 'text-red-600 bg-red-50',
    sky: isDark ? 'text-sky-400 bg-sky-500/15' : 'text-sky-600 bg-sky-50',
    amber: isDark ? 'text-amber-400 bg-amber-500/15' : 'text-amber-600 bg-amber-50',
    emerald: isDark ? 'text-emerald-400 bg-emerald-500/15' : 'text-emerald-600 bg-emerald-50',
    indigo: isDark ? 'text-indigo-400 bg-indigo-500/15' : 'text-indigo-600 bg-indigo-50',
    cyan: isDark ? 'text-cyan-400 bg-cyan-500/15' : 'text-cyan-600 bg-cyan-50',
    orange: isDark ? 'text-orange-400 bg-orange-500/15' : 'text-orange-600 bg-orange-50',
    pink: isDark ? 'text-pink-400 bg-pink-500/15' : 'text-pink-600 bg-pink-50',
    green: isDark ? 'text-green-400 bg-green-500/15' : 'text-green-600 bg-green-50',
  };

  const renderContent = () => {
    switch (active) {
      // ──────────────────────────────────────────────────────── PROFILE
      case 'profile':
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={User} title="Profile Information" description="Manage your public academic identity. Redirects to full profile for more options." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <FieldInput label="Username / Handle" value={username} onChange={setUsername} />
                <FieldInput label="Full Name" value={fullName} onChange={setFullName} />
                <FieldInput label="Institution" value={institution} onChange={setInstitution} />
                <FieldInput label="Email Address" value={settings?.email || user?.email || ''} readOnly />
                <FieldInput label="Role" value={settings?.role || user?.role || ''} readOnly />
                <FieldInput label="Member Since" value={settings?.memberSince ? new Date(settings.memberSince).toLocaleDateString() : '—'} readOnly />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={() => navigate('/profile')}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full Profile Page
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 cursor-pointer ${
                    isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Section>

            <Section>
              <SectionTitle icon={TrendingUp} title="Account Statistics" description="Your real-time learning progress." />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'XP Points', value: (settings?.xp || 0).toLocaleString(), icon: Zap, color: 'violet' },
                  { label: 'Level', value: Math.floor((settings?.xp || 0) / 1000) + 1, icon: Star, color: 'amber' },
                  { label: 'Role', value: settings?.role || user?.role || '—', icon: Award, color: 'emerald' },
                  { label: 'Status', value: 'Active', icon: Check, color: 'green' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-4 text-center ${isDark ? 'bg-white/[0.03] border border-white/8' : 'bg-slate-50 border border-slate-200'}`}>
                    <p className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                    <p className={`text-xs font-medium ${textSecondary}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── SECURITY
      case 'security':
        return (
          <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Shield} title="Change Password" description="Update your account password. You'll be logged out after changing." />
              <div className="space-y-4">
                <div className="relative">
                  <label className={`text-[0.68rem] font-bold uppercase tracking-widest block mb-1.5 ${textSecondary}`}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={curPwd}
                      onChange={e => setCurPwd(e.target.value)}
                      placeholder="Enter current password"
                      className={`w-full px-3 py-2.5 pr-10 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 ${isDark ? 'bg-black/25 border-white/8 text-slate-200 focus:border-violet-500/50 focus:ring-violet-500/20' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-200'}`}
                    />
                    <button onClick={() => setShowPwd(!showPwd)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <FieldInput label="New Password (min 8 chars)" value={newPwd} onChange={setNewPwd} type={showPwd ? 'text' : 'password'} />
                <FieldInput label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} type={showPwd ? 'text' : 'password'} />
                <div className="flex justify-end pt-2">
                  <button
                    onClick={savePassword}
                    disabled={pwdSaving || !curPwd || !newPwd || !confirmPwd}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50 cursor-pointer transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    {pwdSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </Section>

            <Section>
              <SectionTitle icon={Shield} title="Security Settings" description="Additional security controls for your account." />
              <Row label="Proctoring Enforcement" description="Prevents tab-switching during active quiz evaluation" action={<span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>Active</span>} />
              <Row label="Session Management" description="You are logged in from 1 active session" action={
                <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  View Sessions
                </button>
              } />
              <Row label="Two-Factor Authentication" description="Add an extra layer of security (coming soon)" action={<span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>Coming Soon</span>} />
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── APPEARANCE
      case 'appearance':
        return (
          <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Palette} title="Theme Mode" description="This setting affects the entire application globally." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                {/* Light Mode */}
                <button
                  onClick={() => setTheme('light')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                    !isDark ? 'ring-2 ring-blue-500 border-transparent bg-white shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-900">Light Mode</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isDark ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                      {!isDark && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col justify-between">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300" /><div className="w-10 h-2.5 rounded bg-slate-200" /></div>
                    <div className="space-y-1"><div className="w-full h-2 rounded bg-slate-200" /><div className="w-3/4 h-2 rounded bg-blue-200" /></div>
                    <div className="flex gap-2"><div className="w-8 h-3 rounded-lg bg-blue-200" /><div className="w-12 h-3 rounded-lg bg-slate-200" /></div>
                  </div>
                </button>
                {/* Dark Mode */}
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                    isDark ? 'ring-2 ring-violet-500 border-transparent bg-[#0e1322] shadow-lg shadow-violet-500/10' : 'bg-[#0b0f19] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">Dark Mode</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isDark ? 'border-violet-500 bg-violet-500' : 'border-white/30'}`}>
                      {isDark && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="h-20 bg-[#060912] border border-white/8 rounded-xl p-2 flex flex-col justify-between">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-700" /><div className="w-10 h-2.5 rounded bg-slate-700" /></div>
                    <div className="space-y-1"><div className="w-full h-2 rounded bg-slate-800" /><div className="w-3/4 h-2 rounded bg-violet-900/50" /></div>
                    <div className="flex gap-2"><div className="w-8 h-3 rounded-lg bg-violet-900/60 border border-violet-800/30" /><div className="w-12 h-3 rounded-lg bg-slate-800" /></div>
                  </div>
                </button>
              </div>
              <p className={`text-xs mt-3 ${textSecondary}`}>
                ✓ Your theme preference is saved automatically and applies to all pages.
              </p>
            </Section>

            <Section>
              <SectionTitle icon={Globe} title="Language & Region" description="Localization settings for your dashboard." />
              <Row label="Language" description="Interface display language" action={
                <select className={`text-sm border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer ${isDark ? 'bg-black/25 border-white/8 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <option>English (US)</option>
                  <option>English (UK)</option>
                </select>
              } />
              <Row label="Date Format" description="How dates are displayed throughout the app" action={
                <select className={`text-sm border rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer ${isDark ? 'bg-black/25 border-white/8 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              } />
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── NOTIFICATIONS
      case 'notifications':
        return (
          <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Bell} title="Email Notifications" description="Control which events send you an email." />
              <Row label="Weekly Diagnostic Digest" description="Weekly summary of your performance metrics" action={<Toggle value={weeklyDigest} onChange={() => setWeeklyDigest(v => !v)} />} />
              <Row label="Security Alert Broadcasts" description="Instant alert on credential changes or security events" action={<Toggle value={securityAlerts} onChange={() => setSecurityAlerts(v => !v)} />} />
              <Row label="Daily Challenge Reminders" description="Reminder when today's daily challenge is ready" action={<Toggle value={dailyReminders} onChange={() => setDailyReminders(v => !v)} />} />
              <Row label="Achievement Unlocked" description="Get notified when you unlock a new badge or milestone" action={<Toggle value={achievementAlerts} onChange={() => setAchievementAlerts(v => !v)} />} />
              <Row label="General Email Alerts" description="Platform announcements, maintenance notices" action={<Toggle value={emailNotif} onChange={() => setEmailNotif(v => !v)} />} />
              <div className="flex justify-end pt-4 mt-2">
                <button
                  onClick={() => toast.success('Notification preferences saved!')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </Section>

            <Section>
              <SectionTitle icon={Volume2} title="In-App Notifications" description="Real-time notifications inside the platform." />
              <Row label="Push Notifications" description="Browser push notifications (requires permission)" action={<span className={`text-xs px-2 py-1 rounded-lg font-semibold ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>Coming Soon</span>} />
              <Row label="Sound Alerts" description="Play a sound on important events" action={<Toggle value={false} onChange={() => toast('Sound alerts coming soon!')} disabled />} />
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── LEARNING
      case 'learning':
        return (
          <motion.div key="learning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Target} title="Difficulty Preference" description="Choose how the engine selects questions for you." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'ADAPTIVE', label: 'Adaptive (AI)', desc: 'AI picks based on your performance' },
                  { key: 'STANDARD', label: 'Standard', desc: 'Mix of all difficulties' },
                  { key: 'CHALLENGE', label: 'Challenge Mode', desc: 'Focus on hard & medium problems' },
                ].map(d => (
                  <button
                    key={d.key}
                    onClick={() => setDifficultyPref(d.key)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      difficultyPref === d.key
                        ? isDark ? 'ring-2 ring-violet-500 border-transparent bg-violet-500/10' : 'ring-2 ring-blue-500 border-transparent bg-blue-50'
                        : isDark ? 'bg-white/[0.02] border-white/8 hover:bg-white/[0.04]' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{d.label}</p>
                    <p className={`text-xs ${textSecondary}`}>{d.desc}</p>
                  </button>
                ))}
              </div>
            </Section>

            <Section>
              <SectionTitle icon={Clock} title="Daily Goal" description="How many minutes you aim to study each day." />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Daily Study Goal</span>
                  <span className={`text-xl font-bold ${isDark ? 'text-violet-400' : 'text-blue-600'}`}>{dailyGoal} min</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={180}
                  step={5}
                  value={dailyGoal}
                  onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>5 min</span>
                  <span>1 hour</span>
                  <span>3 hours</span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => toast.success(`Daily goal set to ${dailyGoal} minutes!`)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    <Save className="w-4 h-4" />
                    Save Goal
                  </button>
                </div>
              </div>
            </Section>

            <Section>
              <SectionTitle icon={Calendar} title="Study Schedule" description="Advanced scheduling options." />
              <Row label="Daily Challenge Auto-Start" description="Automatically start daily challenge at 6:00 AM" action={<Toggle value={false} onChange={() => toast('Scheduling coming soon!')} disabled />} />
              <Row label="Spaced Repetition" description="Enable AI-powered spaced repetition for weak topics" action={<Toggle value={true} onChange={() => {}} />} />
              <Row label="Streak Protection" description="Get a free streak save once per week" action={<Toggle value={true} onChange={() => {}} />} />
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── PRIVACY
      case 'privacy':
        return (
          <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Lock} title="Profile Visibility" description="Control what others can see about you." />
              <Row label="Public Profile" description="Allow others to view your profile and achievements" action={<Toggle value={profilePublic} onChange={() => setProfilePublic(v => !v)} />} />
              <Row label="Show on Leaderboard" description="Display your name and score on public leaderboards" action={<Toggle value={showOnLeaderboard} onChange={() => setShowOnLeaderboard(v => !v)} />} />
              <Row label="Share Analytics with Teachers" description="Allow your enrolled teachers to view your performance" action={<Toggle value={shareAnalytics} onChange={() => setShareAnalytics(v => !v)} />} />
              <div className="flex justify-end pt-4 mt-2">
                <button
                  onClick={() => toast.success('Privacy settings saved!')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <Save className="w-4 h-4" />
                  Save Privacy
                </button>
              </div>
            </Section>

            <Section>
              <SectionTitle icon={Globe} title="Data & Cookies" description="How your data is used." />
              <Row label="Analytics Cookies" description="Help us improve the platform with anonymous usage data" action={<Toggle value={true} onChange={() => {}} />} />
              <Row label="Performance Tracking" description="Track quiz performance across sessions" action={<Toggle value={true} onChange={() => {}} />} />
              <div className="mt-4 pt-4 border-t border-white/5">
                <button className={`text-sm font-medium transition-colors ${isDark ? 'text-violet-400 hover:text-violet-300' : 'text-blue-600 hover:text-blue-700'}`}>
                  Download My Data (GDPR)
                </button>
              </div>
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── ANALYTICS
      case 'analytics':
        return (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={BarChart2} title="Analytics Dashboard" description="Quick access to your performance data and reports." />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total XP', value: (settings?.xp || 0).toLocaleString(), suffix: 'XP' },
                  { label: 'Current Level', value: Math.floor((settings?.xp || 0) / 1000) + 1, suffix: '' },
                  { label: 'Progress', value: Math.round(((settings?.xp || 0) % 1000) / 10), suffix: '%' },
                ].map((stat, i) => (
                  <div key={i} className={`rounded-xl p-5 text-center ${isDark ? 'bg-white/[0.03] border border-white/8' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'}`}>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}<span className={`text-sm ml-1 ${textSecondary}`}>{stat.suffix}</span></p>
                    <p className={`text-xs font-medium mt-1 ${textSecondary}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border cursor-pointer transition-all ${isDark ? 'border-white/8 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <ExternalLink className="w-4 h-4" />
                Open Full Analytics Dashboard
              </button>
            </Section>

            <Section>
              <SectionTitle icon={BarChart2} title="Export & Reports" description="Download your performance data." />
              <Row label="Export Quiz History" description="Download all your quiz results as CSV" action={
                <button className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              } />
              <Row label="Neural Progress Report" description="View your full AI analysis and predictions" action={
                <button onClick={() => navigate('/neural-cockpit')} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${isDark ? 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                  Open
                </button>
              } />
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── CONNECTED ACCOUNTS
      case 'connected':
        return (
          <motion.div key="connected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Link2} title="Connected Accounts" description="Link external accounts for social login and profile enrichment." />
              {[
                { name: 'Google', icon: '🔵', desc: 'Sign in with Google account', connected: false },
                { name: 'GitHub', icon: '⚫', desc: 'Show your GitHub contributions', connected: settings?.username?.includes('github') || false },
                { name: 'LinkedIn', icon: '🔷', desc: 'Display your LinkedIn profile', connected: false },
              ].map(acc => (
                <Row
                  key={acc.name}
                  label={`${acc.icon} ${acc.name}`}
                  description={acc.desc}
                  action={
                    <button className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      acc.connected
                        ? isDark ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50'
                        : isDark ? 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                    }`}>
                      {acc.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  }
                />
              ))}
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── ACCESSIBILITY
      case 'accessibility':
        return (
          <motion.div key="accessibility" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={Accessibility} title="Accessibility Options" description="Adjust the interface to suit your accessibility needs." />
              <Row label="Reduced Motion" description="Minimize animations and transitions throughout the app" action={<Toggle value={reducedMotion} onChange={() => setReducedMotion(v => !v)} />} />
              <Row label="Large Text Mode" description="Increase base font size across all pages by 20%" action={<Toggle value={largeText} onChange={() => setLargeText(v => !v)} />} />
              <Row label="High Contrast Mode" description="Increase contrast for better readability" action={<Toggle value={highContrast} onChange={() => setHighContrast(v => !v)} />} />
              <Row label="Screen Reader Support" description="Optimize for screen reader compatibility" action={<Toggle value={screenReader} onChange={() => setScreenReader(v => !v)} />} />
              <Row label="Keyboard Navigation" description="Full keyboard navigation support" action={<span className={`text-xs font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>Always On</span>} />
              <div className="flex justify-end pt-4 mt-2">
                <button
                  onClick={() => toast.success('Accessibility preferences saved!')}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${isDark ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <Save className="w-4 h-4" />
                  Save Accessibility
                </button>
              </div>
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── BILLING
      case 'billing':
        return (
          <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={CreditCard} title="Current Plan" description="Your subscription status and billing details." />
              <div className={`rounded-2xl p-6 mb-4 ${isDark ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-violet-400' : 'text-blue-600'}`}>Current Plan</p>
                    <p className={`text-2xl font-bold mb-1 ${textPrimary}`}>Free Tier</p>
                    <p className={`text-sm ${textSecondary}`}>Access to core features — quizzes, daily challenges, profile & analytics.</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>Active</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Student Pro', price: '₹199/mo', features: ['Unlimited quizzes', 'AI explanations', 'Priority support'] },
                  { name: 'Academic Plus', price: '₹499/mo', features: ['Everything in Pro', 'Teacher mode', 'Classroom analytics'] },
                ].map(plan => (
                  <div key={plan.name} className={`p-5 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/8' : 'bg-white border-slate-200'}`}>
                    <p className={`font-bold text-sm mb-1 ${textPrimary}`}>{plan.name}</p>
                    <p className={`text-xl font-bold mb-3 ${isDark ? 'text-violet-400' : 'text-blue-600'}`}>{plan.price}</p>
                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map(f => (
                        <li key={f} className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />{f}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${isDark ? 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                      Upgrade
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        );

      // ──────────────────────────────────────────────────────── DANGER ZONE
      case 'danger':
        return (
          <motion.div key="danger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <Section>
              <SectionTitle icon={AlertTriangle} title="Danger Zone" description="These actions are irreversible. Proceed with extreme caution." />
              
              <div className={`rounded-xl border p-5 mb-4 ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`font-bold text-sm mb-1 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>Log Out of All Devices</p>
                    <p className={`text-xs ${isDark ? 'text-amber-500/80' : 'text-amber-700'}`}>This will invalidate all active sessions. You'll need to log in again on every device.</p>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/auth'); }}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Logout All
                  </button>
                </div>
              </div>

              <div className={`rounded-xl border p-5 ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-bold text-sm mb-1 ${isDark ? 'text-red-400' : 'text-red-800'}`}>Delete Account Permanently</p>
                <p className={`text-xs mb-4 ${isDark ? 'text-red-500/80' : 'text-red-700'}`}>
                  This will permanently delete your account, all quiz history, badges, XP, and any content you created. This action CANNOT be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    I want to delete my account
                  </button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className={`text-xs font-semibold p-3 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'}`}>
                        ⚠️ Please enter your password to confirm this irreversible action:
                      </div>
                      <input
                        type="password"
                        placeholder="Enter your password to confirm"
                        value={deleteConfirmPwd}
                        onChange={e => setDeleteConfirmPwd(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${isDark ? 'bg-black/25 border-red-500/30 text-slate-200' : 'bg-white border-red-200 text-slate-800'}`}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmPwd(''); }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          onClick={deleteAccount}
                          disabled={deleting || !deleteConfirmPwd}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all bg-red-700 hover:bg-red-800 text-white disabled:opacity-50"
                        >
                          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          {deleting ? 'Deleting...' : 'Delete Forever'}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </Section>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg} ${textPrimary} transition-colors duration-300`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? 'bg-[#060912]/80 border-white/8' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div>
            <h1 className="text-base font-bold tracking-tight">Settings</h1>
            <p className={`text-xs ${textSecondary}`}>Manage your account, preferences & privacy</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Quick theme toggle in header */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${isDark ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              const colorKey = item.color === 'red' && item.id === 'danger' ? 'red' : item.color;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? item.id === 'danger'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-violet-500/10 text-violet-300'
                        : item.id === 'danger'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg shrink-0 ${isActive ? navIconColor[colorKey] : isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    <item.icon className="w-3.5 h-3.5" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="lg:hidden w-full">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  active === item.id
                    ? isDark ? 'bg-violet-600 border-violet-500 text-white' : 'bg-blue-600 border-blue-500 text-white'
                    : isDark ? 'border-white/8 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-violet-400' : 'text-blue-500'}`} />
                <p className={`text-sm ${textSecondary}`}>Loading settings…</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
