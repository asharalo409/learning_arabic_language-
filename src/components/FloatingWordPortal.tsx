import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface FloatingAnchor {
  left: number;
  top: number;
  placement: 'bottom' | 'top';
}

export function computePortalPopoverCoords(
  rect: { left: number; top: number; bottom: number; width: number },
  popoverWidth = 290,
  estimatedHeight = 250
): FloatingAnchor {
  if (typeof window === 'undefined') {
    return { left: 16, top: 80, placement: 'bottom' };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const safeW = Math.min(popoverWidth, vw - 20);
  const centerX = rect.left + rect.width / 2;
  const left = Math.max(10, Math.min(vw - safeW - 10, centerX - safeW / 2));

  const spaceBelow = vh - rect.bottom - 12;
  const spaceAbove = rect.top - 12;
  if (spaceBelow >= Math.min(200, estimatedHeight) || spaceBelow >= spaceAbove) {
    return {
      left,
      top: Math.min(vh - 130, rect.bottom + 8),
      placement: 'bottom',
    };
  }
  return {
    left,
    top: Math.max(12, rect.top - 8),
    placement: 'top',
  };
}

interface FloatingWordPortalProps {
  anchor: FloatingAnchor;
  popoverRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  dataAttrs?: Record<string, string>;
  onContainerClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const FloatingWordPortal: React.FC<FloatingWordPortalProps> = ({
  anchor,
  popoverRef,
  children,
  dataAttrs,
  onContainerClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none no-print"
      aria-live="polite"
    >
      <div
        ref={popoverRef}
        dir="ltr"
        {...dataAttrs}
        onClick={onContainerClick}
        style={{
          position: 'absolute',
          left: `${anchor.left}px`,
          top: `${anchor.top}px`,
          transform: anchor.placement === 'top' ? 'translateY(-100%)' : undefined,
        }}
        className="pointer-events-auto w-[min(290px,calc(100vw-20px))] max-h-[44vh] overflow-y-auto rounded-2xl surface-card border border-[var(--border-strong)] p-3 shadow-2xl text-left space-y-2 backdrop-blur-xl"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
