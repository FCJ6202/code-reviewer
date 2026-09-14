import { describe, expect, it } from 'vitest';
import { byteLength, countLines } from '@/lib/code';
import { formatBytes, formatLatency, initials } from '@/lib/format';
import { detectLanguage, displayLanguage } from '@/lib/language';

describe('format helpers', () => {
  it('formats bytes and latency', () => {
    expect(formatBytes(138)).toBe('138 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatLatency(10958)).toBe('11.0 s');
  });

  it('builds initials', () => {
    expect(initials('Vishal Rajak')).toBe('VR');
    expect(initials('dev')).toBe('D');
    expect(initials('  ')).toBe('?');
  });
});

describe('code helpers', () => {
  it('ignores one trailing newline when counting lines', () => {
    expect(countLines('a\nb\n')).toBe(2);
    expect(countLines('')).toBe(0);
  });

  it('measures UTF-8 bytes', () => {
    expect(byteLength('é')).toBe(2);
  });
});

describe('language detection', () => {
  it('matches the backend extension map', () => {
    expect(detectLanguage('app.PY')).toBe('python');
    expect(detectLanguage('main.tsx')).toBe('typescript');
    expect(detectLanguage('Makefile')).toBeNull();
  });

  it('shortens the backend unknown label', () => {
    expect(displayLanguage('unknown (infer from the code)')).toBe('unknown');
  });
});
