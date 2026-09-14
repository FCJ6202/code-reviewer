import { cn } from '@/lib/cn';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function ChipGroup<T extends string>({ options, value, onChange, ariaLabel }: ChipGroupProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-8 rounded-md px-2.5 text-xs transition-colors',
              active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            {option.label}
            {option.count !== undefined && ` ${option.count}`}
          </button>
        );
      })}
    </div>
  );
}
