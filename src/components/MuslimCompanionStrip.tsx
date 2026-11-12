import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, Clock, CloudSun, MapPin, MoonStar, Volume2 } from 'lucide-react';
import {
  calculatePrayerTimes,
  fetchLiveWeather,
  formatCountdown,
  getHijriDateString,
  getNextPrayer,
  ISLAMIC_CITIES,
  playAdhanPreview,
  WaqtKey,
  WeatherSnapshot,
} from '../utils/islamicTimeAndWeather';
import { useApp } from '../context/AppContext';

export interface CompanionPrefs {
  cityId: string;
  customLat?: number;
  customLon?: number;
  customNameBn?: string;
  asrMethod: 'hanafi' | 'shafii';
  adhanEnabled: Record<WaqtKey, boolean>;
}

const PREFS_KEY = 'aaa_muslim_companion_v1';

export function getCompanionPrefs(): CompanionPrefs {
  const defaults: CompanionPrefs = {
    cityId: 'kushtia',
    asrMethod: 'hanafi',
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
  const { pushNotification } = useApp();
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

  const clockStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="surface-card rounded-3xl p-4 sm:p-5 border border-[var(--border-strong)] shadow-sm">
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-3' : 'lg:grid-cols-12'} gap-4 items-center`}>
        {/* Live Clock & Hijri Date */}
        <div className={`${compact ? '' : 'lg:col-span-4'} flex items-center gap-3.5 min-w-0`}>
          <div className="w-11 h-11 rounded-2xl bg-[var(--emerald-highlight)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold font-mono-num tracking-tight">{clockStr}</div>
            <div className="text-[11px] text-[var(--text-muted)] truncate">
              {hijriDate} · {now.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>

        {/* Next Prayer & Countdown */}
        <div className={`${compact ? '' : 'lg:col-span-4'} flex items-center justify-between gap-3 p-3 rounded-2xl surface-alt border border-[var(--border-subtle)]`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <MoonStar className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] text-[var(--text-muted)]">পরবর্তী নামাজ · {next.nameBn}</div>
              <div className="text-sm font-bold font-mono-num">
                {next.formattedTime}{' '}
                <span className="text-xs font-medium text-[var(--accent)]">(-{formatCountdown(remainingSeconds)})</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => playAdhanPreview(next.nameAr)}
            className="p-2 rounded-xl btn-secondary shrink-0"
            title="আজান শুনুন"
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          </button>
        </div>

        {/* Live Weather + Hub Link */}
        <div className={`${compact ? '' : 'lg:col-span-4'} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/12 text-sky-500 flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold font-mono-num flex items-center gap-1.5">
                <span>{weather ? `${weather.temperatureC}°C` : '২৭°C'}</span>
                <span className="text-xs font-normal text-[var(--text-secondary)] truncate">
                  {weather ? weather.conditionBn : 'স্নিগ্ধ আকাশ'}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{locationMeta.nameBn}</span>
              </div>
            </div>
          </div>

          <Link
            to="/prayer-weather"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold btn-primary shrink-0 whitespace-nowrap"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>সব ওয়াক্ত</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
