import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { InterfaceLang, WeeklyVelocityPoint } from '../types/academy';

interface LearningVelocityChartProps {
  data: WeeklyVelocityPoint[];
  lang: InterfaceLang;
}

export const LearningVelocityChart: React.FC<LearningVelocityChartProps> = ({ data, lang }) => {
  const summary = useMemo(() => {
    const totalLessons = data.reduce((acc, d) => acc + d.lessonsCompleted, 0);
    const avgPerWeek = data.length > 0 ? (totalLessons / data.length).toFixed(1) : '0.0';
    const currentWeek = data[data.length - 1]?.lessonsCompleted ?? 0;
    return { totalLessons, avgPerWeek, currentWeek };
  }, [data]);

  return (
    <div className="surface-card rounded-3xl p-5 sm:p-6 space-y-5 border border-[var(--border-subtle)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            <span>
              {lang === 'en'
                ? 'Learning Velocity (Lessons Completed / Week)'
                : 'শেখার গতি (Learning Velocity — সাপ্তাহিক সম্পন্ন পাঠ)'}
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {lang === 'en'
              ? 'Number of lessons completed each week across the past 6 weeks'
              : 'গত ৬ সপ্তাহে প্রতি সপ্তাহে সম্পন্ন করা পাঠের সংখ্যা (লক্ষ্য: প্রতি সপ্তাহে ৩+ পাঠ)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono-num">
          <div>
            <span className="text-[var(--text-muted)]">এই সপ্তাহ: </span>
            <strong className="text-emerald-500">{summary.currentWeek} পাঠ</strong>
          </div>
          <span className="text-[var(--border-strong)]">·</span>
          <div>
            <span className="text-[var(--text-muted)]">সাপ্তাহিক গড়: </span>
            <strong className="text-sky-500">{summary.avgPerWeek} পাঠ</strong>
          </div>
          <span className="text-[var(--border-strong)]">·</span>
          <div>
            <span className="text-[var(--text-muted)]">৬ সপ্তাহে মোট: </span>
            <strong className="text-[var(--accent)]">{summary.totalLessons}</strong>
          </div>
        </div>
      </div>

      <div className="w-full h-[260px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} margin={{ top: 12, right: 16, left: -12, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <ReferenceLine
              y={3}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: lang === 'en' ? 'Goal: 3/wk' : 'লক্ষ্য: ৩',
                position: 'right',
                fill: '#10b981',
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg-surface-alt)', opacity: 0.45 }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const row = payload[0]?.payload as WeeklyVelocityPoint | undefined;
                if (!row) return null;
                return (
                  <div className="surface-card border border-[var(--border-strong)] rounded-2xl px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">
                      {row.weekLabel} ({row.rangeLabel})
                    </div>
                    <div className="flex items-center justify-between gap-4 font-mono-num">
                      <span className="text-[var(--text-secondary)]">সম্পন্ন পাঠ:</span>
                      <span className="font-bold text-sky-500">{row.lessonsCompleted} টি</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      সাপ্তাহিক লক্ষ্য: {row.target} পাঠ
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="lessonsCompleted" name="সম্পন্ন পাঠ" radius={[10, 10, 0, 0]} maxBarSize={44}>
              {data.map((entry, idx) => {
                const isLatest = idx === data.length - 1;
                const hitTarget = entry.lessonsCompleted >= entry.target;
                const fill = isLatest
                  ? '#10b981'
                  : hitTarget
                  ? '#0ea5e9'
                  : '#6366f1';
                return <Cell key={entry.weekKey} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
