import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-input disabled:text-muted-foreground',
  secondary: 'border border-input bg-transparent text-foreground hover:bg-muted disabled:opacity-50',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
  danger: 'text-destructive-soft hover:bg-destructive/10 disabled:opacity-50',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

interface ButtonVariantOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Button classes, also used to style router <Link>s as buttons. */
export function buttonVariants({ variant = 'primary', size = 'md', className }: ButtonVariantOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}
