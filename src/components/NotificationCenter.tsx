import React, { useState } from 'react';
import { Bell, BellRing, CheckCheck, Clock, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    clearNotifications,
    reminderSettings,
    updateReminderSettings,
    browserNotifPermission,
    enableBrowserNotifications,
    sendTestNotification,
    soundEnabled,
    setSoundEnabled,
    activeToast,
    dismissToast,
  } = useApp();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Notification Bell Button + Sound Quick Toggle */}
      <div className="relative flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg btn-secondary shrink-0"
          title={soundEnabled ? 'সাউন্ড ইফেক্ট চালু (বন্ধ করতে ক্লিক করুন)' : 'সাউন্ড ইফেক্ট বন্ধ (চালু করতে ক্লিক করুন)'}
          aria-label="Toggle Sound Effects"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--accent)]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next && unreadNotificationCount > 0) {
              markAllNotificationsRead();
            }
          }}
          className="relative p-2 rounded-lg btn-secondary shrink-0"
          title="নোটিফিকেশন ও দৈনিক রিমাইন্ডার"
          aria-label="Open Notifications"
        >
          <Bell className="w-4 h-4 text-[var(--accent)]" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-bold flex items-center justify-center font-mono-num">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 surface-card rounded-2xl shadow-2xl border border-[var(--border-strong)] p-4 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-sm font-bold">নোটিফিকেশন ও রিমাইন্ডার</h3>
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
                      title="সব মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Browser Push Permission & Daily Reminder Controls */}
              <div className="surface-alt rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">ব্রাউজার/ফোন নোটিফিকেশন</span>
                  <span className="text-[11px] font-medium text-[var(--accent)]">
                    {browserNotifPermission === 'granted'
                      ? 'চালু আছে'
                      : browserNotifPermission === 'denied'
                      ? 'ব্লক করা'
                      : browserNotifPermission === 'unsupported'
                      ? 'অসমর্থিত'
                      : 'অপেক্ষমাণ'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {browserNotifPermission !== 'granted' && browserNotifPermission !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={() => void enableBrowserNotifications()}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs btn-primary"
                    >
                      অনুমতি চালু করুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void sendTestNotification()}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs btn-secondary"
                  >
                    টেস্ট নোটিফিকেশন পাঠান
                  </button>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderSettings.enabled}
                      onChange={(e) => updateReminderSettings({ enabled: e.target.checked })}
                      className="accent-[var(--accent)] rounded"
                    />
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>দৈনিক পড়ার সময়</span>
                  </label>
                  <input
                    type="time"
                    value={reminderSettings.timeHHMM}
                    onChange={(e) => updateReminderSettings({ timeHHMM: e.target.value })}
                    className="px-2 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-mono-num"
                  />
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pe-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-4">
                    কোনো নতুন নোটিফিকেশন নেই।
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="surface-alt rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--accent)]">{n.titleBn}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{n.bodyBn}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Live Floating Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] surface-card border border-[var(--border-strong)] rounded-2xl p-4 shadow-2xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl surface-alt flex items-center justify-center text-[var(--accent)] shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-xs font-bold text-[var(--accent)]">{activeToast.titleBn}</div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{activeToast.bodyBn}</p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-[var(--bg-surface-alt)] text-[var(--text-muted)]"
            aria-label="Dismiss Notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
