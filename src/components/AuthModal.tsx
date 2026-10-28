import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Crown,
  KeyRound,
  LogIn,
  Phone,
  Send,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Bell,
  Link as LinkIcon
} from 'lucide-react';
import { UserAccount, CurrencyCode, AuthProvider, NotificationChannel } from '../types';
import { formatCurrency } from '../services/currency';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentCurrency: CurrencyCode;
  onUpdateUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCurrency,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'channels' | 'edit'>('profile');
  
  // Login method state
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider>('google');
  const [googleEmailInput, setGoogleEmailInput] = useState(user.email || 'chaudharybibash359@gmail.com');
  const [phoneCountry, setPhoneCountry] = useState('+977');
  const [phoneInput, setPhoneInput] = useState('9801234567');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('8899');
  const [telegramInput, setTelegramInput] = useState(user.telegramUsername || '@bibash_gamer');
  const [facebookInput, setFacebookInput] = useState(user.facebookHandle || 'fb.com/bibash.gaming');
  const [twitterInput, setTwitterInput] = useState(user.twitterHandle || '@bibash_c');
  
  // Edit profile state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaved, setIsSaved] = useState(false);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Channels preferences
  const [enabledChannels, setEnabledChannels] = useState<NotificationChannel[]>(() => {
    return user.notificationChannels || ['gmail', 'phone_sms', 'telegram', 'facebook', 'twitter'];
  });

  const vipTiers = [
    { tier: 'Bronze', spend: 'Rp 0', discount: '0%', color: 'text-amber-600' },
    { tier: 'Silver', spend: 'Rp 500k', discount: '1.5% OFF', color: 'text-slate-300' },
    { tier: 'Gold', spend: 'Rp 1.5M', discount: '3.0% OFF', color: 'text-amber-400', isCurrent: user.vipTier === 'Gold' },
    { tier: 'Diamond', spend: 'Rp 5.0M', discount: '5.0% OFF + Priority Queue', color: 'text-cyan-400' },
  ];

  const handleToggleChannel = (channel: NotificationChannel) => {
    let next: NotificationChannel[];
    if (enabledChannels.includes(channel)) {
      next = enabledChannels.filter((c) => c !== channel);
    } else {
      next = [...enabledChannels, channel];
    }
    setEnabledChannels(next);
    onUpdateUser({
      ...user,
      notificationChannels: next,
    });
  };

  const handlePerformLogin = (provider: AuthProvider) => {
    let newName = user.name;
    let newEmail = user.email;
    let newPhone = user.phone;
    let newTelegram = user.telegramUsername;
    let newFacebook = user.facebookHandle;
    let newTwitter = user.twitterHandle;
    let identifier = '';

    if (provider === 'google') {
      newEmail = googleEmailInput.trim() || 'chaudharybibash359@gmail.com';
      newName = newEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase() || 'Google User';
      identifier = newEmail;
    } else if (provider === 'phone') {
      newPhone = `${phoneCountry} ${phoneInput}`;
      newName = `User_${phoneInput.slice(-4)}`;
      identifier = newPhone;
    } else if (provider === 'telegram') {
      newTelegram = telegramInput.startsWith('@') ? telegramInput : `@${telegramInput}`;
      newName = `TG_${newTelegram.replace('@', '')}`;
      identifier = newTelegram;
    } else if (provider === 'facebook') {
      newFacebook = facebookInput;
      newName = facebookInput.replace('fb.com/', '') || 'FB Gamer';
      identifier = newFacebook;
    } else if (provider === 'twitter') {
      newTwitter = twitterInput.startsWith('@') ? twitterInput : `@${twitterInput}`;
      newName = `X_${newTwitter.replace('@', '')}`;
      identifier = newTwitter;
    }

    const updatedLinked = [...(user.linkedAccounts || [])];
    if (!updatedLinked.some((a) => a.provider === provider)) {
      updatedLinked.push({
        provider,
        identifier: identifier || newEmail,
        displayName: `${provider.toUpperCase()} Linked ID`,
        linkedAt: new Date().toISOString(),
      });
    }

    const updatedUser: UserAccount = {
      ...user,
      provider,
      name: newName,
      email: newEmail,
      phone: newPhone,
      telegramUsername: newTelegram,
      facebookHandle: newFacebook,
      twitterHandle: newTwitter,
      linkedAccounts: updatedLinked,
    };

    onUpdateUser(updatedUser);
    setLoginSuccessMsg(`Successfully authenticated via ${provider.toUpperCase()}!`);
    setTimeout(() => {
      setLoginSuccessMsg(null);
      setOtpStep(false);
      setActiveTab('profile');
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      phone: `${phoneCountry} ${phoneInput}`,
      telegramUsername: telegramInput,
      facebookHandle: facebookInput,
      twitterHandle: twitterInput,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveTab('profile');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  UniPin Identity & Login Center
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  VERIFIED ID
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gmail • Phone SMS • Facebook • Twitter/X • Telegram
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-orange-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-slate-800 text-orange-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Methods</span>
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'channels'
                ? 'bg-slate-800 text-orange-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert IDs</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <>
              {/* Profile Card */}
              <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-orange-500 shrink-0">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white truncate">{user.name}</h4>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> VIP {user.vipTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>UniPin Credits: <strong className="text-emerald-400">{formatCurrency(user.unipinCreditsIDR, currentCurrency)}</strong></span>
                    <span>UniPoints: <strong className="text-amber-400">{(user.uniPointsBalance ?? 480).toLocaleString()} PTS</strong></span>
                  </div>
                </div>
              </div>

              {/* Linked Notification Identity Channels */}
              <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-emerald-400" /> Linked Order Alert Channels
                  </span>
                  <button 
                    onClick={() => setActiveTab('channels')}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-bold"
                  >
                    Manage
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-red-400 font-bold">📧 Gmail</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{user.email}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">📱 Phone SMS</span>
                    <span className="text-slate-300">{user.phone || '+977 9801234567'}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-sky-400 font-bold">✈️ Telegram</span>
                    <span className="text-slate-300">{user.telegramUsername || '@bibash_gamer'}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-blue-400 font-bold">🔵 FB & TW</span>
                    <span className="text-slate-300 truncate max-w-[140px]">{user.twitterHandle || '@bibash_c'}</span>
                  </div>
                </div>
              </div>

              {/* VIP Benefits & Progress */}
              <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" /> VIP Loyalty Level & Wholesale Rebates
                  </span>
                  <span className="text-orange-400 font-bold">Level 3</span>
                </div>

                <div className="space-y-2">
                  {vipTiers.map((v) => (
                    <div 
                      key={v.tier}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        v.isCurrent
                          ? 'bg-amber-500/15 border-amber-500/50 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${v.color}`}>{v.tier}</span>
                        <span className="text-[10px] text-slate-400">(Min. Spend {v.spend})</span>
                      </div>
                      <div className="text-emerald-400 font-bold">
                        {v.discount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-all"
                >
                  Edit Profile Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl shadow-lg transition-all"
                >
                  Switch / Link Login ID
                </button>
              </div>
            </>
          )}

          {/* TAB 2: MULTI-ID SOCIAL LOGIN METHODS */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Choose Your Login Method</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in with Gmail, Phone Number (SMS OTP), Facebook, Twitter/X, or Telegram to receive 2-3 min order alerts.
                </p>
              </div>

              {loginSuccessMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {/* Provider Selection Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'google', label: 'Gmail', icon: '🔴', color: 'border-red-500/40 text-red-300' },
                  { id: 'phone', label: 'Phone SMS', icon: '📱', color: 'border-emerald-500/40 text-emerald-300' },
                  { id: 'telegram', label: 'Telegram', icon: '✈️', color: 'border-sky-500/40 text-sky-300' },
                  { id: 'facebook', label: 'Facebook', icon: '🔵', color: 'border-blue-500/40 text-blue-300' },
                  { id: 'twitter', label: 'Twitter / X', icon: '🐦', color: 'border-slate-500/40 text-slate-300' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProvider(p.id as AuthProvider);
                      setOtpStep(false);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                      selectedProvider === p.id
                        ? 'bg-slate-800 border-orange-500 text-white shadow-lg ring-1 ring-orange-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[10px] font-bold">{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Provider Detail Form Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                
                {/* 1. Google / Gmail Form */}
                {selectedProvider === 'google' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                      <span>🔴</span> Sign in with Google / Gmail
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Google Email Address</label>
                      <input
                        type="email"
                        value={googleEmailInput}
                        onChange={(e) => setGoogleEmailInput(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePerformLogin('google')}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Continue with Google Account</span>
                    </button>
                  </div>
                )}

                {/* 2. Phone Number SMS OTP Form */}
                {selectedProvider === 'phone' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <span>📱</span> Phone Number & SMS Verification Code
                    </div>

                    {!otpStep ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <select
                            value={phoneCountry}
                            onChange={(e) => setPhoneCountry(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 font-mono"
                          >
                            <option value="+977">🇳🇵 Nepal (+977)</option>
                            <option value="+62">🇮🇩 Indonesia (+62)</option>
                            <option value="+91">🇮🇳 India (+91)</option>
                            <option value="+63">🇵🇭 Philippines (+63)</option>
                            <option value="+60">🇲🇾 Malaysia (+60)</option>
                            <option value="+1">🇺🇸 USA (+1)</option>
                          </select>
                          <input
                            type="tel"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="9801234567"
                            className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpStep(true)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Send 4-Digit SMS Code</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-400">
                          Enter 4-digit code sent to <strong className="text-emerald-400">{phoneCountry} {phoneInput}</strong>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full text-center text-lg font-mono tracking-widest px-3.5 py-2 bg-slate-900 border border-emerald-500/60 rounded-xl text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handlePerformLogin('phone')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all"
                        >
                          Verify & Sign In
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Telegram Login */}
                {selectedProvider === 'telegram' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                      <span>✈️</span> Telegram Bot Authorization
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Telegram @Username or ID</label>
                      <input
                        type="text"
                        value={telegramInput}
                        onChange={(e) => setTelegramInput(e.target.value)}
                        placeholder="@username"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePerformLogin('telegram')}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Authenticate with Telegram Bot</span>
                    </button>
                  </div>
                )}

                {/* 4. Facebook Login */}
                {selectedProvider === 'facebook' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <span>🔵</span> Facebook Gaming & Profile Sign-In
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Facebook Gaming Profile / Name</label>
                      <input
                        type="text"
                        value={facebookInput}
                        onChange={(e) => setFacebookInput(e.target.value)}
                        placeholder="Bibash Chaudhary Gaming"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePerformLogin('facebook')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg transition-all"
                    >
                      Continue with Facebook
                    </button>
                  </div>
                )}

                {/* 5. Twitter / X Login */}
                {selectedProvider === 'twitter' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span>🐦</span> Twitter / X Account Sign-In
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">X Handle (@handle)</label>
                      <input
                        type="text"
                        value={twitterInput}
                        onChange={(e) => setTwitterInput(e.target.value)}
                        placeholder="@handle"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePerformLogin('twitter')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl shadow-lg border border-slate-700 transition-all"
                    >
                      Authorize via X / Twitter
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: ALERT CHANNELS CONFIG */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Order Completion Notification Routing</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  When your order completes within 2-3 minutes, alerts are instantly pushed to these enabled channels:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'gmail',
                    name: 'Gmail / Google Mail',
                    desc: `Official e-receipt sent to ${user.email}`,
                    icon: '📧',
                    color: 'text-red-400',
                  },
                  {
                    id: 'phone_sms',
                    name: 'Phone Number (SMS Alert)',
                    desc: `Direct SMS sent to ${user.phone || '+977 9801234567'}`,
                    icon: '📱',
                    color: 'text-emerald-400',
                  },
                  {
                    id: 'telegram',
                    name: 'Telegram Bot Dispatcher',
                    desc: `Push notification to ${user.telegramUsername || '@bibash_gamer'}`,
                    icon: '✈️',
                    color: 'text-sky-400',
                  },
                  {
                    id: 'facebook',
                    name: 'Facebook Messenger Alert',
                    desc: `Instant delivery ping to ${user.facebookHandle || 'FB Profile'}`,
                    icon: '🔵',
                    color: 'text-blue-400',
                  },
                  {
                    id: 'twitter',
                    name: 'Twitter / X Direct Message',
                    desc: `Delivery confirmation to ${user.twitterHandle || '@bibash_c'}`,
                    icon: '🐦',
                    color: 'text-slate-300',
                  },
                ].map((item) => {
                  const isEnabled = enabledChannels.includes(item.id as NotificationChannel);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChannel(item.id as NotificationChannel)}
                      className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEnabled
                          ? 'bg-slate-850 border-orange-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                            {isEnabled && (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isEnabled ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isEnabled && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                🔒 All channels are cryptographically bound to your session. Orders deliver with 100% verified delivery receipts.
              </div>
            </div>
          )}

          {/* TAB 4: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email for Automated Receipts
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Telegram Username
                </label>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {isSaved && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white rounded-xl shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Signed in as <strong className="text-white">{user.name}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
};
