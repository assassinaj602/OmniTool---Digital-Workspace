import React from 'react';

export enum ToolCategory {
  IMAGE = 'Image Tools',
  PDF = 'PDF Tools',
  CONVERSION = 'Conversion',
  FUN = 'Fun & Social',
}

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: ToolCategory;
  component: React.ReactNode;
}

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ProcessedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}