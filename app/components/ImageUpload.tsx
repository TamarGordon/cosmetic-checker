'use client';

import { useCallback, useRef, useState } from 'react';
import { Camera, LoaderCircle, TriangleAlert, X } from 'lucide-react';

type UploadState = 'idle' | 'converting' | 'ready' | 'error';

function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

async function toJpeg(blob: Blob, originalName: string): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({ blob, toType: 'image/jpeg', quality: 0.92 });
  const converted = Array.isArray(result) ? result[0] : result;
  const jpegName = originalName.replace(/\.hei[cf]$/i, '.jpg');
  return new File([converted], jpegName, { type: 'image/jpeg' });
}

interface ImageUploadProps {
  onFile: (file: File, previewUrl: string) => void;
  onReset: () => void;
}

export default function ImageUpload({ onFile, onReset }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);

  const processFile = useCallback(
    async (raw: File) => {
      setErrorMsg(null);
      console.log('File selected:', { name: raw.name, type: raw.type, sizeKb: (raw.size / 1024).toFixed(1) });

      if (!raw.type.startsWith('image/') && !isHeicFile(raw)) {
        setErrorMsg('Please select an image file.');
        setState('error');
        return;
      }

      setState('converting');

      try {
        const file = isHeicFile(raw) ? await toJpeg(raw, raw.name) : raw;

        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        const url = URL.createObjectURL(file);
        prevUrlRef.current = url;

        setPreviewUrl(url);
        setState('ready');
        onFile(file, url);
        console.log('Preview ready.');
      } catch (err: any) {
        console.error('Error processing image:', err);
        setErrorMsg('Could not process this image. Please try another file.');
        setState('error');
      }
    },
    [onFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('onChange fired. Files:', e.target.files?.length);
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const triggerPicker = () => fileInputRef.current?.click();

  const reset = () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setPreviewUrl(null);
    setState('idle');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic,image/heif,.heic,.heif"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload image"
      />

      {state === 'idle' || state === 'error' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={triggerPicker}
          onKeyDown={(e) => e.key === 'Enter' && triggerPicker()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            'flex flex-col items-center justify-center gap-3.5',
            'w-full min-h-[220px] rounded-lg border border-dashed',
            'cursor-pointer select-none transition-colors duration-150',
            isDragOver
              ? 'border-ink bg-fill'
              : state === 'error'
                ? 'border-bad/40 bg-bad-bg'
                : 'border-line bg-paper hover:border-mist hover:bg-fill/50',
          ].join(' ')}
        >
          <div
            className={[
              'flex h-12 w-12 items-center justify-center border rounded-md',
              state === 'error' ? 'border-bad/30 bg-bad-bg text-bad' : 'border-line bg-bone text-ink',
            ].join(' ')}
          >
            {state === 'error' ? (
              <TriangleAlert className="h-5 w-5" strokeWidth={1.6} />
            ) : (
              <Camera className="h-5 w-5" strokeWidth={1.6} />
            )}
          </div>

          <div className="px-6 text-center">
            {state === 'error' ? (
              <>
                <p className="text-sm font-semibold text-bad">{errorMsg}</p>
                <p className="mt-1 text-xs text-stone">Tap to try again</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink">Snap or upload the label</p>
                <p className="mt-1 text-xs text-mist">
                  Point at the ingredients list · HEIC, JPEG, PNG, WebP
                </p>
              </>
            )}
          </div>
        </div>
      ) : state === 'converting' ? (
        <div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-paper">
          <div className="flex items-center gap-2.5">
            <LoaderCircle className="h-5 w-5 animate-spin text-ink" strokeWidth={1.6} />
            <p className="text-sm font-semibold text-ink">Processing image…</p>
          </div>
          <p className="text-xs text-mist">Converting HEIC to JPEG</p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden border border-line bg-ink rounded-lg">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-[420px] w-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={reset}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:bg-ink rounded-md cursor-pointer"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
