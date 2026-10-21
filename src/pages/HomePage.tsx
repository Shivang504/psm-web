import { Eye, UserPlus } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { AdminLayout } from '../components/organisms/AdminLayout'
import {
  TableLayout,
  type ColumnType,
  type HeaderButton,
} from '../components/organisms/TableLayout'

type UserStatus = 'Active' | 'Invited' | 'Suspended'

type AdminUser = {
  id: string
  name: string
  role: string
  mobile: string
  status: UserStatus
  lastActive: string
}

const PAGE_SIZE = 8

const USERS: AdminUser[] = [
  {
    id: '1',
    name: 'Aanya Shah',
    role: 'Super admin',
    mobile: '9876500011',
    status: 'Active',
    lastActive: 'Today, 09:40',
  },
  {
    id: '2',
    name: 'Rahul Mehta',
    role: 'Operations',
    mobile: '9822001144',
    status: 'Active',
    lastActive: 'Today, 08:15',
  },
  {
    id: '3',
    name: 'Neha Kapoor',
    role: 'Support',
    mobile: '9811122233',
    status: 'Invited',
    lastActive: 'Yesterday',
  },
  {
    id: '4',
    name: 'Vikram Iyer',
    role: 'Finance',
    mobile: '9900112233',
    status: 'Active',
    lastActive: 'Today, 07:02',
  },
  {
    id: '5',
    name: 'Sara Khan',
    role: 'Support',
    mobile: '9765432109',
    status: 'Suspended',
    lastActive: '12 Oct',
  },
  {
    id: '6',
    name: 'Arjun Desai',
    role: 'Operations',
    mobile: '9898981212',
    status: 'Active',
    lastActive: 'Today, 10:05',
  },
  {
    id: '7',
    name: 'Meera Nair',
    role: 'Super admin',
    mobile: '9845012345',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: '8',
    name: 'Kabir Joshi',
    role: 'Finance',
    mobile: '9723456780',
    status: 'Invited',
    lastActive: '11 Oct',
  },
  {
    id: '9',
    name: 'Ishita Rao',
    role: 'Support',
    mobile: '9810099001',
    status: 'Active',
    lastActive: 'Today, 06:48',
  },
  {
    id: '10',
    name: 'Dev Patel',
    role: 'Operations',
    mobile: '9871200456',
    status: 'Active',
    lastActive: '10 Oct',
  },
  {
    id: '11',
    name: 'Pooja Reddy',
    role: 'Finance',
    mobile: '9944556677',
    status: 'Suspended',
    lastActive: '02 Oct',
  },
  {
    id: '12',
    name: 'Aman Verma',
    role: 'Support',
    mobile: '9833011224',
    status: 'Active',
    lastActive: 'Today, 11:20',
  },
  {
    id: '13',
    name: 'Diya Bhatt',
    role: 'Operations',
    mobile: '9753108642',
    status: 'Invited',
    lastActive: '09 Oct',
  },
  {
    id: '14',
    name: 'Rohan Gill',
    role: 'Super admin',
    mobile: '9887766554',
    status: 'Active',
    lastActive: 'Yesterday',
  },
  {
    id: '15',
    name: 'Tara Menon',
    role: 'Finance',
    mobile: '9700123456',
    status: 'Active',
    lastActive: 'Today, 09:05',
  },
  {
    id: '16',
    name: 'Yash Malhotra',
    role: 'Support',
    mobile: '9812340007',
    status: 'Active',
    lastActive: '08 Oct',
  },
]

const statusStyles: Record<UserStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Invited: 'bg-indigo-50 text-[#4f46e5] ring-indigo-200',
  Suspended: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedId, setSelectedId] = useState<string>()
  const [inviteOpen, setInviteOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    const matched = USERS.filter((user) => {
      if (!term) return true

      return [user.name, user.role, user.mobile, user.status].some((value) =>
        value.toLowerCase().includes(term),
      )
    })

    return [...matched].sort((left, right) => {
      const leftValue = String(left[sortBy as keyof AdminUser] ?? '')
      const rightValue = String(right[sortBy as keyof AdminUser] ?? '')
      const result = leftValue.localeCompare(rightValue, undefined, {
        numeric: true,
        sensitivity: 'base',
      })

      return sortOrder === 'asc' ? result : -result
    })
  }, [search, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const selectedUser = USERS.find((user) => user.id === selectedId)

  const columns: ColumnType<AdminUser>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'mobile', label: 'Mobile', sortable: true, isNowrap: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    { key: 'lastActive', label: 'Last active', sortable: true, isNowrap: true },
  ]

  const buttons: HeaderButton[] = [
    {
      label: 'Invite',
      icon: UserPlus,
      onClick: () => setInviteOpen(true),
    },
  ]

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  return (
    <AdminLayout title="Users" subtitle="People who can open this admin panel.">
      <TableLayout
        columns={columns}
        data={pageRows}
        loading={false}
        searchTerm={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search name, role, or mobile"
        page={currentPage}
        pageSize={PAGE_SIZE}
        totalItems={filteredUsers.length}
        totalPages={filteredUsers.length === 0 ? 0 : totalPages}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        buttons={buttons}
        selectedRowId={selectedId}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyMessage="No users match this search."
        actions={[
          {
            label: 'View',
            icon: Eye,
            onClick: (row) => setSelectedId(row.id),
          },
        ]}
        dialogOpen={inviteOpen}
        dialogTitle="Invite a user"
        dialogDescription="Invites will be sent from here once the users API is connected."
        setDialogOpen={() => setInviteOpen(false)}
        handleOnclick={() => setInviteOpen(false)}
        detailInfo={
          selectedUser ? (
            <UserDetail
              user={selectedUser}
              onClose={() => setSelectedId(undefined)}
            />
          ) : null
        }
      />
    </AdminLayout>
  )
}

function UserDetail({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(42,37,120,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#4f46e5] uppercase">
            Profile
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {user.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          Close
        </button>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <DetailRow label="Role" value={user.role} />
        <DetailRow label="Mobile" value={user.mobile} />
        <DetailRow
          label="Status"
          value={<StatusBadge status={user.status} />}
        />
        <DetailRow label="Last active" value={user.lastActive} />
      </dl>
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}
