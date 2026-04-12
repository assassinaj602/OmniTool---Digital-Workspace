import { PDFDocument } from 'pdf-lib';
import { mapPdfError } from './errors';

export interface PdfValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export const isPdfFile = (file: File) => {
  const byType = file.type === 'application/pdf';
  const byName = /\.pdf$/i.test(file.name);
  return byType || byName;
};

export const validatePdfFile = (file: File | null): PdfValidationResult => {
  if (!file) {
    return { valid: false, errorMessage: 'Please select a PDF file.' };
  }

  if (file.size === 0) {
    return { valid: false, errorMessage: 'The selected file is empty.' };
  }

  if (!isPdfFile(file)) {
    return { valid: false, errorMessage: 'Only PDF files are supported here.' };
  }

  return { valid: true };
};

export const loadPdfLibDocument = async (file: File) => {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes);
};

export const detectEncryptedPdf = async (file: File): Promise<boolean> => {
  try {
    const bytes = await file.arrayBuffer();
    await PDFDocument.load(bytes, { ignoreEncryption: false } as any);
    return false;
  } catch (error) {
    const mapped = mapPdfError(error);
    return mapped.code === 'encrypted';
  }
};
