import { useEffect, useLayoutEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Gauge } from 'lucide-react'
import { ActivityImagePreview } from './activity/ActivityImagePreview'
import { ActivityRouteMap } from './activity/ActivityRouteMap'
import { ActivityTimeline } from './activity/ActivityTimeline'
import { PanelState } from './PanelState'
import { ProductList } from './ProductList'
import {
  requestEmployeeActivity,
  requestEmployeeTracking,
} from './requestEmployeeDetail'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { todayDate, type ActivityProduct } from '@/utils/employeeDetail'

type EmployeeActivityPanelProps = {
  userId: string
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
      {label}
      <span className="rounded-md bg-primary-soft px-1.5 py-0.5 font-semibold text-primary-deep">
        {value}
      </span>
    </span>
  )
}

export function EmployeeActivityPanel({ userId }: EmployeeActivityPanelProps) {
  const dispatch = useAppDispatch()
  const activity = useAppSelector((state) => state.employeeDetail.activity)
  const [date, setDate] = useState(todayDate)
  const [showMap, setShowMap] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [products, setProducts] = useState<ActivityProduct[] | null>(null)

  useLayoutEffect(() => {
    requestEmployeeActivity(dispatch, userId, date)
  }, [dispatch, userId, date])

  useEffect(() => {
    if (!showMap || activity.loading || activity.trackingLoaded) return
    requestEmployeeTracking(dispatch, userId, date)
  }, [
    activity.loading,
    activity.trackingLoaded,
    date,
    dispatch,
    showMap,
    userId,
  ])

  const changeDate = (value: string) => {
    if (value > todayDate()) {
      toast.error('Please select a date in the past or today.')
      return
    }
    setDate(value)
    setShowMap(false)
  }

  const distance = Number(activity.stats.google_distance || 0).toFixed(2)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* {activity.loading ? null : ( */}
        <div className="flex flex-wrap items-center gap-3">
          <Stat label="TC" value={activity.stats.total_count} />
          <Stat label="PC" value={activity.stats.orderApproved} />
          <Stat label="Sales" value={activity.stats.revenueCount} />
          <span className="inline-flex items-center gap-1 text-xs text-text-muted">
            <Gauge className="size-4 text-text-main" />
            {distance} Gkm
          </span>
          {activity.stats.is_vehicle === 1 ? (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Gauge className="size-4 text-text-main" />
              {activity.stats.total_distance} Km
            </span>
          ) : null}
        </div>
        {/* )} */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={todayDate()}
            onChange={(event) => changeDate(event.target.value)}
            className="h-10 rounded-[14px] border border-border bg-background-surface px-3 text-sm text-text-main"
          />
          <button
            type="button"
            onClick={() => setShowMap((current) => !current)}
            className="h-10 cursor-pointer rounded-[14px] bg-primary px-4 text-xs font-semibold text-primary-foreground"
          >
            {showMap ? 'Activity' : 'Map'}
          </button>
        </div>
      </div>

      {products ? (
        <ProductList products={products} onClose={() => setProducts(null)} />
      ) : null}

      {showMap ? (
        <ActivityRouteMap
          points={activity.tracking}
          loading={activity.loading || activity.trackingLoading}
        />
      ) : (
        <PanelState
          loading={activity.loading}
          loadingLabel="Loading activity"
          error={activity.error}
          empty={!activity.items.length}
          emptyMessage="No activity for this date."
          onRetry={() => requestEmployeeActivity(dispatch, userId, date)}
        >
          <ActivityTimeline
            items={activity.items}
            onOpenImage={setImage}
            onViewProducts={setProducts}
          />
        </PanelState>
      )}

      <ActivityImagePreview src={image} onClose={() => setImage(null)} />
    </div>
  )
}
