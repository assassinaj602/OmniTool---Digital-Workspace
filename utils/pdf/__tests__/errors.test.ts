import { describe, expect, it } from 'vitest';
import { mapPdfError } from '../errors';

describe('mapPdfError', () => {
  it('maps password errors to encrypted', () => {
    const result = mapPdfError(new Error('Incorrect password'));
    expect(result.code).toBe('encrypted');
  });

  it('maps invalid parse errors to invalid_pdf', () => {
    const result = mapPdfError(new Error('Invalid PDF structure'));
    expect(result.code).toBe('invalid_pdf');
  });

  it('falls back to processing_failed', () => {
    const result = mapPdfError(new Error('Unexpected issue'));
    expect(result.code).toBe('processing_failed');
  });
});
