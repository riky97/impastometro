import { useEffect } from 'react';

/** Keeps the screen on while the component is shown (hands in the dough, no touching the phone). */
export function useWakeLock(): void {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let stopped = false;

    const acquire = () => {
      // The browser releases the lock when the tab is hidden; ask again when it comes back.
      if (document.visibilityState !== 'visible') return;
      navigator.wakeLock
        .request('screen')
        .then((sentinel) => {
          if (stopped) void sentinel.release();
          else lock = sentinel;
        })
        .catch(() => undefined); // battery saver or no permission: the screen just dims as usual
    };

    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', acquire);
      void lock?.release();
    };
  }, []);
}
