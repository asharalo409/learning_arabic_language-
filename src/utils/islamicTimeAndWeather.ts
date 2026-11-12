import { speakText } from './speech';

export interface CityPreset {
  id: string;
  nameBn: string;
  nameAr: string;
  lat: number;
  lon: number;
  tzOffsetHours: number;
}

export const ISLAMIC_CITIES: CityPreset[] = [
  { id: 'kushtia', nameBn: 'কুষ্টিয়া (ইসলামী বিশ্ববিদ্যালয়)', nameAr: 'كوشتيا', lat: 23.7231, lon: 89.1526, tzOffsetHours: 6 },
  { id: 'dhaka', nameBn: 'ঢাকা', nameAr: 'دكا', lat: 23.8103, lon: 90.4125, tzOffsetHours: 6 },
  { id: 'chattogram', nameBn: 'চট্টগ্রাম', nameAr: 'شيتاغونغ', lat: 22.3569, lon: 91.7832, tzOffsetHours: 6 },
  { id: 'sylhet', nameBn: 'সিলেট', nameAr: 'سيلهيت', lat: 24.8949, lon: 91.8687, tzOffsetHours: 6 },
  { id: 'rajshahi', nameBn: 'রাজশাহী', nameAr: 'راجشاهي', lat: 24.3745, lon: 88.6042, tzOffsetHours: 6 },
  { id: 'khulna', nameBn: 'খুলনা', nameAr: 'خولنا', lat: 22.8456, lon: 89.5403, tzOffsetHours: 6 },
  { id: 'makkah', nameBn: 'মক্কা মুকাররামা', nameAr: 'مكة المكرمة', lat: 21.4225, lon: 39.8262, tzOffsetHours: 3 },
  { id: 'madinah', nameBn: 'মদীনা মুনাওয়ারা', nameAr: 'المدينة المنورة', lat: 24.4672, lon: 39.6111, tzOffsetHours: 3 },
];

export type WaqtKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeEntry {
  key: WaqtKey;
  nameBn: string;
  nameAr: string;
  minutesFromMidnight: number;
  formattedTime: string;
  hasAdhan: boolean;
}

export interface WeatherSnapshot {
  temperatureC: number;
  apparentC: number;
  humidity: number;
  windKmh: number;
  weatherCode: number;
  conditionBn: string;
  isDay: boolean;
  dailyMaxC: number;
  dailyMinC: number;
  forecast: {
    dateLabel: string;
    maxC: number;
    minC: number;
    code: number;
    conditionBn: string;
  }[];
  source: 'live' | 'fallback';
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function fixAngle(a: number): number {
  let res = a - 360 * Math.floor(a / 360);
  if (res < 0) res += 360;
  return res;
}

function fixHour(h: number): number {
  let res = h - 24 * Math.floor(h / 24);
  if (res < 0) res += 24;
  return res;
}

function julianDate(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

function sunPosition(jd: number): { declination: number; eqTime: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * Math.sin(g * DEG2RAD) + 0.02 * Math.sin(2 * g * DEG2RAD));
  const e = 23.439 - 0.00000036 * D;
  const RA =
    (Math.atan2(Math.cos(e * DEG2RAD) * Math.sin(L * DEG2RAD), Math.cos(L * DEG2RAD)) * RAD2DEG) / 15;
  const declination = Math.asin(Math.sin(e * DEG2RAD) * Math.sin(L * DEG2RAD)) * RAD2DEG;
  const eqTime = q / 15 - fixHour(RA);
  return { declination, eqTime };
}

function sunAngleTime(
  angleDeg: number,
  lat: number,
  declination: number,
  midDay: number,
  isMorning: boolean
): number {
  const cosHour =
    (-Math.sin(angleDeg * DEG2RAD) - Math.sin(lat * DEG2RAD) * Math.sin(declination * DEG2RAD)) /
    (Math.cos(lat * DEG2RAD) * Math.cos(declination * DEG2RAD));
  const clamped = Math.max(-0.999, Math.min(0.999, cosHour));
  const t = (Math.acos(clamped) * RAD2DEG) / 15;
  return midDay + (isMorning ? -t : t);
}

function asrTime(factor: 1 | 2, lat: number, declination: number, midDay: number): number {
  const angle = -Math.atan(1 / (factor + Math.tan(Math.abs(lat - declination) * DEG2RAD))) * RAD2DEG;
  const cosHour =
    (Math.sin(angle * DEG2RAD) - Math.sin(lat * DEG2RAD) * Math.sin(declination * DEG2RAD)) /
    (Math.cos(lat * DEG2RAD) * Math.cos(declination * DEG2RAD));
  const clamped = Math.max(-0.999, Math.min(0.999, cosHour));
  const t = (Math.acos(clamped) * RAD2DEG) / 15;
  return midDay + t;
}

export function formatMinutes12h(totalMins: number): string {
  const normalized = ((Math.round(totalMins) % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lon: number,
  tzOffsetHours: number,
  asrMethod: 'hanafi' | 'shafii' = 'hanafi'
): PrayerTimeEntry[] {
  const jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lon / (15 * 24);
  const { declination, eqTime } = sunPosition(jd + 0.5);

  const midDay = fixHour(12 + tzOffsetHours - lon / 15 - eqTime);
  const fajrH = sunAngleTime(18, lat, declination, midDay, true);
  const sunriseH = sunAngleTime(0.833, lat, declination, midDay, true);
  const dhuhrH = midDay + 2 / 60;
  const asrH = asrTime(asrMethod === 'hanafi' ? 2 : 1, lat, declination, midDay);
  const maghribH = sunAngleTime(0.833, lat, declination, midDay, false) + 2 / 60;
  const ishaH = sunAngleTime(18, lat, declination, midDay, false);

  const toMins = (h: number) => Math.round(fixHour(h) * 60);

  return [
    { key: 'fajr', nameBn: 'ফজর', nameAr: 'الفَجْرُ', minutesFromMidnight: toMins(fajrH), formattedTime: formatMinutes12h(toMins(fajrH)), hasAdhan: true },
    { key: 'sunrise', nameBn: 'সূর্যোদয়', nameAr: 'الشُّرُوقُ', minutesFromMidnight: toMins(sunriseH), formattedTime: formatMinutes12h(toMins(sunriseH)), hasAdhan: false },
    { key: 'dhuhr', nameBn: 'যোহর', nameAr: 'الظُّهْرُ', minutesFromMidnight: toMins(dhuhrH), formattedTime: formatMinutes12h(toMins(dhuhrH)), hasAdhan: true },
    { key: 'asr', nameBn: 'আসর', nameAr: 'العَصْرُ', minutesFromMidnight: toMins(asrH), formattedTime: formatMinutes12h(toMins(asrH)), hasAdhan: true },
    { key: 'maghrib', nameBn: 'মাগরিব', nameAr: 'المَغْرِبُ', minutesFromMidnight: toMins(maghribH), formattedTime: formatMinutes12h(toMins(maghribH)), hasAdhan: true },
    { key: 'isha', nameBn: 'ইশা', nameAr: 'العِشَاءُ', minutesFromMidnight: toMins(ishaH), formattedTime: formatMinutes12h(toMins(ishaH)), hasAdhan: true },
  ];
}

export function getNextPrayer(
  now: Date,
  schedule: PrayerTimeEntry[]
): { next: PrayerTimeEntry; remainingSeconds: number } {
  const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const adhanPrayers = schedule.filter((p) => p.hasAdhan);
  for (const p of adhanPrayers) {
    const targetSecs = p.minutesFromMidnight * 60;
    if (targetSecs > nowSecs) {
      return { next: p, remainingSeconds: targetSecs - nowSecs };
    }
  }
  const first = adhanPrayers[0] || schedule[0];
  return {
    next: first,
    remainingSeconds: 86400 - nowSecs + first.minutesFromMidnight * 60,
  };
}

export function formatCountdown(totalSecs: number): string {
  const s = Math.max(0, Math.floor(totalSecs));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function calculateQiblaBearing(lat: number, lon: number): number {
  const makkahLat = 21.4225 * DEG2RAD;
  const makkahLon = 39.8262 * DEG2RAD;
  const userLat = lat * DEG2RAD;
  const dLon = makkahLon - lon * DEG2RAD;
  const y = Math.sin(dLon);
  const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(dLon);
  return Math.round(fixAngle(Math.atan2(y, x) * RAD2DEG));
}

export function getHijriDateString(date: Date): string {
  try {
    return new Intl.DateTimeFormat('bn-BD-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'হিজরি ১৪৪৮';
    }
  }
}

export function wmoCodeToBengali(code: number): string {
  if (code === 0) return 'উজ্জ্বল ও পরিষ্কার আকাশ';
  if (code <= 2) return 'আংশিক মেঘলা আকাশ';
  if (code === 3) return 'মেঘাচ্ছন্ন আকাশ';
  if (code <= 48) return 'হালকা কুয়াশাচ্ছন্ন';
  if (code <= 57) return 'গুঁড়ি গুঁড়ি বৃষ্টি';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'বৃষ্টিপাত';
  if (code >= 95) return 'বজ্রসহ বৃষ্টি';
  return 'স্বাভাবিক আবহাওয়া';
}

export async function fetchLiveWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API unavailable');
    const data = await res.json();
    const cur = data.current || {};
    const daily = data.daily || {};
    const times: string[] = Array.isArray(daily.time) ? daily.time : [];

    return {
      temperatureC: Math.round(Number(cur.temperature_2m ?? 28)),
      apparentC: Math.round(Number(cur.apparent_temperature ?? 30)),
      humidity: Math.round(Number(cur.relative_humidity_2m ?? 64)),
      windKmh: Math.round(Number(cur.wind_speed_10m ?? 9)),
      weatherCode: Number(cur.weather_code ?? 1),
      conditionBn: wmoCodeToBengali(Number(cur.weather_code ?? 1)),
      isDay: cur.is_day !== 0,
      dailyMaxC: Math.round(Number(daily.temperature_2m_max?.[0] ?? 31)),
      dailyMinC: Math.round(Number(daily.temperature_2m_min?.[0] ?? 22)),
      forecast: times.slice(1, 4).map((iso, i) => ({
        dateLabel: new Date(iso).toLocaleDateString('bn-BD', { weekday: 'short' }),
        maxC: Math.round(Number(daily.temperature_2m_max?.[i + 1] ?? 31)),
        minC: Math.round(Number(daily.temperature_2m_min?.[i + 1] ?? 22)),
        code: Number(daily.weather_code?.[i + 1] ?? 1),
        conditionBn: wmoCodeToBengali(Number(daily.weather_code?.[i + 1] ?? 1)),
      })),
      source: 'live',
    };
  } catch {
    return {
      temperatureC: 27,
      apparentC: 29,
      humidity: 66,
      windKmh: 8,
      weatherCode: 1,
      conditionBn: 'আংশিক মেঘলা ও স্নিগ্ধ আকাশ',
      isDay: true,
      dailyMaxC: 31,
      dailyMinC: 21,
      forecast: [
        { dateLabel: 'আগামীকাল', maxC: 31, minC: 22, code: 0, conditionBn: 'উজ্জ্বল আকাশ' },
        { dateLabel: 'পরশু', maxC: 30, minC: 21, code: 2, conditionBn: 'হালকা মেঘ' },
        { dateLabel: '৩য় দিন', maxC: 29, minC: 21, code: 1, conditionBn: 'পরিষ্কার' },
      ],
      source: 'fallback',
    };
  }
}

export function playAdhanPreview(waqtNameAr?: string): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      // Soothing Hijaz-mode resonant Adhan call tones before Arabic speech
      const notes = [293.66, 311.13, 369.99, 392.0, 440.0, 392.0, 369.99, 293.66];
      notes.forEach((freq, idx) => {
        const start = ctx.currentTime + idx * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.09, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    }
  } catch {
    // ignore AudioContext limitations
  }

  const text = waqtNameAr
    ? `حَانَ الآنَ مَوْعِدُ صَلَاةِ ${waqtNameAr}، اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ`
    : 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، حَيَّ عَلَى الصَّلَاةِ، حَيَّ عَلَى الْفَلَاحِ';
  window.setTimeout(() => {
    speakText(text, 'ar-SA', { rate: 0.85 });
  }, 900);
}
