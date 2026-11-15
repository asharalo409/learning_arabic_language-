import React from 'react';

export type ClockDialVariant = 'sky' | 'calligraphy';

interface IslamicClockDialProps {
  now: Date;
  variant: ClockDialVariant;
  sizeClass?: string;
}

/**
 * Dual-mode Islamic Analog Clock:
 * 1) 'sky': Bright cyan/gold ManabSeba hero analog clock
 * 2) 'calligraphy': Dramatic atmospheric mosque lattice clock with Surah Ghafir 40:59 calligraphy
 */
export const IslamicClockDial: React.FC<IslamicClockDialProps> = ({
  now,
  variant,
  sizeClass = 'w-28 h-28',
}) => {
  const seconds = now.getSeconds();
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;
  const secDeg = seconds * 6;
  const minDeg = minutes * 6;
  const hourDeg = hours * 30;

  if (variant === 'calligraphy') {
    // Authentic Quranic calligraphy positions around the 12-hour dial (Surah Ghafir 40:59)
    const calligraphyMarkers: { angleDeg: number; text: string; isSymbol?: boolean }[] = [
      { angleDeg: 30, text: 'إِنَّ' },
      { angleDeg: 60, text: 'السَّاعَةَ' },
      { angleDeg: 90, text: 'لَآتِيَةٌ' },
      { angleDeg: 120, text: 'لَا رَيْبَ' },
      { angleDeg: 150, text: 'فِيهَا' },
      { angleDeg: 180, text: 'وَلَكِنَّ' },
      { angleDeg: 210, text: 'أَكْثَرَ' },
      { angleDeg: 240, text: 'النَّاسِ' },
      { angleDeg: 270, text: 'لَا' },
      { angleDeg: 300, text: 'يُؤْمِنُونَ' },
      { angleDeg: 330, text: '۩', isSymbol: true },
    ];

    return (
      <div
        className={`relative ${sizeClass} rounded-full overflow-hidden shadow-2xl border border-white/25 shrink-0`}
        style={{
          background:
            'radial-gradient(circle at 65% 22%, #e2e8f0 0%, #64748b 34%, #1e293b 70%, #090d16 100%)',
        }}
      >
        {/* Subtle mosque lattice shadow rays across dial */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="beamGlow" cx="68%" cy="22%" r="72%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
              <stop offset="45%" stopColor="rgba(226,232,240,0.16)" />
              <stop offset="100%" stopColor="rgba(9,13,22,0.55)" />
            </radialGradient>
            <pattern id="mosqueLattice" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
              <path
                d="M 11 0 L 22 11 L 11 22 L 0 11 Z"
                fill="none"
                stroke="rgba(15,23,42,0.22)"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          <circle cx="100" cy="100" r="98" fill="url(#mosqueLattice)" />
          <circle cx="100" cy="100" r="98" fill="url(#beamGlow)" />

          {/* 60 Crisp Perimeter Tick Marks */}
          {Array.from({ length: 60 }, (_, idx) => {
            const isMajor = idx % 5 === 0;
            const isCardinal = idx % 15 === 0;
            const angle = (idx * 6 * Math.PI) / 180;
            const innerR = isCardinal ? 80 : isMajor ? 84 : 88;
            const outerR = 93;
            const x1 = 100 + Math.sin(angle) * innerR;
            const y1 = 100 - Math.cos(angle) * innerR;
            const x2 = 100 + Math.sin(angle) * outerR;
            const y2 = 100 - Math.cos(angle) * outerR;
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? '#0f172a' : 'rgba(15,23,42,0.68)'}
                strokeWidth={isCardinal ? '2.4' : isMajor ? '1.8' : '0.9'}
                strokeLinecap="round"
              />
            );
          })}

          {/* 12 O'Clock Ornate Brass/Ink Finial */}
          <path
            d="M100 9 C97 14 97 18 100 22 C103 18 103 14 100 9 Z"
            fill="#0f172a"
          />

          {/* 11-Position Arabic Calligraphy Verses + Rosette */}
          {calligraphyMarkers.map((m) => {
            const rad = (m.angleDeg * Math.PI) / 180;
            const r = 64;
            const x = 100 + Math.sin(rad) * r;
            const y = 100 - Math.cos(rad) * r + 4;
            return (
              <text
                key={m.angleDeg}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={m.isSymbol ? '13' : '10.5'}
                fontWeight="700"
                fill="#090d16"
                style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
              >
                {m.text}
              </text>
            );
          })}

          {/* Ornate Hour Hand */}
          <g transform={`rotate(${hourDeg} 100 100)`}>
            <line x1="100" y1="105" x2="100" y2="54" stroke="#0f172a" strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="100" cy="58" r="4" fill="#0f172a" />
          </g>

          {/* Ornate Minute Hand */}
          <g transform={`rotate(${minDeg} 100 100)`}>
            <line x1="100" y1="108" x2="100" y2="30" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="100" cy="34" r="3" fill="#0f172a" />
          </g>

          {/* Hairline Second Hand with Counterweight */}
          <g transform={`rotate(${secDeg} 100 100)`}>
            <line x1="100" y1="118" x2="100" y2="22" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="100" cy="116" r="3.2" fill="#0f172a" />
          </g>

          {/* Center Pivot Ring */}
          <circle cx="100" cy="100" r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  // Default: 'sky' — Bright Sky-Blue & Gold ManabSeba Analog Clock
  return (
    <div className={`relative ${sizeClass} shrink-0`}>
      <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-lg">
        <defs>
          <radialGradient id="skyDialFace" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
            <stop offset="65%" stopColor="rgba(224,242,254,0.92)" />
            <stop offset="100%" stopColor="rgba(186,230,253,0.9)" />
          </radialGradient>
        </defs>
        <circle
          cx="70"
          cy="70"
          r="64"
          fill="url(#skyDialFace)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="3.5"
        />
        <circle
          cx="70"
          cy="70"
          r="58"
          fill="none"
          stroke="rgba(14, 165, 233, 0.25)"
          strokeWidth="1.5"
        />
        {Array.from({ length: 12 }, (_, idx) => {
          const angle = (idx * 30 * Math.PI) / 180;
          const isQuarter = idx % 3 === 0;
          const x1 = 70 + Math.sin(angle) * (isQuarter ? 48 : 51);
          const y1 = 70 - Math.cos(angle) * (isQuarter ? 48 : 51);
          const x2 = 70 + Math.sin(angle) * 56;
          const y2 = 70 - Math.cos(angle) * 56;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isQuarter ? '#0284c7' : '#64748b'}
              strokeWidth={isQuarter ? '2.8' : '1.4'}
              strokeLinecap="round"
            />
          );
        })}
        {/* Hour Hand */}
        <line
          x1="70"
          y1="70"
          x2={70 + Math.sin((hourDeg * Math.PI) / 180) * 32}
          y2={70 - Math.cos((hourDeg * Math.PI) / 180) * 32}
          stroke="#0f172a"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        {/* Minute Hand */}
        <line
          x1="70"
          y1="70"
          x2={70 + Math.sin((minDeg * Math.PI) / 180) * 44}
          y2={70 - Math.cos((minDeg * Math.PI) / 180) * 44}
          stroke="#0284c7"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Second Hand */}
        <line
          x1="70"
          y1="76"
          x2={70 + Math.sin((secDeg * Math.PI) / 180) * 50}
          y2={70 - Math.cos((secDeg * Math.PI) / 180) * 50}
          stroke="#f97316"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="70" cy="70" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
