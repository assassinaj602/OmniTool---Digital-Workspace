import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationProvider } from '../../components/NotificationContext';
import { PdfMerge } from '../PdfMerge';
import { PdfProtect } from '../PdfProtect';
import { PdfSplit } from '../PdfSplit';
import { PdfUnlock } from '../PdfUnlock';
import { PdfWatermark } from '../PdfWatermark';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<NotificationProvider>{ui}</NotificationProvider>);
};

describe('PDF tool integration smoke tests', () => {
  it('renders PdfWatermark upload state', () => {
    renderWithProvider(<PdfWatermark />);
    expect(screen.getByText('Watermark PDF')).toBeInTheDocument();
    expect(screen.getByText('Upload PDF to watermark')).toBeInTheDocument();
  });

  it('renders PdfMerge upload state', () => {
    renderWithProvider(<PdfMerge />);
    expect(screen.getByText('Merge PDF')).toBeInTheDocument();
    expect(screen.getByText('Select PDF files')).toBeInTheDocument();
  });

  it('renders PdfSplit upload state', () => {
    renderWithProvider(<PdfSplit />);
    expect(screen.getByText('Split PDF')).toBeInTheDocument();
    expect(screen.getByText('Upload PDF to split')).toBeInTheDocument();
  });

  it('renders PdfProtect upload state', () => {
    renderWithProvider(<PdfProtect />);
    expect(screen.getByText('Protect PDF')).toBeInTheDocument();
    expect(screen.getByText('Upload PDF to protect')).toBeInTheDocument();
  });

  it('renders PdfUnlock upload state', () => {
    renderWithProvider(<PdfUnlock />);
    expect(screen.getByText('Unlock PDF')).toBeInTheDocument();
    expect(screen.getByText('Upload protected PDF')).toBeInTheDocument();
  });
});
