import { Card } from './Card.js';

export function MetricCardSkeleton() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 bg-surface-muted rounded" />
          <div className="h-7 w-32 bg-surface-muted rounded" />
          <div className="h-3 w-40 bg-surface-muted rounded" />
        </div>
        <div className="w-11 h-11 bg-surface-muted rounded-lg shrink-0" />
      </div>
      <div className="mt-4 pt-3 border-t border-surface-border">
        <div className="h-3 w-36 bg-surface-muted rounded" />
      </div>
    </Card>
  );
}
