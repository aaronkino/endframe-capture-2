import { ExtractionResult } from '../types';

// Robust check for video files, including HEVC, H.264, H.265, AVI, MOV
export const isValidVideoFile = (file: File): boolean => {
  // Common video extensions and the specific ones requested
  const validExtensions = /\.(mp4|mov|webm|avi|mkv|hevc|ts|m4v|h264|h265|264|265|3gp)$/i;
  return file.type.startsWith('video/') || validExtensions.test(file.name);
};

// Check if device is iOS/iPadOS
const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

/**
 * Extracts N frames from the end of the video.
 */
export const extractFrames = (file: File, count: number = 1): Promise<ExtractionResult[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const results: ExtractionResult[] = [];
    
    // Fail & Cleanup helper
    const fail = (error: Error) => {
      cleanUp();
      reject(error);
    };

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      video.onseeked = null;
      video.onloadedmetadata = null;
      video.ondurationchange = null;
      video.onloadeddata = null;
      video.onerror = null;
    };

    // Essential for iOS/Safari compatibility
    video.playsInline = true;
    video.muted = true;
    video.preload = 'metadata'; // Stronger hint for metadata only initially
    video.src = objectUrl;

    let currentFrameIndex = 0;
    
    const captureFrame = async (timestamp: number) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get canvas context");

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const blob = await new Promise<Blob | null>((blobResolve) => 
              canvas.toBlob(blobResolve, 'image/png', 1.0)
            );

            if (!blob) throw new Error("Failed to create image blob");

            const imageUrl = URL.createObjectURL(blob);
            const suffix = count > 1 ? `_${count - currentFrameIndex}` : '';

            results.push({
              imageUrl,
              blob,
              fileName: `${file.name.replace(/\.[^/.]+$/, "")}_end${suffix}.png`,
              timestamp: timestamp
            });

            currentFrameIndex++;
            processNextFrame();

        } catch (e) {
            fail(e instanceof Error ? e : new Error(String(e)));
        }
    };

    const processNextFrame = () => {
        if (currentFrameIndex >= count) {
            cleanUp();
            resolve(results);
            return;
        }

        const END_EPSILON = 0.001;
        const FRAME_STRIDE = 0.1; 
        let seekTime = video.duration - END_EPSILON - (currentFrameIndex * FRAME_STRIDE);
        seekTime = Math.max(0, seekTime);
        
        // Timeout-based seek wait to prevent infinite stall on mobile
        let seeked = false;
        const onSeeked = () => {
          if (seeked) return;
          seeked = true;
          video.onseeked = null;
          captureFrame(video.currentTime);
        };

        video.onseeked = onSeeked;
        video.currentTime = seekTime;

        // Fallback for mobile if seeked event never fires
        setTimeout(() => {
          if (!seeked) {
            console.warn("Seeked event timed out, attempting capture anyway...");
            onSeeked();
          }
        }, 2000); 
    };

    // Handle initialization with fallback for mobile duration update stalls
    let initialized = false;
    const onReady = () => {
      if (initialized || video.duration === 0 || isNaN(video.duration)) return;
      initialized = true;
      processNextFrame();
    };

    video.onloadedmetadata = onReady;
    video.ondurationchange = onReady;
    video.onloadeddata = onReady;
    
    video.onerror = () => {
      fail(new Error(`Error loading video file (${file.name}). Format might not be supported.`));
    };

    // Force load for mobile
    video.load();
  });
};

/**
 * Robust blob download/sharing for mobile and desktop
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  // 1. Try Web Share API first for mobile (Sync path to avoid popup blockers)
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: filename,
        }).catch(err => {
          console.error("Share failed, falling back to download", err);
          executeFallbackDownload(blob, filename);
        });
        return;
      }
    } catch (e) {
      console.warn("File constructor or share failed", e);
    }
  }

  executeFallbackDownload(blob, filename);
};

const executeFallbackDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  
  // 2. iOS Safari Fallback (Download attribute often ignored)
  if (isIOS()) {
    const newTab = window.open(url, '_blank');
    if (!newTab) {
      // If blocked, try direct location change
      window.location.href = url;
    }
    return;
  }

  // 3. Standard Desktop Download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
