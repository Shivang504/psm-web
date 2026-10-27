import {
  Bell,
  Clock,
  Flag,
  ImageIcon,
  MapPin,
  MessageSquare,
  TriangleAlert,
} from 'lucide-react'
import { BuyerTitle, Frame, Thumb } from './activityCard'
import { DayCard, OrderCard } from './ActivityVisitCards'
import type {
  ActivityProduct,
  EmployeeActivityDetails,
  EmployeeActivityItem,
} from '@/utils/employeeDetail'

type ActivityEventCardProps = {
  item: EmployeeActivityItem
  onOpenImage: (src: string) => void
  onViewProducts: (products: ActivityProduct[]) => void
}

function NoteCard({
  type,
  activity,
}: {
  type: string
  activity: EmployeeActivityDetails
}) {
  const reminder = type.includes('reminder')
  const lead = type.startsWith('lead')
  const title = type.replaceAll('_', ' ')
  const notes = reminder ? activity.followup_description : activity.notes

  return (
    <Frame tone={lead ? 'success' : 'primary'}>
      <div className="mb-2 flex items-center gap-2">
        {reminder ? (
          <Bell className="size-4 text-primary" />
        ) : (
          <MessageSquare className="size-4 text-primary" />
        )}
        <BuyerTitle label={title} activity={activity} />
      </div>
      <div className="space-y-1 border-t border-border pt-2 text-xs">
        <p className="flex gap-3 text-text-muted">
          <span>Meeting with</span>
          <span className="text-right font-semibold text-text-main">
            {activity.meeting_with || 'N/A'}
          </span>
        </p>
        <p className="flex gap-3 text-text-muted">
          <span>Notes</span>
          <span className="max-w-[60%] text-right font-semibold text-text-main">
            {notes || 'No notes available'}
          </span>
        </p>
        {reminder ? (
          <p className="flex gap-3 text-text-muted">
            <span>Date and time</span>
            <span className="text-right font-semibold text-text-main">
              {activity.followup_date || 'Not scheduled'}
            </span>
          </p>
        ) : null}
      </div>
      {activity.address ? (
        <p className="mt-2 text-xs text-text-muted">{activity.address}</p>
      ) : null}
    </Frame>
  )
}

function RouteCard({
  type,
  activity,
}: {
  type: string
  activity: EmployeeActivityDetails
}) {
  if (type === 'route_start' || type === 'route_end') {
    const ended = type === 'route_end'
    return (
      <div
        className={`flex items-center gap-2 text-sm font-semibold ${
          ended ? 'text-error' : 'text-primary-deep'
        }`}
      >
        {ended ? 'Route end' : 'Route start'}
        <MapPin className="size-4" />
        <span
          className={`h-0.5 flex-1 ${ended ? 'bg-error' : 'bg-primary-deep'}`}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border-strong bg-background-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-text-muted">
            Route - {activity.buyer_designation} - {activity.buyer_company_name}
          </p>
          {activity.buyer_address ? (
            <p className="mt-1 text-xs text-text-disabled">
              {activity.buyer_address}
            </p>
          ) : null}
        </div>
        <MapPin className="size-4 text-text-disabled" />
      </div>
    </div>
  )
}

function SimpleCard({
  type,
  activity,
  onOpenImage,
}: {
  type?: string
  activity: EmployeeActivityDetails
  onOpenImage: (src: string) => void
}) {
  if (type === 'kill') {
    return (
      <Frame tone="error">
        <p className="flex items-center gap-2 text-sm font-semibold text-error">
          <TriangleAlert className="size-4" />
          App kill detected
        </p>
        <p className="mt-1 text-xs text-text-muted">
          The application was unexpectedly terminated.
        </p>
      </Frame>
    )
  }

  if (type === 'random_image') {
    return (
      <Frame tone="primary">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-main">
          <ImageIcon className="size-4 text-primary" />
          Random image captured
        </p>
        <Thumb
          src={activity.random_image}
          alt="Random capture"
          onOpen={onOpenImage}
        />
      </Frame>
    )
  }

  const visit = type === '15min'
  return (
    <Frame tone={visit ? 'primary' : 'success'}>
      <p className="flex items-center gap-2 text-sm font-semibold text-text-main">
        {visit ? (
          <Clock className="size-4 text-primary" />
        ) : (
          <Flag className="size-4 text-primary" />
        )}
        {activity.locality || type || 'Activity'}
      </p>
      {activity.address ? (
        <p className="mt-1 text-xs text-text-muted">{activity.address}</p>
      ) : null}
    </Frame>
  )
}

const NOTE_TYPES = new Set([
  'discussion',
  'reminder',
  'lead_discussion',
  'lead_reminder',
])

export function ActivityEventCard({
  item,
  onOpenImage,
  onViewProducts,
}: ActivityEventCardProps) {
  const type = item.event_type || ''
  const activity = item.activity ?? {}

  if (type === 'start_day' || type === 'end_day') {
    return <DayCard type={type} activity={activity} onOpenImage={onOpenImage} />
  }
  if (type === 'order' || type === 'lead_order') {
    return (
      <OrderCard
        activity={activity}
        lead={type === 'lead_order'}
        onViewProducts={onViewProducts}
      />
    )
  }
  if (NOTE_TYPES.has(type)) return <NoteCard type={type} activity={activity} />
  if (type === 'route' || type === 'route_start' || type === 'route_end') {
    return <RouteCard type={type} activity={activity} />
  }
  return (
    <SimpleCard type={type} activity={activity} onOpenImage={onOpenImage} />
  )
}
