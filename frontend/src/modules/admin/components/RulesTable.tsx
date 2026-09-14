import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CATEGORIES } from '@/config/review';
import type { Rule } from '@/types';

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category.label]),
);

export function RulesTable({ rules }: { rules: Rule[] }) {
  if (rules.length === 0) {
    return <EmptyState title="No rules yet" description="Upload a CSV to add the first rules." />;
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="h-9 border-b border-border text-xs text-subtle-foreground">
            <th scope="col" className="w-20 px-4 font-normal">ID</th>
            <th scope="col" className="w-36 px-4 font-normal">Type</th>
            <th scope="col" className="px-4 font-normal">Description</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 align-top font-mono text-[13px] text-primary">#{rule.id}</td>
              <td className="px-4 py-3 align-top text-[13px] text-secondary-foreground">
                {CATEGORY_LABELS[rule.type] ?? rule.type}
              </td>
              <td className="px-4 py-3 text-[13px] leading-5 text-foreground">{rule.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
