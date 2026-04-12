export type PdfErrorCode =
  | 'encrypted'
  | 'invalid_pdf'
  | 'wrong_type'
  | 'empty_file'
  | 'processing_failed'
  | 'unknown';

export interface PdfMappedError {
  code: PdfErrorCode;
  userMessage: string;
}

export const mapPdfError = (error: unknown): PdfMappedError => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('password') || message.includes('encrypted')) {
    return {
      code: 'encrypted',
      userMessage: 'This PDF is password-protected. Please unlock it first.',
    };
  }

  if (message.includes('invalid pdf') || message.includes('no pdf header') || message.includes('failed to parse')) {
    return {
      code: 'invalid_pdf',
      userMessage: 'The selected file is not a valid PDF.',
    };
  }

  return {
    code: 'processing_failed',
    userMessage: 'We could not process this PDF. Please try another file.',
  };
};
