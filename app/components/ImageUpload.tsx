'use client';

import { useCallback, useRef, useState } from 'react';

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
      } catch {
        setErrorMsg('Could not process this image. Please try another file.');
        setState('error');
      }
    },
    [onFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            'flex flex-col items-center justify-center gap-4',
            'w-full min-h-[260px] rounded-2xl border-2 border-dashed',
            'cursor-pointer select-none transition-colors duration-150',
            'active:scale-[0.99]',
            isDragOver
              ? 'border-indigo-400 bg-indigo-50'
              : state === 'error'
                ? 'border-red-300 bg-red-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40',
          ].join(' ')}
        >
          <div
            className={[
              'rounded-full p-4',
              state === 'error' ? 'bg-red-100' : 'bg-white shadow-sm',
            ].join(' ')}
          >
            {state === 'error' ? (
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            ) : (
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 3v18M3 3l18 18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 18h16.5M3.75 3.75h16.5v13.5H3.75V3.75z"
                />
              </svg>
            )}
          </div>

          <div className="text-center px-4">
            {state === 'error' ? (
              <>
                <p className="font-medium text-red-600 text-sm">{errorMsg}</p>
                <p className="mt-1 text-xs text-red-400">Tap to try again</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-700 text-base">
                  Tap to upload a photo
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Supports HEIC, JPEG, PNG, WebP
                </p>
              </>
            )}
          </div>
        </div>
      ) : state === 'converting' ? (
        <div className="flex flex-col items-center justify-center gap-4 w-full min-h-[260px] rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 animate-spin text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm font-medium text-indigo-600">
              Processing image…
            </p>
          </div>
          <p className="text-xs text-indigo-400">Converting HEIC to JPEG</p>
        </div>
      ) : (
        <div className="relative w-full rounded-2xl overflow-hidden bg-black">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full max-h-[480px] object-contain"
            />
          )}
          <button
            type="button"
            onClick={reset}
            className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
            aria-label="Remove image"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
