import {
  Mail,
  MapPin,
  Pencil,
  Phone,
  Power,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { useMemo } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { StatusPill } from '@/components/atoms/StatusPill'
import { Drawer } from '@/components/molecules/Drawer'
import type { UserListItem } from '@/utils/types'
import { displayName, displayValue } from '@/utils/helper'

export interface EmployeeDrawerProps {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onEdit?: (user: UserListItem) => void
  onToggleStatus?: (user: UserListItem) => void
  onDelete?: (user: UserListItem) => void
  canModify?: boolean
}

function parseAreas(user: UserListItem): string[] {
  const territories = user.config?.territories?.trim()
  if (territories) {
    return territories
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const location = user.config?.location?.trim()
  if (location) {
    return location
      .split(/[,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

export function EmployeeDrawer({
  user,
  open,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  canModify = true,
}: EmployeeDrawerProps) {
  const areas = useMemo(() => {
    if (!user) return []
    return parseAreas(user)
  }, [user])

  if (!user) return null

  return (
    <Drawer
      open={open}
      title="Employee Details"
      subtitle={`${displayName(user)} (${displayValue(user.config?.employeeCode)})`}
      onClose={onClose}
      footer={
        canModify ? (
          <div className="flex items-center justify-end gap-3">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#4338CA] transition"
              >
                <Pencil className="size-3.5" />
                <span>Edit</span>
              </button>
            ) : null}

            {onToggleStatus ? (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/80 px-4 text-xs font-semibold text-[#312E81] hover:bg-white transition"
              >
                <Power className="size-3.5" />
                <span>
                  {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                </span>
              </button>
            ) : null}

            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(user)}
                className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-[14px] border border-red-200 bg-red-50/80 px-4 text-xs font-semibold text-[#DC2626] hover:bg-red-100 transition"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            ) : null}
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Header Profile Card */}
        <div className="glass-panel p-5 flex items-center gap-4">
          <Avatar
            name={displayName(user)}
            size={54}
            className="text-lg shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1E1B4B] truncate">
                {displayName(user)}
              </h3>
              <Badge variant="role">
                {displayValue(user.designation || user.role)}
              </Badge>
            </div>
            <p className="text-xs text-[#4C4A7A] mt-0.5">
              Employee Code:{' '}
              <span className="font-semibold text-[#1E1B4B]">
                {displayValue(user.config?.employeeCode)}
              </span>
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <StatusPill status={user.attendance} />
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-white/70 text-[#312E81] border border-[rgba(79,70,229,0.15)]">
                <UserCheck className="size-3" />
                {displayValue(user.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="glass-panel p-5 space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4338CA]">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <Phone className="size-4" />
              </div>
              <div>
                <span className="text-[#4C4A7A] block">Mobile Number</span>
                <span className="font-semibold text-[#1E1B4B]">
                  {displayValue(user.contact_no)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-8 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <Mail className="size-4" />
              </div>
              <div className="truncate">
                <span className="text-[#4C4A7A] block">Email Address</span>
                <span className="font-semibold text-[#1E1B4B] truncate block">
                  {displayValue(user.email)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographical & Organizational Assignment */}
        <div className="glass-panel p-5 space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#4338CA]">
            Assignment & Location
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="size-4 text-[#4F46E5]" />
              <div>
                <span className="text-[#4C4A7A] block">Region / SBU</span>
                <span className="font-semibold text-[#1E1B4B]">
                  {displayValue(user.config?.regionName)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#4C4A7A] block">State</span>
              <span className="font-semibold text-[#1E1B4B]">
                {displayValue(user.config?.state)}
              </span>
            </div>

            <div>
              <span className="text-[#4C4A7A] block">Base Location</span>
              <span className="font-semibold text-[#1E1B4B]">
                {displayValue(user.config?.location)}
              </span>
            </div>
          </div>

          {/* Areas Chips */}
          <div className="pt-2 border-t border-[rgba(79,70,229,0.1)]">
            <span className="text-[#4C4A7A] text-xs block mb-2 font-medium">
              Assigned Areas ({areas.length})
            </span>
            {areas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {areas.map((area, idx) => (
                  <Badge key={idx} variant="area">
                    {area}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#4C4A7A] italic">
                No territories assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
