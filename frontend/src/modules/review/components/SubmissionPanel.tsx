import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from './FileUpload';
import { ReviewProgress } from './ReviewProgress';
import { MAX_CODE_LABEL, type SubmissionForm } from '../hooks/useSubmissionForm';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/lib/format';
import { languageLabel } from '@/lib/language';

interface SubmissionPanelProps {
  form: SubmissionForm;
  pending: boolean;
  error: Error | null;
  onSubmit: () => void;
}

function submitLabel(pending: boolean, failed: boolean): string {
  if (pending) return 'Reviewing…';
  return failed ? 'Try again' : 'Review code';
}

export function SubmissionPanel({ form, pending, error, onSubmit }: SubmissionPanelProps) {
  return (
    <aside className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="review-filename" className="text-xs text-muted-foreground">
          Filename
        </label>
        <Input
          id="review-filename"
          value={form.filename}
          onChange={(event) => form.setFilename(event.target.value)}
          placeholder="app.py"
          disabled={pending}
          className="font-mono"
        />
        <span className="text-xs text-muted-foreground">
          {form.language
            ? `${languageLabel(form.language)} · detected from the filename`
            : 'Add a filename so the language can be detected'}
        </span>
      </div>

      <FileUpload onFile={form.loadFile} disabled={pending} />
      {form.fileError && (
        <p role="alert" className="text-xs text-destructive-soft">
          {form.fileError}
        </p>
      )}

      <div className="flex justify-between font-mono text-xs text-muted-foreground">
        <span>{form.lineCount} lines</span>
        <span className={cn(form.tooLarge && 'text-destructive-soft')}>
          {formatBytes(form.bytes)} of {MAX_CODE_LABEL}
        </span>
      </div>

      {error && !pending && (
        <div role="alert" className="flex flex-col gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-3">
          <span className="text-[13px] font-semibold text-destructive-soft">{error.message}</span>
          <span className="text-xs leading-[18px] text-secondary-foreground">Your code is still here.</span>
        </div>
      )}

      {pending && <ReviewProgress />}

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <Button size="lg" onClick={onSubmit} disabled={!form.canSubmit} loading={pending}>
          {submitLabel(pending, error !== null)}
        </Button>
        <span className="text-center text-xs text-subtle-foreground">
          Reviewed against your team&apos;s historical rules
        </span>
      </div>
    </aside>
  );
}
