import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { RuleUploadCard } from './components/RuleUploadCard';
import { RulesTable } from './components/RulesTable';
import { useIngestRules, useRuleList } from '@/hooks/useRules';
import { pluralize } from '@/lib/format';

export default function RulesPage() {
  const rules = useRuleList();
  const ingest = useIngestRules();

  return (
    <div className="flex-1 lg:min-h-0 lg:overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-6 py-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-xl font-semibold">Review rules</h1>
          {rules.data && <span className="font-mono text-xs text-muted-foreground">{pluralize(rules.data.length, 'rule')}</span>}
        </div>

        <RuleUploadCard
          pending={ingest.isPending}
          result={ingest.data}
          error={ingest.error}
          onUpload={(file) => ingest.mutate(file)}
          onReset={() => ingest.reset()}
        />

        {rules.isPending && <Skeleton className="h-64" />}
        {rules.isError && <EmptyState title="Could not load rules" description={rules.error.message} />}
        {rules.data && <RulesTable rules={rules.data} />}
      </div>
    </div>
  );
}
