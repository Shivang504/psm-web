import { Check, Eye, Info, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import { Drawer } from '@/components/molecules/Drawer'
import { FilterDropdown } from '@/components/molecules/FilterDropdown'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchLeads,
  fetchLeadsFailure,
  fetchLeadsSuccess,
  setLeadOptions,
  setLeadSaving,
} from '@/store/slices/leadsSlice'
import {
  findRoleId,
  readDesignations,
  readRoles,
  userListParams,
} from '@/utils/employee'
import { displayName, displayValue } from '@/utils/helper'
import type {
  DesignationListResponse,
  Lead,
  LeadFormValues,
  LeadListQuery,
  LeadListResponse,
  LeadStatus,
  ProductListResponse,
  RolesResponse,
  UserListItem,
  UserListResponse,
} from '@/utils/types'
import { LeadForm } from './LeadForm'
import { leadPayload, toLeadFormValues } from './leadModel'

const STATUS_PARAM: Record<string, LeadStatus> = {
  pending: 'Pending',
  new: 'New',
  rejected: 'Rejected',
}

const TABS: { id: LeadStatus; path: string; label: string }[] = [
  { id: 'Pending', path: 'pending', label: 'Pending' },
  { id: 'New', path: 'new', label: 'New' },
  { id: 'Rejected', path: 'rejected', label: 'Rejected' },
]

function leadName(lead: Lead) {
  const name = [lead.first_name, lead.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return name || '—'
}

function leadListParams(query: LeadListQuery) {
  const params: Record<string, string | number> = {
    status: query.status,
    page: query.page,
    limit: query.limit,
  }
  const search = query.search.trim()
  if (search) params.searchText = search
  return params
}

function dispatchLeadList(dispatch: AppDispatch, nextQuery: LeadListQuery) {
  dispatch(fetchLeads(nextQuery))
  dispatch({
    type: sagaActions.GET_LEADS,
    payload: {
      query: '/leads/status/',
      method: 'GET',
      variables: leadListParams(nextQuery),
      onSuccess: (response: LeadListResponse) => {
        const leads = response.data?.leads
        dispatch(
          fetchLeadsSuccess({
            items: leads?.lead ?? [],
            total: leads?.totalRowsValue ?? 0,
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchLeadsFailure(message))
      },
    },
  })
}

function reloadLeads(dispatch: AppDispatch) {
  dispatchLeadList(dispatch, store.getState().leads.query)
}

function DetailGrid({ lead }: { lead: Lead }) {
  const fields = [
    ['Role', displayValue(lead.designation)],
    ['Mobile', displayValue(lead.contact_no)],
    ['Company', displayValue(lead.config?.company || lead.config?.companyName)],
    ['Employee', displayValue(lead.config?.employee)],
    ['Lead type', displayValue(lead.config?.leadtype)],
    ['Origin', displayValue(lead.config?.origin)],
    ['Product', displayValue(lead.config?.productname)],
    ['Value', displayValue(lead.config?.valueoflead)],
    ['Address', displayValue(lead.config?.address)],
  ]

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}>
          <dt className="text-[12px] font-semibold text-[#4C4A7A]">{label}</dt>
          <dd className="mt-1 text-sm text-[#1E1B4B]">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function LeadListPage() {
  const { status: statusParam } = useParams()
  const status = statusParam ? STATUS_PARAM[statusParam] : undefined
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items,
    total,
    loading,
    saving,
    error,
    query,
    designations,
    employees,
    products,
    vendorRoleId,
  } = useAppSelector((state) => state.leads)
  const [searchText, setSearchText] = useState(query.search)
  const [formLead, setFormLead] = useState<Lead | null | undefined>(undefined)
  const [detailLead, setDetailLead] = useState<Lead | null>(null)
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null)
  const [approveLead, setApproveLead] = useState<Lead | null>(null)
  const [rejectLead, setRejectLead] = useState<Lead | null>(null)
  const [reasonLead, setReasonLead] = useState<Lead | null>(null)
  const [assignLead, setAssignLead] = useState<Lead | null>(null)
  const [assignEmployeeId, setAssignEmployeeId] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const searchTimer = useRef<number | null>(null)
  const totalPages = Math.ceil(total / query.limit)

  useEffect(() => {
    dispatch({
      type: sagaActions.GET_ROLES,
      payload: {
        query: '/roles',
        method: 'GET',
        onSuccess: (response: RolesResponse) => {
          const roles = readRoles(response.data)
          const employeeRoleId = findRoleId(roles, 'employee')
          const nextVendorRoleId = findRoleId(roles, 'vendor')
          dispatch(setLeadOptions({ vendorRoleId: nextVendorRoleId }))

          if (!employeeRoleId) return
          dispatch({
            type: sagaActions.GET_USERS,
            payload: {
              query: '/users/',
              method: 'GET',
              variables: userListParams({
                role: employeeRoleId,
                designation: '',
                tab: 'Active',
                page: 1,
                limit: 200,
                sort: 'asc',
                column: 'first_name',
                search: '',
              }),
              onSuccess: (usersResponse: UserListResponse) => {
                dispatch(
                  setLeadOptions({
                    employees: usersResponse.data?.users?.user ?? [],
                  }),
                )
              },
            },
          })
        },
      },
    })

    dispatch({
      type: sagaActions.GET_DESIGNATIONS,
      payload: {
        query: '/designations/',
        method: 'GET',
        variables: { dept: 'vendor' },
        onSuccess: (response: DesignationListResponse) => {
          dispatch(
            setLeadOptions({ designations: readDesignations(response.data) }),
          )
        },
      },
    })

    dispatch({
      type: sagaActions.GET_PRODUCTS,
      payload: {
        query: '/products',
        method: 'GET',
        onSuccess: (response: ProductListResponse) => {
          const products = response.data?.productList?.products ?? []
          dispatch(
            setLeadOptions({
              products: products.filter(
                (item) => !item.status || item.status === 'Active',
              ),
            }),
          )
        },
      },
    })

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [dispatch])

  useEffect(() => {
    if (!status) return
    const current = store.getState().leads.query
    dispatchLeadList(dispatch, {
      ...current,
      status,
      page: current.status === status ? current.page : 1,
    })
  }, [dispatch, status])

  const loadList = (next: Partial<LeadListQuery>) => {
    dispatchLeadList(dispatch, {
      ...store.getState().leads.query,
      ...next,
    })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      loadList({ search: value.trim(), page: 1 })
    }, 500)
  }

  const finishMutation = (close: () => void) => {
    close()
    dispatch(setLeadSaving(false))
    reloadLeads(dispatch)
  }

  const handleSave = (values: LeadFormValues) => {
    const editing = formLead
    if (editing === undefined || saving) return

    dispatch(setLeadSaving(true))
    dispatch({
      type: editing ? sagaActions.EDIT_LEAD : sagaActions.ADD_LEAD,
      payload: {
        query: editing ? `/leads/${editing.id}` : '/leads',
        method: editing ? 'PUT' : 'POST',
        variables: leadPayload(values, designations, employees, editing),
        showToast: true,
        successMessage: editing ? 'Lead updated' : 'Lead created',
        onSuccess: () => {
          setFormLead(undefined)
          dispatch(setLeadSaving(false))
          if (!editing) navigate('/leads/new')
          const current = store.getState().leads.query
          dispatchLeadList(dispatch, {
            ...current,
            status: editing ? current.status : 'New',
            page: editing ? current.page : 1,
          })
        },
        onFailure: () => {
          dispatch(setLeadSaving(false))
        },
      },
    })
  }

  const columns: ColumnType<Lead>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: '2fr',
        render: (row) => (
          <div className="flex min-w-0 items-center gap-3 pr-2">
            <Avatar name={leadName(row)} />
            <b className="block truncate text-[14px] font-semibold text-[#1E1B4B]">
              {leadName(row)}
            </b>
          </div>
        ),
      },
      {
        key: 'designation',
        label: 'Role',
        width: '1.2fr',
        render: (row) => (
          <Badge variant="role">
            <span className="max-w-[120px] truncate">
              {displayValue(row.designation)}
            </span>
          </Badge>
        ),
      },
      {
        key: 'contact_no',
        label: 'Mobile',
        width: '1.2fr',
        render: (row) => (
          <span className="block truncate">{displayValue(row.contact_no)}</span>
        ),
      },
      {
        key: 'employee',
        label: 'Employee',
        width: '1.6fr',
        render: (row) => {
          const employee = row.config?.employee?.trim()
          if (query.status === 'New' && !employee) {
            return (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setAssignEmployeeId('')
                  setAssignLead(row)
                }}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[12px] bg-[#4F46E5] px-3 text-[12px] font-semibold text-white hover:bg-[#4338CA]"
              >
                <UserPlus className="size-3.5" />
                Assign
              </button>
            )
          }
          return (
            <span className="block truncate">{displayValue(employee)}</span>
          )
        },
      },
    ],
    [query.status],
  )

  const actions: ActionType<Lead>[] = useMemo(() => {
    const view: ActionType<Lead> = {
      label: 'View',
      icon: Eye,
      onClick: (row) => setDetailLead(row),
    }
    if (query.status === 'Pending') {
      return [
        view,
        {
          label: 'Approve',
          icon: Check,
          onClick: (row) => setApproveLead(row),
        },
        {
          label: 'Reject',
          icon: Trash2,
          variant: 'danger',
          onClick: (row) => {
            setRejectReason('')
            setRejectError('')
            setRejectLead(row)
          },
        },
      ]
    }
    if (query.status === 'Rejected') {
      return [
        view,
        {
          label: 'Reason',
          icon: Info,
          onClick: (row) => setReasonLead(row),
        },
        {
          label: 'Delete',
          icon: Trash2,
          variant: 'danger',
          onClick: (row) => setDeleteLead(row),
        },
      ]
    }
    return [
      view,
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (row) => setFormLead(row),
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: (row) => setDeleteLead(row),
      },
    ]
  }, [query.status])

  if (!status) return <Navigate to="/leads/pending" replace />

  const formOpen = formLead !== undefined
  const editingLead = formLead ?? null

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title="Leads"
          subtitle={`${total} ${status.toLowerCase()} leads`}
          actionLabel="Create lead"
          onAction={() => setFormLead(null)}
        />

        <Toolbar
          searchValue={searchText}
          onSearchChange={handleSearch}
          searchPlaceholder="Search name or mobile"
          filters={
            <div
              role="tablist"
              aria-label="Lead status"
              className="inline-flex h-[44px] items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1 backdrop-blur-md"
            >
              {TABS.map((tab) => {
                const selected = tab.id === status
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => navigate(`/leads/${tab.path}`)}
                    className={`h-[36px] cursor-pointer rounded-[11px] px-4 text-[13px] ${
                      selected
                        ? 'bg-[#4F46E5] font-semibold text-white shadow-sm'
                        : 'font-medium text-[#312E81] hover:bg-white/45'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          }
        />

        <DataTable<Lead>
          columns={columns}
          data={items}
          actions={actions}
          loading={loading}
          error={error || null}
          onRetry={() => reloadLeads(dispatch)}
          onRowClick={(row) => setDetailLead(row)}
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          totalPages={total === 0 ? 0 : totalPages}
          onPageChange={(page) => loadList({ page })}
          onPageSizeChange={(limit) => loadList({ limit, page: 1 })}
          pageSizeOptions={[20, 50, 100]}
          emptyMessage={`No ${status.toLowerCase()} leads.`}
          minWidth="860px"
        />
      </div>

      <Drawer
        open={Boolean(detailLead)}
        title={detailLead ? leadName(detailLead) : 'Lead'}
        subtitle={detailLead?.designation || 'Lead details'}
        onClose={() => setDetailLead(null)}
      >
        {detailLead ? <DetailGrid lead={detailLead} /> : null}
      </Drawer>

      <Drawer
        open={formOpen}
        title={editingLead ? 'Edit lead' : 'Create lead'}
        subtitle="Role, contact, and assignment"
        onClose={() => {
          if (!saving) setFormLead(undefined)
        }}
        panelClassName="max-w-3xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setFormLead(undefined)}
              className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/70 px-5 text-[13px] font-semibold text-[#312E81] hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lead-form"
              disabled={saving}
              className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[14px] bg-[#4F46E5] px-6 text-[13px] font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingLead ? 'Save changes' : 'Create'}
            </button>
          </div>
        }
      >
        {formOpen ? (
          <LeadForm
            key={editingLead?.id ?? 'create'}
            designations={designations}
            employees={employees}
            products={products}
            defaultValues={toLeadFormValues(
              editingLead,
              designations,
              employees,
            )}
            onSubmit={handleSave}
          />
        ) : null}
      </Drawer>

      <Dialog
        open={Boolean(deleteLead)}
        title="Delete lead"
        label="Delete"
        loading={saving}
        onClose={() => setDeleteLead(null)}
        handleSubmit={() => {
          if (!deleteLead) return
          dispatch(setLeadSaving(true))
          dispatch({
            type: sagaActions.DELETE_LEAD,
            payload: {
              query: `/leads/${deleteLead.id}`,
              method: 'DELETE',
              showToast: true,
              successMessage: 'Lead deleted',
              onSuccess: () => finishMutation(() => setDeleteLead(null)),
              onFailure: () => dispatch(setLeadSaving(false)),
            },
          })
        }}
      >
        <p>
          {deleteLead
            ? `Delete ${leadName(deleteLead)}? This cannot be undone.`
            : 'Delete this lead?'}
        </p>
      </Dialog>

      <Dialog
        open={Boolean(approveLead)}
        title="Approve lead"
        onClose={() => setApproveLead(null)}
      >
        <p>
          {approveLead
            ? `Approve ${leadName(approveLead)} and move them forward?`
            : 'Approve this lead?'}
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setApproveLead(null)}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (!approveLead) return
              if (!vendorRoleId) {
                toast.error('Vendor role is not available.')
                return
              }
              dispatch(setLeadSaving(true))
              dispatch({
                type: sagaActions.APPROVE_LEAD,
                payload: {
                  query: `/leads/approve/${approveLead.id}`,
                  method: 'POST',
                  variables: { role_id: vendorRoleId },
                  showToast: true,
                  successMessage: 'Lead approved',
                  onSuccess: () => finishMutation(() => setApproveLead(null)),
                  onFailure: () => dispatch(setLeadSaving(false)),
                },
              })
            }}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(rejectLead)}
        title="Reject lead"
        label="Reject"
        loading={saving}
        onClose={() => setRejectLead(null)}
        handleSubmit={() => {
          const reason = rejectReason.trim()
          if (!reason) {
            setRejectError('Reason is required')
            return
          }
          if (!rejectLead) return
          dispatch(setLeadSaving(true))
          dispatch({
            type: sagaActions.REJECT_LEAD,
            payload: {
              query: `/leads/reject/${rejectLead.id}`,
              method: 'PUT',
              variables: {
                config: {
                  ...rejectLead.config,
                  Reason: reason,
                },
              },
              showToast: true,
              successMessage: 'Lead rejected',
              onSuccess: () => finishMutation(() => setRejectLead(null)),
              onFailure: () => dispatch(setLeadSaving(false)),
            },
          })
        }}
      >
        <label className="block text-[13px] font-semibold text-[#1E1B4B]">
          Reason
        </label>
        <textarea
          value={rejectReason}
          onChange={(event) => {
            setRejectReason(event.target.value)
            setRejectError('')
          }}
          rows={3}
          placeholder="Why is this lead rejected?"
          className="mt-2 w-full rounded-[14px] border border-white/85 bg-white/70 px-4 py-3 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
        />
        {rejectError ? (
          <p className="mt-2 text-xs text-error">{rejectError}</p>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(reasonLead)}
        title="Rejection reason"
        onClose={() => setReasonLead(null)}
      >
        <p>{reasonLead?.config?.Reason?.trim() || 'No reason was recorded.'}</p>
      </Dialog>

      <Dialog
        open={Boolean(assignLead)}
        title="Assign employee"
        onClose={() => setAssignLead(null)}
      >
        <FilterDropdown
          options={employees.map((item: UserListItem) => ({
            label: displayName(item),
            value: item.id,
          }))}
          selected={assignEmployeeId}
          placeholder="Employee"
          clearbutton={false}
          onChange={setAssignEmployeeId}
        />
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setAssignLead(null)}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !assignEmployeeId}
            onClick={() => {
              const employee = employees.find(
                (item) => item.id === assignEmployeeId,
              )
              if (!assignLead || !employee) return
              dispatch(setLeadSaving(true))
              dispatch({
                type: sagaActions.ASSIGN_LEAD,
                payload: {
                  query: `/leads/transfer/${assignLead.id}`,
                  method: 'POST',
                  variables: {
                    employee_id: employee.id,
                    employee: displayName(employee),
                  },
                  showToast: true,
                  successMessage: 'Employee assigned',
                  onSuccess: () => finishMutation(() => setAssignLead(null)),
                  onFailure: () => dispatch(setLeadSaving(false)),
                },
              })
            }}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Assign'}
          </button>
        </div>
      </Dialog>
    </AdminLayout>
  )
}
