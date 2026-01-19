
export enum ProcessingStatus {
  IDLE = 'IDLE',
  LOADING_VIDEO = 'LOADING_VIDEO',
  EXTRACTING = 'EXTRACTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ExtractionResult {
  imageUrl: string;
  blob: Blob;
  fileName: string;
  timestamp: number;
}

export type BatchItemStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export interface BatchItem {
  id: string;
  file: File;
  status: BatchItemStatus;
  result?: ExtractionResult;
  error?: string;
}

export type Language = 
  | 'en' 
  | 'ar' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'hi' 
  | 'it' 
  | 'pl' 
  | 'pt' 
  | 'zh-CN' 
  | 'zh-TW' 
  | 'ja' 
  | 'ko';
