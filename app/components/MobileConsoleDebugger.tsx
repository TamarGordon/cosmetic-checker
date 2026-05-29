'use client';

import { useEffect, useState } from 'react';

interface ConsoleLogMessage {
  type: 'log' | 'info' | 'warn' | 'error';
  args: string[];
  timestamp: string;
}

export default function MobileConsoleDebugger() {
  const [logs, setLogs] = useState<ConsoleLogMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only capture logs in client environment
    if (typeof window === 'undefined') return;

    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    const formatArgs = (args: any[]): string[] => {
      return args.map((arg) => {
        try {
          if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
          }
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        } catch {
          return String(arg);
        }
      });
    };

    const addLog = (type: 'log' | 'info' | 'warn' | 'error', args: any[]) => {
      const formatted = formatArgs(args);
      
      // Also send logs to the server terminal using /api/debug endpoint!
      fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, args: formatted }),
      }).catch(() => {});

      setLogs((prev) => [
        {
          type,
          args: formatted,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 100)); // Limit to last 100 logs
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    // Capture global uncaught errors
    const handleGlobalError = (event: ErrorEvent) => {
      addLog('error', [event.error || { message: event.message, filename: event.filename, lineno: event.lineno }]);
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('error', ['Unhandled Promise Rejection:', event.reason]);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    console.log('Mobile Console Debugger initialized.');

    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-95 text-xs font-bold"
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {isOpen && (
        <div className="fixed inset-x-4 bottom-16 top-4 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl animate-in slide-in-from-bottom-5 duration-200 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50 rounded-t-2xl">
            <h3 className="font-bold text-slate-800 text-xs">Mobile Debugger Console</h3>
            <button
              onClick={() => setLogs([])}
              className="text-[10px] font-bold text-indigo-600 active:scale-95"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-2.5 bg-slate-950 text-slate-100">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-center py-8 italic">No logs recorded yet. Tap the uploader block above to log activity.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-800 pb-2 space-y-0.5">
                  <div className="flex items-center gap-1 text-[8px] font-bold">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className={`uppercase px-1 rounded-xs ${
                      log.type === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : log.type === 'warn'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap break-all leading-normal font-sans">
                    {log.args.join(' ')}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
