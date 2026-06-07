'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Image as ImageIcon, LoaderCircle, Sparkles } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import AnalysisResults from './components/AnalysisResults';
import SkinProfileSelector, { SkinProfile } from './components/SkinProfileSelector';
import MobileConsoleDebugger from './components/MobileConsoleDebugger';
import AuthControls from './components/AuthControls';
import ScanHistory from './components/ScanHistory';
import { Logo } from './components/Logo';
import { useAuth } from './components/AuthProvider';
import {
  getUserProfile,
  saveUserProfile,
  addScan,
  getScans,
  type SavedScan,
} from './lib/userData';

type CheckState = 'idle' | 'checking' | 'done' | 'error';

const DEFAULT_PROFILE: SkinProfile = {
  skinType: 'normal',
  gender: 'unspecified',
  ageGroup: 'adult',
  conditions: [],
};

export default function Home() {
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<SkinProfile>(DEFAULT_PROFILE);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [scansLoading, setScansLoading] = useState(false);

  // Load profile from sessionStorage on mount (guest + initial state)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('cosmetic-checker-profile');
        if (saved) {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    }
  }, []);

  // When a user signs in, load their saved profile from Firestore.
  // If they have none yet, migrate the current local profile up to Firestore.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const remote = await getUserProfile(user.uid);
        if (cancelled) return;
        if (remote) {
          setProfile(remote);
          try {
            sessionStorage.setItem('cosmetic-checker-profile', JSON.stringify(remote));
          } catch {}
        } else {
          await saveUserProfile(user.uid, profile, {
            displayName: user.displayName,
            email: user.email,
          });
        }
      } catch (e) {
        console.error('Failed to sync profile with Firestore', e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We intentionally only re-run when the signed-in user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update profile and persist (sessionStorage always; Firestore when signed in)
  const handleProfileChange = (newProfile: SkinProfile) => {
    setProfile(newProfile);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('cosmetic-checker-profile', JSON.stringify(newProfile));
      } catch (e) {
        console.error('Failed to save profile', e);
      }
    }
    if (user) {
      saveUserProfile(user.uid, newProfile, {
        displayName: user.displayName,
        email: user.email,
      }).catch((e) => console.error('Failed to save profile to Firestore', e));
    }
  };

  const handleOpenHistory = async () => {
    setHistoryOpen(true);
    if (!user) return;
    setScansLoading(true);
    try {
      setScans(await getScans(user.uid));
    } catch (e) {
      console.error('Failed to load scan history', e);
    } finally {
      setScansLoading(false);
    }
  };

  const handleOpenSavedScan = (scan: SavedScan) => {
    setAnalysisResults(scan);
    setProfile(scan.profileUsed);
    setUploadedFile(null);
    setErrorMessage(null);
    setCheckState('done');
    setHistoryOpen(false);
  };

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
      body.append('profile', JSON.stringify(profile));

      const res = await fetch('/api/check', { method: 'POST', body });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setAnalysisResults(data);
      setCheckState('done');
      if (user) {
        addScan(user.uid, data, profile).catch((e) =>
          console.error('Failed to save scan to history', e)
        );
      }
    } catch (error: any) {
      console.error('Error checking ingredients:', error);
      setErrorMessage(error.message || 'Something went wrong');
      setCheckState('error');
    }
  };

  const handleReAnalyze = async (newProfile: SkinProfile) => {
    if (!analysisResults?.ingredients) return;
    setCheckState('checking');
    setErrorMessage(null);

    // Save the new profile as active
    handleProfileChange(newProfile);

    try {
      const body = new FormData();
      const ingredientNames = analysisResults.ingredients.map((ing: any) => ing.name);

      body.append('ingredients', JSON.stringify(ingredientNames));
      body.append('profile', JSON.stringify(newProfile));
      if (uploadedFile) {
        body.append('filename', uploadedFile.name);
      }

      const res = await fetch('/api/check', { method: 'POST', body });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setAnalysisResults(data);
      setCheckState('done');
    } catch (error: any) {
      console.error('Error re-checking ingredients:', error);
      setErrorMessage(error.message || 'Something went wrong');
      setCheckState('error');
    }
  };

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bone/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-2">
            {checkState === 'done' && (
              <button
                onClick={handleReset}
                className="border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-stone transition-colors hover:border-ink hover:text-ink cursor-pointer rounded-md"
              >
                Start over
              </button>
            )}
            <AuthControls onOpenHistory={handleOpenHistory} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 pb-16 pt-8">
        <div className="w-full max-w-xl space-y-5">
          {checkState !== 'done' && (
            <>
              <div className="animate-fade-up text-left">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
                  AI ingredient analysis
                </span>
                <h1 className="mt-3 font-display text-[2.6rem] font-normal leading-[1.05] tracking-[-0.01em] text-ink sm:text-[3.25rem]">
                  Know what&apos;s in
                  <br />
                  <span className="italic">your skincare.</span>
                </h1>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">
                  Set your skin profile, scan an ingredients label, and Lumi decodes
                  every ingredient — personalized to your skin.
                </p>
              </div>

              <div className="animate-fade-up [animation-delay:50ms]">
                <SkinProfileSelector profile={profile} onChange={handleProfileChange} />
              </div>

              <div className="animate-fade-up [animation-delay:100ms]">
                <ImageUpload onFile={handleFile} onReset={handleReset} />
              </div>

              {uploadedFile && (
                <div className="animate-fade-up space-y-3">
                  <div className="flex items-center gap-3 border border-line bg-paper px-4 py-3 rounded-lg">
                    <ImageIcon className="h-4 w-4 shrink-0 text-mist" strokeWidth={1.6} />
                    <span className="truncate text-sm font-medium text-ink">{uploadedFile.name}</span>
                    <span className="ml-auto shrink-0 text-xs font-medium text-mist">
                      {(uploadedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheck}
                    disabled={checkState === 'checking'}
                    className="group flex w-full items-center justify-center gap-2 bg-ink py-3.5 text-sm font-semibold tracking-wide text-bone transition-colors hover:bg-ink-soft disabled:opacity-60 cursor-pointer rounded-lg"
                  >
                    {checkState === 'checking' ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Decoding ingredients…
                      </>
                    ) : (
                      <>
                        Decode ingredients
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                      </>
                    )}
                  </button>

                  {checkState === 'error' && (
                    <div className="animate-fade-up border border-bad/30 bg-bad-bg px-4 py-3.5 rounded-lg">
                      <p className="text-sm font-semibold text-bad">Something went wrong</p>
                      {errorMessage && (
                        <p className="mt-1 break-words font-mono text-xs text-bad/80">{errorMessage}</p>
                      )}
                      <p className="mt-1.5 text-xs text-stone">Please try again or upload a clearer photo.</p>
                    </div>
                  )}
                </div>
              )}

              <p className="pt-1 text-left text-[11px] leading-relaxed text-mist">
                Lumi offers general guidance and isn&apos;t a substitute for professional
                medical or dermatological advice.
              </p>
            </>
          )}

          {checkState === 'checking' && analysisResults && (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-fade-in">
              <LoaderCircle className="h-7 w-7 animate-spin text-ink" strokeWidth={1.6} />
              <p className="text-sm font-medium text-stone">Re-reading the formula for your new profile…</p>
            </div>
          )}

          {checkState === 'done' && analysisResults && (
            <AnalysisResults
              results={analysisResults}
              onReset={handleReset}
              currentProfile={profile}
              onReAnalyze={handleReAnalyze}
            />
          )}
        </div>
      </main>

      {historyOpen && (
        <ScanHistory
          scans={scans}
          loading={scansLoading}
          onClose={() => setHistoryOpen(false)}
          onOpen={handleOpenSavedScan}
        />
      )}

      {/* Real-time logging console specifically for your mobile phone debugging */}
      <MobileConsoleDebugger />
    </div>
  );
}
