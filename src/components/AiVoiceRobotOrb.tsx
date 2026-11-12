import React from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceGender } from '../types/academy';

interface AiVoiceRobotOrbProps {
  listening: boolean;
  speaking: boolean;
  thinking: boolean;
  voiceGender: VoiceGender;
  voiceLang: 'bn-BD' | 'ar-SA' | 'en-US';
  sttSupported: boolean;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
  onChangeGender: (g: VoiceGender) => void;
  onChangeLang: (l: 'bn-BD' | 'ar-SA' | 'en-US') => void;
}

export const AiVoiceRobotOrb: React.FC<AiVoiceRobotOrbProps> = ({
  listening,
  speaking,
  thinking,
  voiceGender,
  voiceLang,
  sttSupported,
  onToggleVoice,
  onStopSpeaking,
  onChangeGender,
  onChangeLang,
}) => {
  const statusLabel = listening
    ? 'আমি শুনছি... মাইকে কথা বলুন'
    : thinking
    ? 'AI রোবট উত্তর প্রস্তুত করছে...'
    : speaking
    ? `AI কথা বলছে (${voiceGender === 'male' ? 'পুরুষ কণ্ঠ' : 'নারী কণ্ঠ'})`
    : 'স্পিকার ও মাইকে কথা বলতে প্রস্তুত';

  const orbGradient = listening
    ? 'radial-gradient(circle at 35% 30%, #fda4af 0%, #ef4444 45%, #7f1d1d 100%)'
    : speaking
    ? 'radial-gradient(circle at 35% 30%, #67e8f9 0%, #3b82f6 42%, #4f46e5 85%, #1e1b4b 100%)'
    : thinking
    ? 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 48%, #78350f 100%)'
    : 'radial-gradient(circle at 35% 30%, #a5f3fc 0%, #0ea5e9 38%, #4f46e5 82%, #1e1b4b 100%)';

  return (
    <div
      className="rounded-3xl p-6 sm:p-7 border border-[var(--border-strong)] relative overflow-hidden shadow-lg text-white"
      style={{
        background: 'linear-gradient(155deg, #071129 0%, #0f1d45 52%, #072226 100%)',
      }}
    >
      {/* Subtle Ambient Halo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: speaking
            ? 'radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.35), transparent 62%)'
            : listening
            ? 'radial-gradient(circle at 50% 42%, rgba(239, 68, 68, 0.35), transparent 62%)'
            : 'radial-gradient(circle at 50% 42%, rgba(99, 102, 241, 0.25), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-5">
        {/* Top Controls Strip: Voice Gender + Language */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            <button
              type="button"
              onClick={() => onChangeGender('male')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                voiceGender === 'male' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              ছেলে কণ্ঠ (পুরুষ)
            </button>
            <button
              type="button"
              onClick={() => onChangeGender('female')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                voiceGender === 'female' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              মেয়ে কণ্ঠ (নারী)
            </button>
          </div>

          <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            {(
              [
                { code: 'bn-BD', label: 'বাংলা' },
                { code: 'ar-SA', label: 'العربية' },
                { code: 'en-US', label: 'EN' },
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onChangeLang(l.code)}
                className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                  voiceLang === l.code ? 'bg-sky-400 text-slate-950 shadow' : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Circular Gemini-Live Style Robot Orb */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-1">
          {/* Outer Pulsing Wave Rings */}
          <span
            className={`absolute inset-0 rounded-full border transition-all duration-500 ${
              speaking || listening
                ? 'border-sky-300/60 scale-115 animate-ping'
                : 'border-white/15 scale-105'
            }`}
            style={{ animationDuration: speaking ? '1.6s' : '2.2s' }}
          />
          <span
            className={`absolute inset-2 rounded-full border-2 transition-transform duration-500 ${
              listening
                ? 'border-rose-400/70 scale-105'
                : speaking
                ? 'border-cyan-300/80 scale-105'
                : thinking
                ? 'border-amber-300/70 animate-spin'
                : 'border-indigo-300/35'
            }`}
            style={thinking ? { borderTopColor: 'transparent', animationDuration: '1.8s' } : undefined}
          />

          {/* Main Glowing Orb Sphere + Friendly Robot Face */}
          <button
            type="button"
            onClick={speaking ? onStopSpeaking : onToggleVoice}
            disabled={!speaking && !sttSupported}
            aria-label={speaking ? 'বলা থামান' : listening ? 'শোনা থামান' : 'কথা বলুন'}
            className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-2xl flex items-center justify-center transition-transform duration-300 focus:outline-none ${
              speaking || listening ? 'scale-105' : 'hover:scale-[1.03]'
            }`}
            style={{
              background: orbGradient,
              boxShadow: speaking
                ? '0 0 48px rgba(56, 189, 248, 0.7)'
                : listening
                ? '0 0 48px rgba(239, 68, 68, 0.65)'
                : '0 0 32px rgba(79, 70, 229, 0.5)',
            }}
          >
            {/* Glossy Sphere Highlight */}
            <div
              aria-hidden="true"
              className="absolute top-3 left-6 w-16 h-8 rounded-full bg-white/30 blur-sm -rotate-12 pointer-events-none"
            />

            {/* Sleek Circular Robot Face (SVG) */}
            <svg viewBox="0 0 120 120" className="w-28 h-28 relative z-10 drop-shadow">
              {/* Robot Head Ring / Antennae */}
              <circle cx="60" cy="62" r="42" fill="rgba(7, 17, 41, 0.42)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
              <line x1="60" y1="20" x2="60" y2="11" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round" />
              <circle
                cx="60"
                cy="9"
                r="4"
                fill={listening ? '#fca5a5' : speaking ? '#67e8f9' : '#fde047'}
              />

              {/* Glowing Robot Eyes */}
              <ellipse
                cx="45"
                cy="54"
                rx="6"
                ry={thinking ? 2.5 : 7}
                fill="#ffffff"
              />
              <ellipse
                cx="75"
                cy="54"
                rx="6"
                ry={thinking ? 2.5 : 7}
                fill="#ffffff"
              />
              <circle cx="46" cy="53" r="2.2" fill="#0ea5e9" />
              <circle cx="76" cy="53" r="2.2" fill="#0ea5e9" />

              {/* Reactive Voice Equalizer / Mouth */}
              {speaking ? (
                <g fill="#67e8f9">
                  <rect x="40" y="70" width="5" height="10" rx="2.5">
                    <animate attributeName="height" values="6;16;6" dur="0.45s" repeatCount="indefinite" />
                    <animate attributeName="y" values="73;68;73" dur="0.45s" repeatCount="indefinite" />
                  </rect>
                  <rect x="49" y="66" width="5" height="18" rx="2.5">
                    <animate attributeName="height" values="10;20;8;18" dur="0.52s" repeatCount="indefinite" />
                    <animate attributeName="y" values="71;66;72;67" dur="0.52s" repeatCount="indefinite" />
                  </rect>
                  <rect x="58" y="65" width="5" height="20" rx="2.5">
                    <animate attributeName="height" values="18;7;20;9" dur="0.42s" repeatCount="indefinite" />
                    <animate attributeName="y" values="67;73;66;71" dur="0.42s" repeatCount="indefinite" />
                  </rect>
                  <rect x="67" y="67" width="5" height="16" rx="2.5">
                    <animate attributeName="height" values="8;18;6" dur="0.48s" repeatCount="indefinite" />
                    <animate attributeName="y" values="72;67;73" dur="0.48s" repeatCount="indefinite" />
                  </rect>
                  <rect x="76" y="70" width="5" height="10" rx="2.5">
                    <animate attributeName="height" values="5;14;5" dur="0.4s" repeatCount="indefinite" />
                    <animate attributeName="y" values="74;69;74" dur="0.4s" repeatCount="indefinite" />
                  </rect>
                </g>
              ) : listening ? (
                <g fill="#fda4af">
                  <circle cx="48" cy="75" r="3" />
                  <circle cx="60" cy="75" r="4" />
                  <circle cx="72" cy="75" r="3" />
                </g>
              ) : (
                <path
                  d="M46 73 Q60 83 74 73"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Live Status & Big Primary Mic / Stop Controls */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-sky-100">{statusLabel}</div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onToggleVoice}
              disabled={!sttSupported}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-lg transition-all disabled:opacity-45 ${
                listening
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white text-slate-900 hover:bg-sky-50'
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
              <span>{listening ? 'শোনা থামান' : 'মাইকে কথা বলুন'}</span>
            </button>

            {speaking && (
              <button
                type="button"
                onClick={onStopSpeaking}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20"
              >
                <VolumeX className="w-4 h-4" />
                <span>স্পিকার থামান</span>
              </button>
            )}

            {!speaking && !listening && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] bg-white/10 text-white/85">
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>অটো-স্পিকার: {voiceGender === 'male' ? 'ছেলে' : 'মেয়ে'}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
