'use client';

import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import AnalysisResults from './components/AnalysisResults';
import MobileConsoleDebugger from './components/MobileConsoleDebugger';

type CheckState = 'idle' | 'checking' | 'done' | 'error';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = (file: File, _previewUrl: string) => {
    setUploadedFile(file);
    setCheckState('idle');
    setAnalysisResults(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setCheckState('idle');
    setAnalysisResults(null);
    setErrorMessage(null);
  };

  const handleCheck = async () => {
    if (!uploadedFile) return;
    setCheckState('checking');
    setErrorMessage(null);

    try {
      const body = new FormData();
      body.append('image', uploadedFile);
      const res = await fetch('/api/check', { method: 'POST', body });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setAnalysisResults(data);
      setCheckState('done');
    } catch (error: any) {
      console.error('Error checking ingredients:', error);
      setErrorMessage(error.message || 'Something went wrong');
      setCheckState('error');
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧴</span>
            <span className="font-semibold text-slate-800 tracking-tight">
              Cosmetic Checker
            </span>
          </div>
          {checkState === 'done' && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          {checkState !== 'done' && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                  Check your product
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a photo of the ingredients label or product packaging.
                </p>
              </div>

              <ImageUpload onFile={handleFile} onReset={handleReset} />

              {uploadedFile && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                    <svg
                      className="h-4 w-4 shrink-0 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 3.75h16.5v13.5H3.75V3.75z"
                      />
                    </svg>
                    <span className="truncate text-xs text-slate-600">
                      {uploadedFile.name}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheck}
                    disabled={checkState === 'checking'}
                    className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 hover:bg-indigo-500"
                  >
                    {checkState === 'checking' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
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
                        Analyzing…
                      </span>
                    ) : (
                      'Check Ingredients'
                    )}
                  </button>

                  {checkState === 'error' && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-sm font-medium text-red-700">
                        Something went wrong
                      </p>
                      {errorMessage && (
                        <p className="mt-1 text-xs text-red-600 font-mono break-words">
                          {errorMessage}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-red-400">
                        Please try again or upload a clearer image.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {checkState === 'done' && analysisResults && (
            <AnalysisResults results={analysisResults} onReset={handleReset} />
          )}
        </div>
      </main>
      
      {/* Real-time logging console specifically for your mobile phone debugging */}
      <MobileConsoleDebugger />
    </div>
  );
}
