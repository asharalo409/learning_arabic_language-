import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Database, Lock, LogIn, Plus, ShieldCheck } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL, useAuth } from '../context/AuthContext';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSqlSchema';
import { CurriculumLevelNumber, DetailedLesson, LearningTrack } from '../types/academy';

export const AdminPage: React.FC = () => {
  const {
    t,
    adminContent,
    addCustomChapter,
    saveCustomLesson,
    addCustomVocab,
    addCustomQuestion,
    triggerSound,
  } = useApp();
  const { user, supabaseConnected, leaderboard } = useAuth();

  const [tab, setTab] = useState<'chapters' | 'lessons' | 'vocab' | 'quiz' | 'supabase'>('chapters');
  const [toast, setToast] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Chapter form
  const [chNum, setChNum] = useState(101);
  const [chLevel, setChLevel] = useState<CurriculumLevelNumber>(1);
  const [chTrack, setChTrack] = useState<LearningTrack>('MSA');
  const [chTitleAr, setChTitleAr] = useState('');
  const [chTitleBn, setChTitleBn] = useState('');
  const [chTitleEn, setChTitleEn] = useState('');
  const [chObjBn, setChObjBn] = useState('');

  // Lesson form
  const [lsChapter, setLsChapter] = useState(1);
  const [lsNumber, setLsNumber] = useState(3);
  const [lsTitleAr, setLsTitleAr] = useState('');
  const [lsTitleBn, setLsTitleBn] = useState('');
  const [lsGrammarAr, setLsGrammarAr] = useState('');
  const [lsGrammarBn, setLsGrammarBn] = useState('');
  const [lsGrammarExpBn, setLsGrammarExpBn] = useState('');

  // Vocab form
  const [vAr, setVAr] = useState('');
  const [vPron, setVPron] = useState('');
  const [vBn, setVBn] = useState('');
  const [vEn, setVEn] = useState('');
  const [vCat, setVCat] = useState('Education');

  // Quiz form
  const [qPromptBn, setQPromptBn] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qOpt4, setQOpt4] = useState('');
  const [qCorrect, setQCorrect] = useState(1);
  const [qExp, setQExp] = useState('');

  const showToast = (msg: string) => {
    triggerSound('success');
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  if (!user || !user.isAdmin) {
    return (
      <AppShell
        title={t.sidebar.admin}
        subtitle="শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত"
      >
        <div className="max-w-lg mx-auto surface-card rounded-3xl p-8 text-center space-y-5 border border-[var(--border-strong)] my-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">অ্যাডমিন প্যানেল সুরক্ষিত</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              কোর্স, পাঠ, শব্দ ও Supabase ডাটাবেজ পরিচালনা করতে শুধুমাত্র প্রতিষ্ঠাতা অ্যাডমিন Gmail (
              <span className="font-mono-num font-semibold text-[var(--accent)]">{ADMIN_EMAIL}</span>) দিয়ে লগইন করুন।
            </p>
            {user && (
              <p className="text-xs text-[var(--danger)] pt-1">
                বর্তমানে লগইন করা আছে: {user.email} (সাধারণ শিক্ষার্থী অ্যাকাউন্ট)
              </p>
            )}
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold btn-primary"
          >
            <LogIn className="w-4 h-4" />
            <span>অ্যাডমিন Gmail দিয়ে লগইন করুন</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      triggerSound('success');
      window.setTimeout(() => setCopiedSql(false), 2200);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chTitleBn.trim() || !chTitleAr.trim()) return;
    addCustomChapter({
      chapterNumber: Number(chNum),
      level: chLevel,
      track: chTrack,
      titleAr: chTitleAr.trim(),
      titleBn: chTitleBn.trim(),
      titleEn: chTitleEn.trim() || chTitleBn.trim(),
      objectiveBn: chObjBn.trim() || 'কাস্টম অধ্যায় উদ্দেশ্য',
      objectiveEn: chTitleEn.trim() || 'Custom chapter objective',
      lessons: Array.from({ length: 10 }, (_, idx) => ({
        lessonNumber: idx + 1,
        titleAr: `${chTitleAr.trim()} (${idx + 1})`,
        titleBn: `${chTitleBn.trim()} — পাঠ ${idx + 1}`,
        titleEn: `${chTitleEn.trim() || chTitleBn.trim()} — Lesson ${idx + 1}`,
        grammarFocus: 'Custom Focus',
        hasFullContent: false,
      })),
    });
    setChTitleAr('');
    setChTitleBn('');
    setChTitleEn('');
    setChObjBn('');
    showToast(`অধ্যায় ${chNum} সংরক্ষিত হয়েছে!`);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lsTitleBn.trim() || !lsTitleAr.trim()) return;
    const id = `ch${lsChapter}-l${lsNumber}`;
    const newLesson: DetailedLesson = {
      id,
      chapterNumber: Number(lsChapter),
      lessonNumber: Number(lsNumber),
      titleAr: lsTitleAr.trim(),
      titleBn: lsTitleBn.trim(),
      titleEn: lsTitleBn.trim(),
      track: 'Combined',
      objectivesBn: [lsGrammarBn.trim() || 'কাস্টম পাঠের মূল ধারণা আয়ত্ত করা।'],
      objectivesEn: ['Master custom authored lesson objectives.'],
      revisionVocabulary: [],
      newVocabulary: vAr
        ? [
            {
              id: `cv-${Date.now()}`,
              arabic: vAr,
              pronunciationBn: vPron || vAr,
              meaningBn: vBn || 'অর্থ',
              meaningEn: vEn || 'Meaning',
              category: vCat,
              exampleAr: vAr,
              exampleBn: vBn || 'উদাহরণ',
              exampleEn: vEn || 'Example',
            },
          ]
        : [],
      grammarTopicAr: lsGrammarAr.trim() || 'قَاعِدَةٌ جَدِيدَةٌ',
      grammarTopicBn: lsGrammarBn.trim() || 'ব্যাকরণ আলোচনা',
      grammarExplanationBn: lsGrammarExpBn.trim() || 'শিক্ষক কর্তৃক সংযোজিত ব্যাকরণ ব্যাখ্যা।',
      grammarExplanationEn: lsGrammarExpBn.trim() || 'Custom grammar explanation.',
      grammarExamples: [],
      conversation: [
        {
          speaker: 'المُعَلِّمُ',
          speakerRoleBn: 'শিক্ষক',
          arabic: 'السَّلَامُ عَلَيْكُمْ، أَهْلًا بِكُمْ فِي هٰذَا الدَّرْسِ.',
          pronunciationBn: 'আসসালামু আলাইকুম, আহলান বিকুম ফী হাযাদ দারসি।',
          translationBn: 'আসসালামু আলাইকুম, এই পাঠে তোমাদের স্বাগতম।',
          translationEn: 'Peace be upon you, welcome to this lesson.',
        },
      ],
      writingPromptBn: 'এই পাঠের বিষয় নিয়ে দুটি আরবি বাক্য লিখুন।',
      writingPromptEn: 'Write two Arabic sentences on this topic.',
      writingTargetHintAr: lsTitleAr.trim(),
      translationExercises: [],
      quiz: [],
    };
    saveCustomLesson(newLesson);
    showToast(`পাঠ ${lsChapter}.${lsNumber} কোর্সে যোগ হয়েছে!`);
  };

  const handleAddVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vAr.trim() || !vBn.trim()) return;
    addCustomVocab({
      id: `custom-v-${Date.now()}`,
      arabic: vAr.trim(),
      pronunciationBn: vPron.trim() || vAr.trim(),
      meaningBn: vBn.trim(),
      meaningEn: vEn.trim() || vBn.trim(),
      category: vCat,
      exampleAr: vAr.trim(),
      exampleBn: vBn.trim(),
      exampleEn: vEn.trim() || vBn.trim(),
    });
    setVAr('');
    setVPron('');
    setVBn('');
    setVEn('');
    showToast('নতুন শব্দ ভোকাবুলারি ব্যাংকে যোগ হয়েছে!');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const opts = [qOpt1, qOpt2, qOpt3, qOpt4].map((s) => s.trim()).filter(Boolean);
    if (!qPromptBn.trim() || opts.length < 2) return;
    addCustomQuestion({
      id: `custom-q-${Date.now()}`,
      type: 'mcq',
      difficulty: 'Beginner',
      promptBn: qPromptBn.trim(),
      promptEn: qPromptBn.trim(),
      options: opts,
      correctAnswer: opts[Math.min(qCorrect - 1, opts.length - 1)] || opts[0],
      explanationBn: qExp.trim() || 'শিক্ষক কর্তৃক সংযোজিত ব্যাখ্যা।',
    });
    setQPromptBn('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQOpt4('');
    setQExp('');
    showToast('নতুন কুইজ প্রশ্ন পরীক্ষা ব্যাংকে যোগ হয়েছে!');
  };

  return (
    <AppShell
      title={t.sidebar.admin}
      subtitle={`স্বাগতম অ্যাডমিন (${user.email}) — একাডেমি কন্টেন্ট ও Supabase ডাটাবেজ কন্ট্রোল`}
    >
      <div className="space-y-6">
        {/* Verified Admin Status Banner */}
        <div className="p-4 rounded-2xl border border-[var(--border-strong)] bg-[var(--emerald-highlight)] text-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <div>
              <div className="font-bold">অ্যাডমিন অনুমোদিত: {user.email}</div>
              <p className="text-xs text-[var(--text-secondary)]">
                মোট নিবন্ধিত/দৃশ্যমান শিক্ষার্থী: {leaderboard.length} · Supabase Cloud:{' '}
                {supabaseConnected ? 'সংযুক্ত' : 'Vercel এনভায়রনমেন্ট ভ্যারিয়েবল অপেক্ষমাণ'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'chapters', label: 'অধ্যায় যুক্ত/সম্পাদনা' },
              { id: 'lessons', label: 'পাঠ যুক্ত/সম্পাদনা' },
              { id: 'vocab', label: 'শব্দভাণ্ডার পরিচালনা' },
              { id: 'quiz', label: 'কুইজ প্রশ্ন পরিচালনা' },
              { id: 'supabase', label: 'Supabase SQL ও সেটআপ' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium ${
                tab === item.id ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {toast && (
          <div className="p-3 rounded-xl bg-[var(--emerald-highlight)] text-[var(--success)] text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {tab === 'supabase' && (
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[var(--accent)]" />
                <h2 className="text-base font-bold">Supabase SQL Schema (SQL Editor-এ রান করুন)</h2>
              </div>
              <button
                type="button"
                onClick={() => void handleCopySql()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs btn-primary"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'কপি হয়েছে!' : 'সম্পূর্ণ SQL কপি করুন'}</span>
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Supabase ড্যাশবোর্ডের <strong>SQL Editor</strong>-এ নিচের কোডটি পেস্ট করে Run করুন। তারপর Vercel-এ{' '}
              <code>VITE_SUPABASE_URL</code> ও <code>VITE_SUPABASE_ANON_KEY</code> যোগ করলেই সকল শিক্ষার্থীর লগইন, ড্যাশবোর্ড ও লাইভ লিডারবোর্ড ক্লাউডে কাজ শুরু করবে।
            </p>
            <pre className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono-num overflow-x-auto max-h-96 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}

        {tab === 'chapters' && (
          <form onSubmit={handleAddChapter} className="surface-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold">নতুন বা বিদ্যমান অধ্যায় যুক্ত/সম্পাদনা</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">অধ্যায় নম্বর</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={chNum}
                  onChange={(e) => setChNum(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">স্তর (Level 1–6)</label>
                <select
                  value={chLevel}
                  onChange={(e) => setChLevel(Number(e.target.value) as CurriculumLevelNumber)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>Level {n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">ট্র্যাক</label>
                <select
                  value={chTrack}
                  onChange={(e) => setChTrack(e.target.value as LearningTrack)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
                >
                  <option value="MSA">MSA</option>
                  <option value="Quranic">Quranic</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                dir="rtl"
                placeholder="আরবি শিরোনাম (হারাকাতসহ)"
                value={chTitleAr}
                onChange={(e) => setChTitleAr(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-base"
              />
              <input
                type="text"
                placeholder="বাংলা শিরোনাম"
                value={chTitleBn}
                onChange={(e) => setChTitleBn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
              <input
                type="text"
                placeholder="English Title"
                value={chTitleEn}
                onChange={(e) => setChTitleEn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="অধ্যায়ের শিখনফল (বাংলায়)"
              value={chObjBn}
              onChange={(e) => setChObjBn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
            />

            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary">
              <Plus className="w-4 h-4" />
              <span>অধ্যায় সংরক্ষণ করুন</span>
            </button>

            <div className="text-xs text-[var(--text-muted)]">
              কাস্টম অধ্যায় সংখ্যা: {adminContent.customChapters.length}
            </div>
          </form>
        )}

        {tab === 'lessons' && (
          <form onSubmit={handleSaveLesson} className="surface-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold">পাঠ যুক্ত বা হালনাগাদ করুন</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">অধ্যায় (১–১০০)</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={lsChapter}
                  onChange={(e) => setLsChapter(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">পাঠ (১–১০)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={lsNumber}
                  onChange={(e) => setLsNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-mono-num"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                dir="rtl"
                placeholder="পাঠের আরবি শিরোনাম"
                value={lsTitleAr}
                onChange={(e) => setLsTitleAr(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-base"
              />
              <input
                type="text"
                placeholder="পাঠের বাংলা শিরোনাম"
                value={lsTitleBn}
                onChange={(e) => setLsTitleBn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                dir="rtl"
                placeholder="ব্যাকরণ শিরোনাম (আরবি)"
                value={lsGrammarAr}
                onChange={(e) => setLsGrammarAr(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-base"
              />
              <input
                type="text"
                placeholder="ব্যাকরণ শিরোনাম (বাংলা)"
                value={lsGrammarBn}
                onChange={(e) => setLsGrammarBn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
            </div>

            <textarea
              rows={3}
              placeholder="ব্যাকরণের বাংলা ব্যাখ্যা..."
              value={lsGrammarExpBn}
              onChange={(e) => setLsGrammarExpBn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
            />

            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary">
              <Plus className="w-4 h-4" />
              <span>পাঠ সংরক্ষণ করুন</span>
            </button>
          </form>
        )}

        {tab === 'vocab' && (
          <form onSubmit={handleAddVocab} className="surface-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold">ভোকাবুলারি ব্যাংকে নতুন শব্দ যোগ করুন</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                dir="rtl"
                placeholder="আরবি শব্দ (হারাকাতসহ)"
                value={vAr}
                onChange={(e) => setVAr(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-arabic text-lg"
              />
              <input
                type="text"
                placeholder="বাংলা উচ্চারণ"
                value={vPron}
                onChange={(e) => setVPron(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
              <input
                type="text"
                placeholder="বাংলা অর্থ"
                value={vBn}
                onChange={(e) => setVBn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
              <input
                type="text"
                placeholder="English Meaning"
                value={vEn}
                onChange={(e) => setVEn(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
            </div>

            <select
              value={vCat}
              onChange={(e) => setVCat(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
            >
              <option value="Education">Education</option>
              <option value="Greetings">Greetings</option>
              <option value="Quranic Roots">Quranic Roots</option>
              <option value="Verbs">Verbs</option>
              <option value="Daily Life">Daily Life</option>
            </select>

            <div>
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary">
                <Plus className="w-4 h-4" />
                <span>শব্দ যোগ করুন</span>
              </button>
            </div>
          </form>
        )}

        {tab === 'quiz' && (
          <form onSubmit={handleAddQuestion} className="surface-card rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold">নতুন কুইজ প্রশ্ন যোগ করুন</h2>
            <input
              type="text"
              placeholder="প্রশ্ন লিখুন (বাংলায়)..."
              value={qPromptBn}
              onChange={(e) => setQPromptBn(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="অপশন ১" value={qOpt1} onChange={(e) => setQOpt1(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm" />
              <input type="text" placeholder="অপশন ২" value={qOpt2} onChange={(e) => setQOpt2(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm" />
              <input type="text" placeholder="অপশন ৩" value={qOpt3} onChange={(e) => setQOpt3(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm" />
              <input type="text" placeholder="অপশন ৪" value={qOpt4} onChange={(e) => setQOpt4(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={qCorrect}
                onChange={(e) => setQCorrect(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              >
                <option value={1}>সঠিক উত্তর: অপশন ১</option>
                <option value={2}>সঠিক উত্তর: অপশন ২</option>
                <option value={3}>সঠিক উত্তর: অপশন ৩</option>
                <option value={4}>সঠিক উত্তর: অপশন ৪</option>
              </select>
              <input
                type="text"
                placeholder="সঠিক উত্তরের সংক্ষিপ্ত ব্যাখ্যা..."
                value={qExp}
                onChange={(e) => setQExp(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm"
              />
            </div>

            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs btn-primary">
              <Plus className="w-4 h-4" />
              <span>প্রশ্ন সংরক্ষণ করুন</span>
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
};
