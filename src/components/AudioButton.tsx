import React, { useState } from 'react';
import { Volume2, Turtle, Square } from 'lucide-react';
import { speakArabic, stopArabicSpeech } from '../utils/speech';
import { useApp } from '../context/AppContext';

interface AudioButtonProps {
  text: string;
  showSlow?: boolean;
  compact?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({ text, showSlow = true, compact = false }) => {
  const { t, progress } = useApp();
  const [playingMode, setPlayingMode] = useState<'normal' | 'slow' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlay = (rate: number, mode: 'normal' | 'slow') => {
    setErrorMsg(null);
    speakArabic(text, {
      rate,
      voiceGender: progress.voiceGender || 'male',
      onStart: () => setPlayingMode(mode),
      onEnd: () => setPlayingMode(null),
      onError: (msg) => {
        setPlayingMode(null);
        setErrorMsg(msg);
      },
    });
  };

  const handleStop = () => {
    stopArabicSpeech();
    setPlayingMode(null);
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {playingMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStop();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-primary whitespace-nowrap shrink-0"
          >
            <Square className="w-3.5 h-3.5" />
            <span>{t.common.stopAudio}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(0.95, 'normal');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-secondary whitespace-nowrap shrink-0"
            title={t.common.playAudio}
          >
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
            {!compact && <span>{t.common.playAudio}</span>}
          </button>
        )}

        {showSlow && !playingMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(0.62, 'slow');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium btn-secondary whitespace-nowrap shrink-0"
            title={t.common.slowAudio}
          >
            <Turtle className="w-3.5 h-3.5 text-[var(--accent)]" />
            {!compact && <span>{t.common.slowAudio}</span>}
          </button>
        )}
      </div>

      {errorMsg && (
        <span className="text-xs text-[var(--warning)]">{errorMsg}</span>
      )}
    </div>
  );
};
