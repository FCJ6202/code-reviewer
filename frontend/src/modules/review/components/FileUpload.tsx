import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { ACCEPTED_EXTENSIONS } from '@/lib/language';

interface FileUploadProps {
  onFile: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function FileUpload({ onFile, disabled = false }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong text-[13px] text-secondary-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="h-4 w-4" aria-hidden />
        Upload a file instead
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        data-testid="file-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so choosing the same file again still fires onChange.
          event.target.value = '';
          if (file) void onFile(file);
        }}
      />
    </>
  );
}
