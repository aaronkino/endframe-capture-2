import React from 'react';
import { BatchItem, Language, ExtractionResult } from '../types';
import { translations } from '../utils/translations';
import Button from './Button';
import { CheckCircle2, Circle, Loader2, AlertCircle, ArrowLeft, Download } from 'lucide-react';

interface BatchProgressProps {
  items: BatchItem[];
  onReset: () => void;
  onDownloadItem: (result: ExtractionResult) => void;
  isProcessing: boolean;
  autoDownload: boolean;
  lang: Language;
}

const BatchProgress: React.FC<BatchProgressProps> = ({ 
  items, 
  onReset, 
  onDownloadItem,
  isProcessing, 
  autoDownload,
  lang 
}) => {
  const t = translations[lang];
  const completedCount = items.filter(i => i.status === 'COMPLETED').length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Stats */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-xl">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{t.batchTitle}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {isProcessing ? t.batchProcessing : t.batchCompleted}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-400">{completedCount}/{items.length}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{t.processed}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden max-h-[600px] overflow-y-auto">
        <div className="divide-y divide-slate-800">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors gap-4">
              
              <div className="flex items-center space-x-4 flex-1 overflow-hidden">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {item.status === 'PENDING' && <Circle className="w-6 h-6 text-slate-600" />}
                  {item.status === 'PROCESSING' && <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />}
                  {item.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                  {item.status === 'ERROR' && <AlertCircle className="w-6 h-6 text-red-400" />}
                </div>

                {/* Thumbnail Preview */}
                <div className="flex-shrink-0 w-24 h-16 bg-slate-950 rounded-md overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                  {item.result ? (
                     <>
                      <img src={item.result.imageUrl} alt="Frame" className="w-full h-full object-cover" />
                      {/* Hover overlay for quick download */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => onDownloadItem(item.result!)}>
                        <Download className="w-5 h-5 text-white" />
                      </div>
                     </>
                  ) : (
                     <div className="text-xs text-slate-600 text-center px-1">
                       {item.status === 'PROCESSING' ? t.processing : t.pending}
                     </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-sm font-medium truncate ${item.status === 'COMPLETED' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {item.file.name}
                  </span>
                  {item.status === 'ERROR' && (
                    <span className="text-xs text-red-400 truncate">{item.error}</span>
                  )}
                  {item.status === 'COMPLETED' && (
                    <div className="flex items-center mt-1">
                      {autoDownload ? (
                        <span className="text-xs text-green-500/70 flex items-center">
                           {t.downloaded}
                        </span>
                      ) : (
                        <button 
                          onClick={() => item.result && onDownloadItem(item.result)}
                          className="text-xs flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {t.downloadNow}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-4">
        {!isProcessing && (
          <Button onClick={onReset} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.processMore}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BatchProgress;