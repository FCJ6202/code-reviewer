export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        className="text-primary"
        aria-hidden
      >
        <path d="M7 5 2 10l5 5" />
        <path d="m13 5 5 5-5 5" />
      </svg>
      <span className="font-mono text-sm font-bold tracking-[0.02em] text-foreground">reviewer</span>
    </span>
  );
}
