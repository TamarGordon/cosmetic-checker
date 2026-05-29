import React from 'react';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c3.4 4 5.5 6.9 5.5 9.8a5.5 5.5 0 0 1-11 0C6.5 9.9 8.6 7 12 3Z" />
      <path d="M9.5 13.2a2.6 2.6 0 0 0 2.5 2.6" strokeWidth={1.3} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-ink ${className ?? ''}`}>
      <LogoMark className="h-[22px] w-[22px]" />
      <span className="font-display text-[22px] font-medium leading-none tracking-tight">
        Lumi
      </span>
    </span>
  );
}
