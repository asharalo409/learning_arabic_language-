import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  LocateFixed,
  MapPin,
  MoonStar,
  RefreshCw,
  Sun,
  Volume2,
  Wind,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { IslamicClockDial } from '../components/IslamicClockDial';
import {
  calculatePrayerTimes,
  calculateQiblaBearing,
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
import {
  CompanionPrefs,
  getCompanionPrefs,
  saveCompanionPrefs,
} from '../components/MuslimCompanionStrip';
import { useApp } from '../context/AppContext';

export const PrayerWeatherPage: React.FC = () => {
  const { t, triggerSound, pushNotification } = useApp();
  const [prefs, setPrefs] = useState<CompanionPrefs>(() => getCompanionPrefs());
  const [now, setNow] = useState<Date>(() => new Date());
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [locatingGps, setLocatingGps] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const locationMeta = useMemo(() => {
    if (prefs.cityId === 'custom' && typeof prefs.customLat === 'number' && typeof prefs.customLon === 'number') {
      return {
        nameBn: prefs.customNameBn || 'আমার জিপিএস লোকেশন',
        nameAr: 'موقعي الحالي',
        lat: prefs.customLat,
        lon: prefs.customLon,
        tzOffsetHours: -new Date().getTimezoneOffset() / 60,
      };
    }
    const preset = ISLAMIC_CITIES.find((c) => c.id === prefs.cityId) || ISLAMIC_CITIES[0];
    return preset;
  }, [prefs]);

  const loadWeather = async (lat: number, lon: number) => {
    setLoadingWeather(true);
    const snap = await fetchLiveWeather(lat, lon);
    setWeather(snap);
    setLoadingWeather(false);
  };

  useEffect(() => {
    loadWeather(locationMeta.lat, locationMeta.lon);
  }, [locationMeta.lat, locationMeta.lon]);

  const updatePrefs = (updater: (prev: CompanionPrefs) => CompanionPrefs) => {
    setPrefs((prev) => {
      const next = updater(prev);
      saveCompanionPrefs(next);
      return next;
    });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      pushNotification({
        titleBn: 'জিপিএস সমর্থিত নয়',
        titleEn: 'GPS unavailable',
        bodyBn: 'আপনার ব্রাউজারে লোকেশন সার্ভিস পাওয়া যায়নি; শহর নির্বাচন করুন।',
        bodyEn: 'Geolocation unavailable; please pick a city.',
        category: 'system',
      });
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        triggerSound('success');
        updatePrefs((prev) => ({
          ...prev,
          cityId: 'custom',
          customLat: pos.coords.latitude,
          customLon: pos.coords.longitude,
          customNameBn: `জিপিএস (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)`,
        }));
      },
      () => {
        setLocatingGps(false);
        pushNotification({
          titleBn: 'লোকেশন অনুমতি মেলেনি',
          titleEn: 'Location permission denied',
          bodyBn: 'শহরের তালিকা থেকে আপনার শহর বাছাই করুন।',
          bodyEn: 'Please choose your city from the list.',
          category: 'system',
        });
      },
      { timeout: 8000 }
    );
  };

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
  const qiblaDeg = useMemo(
    () => calculateQiblaBearing(locationMeta.lat, locationMeta.lon),
    [locationMeta.lat, locationMeta.lon]
  );
  const hijriDate = useMemo(() => getHijriDateString(now), [now]);
  const banglaDate = useMemo(() => getBanglaDateString(now), [now]);
  const banglaPeriod = useMemo(() => getBanglaDayPeriod(now), [now]);

  const toggleAdhan = (key: WaqtKey) => {
    triggerSound('click');
    updatePrefs((prev) => ({
      ...prev,
      adhanEnabled: {
        ...prev.adhanEnabled,
        [key]: !prev.adhanEnabled[key],
      },
    }));
  };

  return (
    <AppShell
      title={t.sidebar.prayerWeather}
      subtitle="লাইভ ঘড়ি, ৫ ওয়াক্ত নামাজের সময়সূচি, আজান অ্যালার্ট, কিবলা ও সরাসরি আবহাওয়া"
    >
      <div className="space-y-6">
        {/* Location & Method Toolbar */}
        <div className="surface-card rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl surface-alt border border-[var(--border-subtle)] text-xs font-semibold">
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
              <select
                value={prefs.cityId === 'custom' ? 'custom' : prefs.cityId}
                onChange={(e) => {
                  triggerSound('click');
                  const id = e.target.value;
                  if (id !== 'custom') {
                    updatePrefs((prev) => ({ ...prev, cityId: id }));
                  }
                }}
                className="bg-transparent focus:outline-none font-semibold text-[var(--text-primary)]"
              >
                {ISLAMIC_CITIES.map((city) => (
                  <option key={city.id} value={city.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {city.nameBn}
                  </option>
                ))}
                {prefs.cityId === 'custom' && (
                  <option value="custom" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {locationMeta.nameBn}
                  </option>
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={handleUseGps}
              disabled={locatingGps}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold btn-secondary"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-[var(--accent)] ${locatingGps ? 'animate-spin' : ''}`} />
              <span>{locatingGps ? 'খোঁজা হচ্ছে...' : 'আমার লোকেশন (GPS)'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-full surface-alt border border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  updatePrefs((prev) => ({ ...prev, asrMethod: 'hanafi' }));
                }}
                className={`px-3 py-1 rounded-full font-semibold ${
                  prefs.asrMethod === 'hanafi' ? 'btn-primary' : 'text-[var(--text-secondary)]'
                }`}
              >
                হানাফি (আসর)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  updatePrefs((prev) => ({ ...prev, asrMethod: 'shafii' }));
                }}
                className={`px-3 py-1 rounded-full font-semibold ${
                  prefs.asrMethod === 'shafii' ? 'btn-primary' : 'text-[var(--text-secondary)]'
                }`}
              >
                জমহুর / শাফেয়ী
              </button>
            </div>

            <button
              type="button"
              onClick={() => playAdhanPreview(next.nameAr)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold btn-primary shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>আজান শুনুন</span>
            </button>
          </div>
        </div>

        {/* Top Row: Live Analog/Digital Clock + Next Prayer Hero | Live Weather Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Clock & Next Prayer Hero (Vibrant Sky / Calligraphy Switchable) */}
          <div
            className="lg:col-span-7 rounded-3xl p-6 text-white shadow-xl flex flex-col gap-5 justify-between relative overflow-hidden"
            style={{
              background:
                prefs.dialVariant === 'calligraphy'
                  ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 55%, #0c1938 100%)'
                  : 'linear-gradient(145deg, #0284c7 0%, #2563eb 52%, #1d4ed8 100%)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{hijriDate}</span>
              </div>

              <div className="inline-flex p-0.5 rounded-full bg-black/25 border border-white/15 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    updatePrefs((prev) => ({ ...prev, dialVariant: 'sky' }));
                  }}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    prefs.dialVariant === 'sky' ? 'bg-white text-sky-900 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  নীল আকাশ ঘড়ি
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    updatePrefs((prev) => ({ ...prev, dialVariant: 'calligraphy' }));
                  }}
                  className={`px-3 py-1 rounded-full font-semibold transition-all ${
                    prefs.dialVariant === 'calligraphy' ? 'bg-white text-slate-950 shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  ক্যালিগ্রাফি ঘড়ি
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
              <IslamicClockDial
                now={now}
                variant={prefs.dialVariant}
                sizeClass="w-40 h-40 sm:w-44 sm:h-44"
              />

              <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
                <div>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono-num tracking-tight">
                      {String(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12).padStart(2, '0')}:
                      {String(now.getMinutes()).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-base font-bold font-mono-num text-amber-300">
                        :{String(now.getSeconds()).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold text-white/90 mt-0.5">{banglaPeriod}</span>
                    </div>
                  </div>
                  <div className="text-xs text-white/85 mt-1">
                    {now.toLocaleDateString('bn-BD', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/35 text-xs font-bold">
                    <span>বঙ্গাব্দ: {banglaDate}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-amber-50/90 font-semibold">পরবর্তী ওয়াক্ত</div>
                    <div className="text-base font-extrabold flex items-center gap-2">
                      <span>{next.nameBn}</span>
                      <span className="font-arabic text-lg">{next.nameAr}</span>
                      <span className="font-mono-num text-sm">({next.formattedTime})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-amber-50/90">বাকি সময়</div>
                    <div className="text-lg font-extrabold font-mono-num">
                      {formatCountdown(remainingSeconds)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Weather Card */}
          <div className="lg:col-span-5 surface-card rounded-3xl p-6 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4" />
                  <span>লাইভ আবহাওয়া ({weather?.source === 'live' ? 'সরাসরি' : 'সংরক্ষিত'})</span>
                </div>
                <h2 className="text-base font-bold mt-1">{locationMeta.nameBn}</h2>
              </div>
              <button
                type="button"
                onClick={() => loadWeather(locationMeta.lat, locationMeta.lon)}
                className="p-2 rounded-xl btn-secondary"
                aria-label="আবহাওয়া রিফ্রেশ"
              >
                <RefreshCw className={`w-4 h-4 ${loadingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {weather && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/12 text-sky-500 flex items-center justify-center">
                      {weather.weatherCode >= 50 ? (
                        <CloudRain className="w-8 h-8" />
                      ) : weather.isDay ? (
                        <Sun className="w-8 h-8" />
                      ) : (
                        <MoonStar className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="text-4xl font-bold font-mono-num">{weather.temperatureC}°C</div>
                      <div className="text-xs text-[var(--text-secondary)]">{weather.conditionBn}</div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-[var(--text-muted)] space-y-1 font-mono-num">
                    <div>অনুভূত: {weather.apparentC}°C</div>
                    <div>সর্বোচ্চ/সর্বনিম্ন: {weather.dailyMaxC}°/{weather.dailyMinC}°</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-2xl surface-alt flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span>আর্দ্রতা: <strong className="font-mono-num">{weather.humidity}%</strong></span>
                  </div>
                  <div className="p-2.5 rounded-2xl surface-alt flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-500" />
                    <span>বাতাস: <strong className="font-mono-num">{weather.windKmh} km/h</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {weather.forecast.map((f) => (
                    <div
                      key={f.dateLabel}
                      className="p-2.5 rounded-2xl surface-alt border border-[var(--border-subtle)] text-center space-y-0.5"
                    >
                      <div className="text-[11px] font-bold">{f.dateLabel}</div>
                      <div className="text-xs font-mono-num font-bold text-[var(--accent)]">
                        {f.maxC}° / {f.minC}°
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{f.conditionBn}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: 6-Entry Prayer & Adhan Schedule | Qibla Compass & Dhikr */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prayer Times Table */}
          <div className="lg:col-span-7 surface-card rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold">আজকের নামাজের সময়সূচি ও আজান</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  অ্যাপ খোলা থাকলে নির্ধারিত সময়ে আজানের ধ্বনি ও নোটিফিকেশন স্বয়ংক্রিয়ভাবে বাজবে
                </p>
              </div>
              <span className="text-xs font-arabic text-[var(--accent)]">حَيَّ عَلَى الصَّلَاةِ</span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
              {schedule.map((item) => {
                const isNext = next.key === item.key;
                const adhanOn = prefs.adhanEnabled[item.key];
                return (
                  <div
                    key={item.key}
                    className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                      isNext ? 'bg-[var(--emerald-highlight)]' : 'surface-alt'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isNext
                            ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                            : 'bg-[var(--bg-surface)] text-[var(--accent)]'
                        }`}
                      >
                        <MoonStar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{item.nameBn}</span>
                          <span className="font-arabic text-base text-[var(--accent)]">{item.nameAr}</span>
                          {isNext && (
                            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-bold">
                              পরবর্তী
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {item.hasAdhan ? 'ফরজ ওয়াক্ত' : 'মাকরূহ সূর্যোদয় সময় সূচনা'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm sm:text-base font-bold font-mono-num">
                        {item.formattedTime}
                      </span>

                      {item.hasAdhan && (
                        <>
                          <button
                            type="button"
                            onClick={() => playAdhanPreview(item.nameAr)}
                            className="p-2 rounded-xl btn-secondary"
                            title={`${item.nameBn} আজান শুনুন`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAdhan(item.key)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                              adhanOn ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {adhanOn ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                            <span>{adhanOn ? 'আজান চালু' : 'বন্ধ'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qibla Compass & Quranic Reminder */}
          <div className="lg:col-span-5 surface-card rounded-3xl p-6 flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--accent)]" />
                <span>কিবলার দিক (Qibla)</span>
              </h3>
              <span className="font-mono-num text-sm font-bold text-[var(--accent)]">{qiblaDeg}°</span>
            </div>

            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full">
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="var(--bg-surface-alt)"
                  stroke="var(--border-strong)"
                  strokeWidth="2.5"
                />
                <text x="70" y="20" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="bold">
                  N
                </text>
                <text x="124" y="73" textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                  E
                </text>
                <text x="70" y="129" textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                  S
                </text>
                <text x="16" y="73" textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                  W
                </text>

                <g transform={`rotate(${qiblaDeg} 70 70)`}>
                  <polygon points="70,22 77,70 70,63 63,70" fill="var(--accent)" />
                  <polygon points="70,118 75,70 70,76 65,70" fill="var(--text-muted)" opacity="0.35" />
                  <circle cx="70" cy="22" r="4" fill="#f59e0b" />
                </g>
                <circle cx="70" cy="70" r="5" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="p-4 rounded-2xl surface-alt border border-[var(--border-subtle)] text-center space-y-1.5">
              <div className="text-xs text-[var(--text-secondary)]">
                আপনার অবস্থান ({locationMeta.nameBn}) থেকে পবিত্র কাবা শরীফ উত্তর দিক হতে{' '}
                <strong className="font-mono-num text-[var(--accent)]">{qiblaDeg}°</strong> কোণে অবস্থিত।
              </div>
              <p className="font-arabic text-xl text-[var(--accent)] pt-2" dir="rtl">
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                জেনে রাখো, আল্লাহর স্মরণেই অন্তরসমূহ প্রশান্তি লাভ করে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
