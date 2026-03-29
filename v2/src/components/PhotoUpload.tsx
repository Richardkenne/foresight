'use client';

import { useState, useRef, useCallback } from 'react';
import exifr from 'exifr';
import heic2any from 'heic2any';

interface SimulationSeed {
  id: number;
  title: string;
  scenario: string;
  category: string;
  confidence: number;
  icon: string;
}

interface PhotoContext {
  location: string | null;
  time_of_day: string | null;
  scene_type: string;
  objects: string[];
  activities: string[];
  economic_signals: string[];
}

interface PhotoUploadProps {
  onSeedSelect: (scenario: string, photoPreview?: string) => void;
  onClose: () => void;
}

// Lucide-style icon paths
const ICON_PATHS: Record<string, string> = {
  'building': 'M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16',
  'car': 'M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2m4 0a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0',
  'users': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M14 3.5a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  'coffee': 'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v4M10 2v4M14 2v4',
  'trending-up': 'M22 7l-8.5 8.5-5-5L2 17',
  'briefcase': 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  'clock': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  'dollar-sign': 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  'globe': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10',
  'heart': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78',
  'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
  'shopping-cart': 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6',
  'truck': 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  'home': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10',
};

const CATEGORY_COLORS: Record<string, string> = {
  'business': '#3b82f6',
  'money': '#10b981',
  'career': '#8b5cf6',
  'life': '#f59e0b',
  'urban': '#6366f1',
  'social': '#ec4899',
};

function SeedIcon({ name }: { name: string }) {
  const d = ICON_PATHS[name] || ICON_PATHS['zap'];
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function PhotoUpload({ onSeedSelect, onClose }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [seeds, setSeeds] = useState<SimulationSeed[] | null>(null);
  const [context, setContext] = useState<PhotoContext | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif'
      || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

    if (!file.type.startsWith('image/') && !isHeic) {
      setError('Please upload an image file');
      return;
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      setError('Image too large (max 20MB)');
      return;
    }

    setError('');
    setSeeds(null);
    setContext(null);
    setAnalyzing(true);

    // Extract EXIF before conversion (HEIC has EXIF too)
    let exifData: { lat?: number; lng?: number; datetime?: string; camera?: string } | undefined;
    try {
      const parsed = await exifr.parse(file, {
        gps: true,
        pick: ['DateTimeOriginal', 'Make', 'Model', 'GPSLatitude', 'GPSLongitude'],
      });
      if (parsed) {
        exifData = {};
        if (parsed.latitude != null) exifData.lat = parsed.latitude;
        if (parsed.longitude != null) exifData.lng = parsed.longitude;
        if (parsed.DateTimeOriginal) {
          exifData.datetime = new Date(parsed.DateTimeOriginal).toISOString();
        }
        if (parsed.Make || parsed.Model) {
          exifData.camera = [parsed.Make, parsed.Model].filter(Boolean).join(' ');
        }
      }
    } catch {
      // EXIF extraction failed — continue without it
    }

    // Convert HEIC → JPEG if needed
    let processedFile = file;
    if (isHeic) {
      try {
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
        processedFile = new File(
          [Array.isArray(blob) ? blob[0] : blob],
          file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
          { type: 'image/jpeg' }
        );
      } catch {
        setError('Could not convert HEIC. Try a JPG or PNG instead.');
        setAnalyzing(false);
        return;
      }
    }

    // Read as data URL for preview + API
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      // Resize image for API (max 1024px, reduces tokens)
      const resized = await resizeImage(dataUrl, 1024);

      try {
        const res = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: resized, exif: exifData }),
        });

        if (!res.ok) throw new Error('Analysis failed');
        const data = await res.json();

        if (data.seeds) {
          setSeeds(data.seeds);
          setContext(data.context);
        } else {
          setError('Could not analyze photo');
        }
      } catch {
        setError('Failed to analyze photo. Try again.');
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(processedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSeedClick = (seed: SimulationSeed) => {
    onSeedSelect(seed.scenario, preview || undefined);
    onClose();
  };

  const reset = () => {
    setPreview(null);
    setSeeds(null);
    setContext(null);
    setError('');
    setAnalyzing(false);
  };

  return (
    <div
      className="absolute top-12 right-0 z-[200]"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-[#141414] rounded-xl overflow-hidden w-[95vw] sm:min-w-[400px] max-w-[440px] flex flex-col"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">
              Photo to Simulation
            </span>
          </div>
          {preview && (
            <button
              onClick={reset}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              New photo
            </button>
          )}
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800/50" />

        {/* Drop zone or Preview */}
        {!preview ? (
          <div
            className="p-4"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragOver ? '#3b82f6' : 'rgba(0,0,0,0.1)',
                background: dragOver ? 'rgba(59,130,246,0.04)' : 'transparent',
              }}
              onClick={() => fileRef.current?.click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-gray-300 dark:text-gray-600">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[13px] text-gray-500 dark:text-gray-400">
                Drop a photo or click to upload
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                AI analyzes the scene and generates simulation options
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="relative">
            {/* Image preview */}
            <div className="h-[140px] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Uploaded scene"
                className="w-full h-full object-cover"
              />
              {/* Context overlay */}
              {context && (
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {context.location && (
                      <span className="text-[10px] text-white/90 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {context.location}
                      </span>
                    )}
                    {context.time_of_day && (
                      <span className="text-[10px] text-white/90 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {context.time_of_day}
                      </span>
                    )}
                    {context.scene_type && (
                      <span className="text-[10px] text-white/90 bg-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {context.scene_type}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Analyzing state */}
            {analyzing && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="text-[12px] text-gray-500">Analyzing scene...</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {['Detecting objects & activities', 'Reading economic signals', 'Identifying location & time', 'Generating simulation seeds'].map((step, i) => (
                    <div key={i} className="text-[10px] text-gray-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 text-center">
                <p className="text-[12px] text-red-500">{error}</p>
                <button
                  onClick={reset}
                  className="mt-2 text-[11px] text-gray-500 hover:text-gray-700 underline cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Seed list */}
        {seeds && seeds.length > 0 && (
          <>
            <div className="h-px bg-gray-100 dark:bg-gray-800/50" />
            <div className="px-4 pt-3 pb-1.5">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Simulation options
              </span>
            </div>
            <div className="overflow-y-auto px-3 pb-3" style={{ maxHeight: '280px', scrollbarWidth: 'thin' }}>
              {seeds.map((seed) => (
                <div
                  key={seed.id}
                  className="group mx-1 px-3 py-3 rounded-lg cursor-pointer transition-all"
                  onClick={() => handleSeedClick(seed)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${CATEGORY_COLORS[seed.category] || '#6b7280'}15`,
                        color: CATEGORY_COLORS[seed.category] || '#6b7280',
                      }}
                    >
                      <SeedIcon name={seed.icon} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {seed.title}
                        </span>
                        <span
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: `${CATEGORY_COLORS[seed.category] || '#6b7280'}15`,
                            color: CATEGORY_COLORS[seed.category] || '#6b7280',
                          }}
                        >
                          {seed.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                        {seed.scenario}
                      </p>
                      {/* Confidence bar */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${seed.confidence}%`,
                              background: CATEGORY_COLORS[seed.category] || '#6b7280',
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400 shrink-0">
                          {seed.confidence}% match
                        </span>
                      </div>
                    </div>
                    <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Context details (collapsible) */}
            {context && (
              <>
                <div className="h-px bg-gray-100 dark:bg-gray-800/50" />
                <details className="px-4 py-2.5">
                  <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                    Scene analysis details
                  </summary>
                  <div className="mt-2 space-y-1.5 pb-1">
                    {context.objects.length > 0 && (
                      <div className="text-[10px]">
                        <span className="text-gray-500 font-medium">Objects: </span>
                        <span className="text-gray-400">{context.objects.join(', ')}</span>
                      </div>
                    )}
                    {context.activities.length > 0 && (
                      <div className="text-[10px]">
                        <span className="text-gray-500 font-medium">Activities: </span>
                        <span className="text-gray-400">{context.activities.join(', ')}</span>
                      </div>
                    )}
                    {context.economic_signals.length > 0 && (
                      <div className="text-[10px]">
                        <span className="text-gray-500 font-medium">Economy: </span>
                        <span className="text-gray-400">{context.economic_signals.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </details>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Resize image to max dimension while keeping aspect ratio
function resizeImage(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDim && height <= maxDim) {
        resolve(dataUrl);
        return;
      }
      const scale = maxDim / Math.max(width, height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });
}
