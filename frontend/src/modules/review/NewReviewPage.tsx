import { useNavigate } from 'react-router-dom';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { CodeInput } from './components/CodeInput';
import { SubmissionPanel } from './components/SubmissionPanel';
import { MAX_CODE_LABEL, useSubmissionForm } from './hooks/useSubmissionForm';
import { useCreateReview } from '@/hooks/useReviews';
import { ROUTES } from '@/config/navigation';

export default function NewReviewPage() {
  const navigate = useNavigate();
  const form = useSubmissionForm();
  const createReview = useCreateReview();

  const submit = () => {
    if (!form.canSubmit || createReview.isPending) return;
    createReview.mutate(form.request, {
      onSuccess: (review) => navigate(ROUTES.review(review.id)),
    });
  };

  return (
    <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex min-h-[420px] flex-col border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
        <PanelHeader>
          <h1 className="text-[13px] font-medium">Paste your code</h1>
          <span className="font-mono text-xs text-subtle-foreground">one file · up to {MAX_CODE_LABEL}</span>
        </PanelHeader>
        <CodeInput value={form.code} onChange={form.setCode} disabled={createReview.isPending} />
      </section>

      <SubmissionPanel form={form} pending={createReview.isPending} error={createReview.error} onSubmit={submit} />
    </div>
  );
}
