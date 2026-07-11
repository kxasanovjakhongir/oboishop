import { describe, it, expect } from 'vitest';
import { formatUzPhone } from './phone';

describe('formatUzPhone', () => {
  it('formats digits progressively as the user types', () => {
    expect(formatUzPhone('9')).toBe('+998 9');
    expect(formatUzPhone('90')).toBe('+998 90');
    expect(formatUzPhone('901')).toBe('+998 90 1');
    expect(formatUzPhone('901234567')).toBe('+998 90 123 45 67');
  });

  it('strips a redundant leading country code', () => {
    expect(formatUzPhone('998901234567')).toBe('+998 90 123 45 67');
    expect(formatUzPhone('+998901234567')).toBe('+998 90 123 45 67');
  });

  it('ignores non-digit characters', () => {
    expect(formatUzPhone('+998 (90) 123-45-67')).toBe('+998 90 123 45 67');
  });

  it('caps input at 9 local digits', () => {
    expect(formatUzPhone('9012345678999')).toBe('+998 90 123 45 67');
  });

  it('returns an empty string when cleared', () => {
    expect(formatUzPhone('')).toBe('');
    expect(formatUzPhone('998')).toBe('');
  });
});
