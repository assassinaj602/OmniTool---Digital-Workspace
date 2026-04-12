import { describe, expect, it, vi } from 'vitest';
import { buildPdfDownloadName, triggerBlobDownload } from '../download';

describe('buildPdfDownloadName', () => {
  it('replaces .pdf and appends suffix', () => {
    expect(buildPdfDownloadName('invoice.pdf', 'watermarked')).toBe('invoice-watermarked.pdf');
  });

  it('handles uppercase extension', () => {
    expect(buildPdfDownloadName('INVOICE.PDF', 'merged')).toBe('INVOICE-merged.pdf');
  });
});

describe('triggerBlobDownload', () => {
  it('creates and clicks download link', () => {
    vi.useFakeTimers();

    const click = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;

    URL.createObjectURL = vi.fn(() => 'blob:test') as any;
    URL.revokeObjectURL = vi.fn(() => undefined) as any;

    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      set href(_v: string) {},
      set download(_v: string) {},
    } as any);

    triggerBlobDownload(new Blob(['x'], { type: 'text/plain' }), 'test.txt');
    vi.runAllTimers();

    expect(createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    createElement.mockRestore();
    vi.useRealTimers();
  });
});
