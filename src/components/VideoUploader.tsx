import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoUploaderProps {
  campaignId: string;
  onUploadComplete?: (assetId: string, thumbnailUrl: string | null) => void;
  maxSizeMB?: number;
  minDurationSec?: number;
  maxDurationSec?: number;
}

interface UploadState {
  status: 'idle' | 'validating' | 'requesting' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error: string | null;
  assetId: string | null;
  thumbnailUrl: string | null;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  type: string;
}

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm'];
const DEFAULT_MAX_SIZE_MB = 500;
const DEFAULT_MIN_DURATION = 10;
const DEFAULT_MAX_DURATION = 90;

export function VideoUploader({
  campaignId,
  onUploadComplete,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  minDurationSec = DEFAULT_MIN_DURATION,
  maxDurationSec = DEFAULT_MAX_DURATION,
}: VideoUploaderProps): JSX.Element {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    assetId: null,
    thumbnailUrl: null,
  });
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getExtension = (filename: string): string => {
    return '.' + filename.split('.').pop()?.toLowerCase();
  };

  const validateFile = useCallback((file: File): string | null => {
    const ext = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid format. Accepted: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type: ${file.type}. Accepted: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    if (file.size === 0) {
      return 'File is empty';
    }
    return null;
  }, [maxSizeMB]);

  const getVideoMetadata = useCallback((file: File): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          size: file.size,
          type: file.type,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Could not load video metadata'));
      };
      video.src = URL.createObjectURL(file);
    });
  }, []);

  const validateDuration = useCallback((duration: number): string | null => {
    if (!isFinite(duration) || duration <= 0) {
      return 'Could not determine video duration';
    }
    if (duration < minDurationSec) {
      return `Video too short. Minimum: ${minDurationSec} seconds`;
    }
    if (duration > maxDurationSec) {
      return `Video too long. Maximum: ${maxDurationSec} seconds`;
    }
    return null;
  }, [minDurationSec, maxDurationSec]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setState(prev => ({ ...prev, status: 'validating', progress: 0, error: null }));

      // Step 1: Validate file format
      const formatError = validateFile(file);
      if (formatError) {
        throw new Error(formatError);
      }
      setState(prev => ({ ...prev, status: 'validating', progress: 5 }));

      // Step 2: Get video metadata (duration, resolution)
      const metadata = await getVideoMetadata(file);
      setVideoMetadata(metadata);
      
      // Step 3: Validate duration
      const durationError = validateDuration(metadata.duration);
      if (durationError) {
        throw new Error(durationError);
      }
      setState(prev => ({ ...prev, status: 'requesting', progress: 10 }));

      // Step 4: Request signed URL (simulated for now)
      // In production: await videoService.getSignedUploadUrl(campaignId, file.name, file.type)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const assetId = crypto.randomUUID();

      setState(prev => ({ ...prev, status: 'uploading', progress: 15 }));

      // Step 5: Upload with progress (simulated)
      const uploadPromise = new Promise<void>((resolve) => {
        // Simulate upload progress
        let progress = 15;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 85) {
            clearInterval(interval);
            progress = 85;
          }
          setState(prev => ({ ...prev, progress: Math.min(progress, 85) }));
        }, 200);

        // Simulate upload completion
        setTimeout(() => {
          clearInterval(interval);
          setState(prev => ({ ...prev, progress: 90, status: 'processing' }));
          resolve();
        }, 1500);
      });

      await uploadPromise;

      // Step 6: Processing (simulated thumbnail generation)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate placeholder thumbnail URL
      const thumbnailUrl = `https://picsum.photos/seed/${assetId}/640/360`;

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        assetId,
        thumbnailUrl,
      }));

      onUploadComplete?.(assetId, thumbnailUrl);

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  }, [campaignId, validateFile, getVideoMetadata, validateDuration, onUploadComplete]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadFile(file);
  }, [uploadFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ ...prev, status: 'error', error: validationError }));
      return;
    }

    uploadFile(file);
  }, [validateFile, uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      assetId: null,
      thumbnailUrl: null,
    });
    setVideoMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getStatusColor = () => {
    switch (state.status) {
      case 'validating': return 'text-yellow-400';
      case 'requesting': return 'text-blue-400';
      case 'uploading': return 'text-blue-400';
      case 'processing': return 'text-purple-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'validating': return 'Validating video...';
      case 'requesting': return 'Preparing upload...';
      case 'uploading': return `Uploading... ${Math.round(state.progress)}%`;
      case 'processing': return 'Processing video...';
      case 'complete': return 'Upload complete!';
      case 'error': return state.error || 'Upload failed';
      default: return 'Drop your video here or click to browse';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {state.status === 'complete' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-video bg-obsidian-light rounded-xl overflow-hidden border-2 border-vibe-mint/50"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-vibe-mint/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-vibe-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-vibe-mint font-medium">Video uploaded successfully!</p>
                {videoMetadata && (
                  <p className="text-sm text-gray-400 mt-2">
                    {formatDuration(videoMetadata.duration)} • {videoMetadata.width}x{videoMetadata.height}
                  </p>
                )}
                <button
                  onClick={reset}
                  className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Upload another video
                </button>
              </div>
            </div>
            {state.thumbnailUrl && (
              <img 
                src={state.thumbnailUrl} 
                alt="Video thumbnail" 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`
                relative aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer
                ${state.status === 'error' 
                  ? 'border-red-500/50 bg-red-500/5' 
                  : 'border-white/20 hover:border-vibe-mint/50 bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className={`
                  w-14 h-14 mb-4 rounded-full flex items-center justify-center
                  ${state.status === 'error' ? 'bg-red-500/20' : 'bg-vibe-mint/20'}
                `}>
                  {state.status === 'uploading' || state.status === 'processing' || state.status === 'validating' ? (
                    <svg className="w-7 h-7 text-vibe-mint animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className={`w-7 h-7 ${state.status === 'error' ? 'text-red-400' : 'text-vibe-mint'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>
                
                <p className={`text-center font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
                
                <p className="text-sm text-gray-500 mt-2">
                  {ALLOWED_EXTENSIONS.join(', ')} • Max {maxSizeMB}MB • {minDurationSec}-{maxDurationSec}s
                </p>

                {(state.status === 'uploading' || state.status === 'processing' || state.status === 'validating') && (
                  <div className="w-48 h-2 mt-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-vibe-mint"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Display */}
            {videoMetadata && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 text-sm text-gray-400"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(videoMetadata.duration)}
                </span>
                <span>•</span>
                <span>{videoMetadata.width}x{videoMetadata.height}</span>
                <span>•</span>
                <span>{formatSize(videoMetadata.size)}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
