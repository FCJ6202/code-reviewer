import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  lg: 'h-[72px] w-[72px] text-2xl',
} as const;

interface AvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
}

export function Avatar({ name, photoUrl, size = 'sm' }: AvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={cn('shrink-0 rounded-full object-cover', SIZES[size])}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-input font-semibold', SIZES[size])}
    >
      {initials(name)}
    </span>
  );
}
