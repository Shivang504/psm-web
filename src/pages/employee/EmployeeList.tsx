import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusTabs from '../../components/atoms/StatusTabs/StatusTabs'
import { FilterDropdown } from '../../components/molecules/FilterDropdown'
import { AdminLayout } from '../../components/organisms/AdminLayout'
import {
  TableLayout,
  type ColumnType,
} from '../../components/organisms/TableLayout'
import { sagaActions } from '../../store/actions'
import { store, type AppDispatch } from '../../store'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  cancelDeleteEmployee,
  deleteEmployee,
  deleteEmployeeFailure,
  deleteEmployeeSuccess,
  fetchDesignations,
  fetchDesignationsFailure,
  fetchDesignationsSuccess,
  fetchUserList,
  fetchUserListFailure,
  fetchUserListSuccess,
  requestDeleteEmployee,
  setSelectedUserId,
  updateEmployeeStatus,
  updateEmployeeStatusFinished,
} from '../../store/slices/usersSlice'
import {
  findRoleId,
  readConfig,
  readDesignations,
  readRoles,
  userListParams,
} from '../../utils/employee'
import type {
  Designation,
  DesignationListResponse,
  RolesResponse,
  UserListItem,
  UserListQuery,
  UserListResponse,
} from '../../utils/types'
import { statusStyles } from '../../utils/styleVariant'
import { attendanceLabel, displayName, displayValue } from '../../utils/helper'

function dispatchUserList(dispatch: AppDispatch, nextQuery: UserListQuery) {
  dispatch(fetchUserList(nextQuery))
  dispatch({
    type: sagaActions.GET_USERS,
    payload: {
      query: '/users/',
      method: 'GET',
      variables: userListParams(nextQuery),
      onSuccess: (response: UserListResponse) => {
        const users = response.data?.users
        dispatch(
          fetchUserListSuccess({
            items: users?.user ?? [],
            total: users?.totalRowsValue ?? 0,
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchUserListFailure(message))
      },
    },
  })
}

function StatusBadge({ status }: { status?: string | null }) {
  const label = status?.trim() || '—'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        statusStyles[label] ??
        'bg-background-muted text-text-secondary ring-border'
      }`}
    >
      {label}
    </span>
  )
}

function StatusSwitch({
  active,
  disabled,
  onToggle,
}: {
  active: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'Mark inactive' : 'Mark active'}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? 'bg-primary' : 'bg-border-strong'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-background-surface shadow transition ${
          active ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function HomePage() {
  const dispatch = useAppDispatch()
  const {
    items,
    total,
    loading,
    error,
    selectedId,
    query,
    designations,
    designationsLoading,
    designationsError,
    employeeRoleId,
    deleteTargetId,
    actionLoading,
  } = useAppSelector((state) => state.users)
  const navigate = useNavigate()
  const deleteTarget = items.find((user) => user.id === deleteTargetId)
  const totalPages = Math.ceil(total / query.limit)
  const listError = designationsError || error
  const [searchText, setSearchText] = useState(query.search)
  const searchTimer = useRef<number | null>(null)

  const loadList = (next: Partial<UserListQuery>) => {
    const role = employeeRoleId || query.role
    if (!role) return

    dispatchUserList(dispatch, {
      ...query,
      ...next,
      role,
    })
  }

  useEffect(() => {
    const currentQuery = store.getState().users.query
    let designationList: Designation[] | undefined
    let nextRoleId = ''
    let roleLoaded = false
    let settled = false

    dispatch(fetchDesignations())

    const fail = (message: string) => {
      if (settled) return
      settled = true
      dispatch(fetchDesignationsFailure(message))
    }

    const finish = () => {
      if (settled || designationList === undefined || !roleLoaded) return
      settled = true

      if (!nextRoleId) {
        dispatch(fetchDesignationsFailure('Employee role is not available.'))
        return
      }

      dispatch(
        fetchDesignationsSuccess({
          designations: designationList,
          employeeRoleId: nextRoleId,
        }),
      )

      dispatchUserList(dispatch, {
        ...currentQuery,
        role: nextRoleId,
        designation: currentQuery.designation || '',
        search: currentQuery.search ?? '',
      })
    }

    dispatch({
      type: sagaActions.GET_DESIGNATIONS,
      payload: {
        query: '/designations/',
        method: 'GET',
        variables: { dept: 'employee' },
        onSuccess: (response: DesignationListResponse) => {
          designationList = readDesignations(response.data)
          finish()
        },
        onFailure: fail,
      },
    })

    dispatch({
      type: sagaActions.GET_ROLES,
      payload: {
        query: '/roles',
        method: 'GET',
        onSuccess: (response: RolesResponse) => {
          nextRoleId = findRoleId(readRoles(response.data), 'employee')
          roleLoaded = true
          finish()
        },
        onFailure: fail,
      },
    })

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [dispatch])

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)

    searchTimer.current = window.setTimeout(() => {
      const current = store.getState().users.query
      if (!current.role) return

      loadList({
        ...current,
        search: value.trim(),
        page: 1,
      })
    }, 400)
  }

  const dispatchStatus = (row: UserListItem, status: 'Active' | 'Inactive') => {
    dispatch(updateEmployeeStatus({ id: row.id, status }))
    dispatch({
      type: sagaActions.UPDATE_EMPLOYEE_STATUS,
      payload: {
        query: `/users/${row.id}`,
        method: 'PUT',
        variables: {
          id: row.id,
          first_name: row.first_name ?? '',
          last_name: row.last_name ?? '',
          email: row.email ?? '',
          contact_no: row.contact_no ?? '',
          role: row.role || 'employee',
          status,
          config: readConfig(row.config),
        },
        showToast: true,
        successMessage: 'Employee status updated',
        onSuccess: () => {
          dispatch(updateEmployeeStatusFinished())
          const current = store.getState().users.query
          if (current.role) dispatchUserList(dispatch, current)
        },
        onFailure: () => {
          dispatch(updateEmployeeStatusFinished())
        },
      },
    })
  }

  const dispatchDelete = (id: string) => {
    dispatch(deleteEmployee(id))
    dispatch({
      type: sagaActions.DELETE_EMPLOYEE,
      payload: {
        query: `/users/${id}`,
        method: 'DELETE',
        showToast: true,
        successMessage: 'Employee deleted',
        onSuccess: () => {
          dispatch(deleteEmployeeSuccess())
          const current = store.getState().users.query
          if (current.role) dispatchUserList(dispatch, current)
        },
        onFailure: () => {
          dispatch(deleteEmployeeFailure())
        },
      },
    })
  }

  const handleSort = (column: string) => {
    loadList({
      column,
      sort: query.column === column && query.sort === 'asc' ? 'desc' : 'asc',
      page: 1,
    })
  }

  const columns: ColumnType<UserListItem>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      sortKey: 'first_name',
      isNowrap: true,
      render: (row) => displayName(row),
    },
    {
      key: 'employeeCode',
      label: 'Code',
      isNowrap: true,
      render: (row) => displayValue(row.config?.employeeCode),
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      isNowrap: true,
      render: (row) => displayValue(row.designation),
    },
    {
      key: 'region',
      label: 'SBU',
      render: (row) => displayValue(row.config?.regionName),
    },
    {
      key: 'location',
      label: 'Location',
      render: (row) => displayValue(row.config?.location),
    },
    {
      key: 'state',
      label: 'State',
      render: (row) => displayValue(row.config?.state),
    },
    {
      key: 'contact_no',
      label: 'Mobile',
      sortable: true,
      isNowrap: true,
      render: (row) => displayValue(row.contact_no),
    },
    {
      key: 'attendance',
      label: 'Today',
      isNowrap: true,
      render: (row) => attendanceLabel(row.attendance),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) =>
        query.tab === 'Deleted' ? (
          <StatusBadge status={row.status} />
        ) : (
          <StatusSwitch
            active={row.status === 'Active'}
            disabled={actionLoading || loading}
            onToggle={() =>
              dispatchStatus(
                row,
                row.status === 'Active' ? 'Inactive' : 'Active',
              )
            }
          />
        ),
    },
  ]

  return (
    <AdminLayout title="Employee list">
      {listError ? (
        <p className="mb-3 text-sm text-error">{listError}</p>
      ) : null}
      <TableLayout
        columns={columns}
        data={items}
        loading={loading || designationsLoading}
        searchTerm={searchText}
        onSearchChange={handleSearch}
        searchPlaceholder="Search name or mobile"
        page={query.page}
        pageSize={query.limit}
        totalItems={total}
        totalPages={total === 0 ? 0 : totalPages}
        onPageChange={(page) => loadList({ page })}
        sortBy={query.column}
        sortOrder={query.sort}
        onSort={handleSort}
        selectedRowId={selectedId ?? undefined}
        onRowClick={(row) => dispatch(setSelectedUserId(row.id))}
        emptyMessage={
          listError
            ? 'The list could not be loaded.'
            : `No ${query.tab.toLowerCase()} employees.`
        }
        buttons={[
          {
            label: 'Create employee',
            icon: Plus,
            disabled: !employeeRoleId,
            onClick: () => navigate('/home/new'),
          },
        ]}
        filters={
          <FilterDropdown
            options={designations.map((item) => ({
              label: item.designation,
              value: item.id,
            }))}
            selected={query.designation}
            placeholder="Designation"
            clearbutton={true}
            onChange={(value) => loadList({ designation: value, page: 1 })}
          />
        }
        actions={[
          // {
          //   label: 'View',
          //   icon: Eye,
          //   onClick: (row) => dispatch(setSelectedUserId(row.id)),
          // },
          {
            label: 'Edit',
            icon: Pencil,
            condition: () => query.tab !== 'Deleted',
            onClick: (row) => navigate(`/home/${row.id}/edit`),
          },
          {
            label: 'Delete',
            icon: Trash2,
            condition: () => query.tab !== 'Deleted',
            onClick: (row) => dispatch(requestDeleteEmployee(row.id)),
          },
        ]}
        dialogOpen={Boolean(deleteTargetId)}
        dialogTitle="Delete employee"
        dialogLabel="Delete"
        dialogLoading={actionLoading}
        dialogDescription={
          deleteTarget
            ? `Delete ${displayName(deleteTarget)}? This moves the employee to the deleted list.`
            : 'Delete this employee?'
        }
        setDialogOpen={() => dispatch(cancelDeleteEmployee())}
        handleOnclick={() => {
          if (deleteTargetId) dispatchDelete(deleteTargetId)
        }}
      >
        <StatusTabs
          value={query.tab}
          onChange={(tab) => loadList({ tab, page: 1 })}
          size="md"
        />
      </TableLayout>
    </AdminLayout>
  )
}
