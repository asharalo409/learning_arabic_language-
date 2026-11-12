export type SoundEffectType =
  | 'welcome'
  | 'loading'
  | 'bubble'
  | 'auth'
  | 'quran'
  | 'lesson'
  | 'grammar'
  | 'quiz'
  | 'click'
  | 'success'
  | 'error'
  | 'badge'
  | 'notification'
  | 'theme';

const SOUND_STORAGE_KEY = 'aaa_sound_enabled_v1';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    void sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const raw = localStorage.getItem(SOUND_STORAGE_KEY);
  return raw === null ? true : raw === 'true';
}

export function setSoundEnabledPref(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffsetSec: number,
  durationSec: number,
  volume = 0.11,
  type: OscillatorType = 'sine',
  glideToFreq?: number
) {
  const now = ctx.currentTime + startOffsetSec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (glideToFreq) {
    osc.frequency.exponentialRampToValueAtTime(glideToFreq, now + durationSec);
  }

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3200, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.016);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.03);
}

/**
 * Plays distinct, soothing Web Audio synthesized sound effects per screen and action.
 * Returns true if AudioContext was unlocked and playing cleanly.
 */
export function playSound(type: SoundEffectType, force = false): boolean {
  if (!force && !isSoundEnabled()) return false;
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    switch (type) {
      case 'loading': {
        // Luminous ascending sunrise shimmer for splash screen
        playTone(ctx, 392.0, 0.0, 0.25, 0.07, 'sine');
        playTone(ctx, 493.88, 0.09, 0.28, 0.08, 'sine');
        playTone(ctx, 587.33, 0.18, 0.34, 0.09, 'triangle');
        playTone(ctx, 783.99, 0.28, 0.45, 0.1, 'sine');
        break;
      }
      case 'welcome': {
        // Warm radiant Arabic-inspired harmonic harp cascade (D Hijaz / Major glow)
        playTone(ctx, 587.33, 0.0, 0.35, 0.11, 'triangle'); // D5
        playTone(ctx, 739.99, 0.08, 0.36, 0.1, 'sine'); // F#5
        playTone(ctx, 880.0, 0.16, 0.4, 0.11, 'triangle'); // A5
        playTone(ctx, 1174.66, 0.25, 0.55, 0.13, 'sine'); // D6
        playTone(ctx, 1318.51, 0.36, 0.65, 0.09, 'sine'); // E6
        break;
      }
      case 'bubble': {
        // Crisp joyful water-bubble pop with gentle upward chirp
        const base = 460 + Math.random() * 240;
        playTone(ctx, base, 0.0, 0.09, 0.08, 'sine', base * 1.9);
        break;
      }
      case 'auth': {
        // Clear welcoming account sign-in cadence
        playTone(ctx, 440.0, 0.0, 0.16, 0.09, 'triangle');
        playTone(ctx, 554.37, 0.08, 0.18, 0.09, 'sine');
        playTone(ctx, 659.25, 0.16, 0.25, 0.1, 'triangle');
        playTone(ctx, 880.0, 0.25, 0.38, 0.11, 'sine');
        break;
      }
      case 'quran': {
        // Serene warm meditative harmonic fifths
        playTone(ctx, 329.63, 0.0, 0.45, 0.08, 'sine');
        playTone(ctx, 493.88, 0.1, 0.48, 0.08, 'sine');
        playTone(ctx, 659.25, 0.22, 0.55, 0.09, 'triangle');
        break;
      }
      case 'lesson': {
        // Bright scholarly page chime
        playTone(ctx, 587.33, 0.0, 0.18, 0.08, 'triangle');
        playTone(ctx, 880.0, 0.09, 0.26, 0.08, 'sine');
        break;
      }
      case 'grammar': {
        // Crisp structured double pluck
        playTone(ctx, 523.25, 0.0, 0.14, 0.08, 'triangle');
        playTone(ctx, 659.25, 0.07, 0.16, 0.08, 'triangle');
        break;
      }
      case 'quiz': {
        // Energetic quiz readiness chime
        playTone(ctx, 659.25, 0.0, 0.14, 0.08, 'sine');
        playTone(ctx, 783.99, 0.07, 0.14, 0.08, 'sine');
        playTone(ctx, 987.77, 0.14, 0.22, 0.09, 'triangle');
        break;
      }
      case 'success': {
        // Crisp 3-note lesson/quiz reward chime
        playTone(ctx, 523.25, 0.0, 0.18, 0.11, 'triangle');
        playTone(ctx, 659.25, 0.08, 0.2, 0.11, 'triangle');
        playTone(ctx, 783.99, 0.16, 0.32, 0.13, 'sine');
        break;
      }
      case 'badge': {
        // Celebratory level/badge fanfare
        playTone(ctx, 523.25, 0.0, 0.15, 0.1, 'triangle');
        playTone(ctx, 659.25, 0.08, 0.15, 0.1, 'triangle');
        playTone(ctx, 783.99, 0.16, 0.18, 0.11, 'triangle');
        playTone(ctx, 1046.5, 0.25, 0.5, 0.14, 'sine');
        break;
      }
      case 'notification': {
        // Clear double-bell alert
        playTone(ctx, 880.0, 0.0, 0.22, 0.1, 'sine');
        playTone(ctx, 1174.66, 0.11, 0.32, 0.11, 'sine');
        break;
      }
      case 'theme': {
        // Ethereal sky prism transition shimmer
        playTone(ctx, 659.25, 0.0, 0.18, 0.08, 'sine');
        playTone(ctx, 830.61, 0.05, 0.2, 0.08, 'sine');
        playTone(ctx, 987.77, 0.11, 0.28, 0.08, 'sine');
        break;
      }
      case 'error': {
        // Soft descending gentle feedback
        playTone(ctx, 329.63, 0.0, 0.16, 0.09, 'triangle');
        playTone(ctx, 261.63, 0.12, 0.24, 0.09, 'triangle');
        break;
      }
      case 'click':
      default: {
        // Subtle tactile tap
        playTone(ctx, 640, 0.0, 0.055, 0.045, 'sine');
        break;
      }
    }
    return ctx.state === 'running';
  } catch {
    return false;
  }
}

export function getRouteSoundEffect(pathname: string): SoundEffectType {
  if (pathname === '/quranic-arabic') return 'quran';
  if (pathname === '/grammar' || pathname === '/safwatul-masadir') return 'grammar';
  if (pathname === '/quiz' || pathname === '/daily-challenge' || pathname === '/leaderboard') return 'quiz';
  if (pathname === '/themes') return 'theme';
  if (pathname === '/auth') return 'auth';
  if (
    pathname.startsWith('/courses') ||
    pathname === '/daily-lessons' ||
    pathname === '/bayna-yadayk' ||
    pathname === '/listening' ||
    pathname === '/speaking'
  ) {
    return 'lesson';
  }
  return 'click';
}
