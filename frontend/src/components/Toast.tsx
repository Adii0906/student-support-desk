import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'ok' | 'error';
}

export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, toast.kind === 'error' ? 6000 : 3500);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:justify-end sm:px-6"
    >
      {toast && (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex max-w-md animate-toast-in items-start gap-4 border-l-[3px] bg-ink px-4 py-3 text-body text-paper shadow-toast ${
            toast.kind === 'error' ? 'border-l-[#E08A7B]' : 'border-l-[#8FC49E]'
          }`}
        >
          <p>{toast.text}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-meta text-paper/70 underline underline-offset-4 hover:text-paper"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
