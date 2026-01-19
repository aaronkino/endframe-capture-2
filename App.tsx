import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, AlertCircle, Layers, ChevronDown, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { extractFrames, downloadBlob, isValidVideoFile } from './utils/videoUtils';
import { ProcessingStatus, ExtractionResult, BatchItem, Language } from './types';
import { translations } from './utils/translations';
import Button from './components/Button';
import { FrameDisplay } from './components/FrameDisplay';
import BatchProgress from './components/BatchProgress';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'it', label: 'Italiano' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

const App: React.FC = () => {
  // Settings
  const [lang, setLang] = useState<Language>('en');
  const [frameCount, setFrameCount] = useState<number>(1);
  const [autoDownload, setAutoDownload] = useState<boolean>(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Initialize Language based on browser
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    // Simple matching for supported languages
    if (browserLang.startsWith('zh-cn') || browserLang === 'zh') {
      setLang('zh-CN');
    } else if (browserLang.startsWith('zh')) {
      setLang('zh-TW');
    } else if (browserLang.startsWith('ja')) {
      setLang('ja');
    } else if (browserLang.startsWith('ko')) {
      setLang('ko');
    } else if (browserLang.startsWith('es')) {
      setLang('es');
    } else if (browserLang.startsWith('fr')) {
      setLang('fr');
    } else if (browserLang.startsWith('de')) {
      setLang('de');
    } else if (browserLang.startsWith('it')) {
      setLang('it');
    } else if (browserLang.startsWith('pt')) {
      setLang('pt');
    } else if (browserLang.startsWith('pl')) {
      setLang('pl');
    } else if (browserLang.startsWith('hi')) {
      setLang('hi');
    } else if (browserLang.startsWith('ar')) {
      setLang('ar');
    } else {
      setLang('en');
    }
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.lang-dropdown')) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Single Mode State
  const [singleStatus, setSingleStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<ExtractionResult | null>(null);

  // Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const changeLanguage = (l: Language) => {
    setLang(l);
    setIsLangMenuOpen(false);
  };

  const resetState = () => {
    // Reset Single
    setSingleStatus(ProcessingStatus.IDLE);
    setSingleError(null);
    if (singleResult) {
      URL.revokeObjectURL(singleResult.imageUrl);
    }
    setSingleResult(null);

    // Reset Batch
    setIsBatchMode(false);
    setBatchItems([]);
    setIsBatchProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processSingleVideo = async (file: File) => {
    try {
      setSingleStatus(ProcessingStatus.LOADING_VIDEO);
      const results = await extractFrames(file, frameCount);
      
      // We display the very last frame (index 0) in the UI
      setSingleResult(results[0]);
      setSingleStatus(ProcessingStatus.COMPLETED);
      
      // Auto Download logic
      if (autoDownload) {
        results.forEach(res => {
          downloadBlob(res.blob, res.fileName);
        });
      }

    } catch (err: any) {
      console.error(err);
      setSingleStatus(ProcessingStatus.ERROR);
      setSingleError(err.message || t.failed);
    }
  };

  const processBatchVideos = async (files: File[]) => {
    setIsBatchMode(true);
    setIsBatchProcessing(true);
    
    // Initialize items
    const items: BatchItem[] = files.map((file, index) => ({
      id: `batch-${index}-${Date.now()}`,
      file,
      status: 'PENDING'
    }));
    setBatchItems(items);

    // Process sequentially
    for (let i = 0; i < items.length; i++) {
      const currentItem = items[i];
      
      // Update status to processing
      setBatchItems(prev => prev.map(item => 
        item.id === currentItem.id ? { ...item, status: 'PROCESSING' } : item
      ));

      try {
        const results = await extractFrames(currentItem.file, frameCount);
        
        // Auto Download logic
        if (autoDownload) {
          results.forEach(res => {
             downloadBlob(res.blob, res.fileName);
          });
        }

        // Update status to completed (showing the first result/last frame as thumbnail)
        setBatchItems(prev => prev.map(item => 
          item.id === currentItem.id ? { ...item, status: 'COMPLETED', result: results[0] } : item
        ));
      } catch (err: any) {
        // Update status to error
        setBatchItems(prev => prev.map(item => 
          item.id === currentItem.id ? { ...item, status: 'ERROR', error: err.message } : item
        ));
      }
    }

    setIsBatchProcessing(false);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    // Capture files BEFORE resetting state.
    const rawFiles = Array.from(fileList);

    resetState();

    const files: File[] = [];

    // Robust file checking
    for (const f of rawFiles) {
      if (isValidVideoFile(f)) {
        files.push(f);
      }
    }

    if (files.length === 0) {
      setSingleError(t.errorVideo);
      setSingleStatus(ProcessingStatus.ERROR);
      return;
    }

    if (files.length === 1) {
      // Single Mode
      processSingleVideo(files[0]);
    } else {
      // Batch Mode
      processBatchVideos(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Helper for slider label
  const getSliderLabel = (val: number) => {
    if (val === 1) return t.frame1x;
    if (val === 2) return t.frame2x;
    return t.frame3x;
  };

  // Find current language object
  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <nav className="relative z-20 w-full p-4 flex justify-end">
        {/* Language Dropdown - TEXT ONLY */}
        <div className="relative lang-dropdown">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLangMenuOpen(!isLangMenuOpen); }}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors text-sm text-slate-300 shadow-md"
          >
            <span className="font-medium">{currentLangObj.label}</span>
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 max-h-[300px] overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-200 z-50">
              {languages.map((l) => (
                <button 
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700/50 flex items-center justify-between group transition-colors"
                >
                  <span className="text-slate-200 group-hover:text-white font-medium">{l.label}</span>
                  {lang === l.code && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 pb-12 pt-4 flex flex-col items-center min-h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
            {t.title}
          </h1>
          <p className="text-lg text-slate-400">
            {t.subtitle}
          </p>
          
          {/* Auto Download Toggle */}
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setAutoDownload(!autoDownload)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                autoDownload 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {autoDownload ? (
                <ToggleRight className="w-6 h-6 text-indigo-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-500" />
              )}
              <span className="text-sm font-medium">
                {autoDownload ? t.autoDownloadOn : t.autoDownloadOff}
              </span>
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="w-full flex flex-col items-center justify-center flex-1">
          
          {/* UPLOAD ZONE */}
          {!isBatchMode && singleStatus === ProcessingStatus.IDLE && (
            <div 
              className="w-full max-w-xl animate-in fade-in zoom-in duration-500 flex flex-col space-y-6"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label 
                htmlFor="video-upload" 
                className="group relative flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer backdrop-blur-sm"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="relative mb-6">
                    <div className="p-5 bg-slate-900 rounded-full group-hover:scale-110 transition-transform shadow-xl shadow-black/20 group-hover:shadow-indigo-500/20 relative z-10 border border-slate-800">
                      <Upload className="w-10 h-10 text-indigo-400" />
                    </div>
                  </div>
                  
                  <p className="mb-2 text-xl font-medium text-slate-200">
                    {t.clickUpload}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    {t.supportFormat}
                  </p>
                  
                  <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700/50 rounded-full border border-indigo-500/20">
                     <Layers className="w-3 h-3 text-indigo-300" />
                     <span className="text-xs text-indigo-300">{t.batchTag}</span>
                  </div>
                </div>
                <input 
                  id="video-upload" 
                  ref={fileInputRef}
                  type="file" 
                  accept="video/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>

              {/* Slider for Frame Count */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <label htmlFor="frame-slider" className="text-sm font-medium text-slate-300 flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-indigo-400" />
                    {t.frameCountLabel}
                  </label>
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full text-sm border border-indigo-500/20">
                    {getSliderLabel(frameCount)}
                  </span>
                </div>
                <input 
                  id="frame-slider"
                  type="range" 
                  min="1" 
                  max="3" 
                  step="1"
                  value={frameCount}
                  onChange={(e) => setFrameCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                </div>
              </div>
            </div>
          )}

          {/* SINGLE FILE: Loading State */}
          {!isBatchMode && (singleStatus === ProcessingStatus.LOADING_VIDEO || singleStatus === ProcessingStatus.EXTRACTING) && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-8 h-8 text-indigo-400 opacity-50" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-slate-200">{t.processing}</h3>
                <p className="text-slate-500">{t.seeking}</p>
              </div>
            </div>
          )}

          {/* SINGLE FILE: Error State */}
          {!isBatchMode && singleStatus === ProcessingStatus.ERROR && (
            <div className="w-full max-w-md bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-center animate-in fade-in zoom-in">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-200 mb-2">{t.failed}</h3>
              <p className="text-red-300/70 mb-6">{singleError}</p>
              <Button onClick={resetState} variant="secondary">{t.tryAgain}</Button>
            </div>
          )}

          {/* SINGLE FILE: Success State (No AI) */}
          {!isBatchMode && singleStatus === ProcessingStatus.COMPLETED && singleResult && (
            <FrameDisplay 
              result={singleResult}
              onDownload={() => downloadBlob(singleResult.blob, singleResult.fileName)}
              onReset={resetState}
              lang={lang}
            />
          )}

          {/* BATCH MODE: Progress List (No AI) */}
          {isBatchMode && (
            <BatchProgress 
              items={batchItems}
              onReset={resetState}
              onDownloadItem={(result) => downloadBlob(result.blob, result.fileName)}
              isProcessing={isBatchProcessing}
              autoDownload={autoDownload}
              lang={lang}
            />
          )}

        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>{t.localOnly}</p>
        </footer>
      </main>
    </div>
  );
};

export default App;