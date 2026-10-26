import { Mail, MapPin, Phone, UserCheck } from 'lucide-react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { StatusPill } from '@/components/atoms/StatusPill'
import type { UserListItem } from '@/utils/types'
import { displayName, displayValue } from '@/utils/helper'

type EmployeeDetailsPanelProps = {
  user: UserListItem
  areas: string[]
}

export function EmployeeDetailsPanel({
  user,
  areas,
}: EmployeeDetailsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="glass-panel flex items-center gap-4 p-5">
        <Avatar
          name={displayName(user)}
          size={54}
          className="text-lg shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold text-text-main">
              {displayName(user)}
            </h3>
            <Badge variant="role">
              {displayValue(user.designation || user.role)}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            Employee Code:{' '}
            <span className="font-semibold text-text-main">
              {displayValue(user.config?.employeeCode)}
            </span>
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <StatusPill status={user.attendance} />
            <span className="inline-flex items-center gap-1 rounded-full border border-primary-border bg-background-surface/70 px-2.5 py-0.5 text-xs font-semibold text-primary-deep">
              <UserCheck className="size-3" />
              {displayValue(user.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel space-y-3.5 p-5">
        <h4 className="text-xs font-bold tracking-wider text-primary-hover uppercase">
          Contact Information
        </h4>
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary-soft text-primary">
              <Phone className="size-4" />
            </div>
            <div>
              <span className="block text-text-muted">Mobile Number</span>
              <span className="font-semibold text-text-main">
                {displayValue(user.contact_no)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary-soft text-primary">
              <Mail className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-text-muted">Email Address</span>
              <span className="block truncate font-semibold text-text-main">
                {displayValue(user.email)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel space-y-3.5 p-5">
        <h4 className="text-xs font-bold tracking-wider text-primary-hover uppercase">
          Assignment & Location
        </h4>
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <div className="flex items-center gap-2.5">
            <MapPin className="size-4 text-primary" />
            <div>
              <span className="block text-text-muted">Region / SBU</span>
              <span className="font-semibold text-text-main">
                {displayValue(user.config?.regionName)}
              </span>
            </div>
          </div>
          <div>
            <span className="block text-text-muted">State</span>
            <span className="font-semibold text-text-main">
              {displayValue(user.config?.state)}
            </span>
          </div>
          <div>
            <span className="block text-text-muted">Base Location</span>
            <span className="font-semibold text-text-main">
              {displayValue(user.config?.location)}
            </span>
          </div>
        </div>
        <div className="border-t border-border pt-2">
          <span className="mb-2 block text-xs font-medium text-text-muted">
            Assigned Areas ({areas.length})
          </span>
          {areas.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {areas.map((area) => (
                <Badge key={area} variant="area">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-muted italic">
              No territories assigned
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
