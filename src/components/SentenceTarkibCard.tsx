import React from 'react';
import { SentenceTarkibResult } from '../data/nahwQuickTips';
import { TarkibVisualizer } from './TarkibVisualizer';

interface SentenceTarkibCardProps {
  sentenceAr: string;
  translationBn?: string;
  translationEn?: string;
  precomputed?: SentenceTarkibResult;
  onClose?: () => void;
  titleLabel?: string;
  initialSelectedIndex?: number;
  compact?: boolean;
}

export const SentenceTarkibCard: React.FC<SentenceTarkibCardProps> = (props) => {
  return <TarkibVisualizer {...props} />;
};
