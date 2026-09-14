import { ChipGroup } from '@/components/ui/ChipGroup';
import { FindingCard } from './FindingCard';
import type { FindingFilterState } from '../hooks/useFindingFilter';

interface FindingListProps {
  state: FindingFilterState;
  /** Hidden for degraded reviews, where no rules were retrieved. */
  showRules: boolean;
}

export function FindingList({ state, showRules }: FindingListProps) {
  if (state.total === 0) {
    return <p className="px-6 py-8 text-sm text-muted-foreground">No findings. Nothing to fix in this file.</p>;
  }

  return (
    <>
      <div className="border-b border-border px-5 py-1.5">
        <ChipGroup
          ariaLabel="Filter findings by category"
          options={state.options}
          value={state.filter}
          onChange={state.setFilter}
        />
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {state.visible.map((finding) => (
          <li key={finding.index}>
            <FindingCard
              finding={finding}
              open={finding.index === state.selectedIndex}
              onToggle={() => state.toggle(finding.index)}
              showRule={showRules}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
