import { useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatBytes, pluralize } from '@/lib/format';
import { MAX_RULES_CSV_BYTES, MAX_RULES_CSV_LABEL } from '@/config/rules';
import type { IngestResult } from '@/types';

interface RuleUploadCardProps {
  pending: boolean;
  result: IngestResult | undefined;
  error: Error | null;
  onUpload: (file: File) => void;
  /** Clears the previous result when a new file is chosen. */
  onReset: () => void;
}

export function RuleUploadCard({ pending, result, error, onUpload, onReset }: RuleUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const tooLarge = file !== null && file.size > MAX_RULES_CSV_BYTES;

  const chooseFile = (next: File | undefined) => {
    setFile(next ?? null);
    onReset();
  };

  const upload = () => {
    if (file && !tooLarge) onUpload(file);
  };

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Upload rules CSV</h2>
        <p className="text-[13px] leading-5 text-muted-foreground">
          Columns <code className="font-mono text-secondary-foreground">id,type,description</code>. New ids are added
          and changed rules are re-embedded. Rules missing from the file are kept.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={pending}>
          <FileUp className="h-4 w-4" aria-hidden />
          Choose CSV
        </Button>
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {file ? `${file.name} · ${formatBytes(file.size)}` : 'No file chosen'}
        </span>
        <Button className="sm:ml-auto" onClick={upload} disabled={!file || tooLarge} loading={pending}>
          {pending ? 'Uploading…' : 'Upload'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          data-testid="rules-file-input"
          onChange={(event) => {
            chooseFile(event.target.files?.[0]);
            // Reset so choosing the same file again still fires onChange.
            event.target.value = '';
          }}
        />
      </div>

      {tooLarge && (
        <p role="alert" className="text-xs text-destructive-soft">
          The file is {formatBytes(file.size)}. The limit is {MAX_RULES_CSV_LABEL}.
        </p>
      )}

      {pending && (
        <p className="text-xs text-muted-foreground">Uploading and embedding changed rules. This can take up to a minute.</p>
      )}

      {error && !pending && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-[13px] text-destructive-soft">
          {error.message}
        </div>
      )}

      {result && !pending && (
        <div role="status" className="flex flex-col gap-1 rounded-lg border border-success/40 bg-success/10 px-3.5 py-3">
          <span className="text-[13px] font-semibold text-success">
            {pluralize(result.rowsRead, 'row')} read · {result.rowsUpserted} added or updated
          </span>
          {result.rowsFailed > 0 && (
            <span className="text-xs text-warning">
              {pluralize(result.rowsFailed, 'rule')} could not be embedded and {result.rowsFailed === 1 ? 'was' : 'were'}{' '}
              skipped. Upload the file again to retry.
            </span>
          )}
          <span className="truncate font-mono text-[11px] text-subtle-foreground">{result.sourceFile}</span>
        </div>
      )}
    </Card>
  );
}
