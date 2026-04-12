export const buildPdfDownloadName = (originalName: string, suffix: string) => {
  const base = originalName.replace(/\.pdf$/i, '');
  return `${base}-${suffix}.pdf`;
};

export const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const downloadPdfBytes = (bytes: Uint8Array, fileName: string) => {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  triggerBlobDownload(blob, fileName);
};
