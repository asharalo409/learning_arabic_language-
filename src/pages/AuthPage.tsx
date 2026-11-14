import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL, useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { progress, triggerSound } = useApp();
  const { user, supabaseConnected, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
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
          window.setTimeout(() => navigate('/dashboard'), 850);
        }
      } else {
        const res = await signUp(email, password, fullName, progress);
        if (!res.ok) {
          triggerSound('error');
          setErrorMsg(res.errorBn || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
        } else if (res.needsEmailVerify) {
          setInfoMsg(
            'অ্যাকাউন্ট তৈরি হয়েছে! আপনার Gmail ইনবক্সে যাচাইকরণ লিংকে ক্লিক করে তারপর লগইন করুন।'
          );
          setMode('login');
        } else {
          setInfoMsg('অভিনন্দন! আপনার নতুন শিক্ষার্থী অ্যাকাউন্ট প্রস্তুত।');
          window.setTimeout(() => navigate('/dashboard'), 850);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="অ্যাকাউন্ট ও লগইন"
      subtitle="আপনার Gmail ও পাসওয়ার্ড দিয়ে লগইন করে ব্যক্তিগত ড্যাশবোর্ড ও র‍্যাঙ্কিং সিঙ্ক করুন"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Atmospheric Botanical/Sapphire Glass Hero Card (Image 3 style) */}
        <div
          className="lg:col-span-5 rounded-3xl p-7 sm:p-8 text-white flex flex-col justify-between gap-6 shadow-xl relative overflow-hidden"
          style={{
            background:
              'linear-gradient(155deg, #0b2416 0%, #19472c 48%, #0f2c4e 100%)',
          }}
        >
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 backdrop-blur-md text-[11px] font-medium text-emerald-100">
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {supabaseConnected ? 'Supabase Cloud সক্রিয়' : 'Account Sync Ready'}
              </span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>

            <p className="font-arabic text-2xl sm:text-3xl text-amber-300 leading-relaxed" dir="rtl">
              طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَىٰ كُلِّ مُسْلِمٍ
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
              Join AI Arabic Academy
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              প্রতিটি শিক্ষার্থীর নিজস্ব ড্যাশবোর্ড, সাপ্তাহিক অগ্রগতি চার্ট, অর্জিত ব্যাজ এবং গ্লোবাল লিডারবোর্ডে অবস্থান সংরক্ষিত থাকে।
            </p>
          </div>

          <div className="space-y-2.5 text-xs relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
              <span className="text-white/90">ব্যক্তিগত ড্যাশবোর্ড ও চার্ট</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
              <span className="text-white/90">লাইভ শিক্ষার্থী লিডারবোর্ড</span>
              <Trophy className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-white/80 leading-relaxed">
              প্রতিষ্ঠাতা: <strong className="text-white">তাসীন বিল্লাহ</strong> · আল কুরআন এণ্ড ইসলামিক স্টাডিজ, কুষ্টিয়া ইবি · Admin: <span className="font-mono-num">{ADMIN_EMAIL}</span>
            </div>
          </div>
        </div>

        {/* Right Frosted Glass Form / Passport Card (Image 3 style) */}
        <div className="lg:col-span-7 surface-card rounded-3xl p-6 sm:p-9 flex flex-col justify-center">
          {user ? (
            <div className="space-y-6">
              {/* Flyora Passport Style Signed-in Card */}
              <div
                className="rounded-3xl p-6 text-white shadow-lg space-y-5"
                style={{
                  background: 'linear-gradient(145deg, #1d397e 0%, #4a6ed4 58%, #6d8cf0 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
                    STUDENT PASSPORT
                  </span>
                  {user.isAdmin && (
                    <span className="px-3 py-1 rounded-full bg-white text-[#1d397e] text-[11px] font-bold inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ADMIN
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <p className="text-xs text-white/80 font-mono-num mt-0.5">{user.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20 text-center">
                  <div>
                    <div className="text-2xl font-bold font-mono-num">{progress.xp}</div>
                    <div className="text-[11px] text-white/75">মোট XP</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono-num">{progress.completedLessonIds.length}</div>
                    <div className="text-[11px] text-white/75">পাঠ সম্পন্ন</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono-num">{progress.streakDays}d</div>
                    <div className="text-[11px] text-white/75">স্ট্রিক</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold btn-primary shadow-md whitespace-nowrap"
                >
                  <span>ড্যাশবোর্ডে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold btn-secondary whitespace-nowrap"
                >
                  <Trophy className="w-4 h-4 text-[var(--accent)]" />
                  <span>লিডারবোর্ড</span>
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold btn-secondary border-[var(--border-strong)] whitespace-nowrap"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                    <span>অ্যাডমিন প্যানেল</span>
                  </Link>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs btn-secondary text-[var(--danger)]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগ আউট করুন</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {mode === 'signup' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'আপনার অ্যাকাউন্টে প্রবেশ করুন'}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  আপনার ব্যক্তিগত অগ্রগতি ও পয়েন্ট সংরক্ষণের জন্য Gmail ও পাসওয়ার্ড দিন
                </p>
              </div>

              {/* Clean Segmented Pill Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full surface-alt border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                    mode === 'signup' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  নতুন অ্যাকাউন্ট
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                    mode === 'login' ? 'btn-primary shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  লগইন (Sign In)
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="আপনার পূর্ণ নাম (যেমন: আব্দুল্লাহ আল মামুন)"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার Gmail ঠিকানা (example@gmail.com)"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl surface-alt border border-[var(--border-subtle)] text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/35 text-xs text-[var(--danger)] font-medium">
                    {errorMsg}
                  </div>
                )}

                {infoMsg && (
                  <div className="p-3.5 rounded-2xl bg-[var(--success)]/12 border border-[var(--success)]/35 text-xs text-[var(--success)] font-medium">
                    {infoMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-full text-sm font-bold btn-primary flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'প্রক্রিয়াধীন...'
                      : mode === 'login'
                      ? 'Continue · লগইন করুন'
                      : 'Continue · অ্যাকাউন্ট তৈরি করুন'}
                  </span>
                </button>
              </form>

              <div className="pt-3 border-t border-[var(--border-subtle)] text-center space-y-2">
                <p className="text-[11px] text-[var(--text-muted)]">
                  লগইন করতে না চাইলে গেস্ট হিসেবেও সকল পাঠ ও AI রোবট ব্যবহার করতে পারবেন (ড্যাশবোর্ড ছাড়া)।
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold btn-secondary"
                >
                  <span>লগইন ছাড়াই গেস্ট হিসেবে প্রবেশ করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
