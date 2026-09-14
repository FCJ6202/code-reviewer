import { Spinner } from '@/components/ui/Spinner';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center">
      <Spinner className="h-6 w-6" label="Loading" />
    </div>
  );
}
