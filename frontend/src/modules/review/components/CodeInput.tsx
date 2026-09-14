import { useRef } from 'react';
import { cn } from '@/lib/cn';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Plain textarea with a line-number gutter that scrolls with it. */
export function CodeInput({ value, onChange, disabled = false }: CodeInputProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(1, value.split('\n').length);

  return (
    <div className={cn('flex min-h-0 flex-1 font-mono text-[13px] leading-[26px]', disabled && 'opacity-55')}>
      <div
        ref={gutterRef}
        aria-hidden
        className="w-12 shrink-0 select-none overflow-hidden py-4 pr-4 text-right text-subtle-foreground"
      >
        {Array.from({ length: lineCount }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <textarea
        aria-label="Code to review"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={(event) => {
          if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
        }}
        disabled={disabled}
        spellCheck={false}
        wrap="off"
        placeholder="Paste a file here…"
        className="min-h-0 flex-1 resize-none bg-transparent py-4 pr-6 text-foreground caret-primary outline-none placeholder:text-subtle-foreground"
      />
    </div>
  );
}
