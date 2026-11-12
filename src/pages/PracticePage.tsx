import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ClipboardCheck, GraduationCap, Headphones, Layers, Mic, ScrollText } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { AudioButton } from '../components/AudioButton';
import { useApp } from '../context/AppContext';

const SENTENCE_BUILDER_DRILLS = [
  {
    promptBn: 'সাজিয়ে লিখুন: "ছাত্রটি মসজিদে যাচ্ছে"',
    words: ['يَذْهَبُ', 'الطَّالِبُ', 'إِلَى', 'المَسْجِدِ'],
    correct: 'يَذْهَبُ الطَّالِبُ إِلَى المَسْجِدِ',
  },
  {
    promptBn: 'সাজিয়ে লিখুন: "জ্ঞান একটি আলো"',
    words: ['العِلْمُ', 'نُورٌ'],
    correct: 'العِلْمُ نُورٌ',
  },
];

export const PracticePage: React.FC = () => {
  const { t, lang, awardXp } = useApp();
  const [drillIdx, setDrillIdx] = useState(0);
  const [pickedWords, setPickedWords] = useState<string[]>([]);
  const [checked, setChecked] = useState<'correct' | 'wrong' | null>(null);

  const drill = SENTENCE_BUILDER_DRILLS[drillIdx];

  const availableWords = drill.words.filter(
    (w) => pickedWords.filter((p) => p === w).length < drill.words.filter((x) => x === w).length
  );

  const handleCheckSentence = () => {
    const built = pickedWords.join(' ').trim();
    if (built === drill.correct) {
      setChecked('correct');
      awardXp(15, {
        titleBn: 'বাক্য গঠন অনুশীলন সম্পন্ন',
        titleEn: 'Completed sentence builder drill',
        type: 'lesson',
      });
    } else {
      setChecked('wrong');
    }
  };

  const modules = [
    { to: '/listening', title: t.sidebar.listening, desc: 'অডিও শুনে অর্থ যাচাই ও ধীর গতির প্লেব্যাক', icon: Headphones },
    { to: '/speaking', title: t.sidebar.speaking, desc: 'মাইক্রোফোনে আরবি বলা ও AI সংশোধন', icon: Mic },
    { to: '/grammar', title: t.sidebar.grammar, desc: '১৪টি নাহু ও ছরফ মডিউল অনুশীলন', icon: GraduationCap },
    { to: '/quranic-arabic', title: t.sidebar.quranic, desc: 'কুরআনিক শব্দ ও মূলধাতু বিশ্লেষণ', icon: ScrollText },
    { to: '/vocabulary', title: t.sidebar.vocabulary, desc: 'স্পেসড রিপিটেশন ফ্ল্যাশকার্ড', icon: Layers },
    { to: '/quiz', title: t.sidebar.quiz, desc: 'পূর্ণাঙ্গ পরীক্ষা ও সময়-নির্ধারিত কুইজ', icon: ClipboardCheck },
  ];

  return (
    <AppShell
      title={t.sidebar.practice}
      subtitle={
        lang === 'bn'
          ? 'বাক্য গঠন অনুশীলন এবং সকল স্কিল-ল্যাবের সমন্বিত কেন্দ্র'
          : 'Sentence builder drill and central hub for all Arabic practice labs'
      }
    >
      <div className="space-y-8">
        {/* Interactive Arabic Sentence Builder */}
        <div className="surface-card rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[var(--accent)] font-medium">ইন্টারঅ্যাক্টিভ বাক্য গঠন</span>
              <h2 className="text-lg font-bold mt-0.5">{drill.promptBn}</h2>
            </div>
            <AudioButton text={drill.correct} compact />
          </div>

          {/* Drop Zone */}
          <div
            className="min-h-[64px] p-4 rounded-xl surface-alt flex flex-wrap items-center gap-2"
            dir="rtl"
          >
            {pickedWords.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] font-bengali" dir="ltr">
                নিচের শব্দগুলোতে ক্লিক করে শুদ্ধ আরবি বাক্যটি সাজান...
              </span>
            ) : (
              pickedWords.map((w, i) => (
                <button
                  key={`${w}-${i}`}
                  type="button"
                  onClick={() => {
                    setPickedWords((prev) => prev.filter((_, idx) => idx !== i));
                    setChecked(null);
                  }}
                  className="px-3.5 py-2 rounded-lg btn-primary font-arabic text-xl"
                >
                  {w}
                </button>
              ))
            )}
          </div>

          {/* Word Bank */}
          <div className="flex flex-wrap gap-2" dir="rtl">
            {[...availableWords].reverse().map((w, i) => (
              <button
                key={`${w}-bank-${i}`}
                type="button"
                onClick={() => {
                  setPickedWords((prev) => [...prev, w]);
                  setChecked(null);
                }}
                className="px-3.5 py-2 rounded-lg btn-secondary font-arabic text-xl"
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheckSentence}
              disabled={pickedWords.length === 0}
              className="px-4 py-2 rounded-lg text-xs btn-primary disabled:opacity-50"
            >
              যাচাই করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setPickedWords([]);
                setChecked(null);
                setDrillIdx((i) => (i + 1) % SENTENCE_BUILDER_DRILLS.length);
              }}
              className="px-4 py-2 rounded-lg text-xs btn-secondary"
            >
              পরবর্তী বাক্য
            </button>
            {checked === 'correct' && (
              <span className="text-xs font-semibold text-[var(--success)]">
                মাশাআল্লাহ! একদম সঠিক বাক্য গঠন হয়েছে (+15 XP)।
              </span>
            )}
            {checked === 'wrong' && (
              <span className="text-xs font-semibold text-[var(--warning)]">
                শব্দক্রম আবার চেষ্টা করুন (টিপস: ক্রিয়া + ফায়েল + হরফে জার + ইসম)।
              </span>
            )}
          </div>
        </div>

        {/* All Practice Labs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.to}
                to={m.to}
                className="surface-card rounded-xl p-5 space-y-2 hover:border-[var(--border-strong)] transition-colors"
              >
                <Icon className="w-5 h-5 text-[var(--accent)]" />
                <div className="text-base font-bold">{m.title}</div>
                <p className="text-xs text-[var(--text-secondary)]">{m.desc}</p>
              </Link>
            );
          })}
        </div>

        <div className="surface-alt rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[var(--accent)]" />
            <div>
              <div className="text-sm font-semibold">ব্যক্তিগতকৃত অনুশীলন চান?</div>
              <div className="text-xs text-[var(--text-secondary)]">
                AI শিক্ষককে আপনার দুর্বল দিক বললে সাথে সাথে নতুন অনুশীলন তৈরি করে দেবে।
              </div>
            </div>
          </div>
          <Link to="/ai-teacher" className="px-4 py-2 rounded-lg text-xs btn-primary">
            AI শিক্ষক খুলুন
          </Link>
        </div>
      </div>
    </AppShell>
  );
};
