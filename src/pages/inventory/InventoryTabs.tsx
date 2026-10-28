import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminLayout } from '@/components/organisms/AdminLayout'

export function InventoryFrame({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  subtitle: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}) {
  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          onAction={onAction}
        />
        {children}
      </div>
    </AdminLayout>
  )
}
