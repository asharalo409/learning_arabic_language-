import React from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceGender } from '../types/academy';

export type RobotMood = 'happy' | 'listening' | 'speaking' | 'thinking' | 'angry';

interface AiVoiceRobotOrbProps {
  listening: boolean;
  speaking: boolean;
  thinking: boolean;
  hasError?: boolean;
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
  hasError = false,
  voiceGender,
  voiceLang,
  sttSupported,
  onToggleVoice,
  onStopSpeaking,
  onChangeGender,
  onChangeLang,
}) => {
  const activeMood: RobotMood = listening
    ? 'listening'
    : speaking
    ? 'speaking'
    : thinking
    ? 'thinking'
    : hasError
    ? 'angry'
    : 'happy';

  const statusLabel =
    activeMood === 'listening'
      ? 'কান খাড়া করে শুনছি... বলুন!'
      : activeMood === 'thinking'
      ? 'চিন্তা করছি...'
      : activeMood === 'speaking'
      ? `কথা বলছি (${voiceGender === 'male' ? 'ছেলে কণ্ঠ' : 'মেয়ে কণ্ঠ'})`
      : activeMood === 'angry'
      ? 'সংযোগ বা মাইক্রোফোনে ত্রুটি হয়েছে!'
      : 'কথা বলতে অরব বা মাইকে ট্যাপ করুন';

  const orbGradient =
    activeMood === 'listening'
      ? 'radial-gradient(circle at 35% 30%, #6ee7b7 0%, #10b981 42%, #064e3b 100%)'
      : activeMood === 'speaking'
      ? 'radial-gradient(circle at 35% 30%, #67e8f9 0%, #3b82f6 42%, #4f46e5 85%, #1e1b4b 100%)'
      : activeMood === 'angry'
      ? 'radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 48%, #7f1d1d 100%)'
      : activeMood === 'thinking'
      ? 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 48%, #78350f 100%)'
      : 'radial-gradient(circle at 35% 30%, #a5f3fc 0%, #0ea5e9 38%, #4f46e5 82%, #1e1b4b 100%)';

  const earsPerked = activeMood === 'listening';

  return (
    <div
      className="rounded-3xl p-4 sm:p-6 border border-[var(--border-strong)] relative overflow-hidden shadow-lg text-white"
      style={{
        background: 'linear-gradient(155deg, #071129 0%, #0f1d45 55%, #072226 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-60 transition-all duration-500"
        style={{
          background:
            activeMood === 'speaking'
              ? 'radial-gradient(circle at 50% 42%, rgba(56, 189, 248, 0.34), transparent 62%)'
              : activeMood === 'listening'
              ? 'radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.34), transparent 62%)'
              : activeMood === 'angry'
              ? 'radial-gradient(circle at 50% 42%, rgba(239, 68, 68, 0.36), transparent 62%)'
              : 'radial-gradient(circle at 50% 42%, rgba(99, 102, 241, 0.25), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-3.5">
        {/* Clean Minimal Top Bar: Voice Gender & Language */}
        <div className="w-full flex items-center justify-between gap-2 text-[11px]">
          <div className="inline-flex p-0.5 rounded-full bg-white/10 border border-white/15">
            <button
              type="button"
              onClick={() => onChangeGender('male')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                voiceGender === 'male' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              ছেলে
            </button>
            <button
              type="button"
              onClick={() => onChangeGender('female')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                voiceGender === 'female' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              মেয়ে
            </button>
          </div>

          <div className="inline-flex p-0.5 rounded-full bg-white/10 border border-white/15">
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

        {/* Circular Gemini-Live Style Expressive Robot Orb */}
        <div className="relative w-44 h-40 sm:w-48 sm:h-44 flex items-center justify-center">
          <span
            className={`absolute w-40 h-40 rounded-full border transition-all duration-500 ${
              activeMood === 'speaking' || activeMood === 'listening'
                ? 'border-sky-300/60 scale-115 animate-ping'
                : 'border-white/15 scale-105'
            }`}
            style={{ animationDuration: activeMood === 'speaking' ? '1.5s' : '2s' }}
          />
          <span
            className={`absolute w-40 h-40 rounded-full border-2 transition-transform duration-500 ${
              activeMood === 'listening'
                ? 'border-emerald-300/80 scale-105'
                : activeMood === 'speaking'
                ? 'border-cyan-300/85 scale-105'
                : activeMood === 'angry'
                ? 'border-rose-400/85 scale-105'
                : activeMood === 'thinking'
                ? 'border-amber-300/80 animate-spin'
                : 'border-indigo-300/40'
            }`}
            style={activeMood === 'thinking' ? { borderTopColor: 'transparent', animationDuration: '1.6s' } : undefined}
          />

          <button
            type="button"
            onClick={speaking ? onStopSpeaking : onToggleVoice}
            disabled={!speaking && !sttSupported}
            aria-label={speaking ? 'বলা থামান' : listening ? 'শোনা থামান' : 'কথা বলুন'}
            className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 focus:outline-none ${
              speaking || listening ? 'scale-105' : 'hover:scale-[1.03]'
            }`}
            style={{
              background: orbGradient,
              boxShadow:
                activeMood === 'speaking'
                  ? '0 0 46px rgba(56, 189, 248, 0.7)'
                  : activeMood === 'listening'
                  ? '0 0 46px rgba(16, 185, 129, 0.7)'
                  : activeMood === 'angry'
                  ? '0 0 46px rgba(239, 68, 68, 0.7)'
                  : '0 0 30px rgba(79, 70, 229, 0.55)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute top-3 left-5 w-14 h-7 rounded-full bg-white/30 blur-sm -rotate-12 pointer-events-none"
            />

            {/* Animated Expressive Robot SVG */}
            <svg viewBox="0 0 150 135" className="w-32 h-30 relative z-10 drop-shadow overflow-visible">
              {/* Left & Right Ears (Perk up tall when listening) */}
              <g
                style={{
                  transform: earsPerked ? 'translateY(-10px) scale(1.18)' : 'translateY(0px) scale(1)',
                  transformOrigin: '26px 68px',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <rect x="14" y="48" width="12" height="32" rx="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
                <circle cx="20" cy="54" r="3" fill={earsPerked ? '#34d399' : '#38bdf8'} />
                {earsPerked && (
                  <>
                    <path d="M8 54 Q2 64 8 74" fill="none" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M3 49 Q-5 64 3 79" fill="none" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                  </>
                )}
              </g>

              <g
                style={{
                  transform: earsPerked ? 'translateY(-10px) scale(1.18)' : 'translateY(0px) scale(1)',
                  transformOrigin: '124px 68px',
                  transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <rect x="124" y="48" width="12" height="32" rx="6" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
                <circle cx="130" cy="54" r="3" fill={earsPerked ? '#34d399' : '#38bdf8'} />
                {earsPerked && (
                  <>
                    <path d="M142 54 Q148 64 142 74" fill="none" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M147 49 Q155 64 147 79" fill="none" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                  </>
                )}
              </g>

              {/* Antenna */}
              <line x1="75" y1="24" x2="75" y2="11" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" />
              <circle
                cx="75"
                cy="8"
                r={earsPerked ? 6 : 4.5}
                fill={
                  activeMood === 'angry'
                    ? '#f87171'
                    : activeMood === 'listening'
                    ? '#34d399'
                    : activeMood === 'speaking'
                    ? '#67e8f9'
                    : '#fde047'
                }
              />

              {/* Head Screen */}
              <circle
                cx="75"
                cy="68"
                r="45"
                fill="rgba(8, 16, 40, 0.72)"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="2.4"
              />

              {activeMood === 'angry' && (
                <g stroke="#fca5a5" strokeWidth="3.2" strokeLinecap="round">
                  <line x1="43" y1="43" x2="62" y2="50" />
                  <line x1="107" y1="43" x2="88" y2="50" />
                </g>
              )}

              {/* Expressive Eyes */}
              {activeMood === 'happy' ? (
                <>
                  <path d="M46 60 Q55 50 64 60" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                  <path d="M86 60 Q95 50 104 60" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="44" cy="72" rx="6" ry="3.2" fill="#f472b6" opacity="0.55" />
                  <ellipse cx="106" cy="72" rx="6" ry="3.2" fill="#f472b6" opacity="0.55" />
                </>
              ) : activeMood === 'angry' ? (
                <>
                  <circle cx="54" cy="60" r="11" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="96" cy="60" r="11" fill="#ffffff" stroke="#ef4444" strokeWidth="2" />
                  <circle cx="55" cy="60" r="5" fill="#991b1b" />
                  <circle cx="95" cy="60" r="5" fill="#991b1b" />
                  <circle cx="57" cy="57" r="2" fill="#ffffff" />
                  <circle cx="97" cy="57" r="2" fill="#ffffff" />
                </>
              ) : (
                <>
                  <ellipse
                    cx={activeMood === 'thinking' ? 58 : 55}
                    cy={activeMood === 'thinking' ? 55 : 58}
                    rx={activeMood === 'listening' ? 8.5 : 7}
                    ry={activeMood === 'listening' ? 9.5 : 8}
                    fill="#ffffff"
                  />
                  <ellipse
                    cx={activeMood === 'thinking' ? 99 : 95}
                    cy={activeMood === 'thinking' ? 55 : 58}
                    rx={activeMood === 'listening' ? 8.5 : 7}
                    ry={activeMood === 'listening' ? 9.5 : 8}
                    fill="#ffffff"
                  />
                  <circle cx={activeMood === 'thinking' ? 60 : 56} cy={activeMood === 'thinking' ? 53 : 58} r="3.2" fill="#0284c7" />
                  <circle cx={activeMood === 'thinking' ? 101 : 96} cy={activeMood === 'thinking' ? 53 : 58} r="3.2" fill="#0284c7" />
                  <circle cx="58" cy="55" r="1.4" fill="#ffffff" />
                  <circle cx="98" cy="55" r="1.4" fill="#ffffff" />
                </>
              )}

              {/* Expressive Mouth */}
              {activeMood === 'speaking' ? (
                <g fill="#67e8f9">
                  <rect x="52" y="79" width="5" height="10" rx="2.5">
                    <animate attributeName="height" values="6;16;6" dur="0.45s" repeatCount="indefinite" />
                    <animate attributeName="y" values="82;77;82" dur="0.45s" repeatCount="indefinite" />
                  </rect>
                  <rect x="61" y="75" width="5" height="18" rx="2.5">
                    <animate attributeName="height" values="10;20;8;18" dur="0.52s" repeatCount="indefinite" />
                    <animate attributeName="y" values="80;75;81;76" dur="0.52s" repeatCount="indefinite" />
                  </rect>
                  <rect x="70" y="74" width="5" height="20" rx="2.5">
                    <animate attributeName="height" values="18;7;20;9" dur="0.42s" repeatCount="indefinite" />
                    <animate attributeName="y" values="76;82;75;80" dur="0.42s" repeatCount="indefinite" />
                  </rect>
                  <rect x="79" y="76" width="5" height="16" rx="2.5">
                    <animate attributeName="height" values="8;18;6" dur="0.48s" repeatCount="indefinite" />
                    <animate attributeName="y" values="81;76;82" dur="0.48s" repeatCount="indefinite" />
                  </rect>
                  <rect x="88" y="79" width="5" height="10" rx="2.5">
                    <animate attributeName="height" values="5;14;5" dur="0.4s" repeatCount="indefinite" />
                    <animate attributeName="y" values="83;78;83" dur="0.4s" repeatCount="indefinite" />
                  </rect>
                </g>
              ) : activeMood === 'happy' ? (
                <path
                  d="M54 78 Q75 96 96 78"
                  fill="rgba(255,255,255,0.22)"
                  stroke="#ffffff"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              ) : activeMood === 'angry' ? (
                <path
                  d="M56 88 L64 82 L75 88 L86 82 L94 88"
                  fill="none"
                  stroke="#fca5a5"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : activeMood === 'thinking' ? (
                <path
                  d="M62 84 Q75 80 86 86"
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              ) : (
                <g fill="#6ee7b7">
                  <circle cx="63" cy="84" r="3" />
                  <circle cx="75" cy="84" r="4" />
                  <circle cx="87" cy="84" r="3" />
                </g>
              )}
            </svg>
          </button>
        </div>

        {/* Clean Status & Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs font-medium text-sky-100">{statusLabel}</span>
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={!sttSupported}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow transition-all disabled:opacity-45 ${
              listening
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white text-slate-900 hover:bg-sky-50'
            }`}
          >
            {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{listening ? 'শোনা থামান' : 'মাইকে কথা বলুন'}</span>
          </button>

          {speaking && (
            <button
              type="button"
              onClick={onStopSpeaking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>থামান</span>
            </button>
          )}
          {!speaking && !listening && (
            <span className="inline-flex items-center gap-1 text-[11px] text-white/75">
              <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>{voiceGender === 'male' ? 'ছেলে' : 'মেয়ে'}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
