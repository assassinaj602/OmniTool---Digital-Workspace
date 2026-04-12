import { describe, expect, it } from 'vitest';
import { isPdfFile, validatePdfFile } from '../validation';

describe('isPdfFile', () => {
  it('accepts mime-type pdf', () => {
    const file = new File(['x'], 'demo.bin', { type: 'application/pdf' });
    expect(isPdfFile(file)).toBe(true);
  });

  it('accepts extension pdf when mime is missing', () => {
    const file = new File(['x'], 'demo.pdf', { type: '' });
    expect(isPdfFile(file)).toBe(true);
  });

  it('rejects non-pdf files', () => {
    const file = new File(['x'], 'demo.png', { type: 'image/png' });
    expect(isPdfFile(file)).toBe(false);
  });
});

describe('validatePdfFile', () => {
  it('rejects missing file', () => {
    expect(validatePdfFile(null).valid).toBe(false);
  });

  it('rejects empty file', () => {
    const file = new File([], 'empty.pdf', { type: 'application/pdf' });
    expect(validatePdfFile(file).valid).toBe(false);
  });

  it('rejects wrong type', () => {
    const file = new File(['x'], 'demo.png', { type: 'image/png' });
    expect(validatePdfFile(file).valid).toBe(false);
  });

  it('accepts valid pdf-like file', () => {
    const file = new File(['dummy pdf bytes'], 'demo.pdf', { type: 'application/pdf' });
    expect(validatePdfFile(file).valid).toBe(true);
  });
});
