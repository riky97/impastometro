// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWakeLock } from './state/wakeLock';

function Probe() {
  useWakeLock();
  return null;
}

const release = vi.fn(() => Promise.resolve());
const request = vi.fn(() => Promise.resolve({ release }));

beforeEach(() => {
  release.mockClear();
  request.mockClear();
});
afterEach(() => {
  cleanup();
  // @ts-expect-error back to the jsdom default: no wake lock
  delete navigator.wakeLock;
});

describe('screen wake lock', () => {
  it('asks for it while shown and lets go when the page goes away', async () => {
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
    const { unmount } = render(<Probe />);
    expect(request).toHaveBeenCalledWith('screen');
    await Promise.resolve();
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('does nothing, and does not fail, where the browser has no wake lock', () => {
    expect(() => render(<Probe />)).not.toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it('survives a refusal', async () => {
    const refuse = vi.fn(() => Promise.reject(new Error('battery saver')));
    Object.defineProperty(navigator, 'wakeLock', {
      value: { request: refuse },
      configurable: true,
    });
    expect(() => render(<Probe />)).not.toThrow();
    await Promise.resolve();
  });
});
