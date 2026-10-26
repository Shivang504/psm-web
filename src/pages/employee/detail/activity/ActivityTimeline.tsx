import { ActivityEventCard } from './ActivityEventCard'
import { formatActivityTime } from '@/utils/employeeDetail'
import type {
  ActivityProduct,
  EmployeeActivityItem,
} from '@/utils/employeeDetail'

type ActivityTimelineProps = {
  items: EmployeeActivityItem[]
  onOpenImage: (src: string) => void
  onViewProducts: (products: ActivityProduct[]) => void
}

export function ActivityTimeline({
  items,
  onOpenImage,
  onViewProducts,
}: ActivityTimelineProps) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item.event_type}-${index}`} className="flex gap-3">
          <div className="w-16 shrink-0 pt-3 text-xs font-semibold text-text-muted">
            {formatActivityTime(item.activity?.start_time)}
          </div>
          <div className="flex flex-col items-center">
            <span className="mt-3 size-2.5 rounded-full bg-primary" />
            {index < items.length - 1 ? (
              <span className="w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 pb-2">
            <ActivityEventCard
              item={item}
              onOpenImage={onOpenImage}
              onViewProducts={onViewProducts}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
