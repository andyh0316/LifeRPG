import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatCountdown } from './formatCountdown';

describe('formatCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "n/a" for null', () => {
    expect(formatCountdown(null)).toBe('n/a');
  });

  it('returns "EXPIRED" when the date is in the past', () => {
    expect(formatCountdown('2000-01-01T00:00:00Z')).toBe('EXPIRED');
  });

  it('formats seconds only when under a minute', () => {
    // setup
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    // act & assert
    expect(formatCountdown('2025-01-01T00:00:30Z')).toBe('30s');
  });

  it('formats minutes and seconds when under an hour', () => {
    // setup
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    // act & assert
    expect(formatCountdown('2025-01-01T00:14:59Z')).toBe('14m 59s');
  });

  it('formats hours, minutes, and seconds', () => {
    // setup
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    // act & assert
    expect(formatCountdown('2025-01-01T02:30:15Z')).toBe('2h 30m 15s');
  });

  it('accepts a Date object', () => {
    // setup
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    // act & assert
    expect(formatCountdown(new Date('2025-01-01T00:05:00Z'))).toBe('5m 0s');
  });
});
