import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, CloudSun, MapPin, MoonStar, Sparkles, Volume2 } from 'lucide-react';
import {
  calculatePrayerTimes,
  fetchLiveWeather,
  formatCountdown,
  getBanglaDateString,
  getBanglaDayPeriod,
  getHijriDateString,
  getNextPrayer,
  ISLAMIC_CITIES,
  playAdhanPreview,
  WaqtKey,
  WeatherSnapshot,
} from '../utils/islamicTimeAndWeather';
import { ClockDialVariant, IslamicClockDial } from './IslamicClockDial';
import { useApp } from '../context/AppContext';

export interface CompanionPrefs {
  cityId: string;
  customLat?: number;
  customLon?: number;
  customNameBn?: string;
  asrMethod: 'hanafi' | 'shafii';
  dialVariant: ClockDialVariant;
  adhanEnabled: Record<WaqtKey, boolean>;
}

const PREFS_KEY = 'aaa_muslim_companion_v1';

export function getCompanionPrefs(): CompanionPrefs {
  const defaults: CompanionPrefs = {
    cityId: 'kushtia',
    asrMethod: 'hanafi',
    dialVariant: 'sky',
    adhanEnabled: {
      fajr: true,
      sunrise: false,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<CompanionPrefs>;
    return {
      ...defaults,
      ...parsed,
      dialVariant: parsed.dialVariant === 'calligraphy' ? 'calligraphy' : 'sky',
      adhanEnabled: { ...defaults.adhanEnabled, ...(parsed.adhanEnabled || {}) },
    };
  } catch {
    return defaults;
  }
}

export function saveCompanionPrefs(prefs: CompanionPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('aaa:companion-prefs', { detail: prefs }));
  } catch {
    // ignore storage errors
  }
}

export const MuslimCompanionStrip: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { pushNotification, triggerSound } = useApp();
  const [prefs, setPrefs] = useState<CompanionPrefs>(() => getCompanionPrefs());
  const [now, setNow] = useState<Date>(() => new Date());
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    const handlePrefsSync = () => setPrefs(getCompanionPrefs());
    window.addEventListener('aaa:companion-prefs', handlePrefsSync);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener('aaa:companion-prefs', handlePrefsSync);
      window.clearInterval(timer);
    };
  }, []);

  const locationMeta = useMemo(() => {
    if (prefs.cityId === 'custom' && typeof prefs.customLat === 'number' && typeof prefs.customLon === 'number') {
      return {
        nameBn: prefs.customNameBn || 'আমার লোকেশন',
        lat: prefs.customLat,
        lon: prefs.customLon,
        tzOffsetHours: -new Date().getTimezoneOffset() / 60,
      };
    }
    const preset = ISLAMIC_CITIES.find((c) => c.id === prefs.cityId) || ISLAMIC_CITIES[0];
    return {
      nameBn: preset.nameBn,
      lat: preset.lat,
      lon: preset.lon,
      tzOffsetHours: preset.tzOffsetHours,
    };
  }, [prefs]);

  useEffect(() => {
    let active = true;
    fetchLiveWeather(locationMeta.lat, locationMeta.lon).then((snap) => {
      if (active) setWeather(snap);
    });
    return () => {
      active = false;
    };
  }, [locationMeta.lat, locationMeta.lon]);

  const schedule = useMemo(
    () =>
      calculatePrayerTimes(
        now,
        locationMeta.lat,
        locationMeta.lon,
        locationMeta.tzOffsetHours,
        prefs.asrMethod
      ),
    [locationMeta.lat, locationMeta.lon, locationMeta.tzOffsetHours, now, prefs.asrMethod]
  );

  const { next, remainingSeconds } = useMemo(() => getNextPrayer(now, schedule), [now, schedule]);
  const hijriDate = useMemo(() => getHijriDateString(now), [now]);
  const banglaDate = useMemo(() => getBanglaDateString(now), [now]);
  const banglaPeriod = useMemo(() => getBanglaDayPeriod(now), [now]);

  // Automatic exact-minute Adhan check while the app is open
  useEffect(() => {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const todayKey = now.toISOString().slice(0, 10);
    for (const p of schedule) {
      if (p.hasAdhan && prefs.adhanEnabled[p.key] && p.minutesFromMidnight === nowMin) {
        const triggerKey = `aaa_adhan_fired_${todayKey}_${p.key}`;
        if (!sessionStorage.getItem(triggerKey)) {
          sessionStorage.setItem(triggerKey, '1');
          playAdhanPreview(p.nameAr);
          pushNotification(
            {
              titleBn: `আজান: ${p.nameBn} (${p.formattedTime})`,
              titleEn: `Adhan: ${p.key} (${p.formattedTime})`,
              bodyBn: `${locationMeta.nameBn} — এখন ${p.nameBn} নামাজের ওয়াক্ত শুরু হয়েছে।`,
              bodyEn: `Prayer time has started for ${p.key}.`,
              category: 'reminder',
            },
            true
          );
        }
      }
    }
  }, [pushNotification, locationMeta.nameBn, now, prefs.adhanEnabled, schedule]);

  const hour12 = String(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12).padStart(2, '0');
  const minStr = String(now.getMinutes()).padStart(2, '0');
  const secStr = String(now.getSeconds()).padStart(2, '0');

  const handleToggleDial = (variant: ClockDialVariant) => {
    triggerSound('click');
    const nextPrefs: CompanionPrefs = { ...prefs, dialVariant: variant };
    setPrefs(nextPrefs);
    saveCompanionPrefs(nextPrefs);
  };

  return (
    <div
      className="rounded-3xl p-4 sm:p-6 text-white shadow-xl border border-white/25 relative overflow-hidden"
      style={{
        background:
          prefs.dialVariant === 'calligraphy'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #0c1938 100%)'
            : 'linear-gradient(135deg, #0284c7 0%, #2563eb 52%, #1d4ed8 100%)',
      }}
    >
      {/* Subtle Ambient Sky Glow */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-white/12 blur-2xl pointer-events-none"
      />

      <div className="relative z-10 space-y-4">
        {/* Top Control Row: City Location + Switchable Clock Dial Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{locationMeta.nameBn}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="inline-flex p-0.5 rounded-full bg-black/20 border border-white/15 text-[11px]">
              <button
                type="button"
                onClick={() => handleToggleDial('sky')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  prefs.dialVariant === 'sky' ? 'bg-white text-sky-900 shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                নীল আকাশ ঘড়ি
              </button>
              <button
                type="button"
                onClick={() => handleToggleDial('calligraphy')}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  prefs.dialVariant === 'calligraphy' ? 'bg-white text-slate-950 shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                ক্যালিগ্রাফি ঘড়ি
              </button>
            </div>

            <button
              type="button"
              onClick={() => playAdhanPreview(next.nameAr)}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              title="আজান শুনুন"
              aria-label="আজান শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-200" />
            </button>
          </div>
        </div>

        {/* Center Hero Stage: Left Analog Clock Dial | Right Big Digital Time & Weather */}
        <div className={`flex ${compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row'} items-center justify-between gap-5`}>
          <div className="flex items-center gap-4 sm:gap-6">
            <IslamicClockDial
              now={now}
              variant={prefs.dialVariant}
              sizeClass="w-32 h-32 sm:w-36 sm:h-36"
            />

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono-num tracking-tight">
                  {hour12}:{minStr}
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-sm sm:text-base font-bold font-mono-num text-amber-300">:{secStr}</span>
                  <span className="text-xs font-bold text-white/90 mt-0.5">{banglaPeriod}</span>
                </div>
              </div>

              <div className="text-xs text-white/85 font-medium">
                {now.toLocaleDateString('bn-BD', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>

              <div className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-amber-100">
                <CloudSun className="w-4 h-4 text-amber-300" />
                <span className="font-mono-num">{weather ? `${weather.temperatureC}°C` : '২৮°C'}</span>
                <span>·</span>
                <span>{weather ? weather.conditionBn : 'উজ্জ্বল আকাশ'}</span>
              </div>
            </div>
          </div>

          <Link
            to="/prayer-weather"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg hover:bg-sky-50 transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>৫ ওয়াক্ত, কিবলা ও আবহাওয়া</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom 3 Colorful Pills (Bangla Date | Hijri Date | Orange Next Prayer Countdown) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="rounded-2xl px-3.5 py-2.5 bg-emerald-500/28 border border-emerald-300/35 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-emerald-200 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-emerald-100/80">বঙ্গাব্দ</div>
              <div className="text-xs font-bold truncate">{banglaDate}</div>
            </div>
          </div>

          <div className="rounded-2xl px-3.5 py-2.5 bg-white/15 border border-white/25 flex items-center gap-2.5">
            <MoonStar className="w-4 h-4 text-amber-200 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-white/75">হিজরি তারিখ</div>
              <div className="text-xs font-bold truncate">{hijriDate}</div>
            </div>
          </div>

          <Link
            to="/prayer-weather"
            className="rounded-2xl px-3.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-between gap-2 hover:brightness-105 transition"
          >
            <div className="min-w-0">
              <div className="text-[10px] text-amber-50/90 font-semibold">পরবর্তী ওয়াক্ত · {next.nameBn}</div>
              <div className="text-xs font-extrabold font-mono-num truncate">
                {next.formattedTime} · -{formatCountdown(remainingSeconds)}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
};
