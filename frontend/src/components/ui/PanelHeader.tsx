import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** The 44px bar at the top of a pane (code panel, file header). */
export function PanelHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-11 shrink-0 items-center justify-between gap-3 border-b border-border px-5', className)}>
      {children}
    </div>
  );
}
