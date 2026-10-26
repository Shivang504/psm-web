import { Bike, MapPin, Power, ShoppingBag } from 'lucide-react'
import { BuyerTitle, Frame, Thumb } from './activityCard'
import type {
  ActivityProduct,
  EmployeeActivityDetails,
} from '@/utils/employeeDetail'
import { isVehicleMode } from '@/utils/employeeDetail'

export function DayCard({
  type,
  activity,
  onOpenImage,
}: {
  type: string
  activity: EmployeeActivityDetails
  onOpenImage: (src: string) => void
}) {
  const isStart = type === 'start_day'
  const vehicle = isVehicleMode(activity.is_vehicle)
  const hasFiles = Boolean(activity.files)

  return (
    <Frame tone={isStart ? 'success' : 'error'}>
      {vehicle && (isStart || hasFiles) ? (
        <div className="mb-3 flex items-center gap-3">
          <Thumb
            src={activity.files?.selfie_fileName}
            alt="Selfie"
            onOpen={onOpenImage}
          />
          <Thumb
            src={activity.files?.meter_image_fileName}
            alt="Meter"
            onOpen={onOpenImage}
          />
          {isStart || activity.meter_no ? (
            <div className="grid size-16 place-items-center rounded-[14px] border border-text-main text-center text-xs font-semibold text-text-main">
              {activity.meter_no ?? ''} {isStart ? 'Km' : 'KM'}
            </div>
          ) : null}
        </div>
      ) : null}
      {!vehicle && (isStart || hasFiles) ? (
        <div className="mb-3 flex items-center gap-3">
          <Thumb
            src={activity.files?.selfie_fileName}
            alt="Selfie"
            onOpen={onOpenImage}
          />
          <p className="text-sm font-semibold text-text-main">
            Public Transport
          </p>
        </div>
      ) : null}
      {!isStart && !hasFiles ? (
        <p className="mb-3 inline-flex rounded-lg bg-error-soft px-3 py-1 text-sm font-semibold text-error">
          Auto End Day
        </p>
      ) : null}
      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
        {isStart ? (
          <Bike className="size-4 text-success" />
        ) : (
          <Power className="size-4 text-error" />
        )}
        {activity.locality || (isStart ? '' : 'Your day has been ended.')}
      </div>
      {activity.address ? (
        <p className="mt-1 text-xs text-text-muted">{activity.address}</p>
      ) : null}
    </Frame>
  )
}

export function OrderCard({
  activity,
  lead,
  onViewProducts,
}: {
  activity: EmployeeActivityDetails
  lead: boolean
  onViewProducts: (products: ActivityProduct[]) => void
}) {
  const approved = activity.order_status === 'Approved'
  const products = activity.products ?? []
  const outside =
    activity.is_out_side_route === 1 || activity.is_out_side_route === true

  return (
    <Frame tone={lead ? 'success' : 'primary'}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShoppingBag
            className={`size-4 ${lead ? 'text-success' : 'text-primary'}`}
          />
          <BuyerTitle
            label={lead ? 'Lead order' : 'Order'}
            activity={activity}
          />
        </div>
        {!lead ? (
          <span
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
              approved
                ? 'bg-success-soft text-success'
                : 'bg-warning-soft text-warning'
            }`}
          >
            {activity.order_status || 'Pending'}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 border-t border-border pt-2 text-xs">
        <p className="flex justify-between text-text-muted">
          <span>{lead ? 'Status' : 'Order total'}</span>
          <span className="font-semibold text-text-main">
            {lead
              ? activity.order_status || '—'
              : `₹${activity.gross_total || '0.00'}`}
          </span>
        </p>
        {lead ? (
          <p className="flex justify-between text-text-muted">
            <span>Total</span>
            <span className="font-semibold text-text-main">
              {activity.gross_total ?? '—'}
            </span>
          </p>
        ) : null}
        <p className="flex justify-between text-text-muted">
          <span>Total products</span>
          <span className="font-semibold text-text-main">
            {products.length}
          </span>
        </p>
      </div>
      {products.length ? (
        <button
          type="button"
          onClick={() => onViewProducts(products)}
          className="mt-2 w-full cursor-pointer rounded-lg bg-primary-soft py-2 text-xs font-semibold text-primary"
        >
          View products
        </button>
      ) : null}
      {!lead && outside ? (
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-error">
          <MapPin className="size-3.5" />
          Vendor outside the route
        </p>
      ) : null}
      {activity.address ? (
        <p className="mt-2 text-xs text-text-muted">{activity.address}</p>
      ) : null}
    </Frame>
  )
}
