import { Eye, Pencil, Power, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../components/atoms/Avatar'
import { Badge } from '../../components/atoms/Badge'
import { StatusPill } from '../../components/atoms/StatusPill'
import {
  DataTable,
  AreasCell,
  type ColumnType,
  type ActionType,
} from '../../components/molecules/DataTable'
import { Dialog } from '../../components/molecules/Dialog'
import { FilterDropdown } from '../../components/molecules/FilterDropdown'
import { PageHeader } from '../../components/layout/PageHeader'
import { Toolbar } from '../../components/layout/Toolbar'
import { AdminLayout } from '../../components/organisms/AdminLayout'
import { EmployeeDrawer } from './EmployeeDrawer'
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
import { displayName, displayValue } from '../../utils/helper'

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

  const dispatchStatus = useCallback(
    (row: UserListItem, status: 'Active' | 'Inactive') => {
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
    },
    [dispatch],
  )

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

  // Selected user for details drawer
  const selectedUser = useMemo(() => {
    return items.find((u) => u.id === selectedId) || null
  }, [items, selectedId])

  // Dynamic columns definition
  const columns: ColumnType<UserListItem>[] = useMemo(
    () => [
      {
        key: 'employee',
        label: 'Employee',
        sortable: true,
        sortKey: 'first_name',
        width: '2.3fr',
        render: (row) => {
          const name = displayName(row)
          const code = displayValue(row.config?.employeeCode)

          return (
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <Avatar name={name} />
              <div className="min-w-0 truncate">
                <b className="block text-[14px] font-semibold text-[#1E1B4B] truncate">
                  {name}
                </b>
                <span className="text-[12px] text-[#4C4A7A] block truncate">
                  {code}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        sortKey: 'designation',
        width: '0.8fr',
        render: (row) => (
          <Badge variant="role">
            <span className="truncate max-w-[80px]">
              {displayValue(row.designation || row.role)}
            </span>
          </Badge>
        ),
      },
      {
        key: 'region',
        label: 'Region',
        width: '1.2fr',
        render: (row) => {
          const region = displayValue(row.config?.regionName)
          return (
            <span className="truncate text-[#1E1B4B] block" title={region}>
              {region}
            </span>
          )
        },
      },
      {
        key: 'areas',
        label: 'Areas',
        width: '2.2fr',
        render: (row) => <AreasCell areas={parseAreas(row)} />,
      },
      {
        key: 'state',
        label: 'State',
        width: '1fr',
        render: (row) => {
          const state = displayValue(row.config?.state)
          return (
            <span className="truncate text-[#1E1B4B] block" title={state}>
              {state}
            </span>
          )
        },
      },
      {
        key: 'mobile',
        label: 'Mobile',
        sortable: true,
        sortKey: 'contact_no',
        width: '1.1fr',
        render: (row) => (
          <span className="truncate text-[#1E1B4B] block">
            {displayValue(row.contact_no)}
          </span>
        ),
      },
      {
        key: 'attendance',
        label: 'Attendance',
        width: '0.9fr',
        render: (row) => <StatusPill status={row.attendance} />,
      },
    ],
    [],
  )

  // Dynamic actions definition
  const actions: ActionType<UserListItem>[] = useMemo(
    () => [
      {
        label: 'View',
        icon: Eye,
        onClick: (row) => dispatch(setSelectedUserId(row.id)),
      },
      {
        label: 'Edit',
        icon: Pencil,
        condition: () => query.tab !== 'Deleted',
        onClick: (row) => navigate(`/home/${row.id}/edit`),
      },
      {
        label: 'Status',
        icon: Power,
        condition: () => query.tab !== 'Deleted',
        title: (row) => (row.status === 'Active' ? 'Deactivate' : 'Activate'),
        onClick: (row) =>
          dispatchStatus(row, row.status === 'Active' ? 'Inactive' : 'Active'),
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        condition: () => query.tab !== 'Deleted',
        onClick: (row) => dispatch(requestDeleteEmployee(row.id)),
      },
    ],
    [dispatch, navigate, query.tab, dispatchStatus],
  )

  return (
    <AdminLayout hideHeader={true}>
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
        {/* Page Header */}
        <PageHeader
          title="Employee list"
          subtitle={`${total} employees across all regions`}
          actionLabel="Create employee"
          actionDisabled={!employeeRoleId}
          onAction={() => navigate('/home/new')}
        />

        {listError ? (
          <div className="glass-panel border-red-300 bg-red-50/70 p-3 text-xs text-[#991B1B]">
            {listError}
          </div>
        ) : null}

        {/* Toolbar */}
        <Toolbar
          searchValue={searchText}
          onSearchChange={handleSearch}
          searchPlaceholder="Search name or mobile"
          activeTab={query.tab}
          onTabChange={(tab) => loadList({ tab, page: 1 })}
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
        />

        {/* Data Table Card */}
        <DataTable<UserListItem>
          columns={columns}
          data={items}
          actions={actions}
          loading={loading || designationsLoading}
          error={listError ? 'The employee list could not be loaded.' : null}
          onRetry={() => {
            const current = store.getState().users.query
            if (current.role) dispatchUserList(dispatch, current)
          }}
          onRowClick={(row) => dispatch(setSelectedUserId(row.id))}
          sortBy={query.column}
          sortOrder={query.sort}
          onSort={handleSort}
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          totalPages={total === 0 ? 0 : totalPages}
          onPageChange={(page) => loadList({ page })}
          onPageSizeChange={(limit) => loadList({ limit, page: 1 })}
          selectedRowId={selectedId}
          emptyMessage={
            listError
              ? 'The employee list could not be loaded.'
              : `No ${query.tab.toLowerCase()} employees.`
          }
        />
      </div>

      {/* Right-side Glass Details Drawer */}
      <EmployeeDrawer
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={() => dispatch(setSelectedUserId(null))}
        onEdit={(user) => {
          dispatch(setSelectedUserId(null))
          navigate(`/home/${user.id}/edit`)
        }}
        onToggleStatus={(user) => {
          dispatchStatus(user, user.status === 'Active' ? 'Inactive' : 'Active')
        }}
        onDelete={(user) => {
          dispatch(setSelectedUserId(null))
          dispatch(requestDeleteEmployee(user.id))
        }}
        canModify={query.tab !== 'Deleted'}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        title="Delete employee"
        label="Delete"
        open={Boolean(deleteTargetId)}
        loading={actionLoading}
        onClose={() => dispatch(cancelDeleteEmployee())}
        handleSubmit={() => {
          if (deleteTargetId) dispatchDelete(deleteTargetId)
        }}
      >
        <p className="text-sm text-[#4C4A7A]">
          {deleteTarget
            ? `Are you sure you want to delete ${displayName(deleteTarget)}? This moves the employee to the deleted list.`
            : 'Are you sure you want to delete this employee?'}
        </p>
      </Dialog>
    </AdminLayout>
  )
}
