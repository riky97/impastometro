import { useSyncExternalStore } from 'react';

/** Width from which the recipe rail sits beside the calculation (Tailwind's `lg`). */
const DESKTOP_QUERY = '(min-width: 1024px)';

const media = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(DESKTOP_QUERY)
    : null;

/** True on a wide screen; false where there is no matchMedia (tests, old browsers). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = media();
      query?.addEventListener('change', onChange);
      return () => query?.removeEventListener('change', onChange);
    },
    () => media()?.matches ?? false,
  );
}
