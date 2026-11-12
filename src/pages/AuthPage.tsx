import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL, useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { progress, triggerSound } = useApp();
  const { user, supabaseConnected, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await signIn(email, password);
        if (!res.ok) {
          triggerSound('error');
          setErrorMsg(res.errorBn || 'লগইন করা যায়নি।');
        } else {
          setInfoMsg('সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...');
          window.setTimeout(() => navigate('/dashboard'), 900);
        }
      } else {
        const res = await signUp(email, password, fullName, progress);
        if (!res.ok) {
          triggerSound('error');
          setErrorMsg(res.errorBn || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
        } else if (res.needsEmailVerify) {
          setInfoMsg(
            'অ্যাকাউন্ট তৈরি হয়েছে! অনুগ্রহ করে আপনার Gmail ইনবক্সে যাচাইকরণ লিংকে ক্লিক করে তারপর লগইন করুন।'
          );
          setMode('login');
        } else {
          setInfoMsg('অভিনন্দন! আপনার নতুন শিক্ষার্থী অ্যাকাউন্ট প্রস্তুত।');
          window.setTimeout(() => navigate('/dashboard'), 900);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="শিক্ষার্থী অ্যাকাউন্ট ও লগইন"
      subtitle="আপনার Gmail ও পাসওয়ার্ড দিয়ে লগইন করে নিজের ড্যাশবোর্ড ও লিডারবোর্ড সিঙ্ক করুন"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Visual & Benefits Column */}
        <div className="lg:col-span-5 surface-card rounded-3xl p-7 flex flex-col justify-between gap-6 border border-[var(--border-strong)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--emerald-highlight)] text-xs font-semibold text-[var(--accent)]">
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {supabaseConnected
                  ? 'Supabase Cloud Sync সক্রিয়'
                  : 'অ্যাকাউন্ট সিঙ্ক মোড (Preview Ready)'}
              </span>
            </div>

            <p className="font-arabic text-2xl sm:text-3xl text-[var(--accent)] leading-relaxed" dir="rtl">
              طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَىٰ كُلِّ مُسْلِمٍ
            </p>

            <h2 className="text-2xl font-bold leading-snug">
              প্রত্যেক শিক্ষার্থীর নিজস্ব প্রোফাইল, পয়েন্ট ও র‍্যাঙ্কিং
            </h2>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              একবার Gmail ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করলে আপনার অর্জিত XP, সম্পন্ন পাঠ, ব্যাকরণ অগ্রগতি ও সার্টিফিকেট তথ্য সুরক্ষিত থাকবে।
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="surface-alt rounded-2xl p-3.5 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>নিজস্ব ড্যাশবোর্ডে দৈনিক উন্নতি ও স্ট্রিক ট্র্যাকিং</span>
            </div>
            <div className="surface-alt rounded-2xl p-3.5 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>গ্লোবাল লিডারবোর্ডে সবার সাথে পয়েন্ট ও র‍্যাঙ্ক দেখা</span>
            </div>
            <div className="surface-alt rounded-2xl p-3.5 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <span>
                প্রতিষ্ঠাতা ও অ্যাডমিন প্যানেল সংরক্ষিত ({ADMIN_EMAIL})
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            প্রতিষ্ঠাতা: <strong className="text-[var(--text-primary)]">তাসীন বিল্লাহ</strong> — আল কুরআন এণ্ড ইসলামিক স্টাডিজ বিভাগ, কুষ্টিয়া ইসলামী বিশ্ববিদ্যালয়
          </div>
        </div>

        {/* Right Form / Active Session Column */}
        <div className="lg:col-span-7 surface-card rounded-3xl p-7 sm:p-8 flex flex-col justify-center">
          {user ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--success)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>লগইন সম্পন্ন হয়েছে</span>
                  </div>
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <p className="text-sm text-[var(--text-muted)] font-mono-num">{user.email}</p>
                </div>

                {user.isAdmin && (
                  <span className="px-3 py-1.5 rounded-xl bg-[var(--emerald-highlight)] border border-[var(--border-strong)] text-xs font-bold text-[var(--accent)] inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>অ্যাডমিন অ্যাকাউন্ট</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="surface-alt rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold font-mono-num text-[var(--accent)]">{progress.xp}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">মোট XP</div>
                </div>
                <div className="surface-alt rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold font-mono-num text-[var(--accent)]">
                    {progress.completedLessonIds.length}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">পাঠ সম্পন্ন</div>
                </div>
                <div className="surface-alt rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold font-mono-num text-[var(--accent)]">
                    {progress.streakDays}d
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">স্ট্রিক</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/dashboard"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm btn-primary whitespace-nowrap"
                >
                  <span>আমার ড্যাশবোর্ড খুলুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm btn-secondary whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4 text-[var(--accent)]" />
                  <span>লিডারবোর্ড</span>
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm btn-secondary border-[var(--border-strong)] whitespace-nowrap"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                    <span>অ্যাডমিন প্যানেল</span>
                  </Link>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs btn-secondary text-[var(--danger)]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগ আউট করুন</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toggle Login / SignUp Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl surface-alt border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                    mode === 'login' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>লগইন (Sign In)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                    mode === 'signup' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>নতুন অ্যাকাউন্ট</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                      আপনার পূর্ণ নাম (ড্যাশবোর্ড ও লিডারবোর্ডে দেখানো হবে)
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="যেমন: আব্দুল্লাহ আল মামুন"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                    Gmail / ইমেইল ঠিকানা
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                    পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/35 text-xs text-[var(--danger)] font-medium">
                    {errorMsg}
                  </div>
                )}

                {infoMsg && (
                  <div className="p-3.5 rounded-xl bg-[var(--success)]/12 border border-[var(--success)]/35 text-xs text-[var(--success)] font-medium">
                    {infoMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-bold btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>
                    {submitting
                      ? 'প্রক্রিয়াধীন...'
                      : mode === 'login'
                      ? 'একাডেমিতে লগইন করুন'
                      : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
