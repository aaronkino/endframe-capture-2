import { ExtractionResult } from '../types';

// Robust check for video files, including HEVC, H.264, H.265, AVI, MOV
export const isValidVideoFile = (file: File): boolean => {
  // Common video extensions and the specific ones requested
  const validExtensions = /\.(mp4|mov|webm|avi|mkv|hevc|ts|m4v|h264|h265|264|265|3gp)$/i;
  return file.type.startsWith('video/') || validExtensions.test(file.name);
};

/**
 * Extracts N frames from the end of the video.
 * count = 1: Duration
 * count = 2: Duration, Duration - 0.1s
 * count = 3: Duration, Duration - 0.1s, Duration - 0.2s
 */
export const extractFrames = (file: File, count: number = 1): Promise<ExtractionResult[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const results: ExtractionResult[] = [];
    
    // Essential for iOS/Safari to allow loading metadata without playing
    video.playsInline = true;
    video.muted = true;
    video.src = objectUrl;
    video.preload = 'auto'; 

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
            // Suffix for filename if multiple frames
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
            cleanUp();
            reject(e);
        }
    };

    const processNextFrame = () => {
        if (currentFrameIndex >= count) {
            cleanUp();
            resolve(results);
            return;
        }

        // Calculate timestamp
        // 0 -> duration
        // 1 -> duration - 0.1
        // 2 -> duration - 0.2
        let seekTime = video.duration - (currentFrameIndex * 0.1); // 0.1s interval roughly 3-6 frames depending on fps
        
        // Safety check
        if (seekTime > 0.1) {
            seekTime = seekTime - 0.05; // seek just before end to capture
        } else {
            seekTime = 0; // fallback to start if video is too short
        }
        
        video.currentTime = seekTime;
    };

    const cleanUp = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
        video.onseeked = null;
        video.onloadedmetadata = null;
        video.onerror = null;
    };

    video.onloadedmetadata = () => {
        // Some formats might read infinite duration initially, wait or clamp
        if (video.duration === Infinity) {
             video.currentTime = 1e101; // Hack to trigger duration change in some browsers
             video.ontimeupdate = () => {
                 video.ontimeupdate = null;
                 video.currentTime = 0;
                 processNextFrame();
             }
        } else {
             processNextFrame();
        }
    };

    video.onseeked = () => {
        // Capture after seek is complete
        captureFrame(video.currentTime);
    };

    video.onerror = () => {
      cleanUp();
      reject(new Error(`Error loading video file (${file.name}). The format might not be supported by your browser.`));
    };
  });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};