/**
 * Extract the first frame from a video file to use as a thumbnail
 * Clean, simple implementation with proper aspect ratio handling
 */
export const extractVideoThumbnail = (
  videoUrl: string,
  timeInSeconds: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail extraction timeout'));
    }, 10000);

    const cleanup = (video?: HTMLVideoElement) => {
      if (timeoutId) clearTimeout(timeoutId);
      if (video) {
        video.pause();
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('error', onError);
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const onLoadedMetadata = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement | null;
      if (!video) return;
      
      try {
        video.currentTime = Math.min(timeInSeconds, video.duration * 0.25);
      } catch (err) {
        console.warn('Failed to seek video:', err);
      }
    };

    const onSeeked = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement | null;
      if (!video) return;

      try {
        const canvas = document.createElement('canvas');
        
        // Maintain aspect ratio - don't stretch
        const aspectRatio = video.videoWidth / video.videoHeight;
        canvas.width = 400;
        canvas.height = Math.round(400 / aspectRatio);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Clear canvas and draw image
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        cleanup(video);

        if (thumbnail && thumbnail.length > 100) {
          resolve(thumbnail);
        } else {
          reject(new Error('Generated thumbnail is invalid'));
        }
      } catch (error) {
        cleanup(video);
        reject(error);
      }
    };

    const onError = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement | null;
      cleanup(video ?? undefined);
      reject(new Error(`Failed to load video: ${video?.error?.message || 'Unknown error'}`));
    };

    // Try direct URL first
    const loadVideo = (url: string) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', onError);

      video.src = url;
    };

    loadVideo(videoUrl);
  });
};
