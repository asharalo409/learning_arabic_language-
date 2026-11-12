export interface AcademyNotification {
  id: string;
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
  timestampIso: string;
  read: boolean;
  category: 'welcome' | 'reminder' | 'achievement' | 'system';
}

export interface ReminderSettings {
  enabled: boolean;
  timeHHMM: string; // e.g. "20:30"
  lastReminderDate?: string;
}

const NOTIF_STORAGE_KEY = 'aaa_notifications_list_v1';
const REMINDER_STORAGE_KEY = 'aaa_reminder_settings_v1';

export function getStoredNotifications(): AcademyNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'notif-welcome-1',
          titleBn: 'আসসালামু আলাইকুম! AI Arabic Academy-তে স্বাগতম',
          titleEn: 'Assalamu Alaikum! Welcome to AI Arabic Academy',
          bodyBn: 'প্রতিদিন ১০–১৫ মিনিট আরবি ও কুরআনিক পাঠ অনুশীলন করে আপনার স্ট্রিক ধরে রাখুন।',
          bodyEn: 'Practice 10–15 minutes daily to grow your Arabic fluency and streak.',
          timestampIso: new Date().toISOString(),
          read: false,
          category: 'welcome',
        },
      ];
    }
    return JSON.parse(raw) as AcademyNotification[];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(list: AcademyNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    // ignore storage quota errors
  }
}

export function getReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') return { enabled: false, timeHHMM: '20:30' };
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return { enabled: false, timeHHMM: '20:30' };
    return { enabled: false, timeHHMM: '20:30', ...(JSON.parse(raw) as Partial<ReminderSettings>) };
  } catch {
    return { enabled: false, timeHHMM: '20:30' };
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage quota errors
  }
}

export function getBrowserNotificationStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function dispatchBrowserNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'ai-arabic-academy',
        });
        return true;
      }
    }
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
    });
    return true;
  } catch {
    return false;
  }
}
