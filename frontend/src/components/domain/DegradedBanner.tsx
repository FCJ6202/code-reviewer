import { TriangleAlert } from 'lucide-react';

export function DegradedBanner() {
  return (
    <div
      role="note"
      className="flex shrink-0 items-center gap-2.5 border-b border-warning/35 bg-warning/10 px-5 py-2.5 text-[13px] text-warning"
    >
      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
      <span>Team rules were unavailable for this review, so findings aren&apos;t linked to rule numbers.</span>
    </div>
  );
}
