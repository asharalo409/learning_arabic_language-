import React, { useState } from 'react';
import { Award, Lock, Printer } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { useApp } from '../context/AppContext';

export const CertificatesPage: React.FC = () => {
  const { t, lang, progress } = useApp();
  const [selectedCertId, setSelectedCertId] = useState('foundation');

  const certificates = [
    {
      id: 'foundation',
      titleBn: 'আরবি ভাষা ফাউন্ডেশন সার্টিফিকেট',
      titleEn: 'Arabic Foundations Certificate',
      criteriaBn: 'কমপক্ষে ১টি পূর্ণাঙ্গ পাঠ সম্পন্ন করা বা ১৫০+ XP অর্জন করা।',
      unlocked: progress.completedLessonIds.length >= 1 || progress.xp >= 150,
    },
    {
      id: 'grammar',
      titleBn: 'নাহু ও ছরফ ব্যাকরণ দক্ষতা সনদ',
      titleEn: 'Nahw & Sarf Grammar Mastery Certificate',
      criteriaBn: 'কমপক্ষে ৩টি ব্যাকরণ অধ্যায় সম্পন্ন করা।',
      unlocked: progress.completedGrammarIds.length >= 3,
    },
    {
      id: 'quranic',
      titleBn: 'কুরআনিক আরবি ও পরীক্ষা কৃতিত্ব সনদ',
      titleEn: 'Quranic Arabic & Assessment Certificate',
      criteriaBn: '৫০০+ XP এবং অন্তত ১টি পরীক্ষায় ৭০%+ নম্বর অর্জন।',
      unlocked: progress.xp >= 500 && progress.examHistory.some((e) => e.percentage >= 70),
    },
  ];

  const activeCert = certificates.find((c) => c.id === selectedCertId) || certificates[0];

  return (
    <AppShell
      title={t.sidebar.certificates}
      subtitle={
        lang === 'bn'
          ? 'কোর্স ও মাইলফলক সম্পন্ন হলে প্রিন্টযোগ্য একাডেমি সনদ সংগ্রহ করুন'
          : 'Earn and print verified Academy completion certificates'
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          {certificates.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setSelectedCertId(cert.id)}
              className={`text-left p-5 rounded-xl border transition-colors space-y-2 ${
                selectedCertId === cert.id
                  ? 'surface-alt border-[var(--border-strong)]'
                  : 'surface-card hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                {cert.unlocked ? (
                  <Award className="w-5 h-5 text-[var(--accent)]" />
                ) : (
                  <Lock className="w-5 h-5 text-[var(--text-muted)]" />
                )}
                <span className={`text-xs font-semibold ${cert.unlocked ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                  {cert.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <div className="font-bold text-sm">{lang === 'bn' ? cert.titleBn : cert.titleEn}</div>
              <div className="text-xs text-[var(--text-secondary)]">{cert.criteriaBn}</div>
            </button>
          ))}
        </div>

        {/* Certificate Preview */}
        <div className="surface-card rounded-2xl p-8 sm:p-12 border-2 border-[var(--border-strong)] text-center space-y-6">
          <div className="space-y-1">
            <div className="font-arabic text-2xl text-[var(--accent)]" dir="rtl">
              أَكَادِيمِيَّةُ اللُّغَةِ العَرَبِيَّةِ
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
              AI Arabic Academy · Official Completion Record
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold">
            {lang === 'bn' ? activeCert.titleBn : activeCert.titleEn}
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            {lang === 'bn' ? 'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে' : 'This certifies that'}
          </p>

          <div className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">
            {progress.studentName}
          </div>

          {activeCert.unlocked ? (
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              সফলভাবে প্রয়োজনীয় পাঠ, অনুশীলন এবং মূল্যায়ন সম্পন্ন করে {progress.xp} XP ও {progress.completedLessonIds.length}টি পাঠ সমাপ্তির মাধ্যমে এই সনদ অর্জন করেছেন।
            </p>
          ) : (
            <p className="text-sm text-[var(--warning)] max-w-xl mx-auto">
              এই সনদটি এখনো লক করা আছে। শর্ত: {activeCert.criteriaBn}
            </p>
          )}

          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <span className="font-mono-num">Date: {new Date().toLocaleDateString()}</span>
            <span>Track: {progress.preferredTrack}</span>
            <span className="font-mono-num">Certificate ID: AAA-{activeCert.id.toUpperCase()}</span>
          </div>

          {activeCert.unlocked && (
            <div className="pt-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm btn-primary"
              >
                <Printer className="w-4 h-4" />
                <span>সার্টিফিকেট প্রিন্ট / PDF সংরক্ষণ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
