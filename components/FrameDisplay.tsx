import React from 'react';
import { ExtractionResult, Language } from '../types';
import { translations } from '../utils/translations';
import Button from './Button';
import { Download, RefreshCw, FileImage } from 'lucide-react';

interface FrameDisplayProps {
  result: ExtractionResult;
  onDownload: () => void;
  onReset: () => void;
  lang: Language;
}

export const FrameDisplay: React.FC<FrameDisplayProps> = ({ 
  result, 
  onDownload, 
  onReset,
  lang
}) => {
  const t = translations[lang];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm sticky top-4 z-10 shadow-xl">
        <div className="flex items-center space-x-2 text-slate-300">
           <FileImage className="w-5 h-5 text-indigo-400" />
           <span className="font-medium truncate max-w-[150px] sm:max-w-xs">{result.fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onReset} variant="outline" className="text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.new}
          </Button>
          <Button onClick={onDownload} variant="primary" className="text-sm">
            <Download className="w-4 h-4 mr-2" />
            {t.download}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Image Preview - Centered and Large */}
        <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-video flex items-center justify-center">
          <img 
            src={result.imageUrl} 
            alt="Extracted frame" 
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-xs text-center text-slate-500">
          {t.extractTime}: {result.timestamp.toFixed(2)}s
        </p>
      </div>
    </div>
  );
};