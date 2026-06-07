'use client';

import { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, History, LoaderCircle, ChevronDown } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AuthControlsProps {
  onOpenHistory?: () => void;
}

export default function AuthControls({ onOpenHistory }: AuthControlsProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign-in failed', e);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    setBusy(true);
    try {
      await signOut();
    } catch (e) {
      console.error('Sign-out failed', e);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoaderCircle className="h-4 w-4 animate-spin text-mist" strokeWidth={1.6} />;
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={busy}
        className="flex items-center gap-1.5 border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-stone transition-colors hover:border-ink hover:text-ink disabled:opacity-60 cursor-pointer rounded-md"
      >
        {busy ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" strokeWidth={1.8} />
        ) : (
          <LogIn className="h-3.5 w-3.5" strokeWidth={1.8} />
        )}
        Sign in
      </button>
    );
  }

  const label = user.displayName || user.email || 'Account';
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 border border-line bg-paper py-1 pl-1 pr-2 text-xs font-semibold text-ink transition-colors hover:border-ink cursor-pointer rounded-full"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-bone">
            {initial}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-mist" strokeWidth={2} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-30 mt-2 w-52 animate-fade-in overflow-hidden border border-line bg-paper rounded-lg">
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-xs font-bold text-ink">{user.displayName || 'Signed in'}</p>
            {user.email && <p className="truncate text-[11px] text-mist">{user.email}</p>}
          </div>
          {onOpenHistory && (
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenHistory();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-semibold text-stone transition-colors hover:bg-fill hover:text-ink cursor-pointer"
            >
              <History className="h-3.5 w-3.5" strokeWidth={1.8} />
              Scan history
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 border-t border-line px-3 py-2.5 text-left text-xs font-semibold text-stone transition-colors hover:bg-fill hover:text-ink cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
