export function SkeletonRow() {
  return (
    <div className="flex items-center gap-6 border-b border-rule px-4 py-4" aria-hidden>
      <div className="h-3 w-16 animate-pulse rounded-sm bg-paper-sunk" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/5 animate-pulse rounded-sm bg-paper-sunk" />
        <div className="h-2.5 w-1/4 animate-pulse rounded-sm bg-paper-sunk" />
      </div>
      <div className="hidden h-3 w-20 animate-pulse rounded-sm bg-paper-sunk lg:block" />
      <div className="hidden h-3 w-24 animate-pulse rounded-sm bg-paper-sunk lg:block" />
      <div className="h-6 w-20 animate-pulse rounded-sm bg-paper-sunk" />
    </div>
  );
}
