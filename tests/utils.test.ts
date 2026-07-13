import { describe, expect, it } from 'vitest';
import { outputFilename, parsePositiveInteger, sanitizeFilename } from '../src/utils.js';

describe('filename helpers', () => {
  it('removes reserved characters', () => expect(sanitizeFilename('A/B: C?')).toBe('A_B_ C_'));
  it('pads track numbers', () => expect(outputFilename(0, 120, 'Song')).toBe('001 - Song.mp3'));
});

describe('parsePositiveInteger', () => {
  it('accepts valid values', () => expect(parsePositiveInteger('4', 'workers', 10)).toBe(4));
  it('rejects decimals and out-of-range values', () => {
    expect(() => parsePositiveInteger('1.5', 'workers', 10)).toThrow();
    expect(() => parsePositiveInteger('11', 'workers', 10)).toThrow();
  });
});
