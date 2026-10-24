'use client';

import { useEffect, useCallback } from 'react';

interface ScrollRestorerProps {
  key: string;
}

export function ScrollRestorer({ key }: ScrollRestorerProps) {
  const restorePosition = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(`scroll:${key}`);
      if (stored) {
        const { x, y } = JSON.parse(stored);
        window.scrollTo(x, y);
        sessionStorage.removeItem(`scroll:${key}`);
      }
    } catch {
      // Ignore storage errors
    }
  }, [key]);

  const savePosition = useCallback(() => {
    try {
      sessionStorage.setItem(
        `scroll:${key}`,
        JSON.stringify({ x: window.scrollX, y: window.scrollY })
      );
    } catch {
      // Ignore storage errors
    }
  }, [key]);

  useEffect(() => {
    // Restore on mount
    restorePosition();

    // Save on page hide / navigation away
    window.addEventListener('pagehide', savePosition);
    window.addEventListener('beforeunload', savePosition);

    return () => {
      window.removeEventListener('pagehide', savePosition);
      window.removeEventListener('beforeunload', savePosition);
    };
  }, [key, restorePosition, savePosition]);

  return null;
}
