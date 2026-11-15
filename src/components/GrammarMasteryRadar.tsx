import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { GRAMMAR_TOPICS } from '../data/grammarData';
import { InterfaceLang, StudentProgress } from '../types/academy';

interface GrammarMasteryRadarProps {
  progress: StudentProgress;
  lang: InterfaceLang;
  grammarTerminologyMode?: 'arabic' | 'bengali';
}

interface RadarDomainDef {
  id: string;
  labelAr: string;
  labelBn: string;
  labelEn: string;
  branch: 'Nahw' | 'Sarf';
  topicIds: string[];
  lessonBoostRange?: [number, number];
}

const RADAR_DOMAINS: RadarDomainDef[] = [
  {
    id: 'kalimah-irab',
    labelAr: 'الكَلِمَةُ وَالإِعْرَابُ',
    labelBn: 'কালিমা ও ই‘রাব',
    labelEn: 'Words & I’rab',
    branch: 'Nahw',
    topicIds: ['kalimah', 'nahw', 'irab', 'ism', 'harf', 'marifah-nakirah'],
    lessonBoostRange: [1, 16],
  },
  {
    id: 'jumlah-ismiyyah',
    labelAr: 'الجُمْلَةُ الإِسْمِيَّةُ',
    labelBn: 'জুমলাহ ইসমীয়্যাহ',
    labelEn: 'Nominal Sentences',
    branch: 'Nahw',
    topicIds: ['jumlah-ismiyyah', 'ism-kana-inna', 'mabadi-qawaid', 'mudhakkar-muannath'],
    lessonBoostRange: [17, 33],
  },
  {
    id: 'jumlah-filiyyah',
    labelAr: 'الجُمْلَةُ الفِعْلِيَّةُ',
    labelBn: 'জুমলাহ ফেলিয়্যাহ',
    labelEn: 'Verbal Sentences',
    branch: 'Nahw',
    topicIds: ['jumlah-filiyyah', 'hal-tamyiz-mafail', 'isharah', 'damair'],
    lessonBoostRange: [34, 50],
  },
  {
    id: 'idafah-tawabi',
    labelAr: 'الإِضَافَةُ وَالتَّوَابِعُ',
    labelBn: 'ইদাফা ও তাওয়াবি',
    labelEn: 'Idafah & Modifiers',
    branch: 'Nahw',
    topicIds: ['idafah', 'mawsuf-sifah', 'mamnu-min-sarf', 'adad-madud', 'balaghah'],
    lessonBoostRange: [51, 67],
  },
  {
    id: 'mizan-sarf',
    labelAr: 'الصَّرْفُ وَالمِيزَانُ',
    labelBn: 'ছরফ ও মীযান',
    labelEn: 'Sarf Morphology',
    branch: 'Sarf',
    topicIds: ['sarf', 'haft-aqsam', 'majhul', 'afal', 'amr-nahi'],
    lessonBoostRange: [68, 84],
  },
  {
    id: 'masadir-ism',
    labelAr: 'المَصَادِرُ وَالجُمُوعُ',
    labelBn: 'মাসদার ও বহুবচন',
    labelEn: 'Masadir & Plurals',
    branch: 'Sarf',
    topicIds: ['jumoo', 'sarf-masadir', 'ism-fail-maful'],
    lessonBoostRange: [85, 100],
  },
];

export const GrammarMasteryRadar: React.FC<GrammarMasteryRadarProps> = ({
  progress,
  lang,
  grammarTerminologyMode = 'arabic',
}) => {
  const isArabicLabels = grammarTerminologyMode === 'arabic';
  const completedSet = useMemo(
    () => new Set(progress.completedGrammarIds || []),
    [progress.completedGrammarIds]
  );

  const avgQuizFactor = useMemo(() => {
    if (!progress.examHistory.length) return 0;
    const avg =
      progress.examHistory.reduce((acc, e) => acc + e.percentage, 0) / progress.examHistory.length;
    return Math.round(avg * 0.2);
  }, [progress.examHistory]);

  const radarData = useMemo(() => {
    const allTopicIds = new Set(GRAMMAR_TOPICS.map((t) => t.id));
    const completedLessons = progress.completedLessonIds || [];

    return RADAR_DOMAINS.map((domain) => {
      const validIds = domain.topicIds.filter((id) => allTopicIds.has(id));
      const matchedPool = validIds.length > 0 ? validIds : domain.topicIds;
      const doneTopics = matchedPool.filter((id) => completedSet.has(id)).length;
      const topicRatio = matchedPool.length > 0 ? (doneTopics / matchedPool.length) * 65 : 0;

      let lessonRatio = 0;
      if (domain.lessonBoostRange) {
        const [minCh, maxCh] = domain.lessonBoostRange;
        const matchedLessons = completedLessons.filter((lid) => {
          const m = /^ch(\d+)-/.exec(lid);
          if (!m) return false;
          const ch = Number(m[1]);
          return ch >= minCh && ch <= maxCh;
        }).length;
        lessonRatio = Math.min(20, matchedLessons * 4);
      }

      const mastery = Math.min(100, Math.max(12, Math.round(12 + topicRatio + lessonRatio + avgQuizFactor * 0.6)));
      const axisLabel =
        lang === 'en'
          ? domain.labelEn
          : isArabicLabels
          ? domain.labelAr
          : domain.labelBn;

      return {
        id: domain.id,
        axisLabel,
        titleBn: domain.labelBn,
        titleAr: domain.labelAr,
        branch: domain.branch,
        mastery,
        completedCount: doneTopics,
        totalCount: matchedPool.length,
      };
    });
  }, [avgQuizFactor, completedSet, isArabicLabels, lang, progress.completedLessonIds]);

  const overallMastery = useMemo(() => {
    if (radarData.length === 0) return 0;
    return Math.round(radarData.reduce((sum, item) => sum + item.mastery, 0) / radarData.length);
  }, [radarData]);

  return (
    <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--accent)]" />
            <span>
              {lang === 'en'
                ? 'Arabic Grammar Mastery Radar (Nahw & Sarf)'
                : 'আরবি ব্যাকরণ দক্ষতা রাডার (নাহু ও ছরফ)'}
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {lang === 'en'
              ? 'Mastery across core syntax (النحو) and morphology (الصرف) topics'
              : 'ব্যাকরণের ৬টি মূল শাখায় (নাহু ও ছরফ) আপনার বর্তমান দক্ষতার মানচিত্র'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono-num font-bold text-[var(--accent)]">
            গড় দক্ষতা: {overallMastery}%
          </span>
          <Link to="/grammar" className="font-semibold text-[var(--accent)] hover:underline">
            ব্যাকরণ পড়ুন →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-7 h-[270px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis
                dataKey="axisLabel"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="দক্ষতা (%)"
                dataKey="mastery"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="#4f46e5"
                fillOpacity={0.28}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0]?.payload as (typeof radarData)[number] | undefined;
                  if (!row) return null;
                  return (
                    <div className="surface-card border border-[var(--border-strong)] rounded-2xl px-3 py-2 shadow-lg text-xs space-y-0.5">
                      <div className="font-arabic font-bold text-sm text-[var(--accent)]" dir="rtl">
                        {row.titleAr}
                      </div>
                      <div className="font-bold text-[var(--text-primary)]">{row.titleBn}</div>
                      <div className="font-mono-num text-[var(--text-secondary)]">
                        দক্ষতা: <strong className="text-[var(--accent)]">{row.mastery}%</strong> ({row.branch})
                      </div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-5 space-y-2.5 text-xs">
          {radarData.map((row) => (
            <div key={row.id} className="space-y-1 pb-2 border-b border-[var(--border-subtle)] last:border-b-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-semibold text-[var(--text-primary)]">{row.titleBn}</span>
                  <span className="ms-1.5 text-[10px] text-[var(--text-muted)]">({row.branch})</span>
                </div>
                <span className="font-mono-num font-bold text-[var(--accent)] shrink-0">
                  {row.mastery}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-surface-alt)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.branch === 'Sarf' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${row.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
