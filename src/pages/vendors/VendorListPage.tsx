import { Eye, Pencil, Power, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { StatusPill } from '@/components/atoms/StatusPill'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import { FilterDropdown } from '@/components/molecules/FilterDropdown'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  cancelDeleteVendor,
  deleteVendor,
  deleteVendorFinished,
  fetchVendorOptions,
  fetchVendorOptionsFailure,
  fetchVendorOptionsSuccess,
  fetchVendors,
  fetchVendorsFailure,
  fetchVendorsSuccess,
  requestDeleteVendor,
  setSelectedVendorId,
  updateVendorStatus,
  updateVendorStatusFinished,
} from '@/store/slices/vendorsSlice'
import {
  findRoleId,
  readDesignations,
  readFormOptions,
  readRegions,
  readRoles,
} from '@/utils/employee'
import { displayName, displayValue } from '@/utils/helper'
import type {
  Designation,
  DesignationListResponse,
  RegionItem,
  RegionsResponse,
  RolesResponse,
  TerritoryMasterResponse,
  VendorListQuery,
  VendorListResponse,
  VendorRecord,
} from '@/utils/types'
import { VendorDetailDrawer } from './VendorDetailDrawer'
import {
  readVendorConfig,
  vendorListParams,
  vendorStatusBody,
} from './vendorModel'

function dispatchVendorList(dispatch: AppDispatch, nextQuery: VendorListQuery) {
  if (!nextQuery.role) return
  dispatch(fetchVendors(nextQuery))
  dispatch({
    type: sagaActions.GET_VENDORS,
    payload: {
      query: '/users/',
      method: 'GET',
      variables: vendorListParams(nextQuery),
      onSuccess: (response: VendorListResponse) => {
        const users = response.data?.users
        dispatch(
          fetchVendorsSuccess({
            items: users?.user ?? [],
            total: users?.totalRowsValue ?? 0,
          }),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchVendorsFailure(message))
      },
    },
  })
}

export default function VendorListPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items,
    total,
    loading,
    error,
    query,
    designations,
    designationsLoading,
    designationsError,
    vendorRoleId,
    selectedId,
    deleteTargetId,
    actionLoading,
  } = useAppSelector((state) => state.vendors)
  const [searchText, setSearchText] = useState(query.search)
  const searchTimer = useRef<number | null>(null)
  const totalPages = Math.ceil(total / query.limit)
  const listError = designationsError || error
  const selectedVendor = items.find((item) => item.id === selectedId) ?? null
  const deleteTarget = items.find((item) => item.id === deleteTargetId)

  const loadList = (next: Partial<VendorListQuery>) => {
    const current = store.getState().vendors.query
    const role = vendorRoleId || current.role
    if (!role) return
    dispatchVendorList(dispatch, { ...current, ...next, role })
  }

  useEffect(() => {
    dispatch(fetchVendorOptions())
    let designations: Designation[] | undefined
    let regions: RegionItem[] | undefined
    let territoryData: unknown
    let roleId = ''
    let pending = 4
    let failed = false

    const finish = () => {
      pending -= 1
      if (failed || pending > 0) return
      if (
        designations === undefined ||
        regions === undefined ||
        territoryData === undefined
      ) {
        return
      }
      if (!roleId) {
        dispatch(fetchVendorOptionsFailure('Vendor role is not available.'))
        return
      }
      dispatch(
        fetchVendorOptionsSuccess({
          designations,
          vendorRoleId: roleId,
          formOptions: readFormOptions(regions, territoryData),
        }),
      )
      const current = store.getState().vendors.query
      dispatchVendorList(dispatch, {
        ...current,
        role: roleId,
        designation: current.designation,
        search: current.search ?? '',
      })
    }

    const fail = (message: string) => {
      if (failed) return
      failed = true
      dispatch(fetchVendorOptionsFailure(message))
    }

    dispatch({
      type: sagaActions.GET_DESIGNATIONS,
      payload: {
        query: '/designations/',
        method: 'GET',
        variables: { dept: 'vendor' },
        onSuccess: (response: DesignationListResponse) => {
          designations = readDesignations(response.data)
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
          roleId = findRoleId(readRoles(response.data), 'vendor')
          finish()
        },
        onFailure: fail,
      },
    })
    dispatch({
      type: sagaActions.GET_REGIONS,
      payload: {
        query: '/regions',
        method: 'GET',
        onSuccess: (response: RegionsResponse) => {
          regions = readRegions(response.data)
          finish()
        },
        onFailure: () => {
          regions = []
          finish()
        },
      },
    })
    dispatch({
      type: sagaActions.GET_TERRITORIES,
      payload: {
        query: '/territorymaster',
        method: 'GET',
        onSuccess: (response: TerritoryMasterResponse) => {
          territoryData = response.data?.territoryMaster?.data ?? response.data
          finish()
        },
        onFailure: () => {
          territoryData = []
          finish()
        },
      },
    })

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [dispatch])

  const changeStatus = useCallback(
    (row: VendorRecord) => {
      const status = row.status === 'Active' ? 'Inactive' : 'Active'
      dispatch(updateVendorStatus())
      dispatch({
        type: sagaActions.UPDATE_VENDOR,
        payload: {
          query: `/users/${row.id}`,
          method: 'PUT',
          showToast: true,
          successMessage: 'Vendor status updated',
          variables: vendorStatusBody(row, status),
          onSuccess: () => {
            dispatch(updateVendorStatusFinished())
            dispatchVendorList(dispatch, store.getState().vendors.query)
          },
          onFailure: () => dispatch(updateVendorStatusFinished()),
        },
      })
    },
    [dispatch],
  )

  const columns: ColumnType<VendorRecord>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: '1.8fr',
        render: (row) => (
          <div className="flex min-w-0 items-center gap-3 pr-2">
            <Avatar name={displayName(row)} />
            <b className="block truncate text-[14px] font-semibold text-[#1E1B4B]">
              {displayName(row)}
            </b>
          </div>
        ),
      },
      {
        key: 'designation',
        label: 'Role',
        width: '1.1fr',
        render: (row) => (
          <Badge variant="role">
            <span className="max-w-[110px] truncate">
              {displayValue(row.designation)}
            </span>
          </Badge>
        ),
      },
      {
        key: 'company',
        label: 'Company',
        width: '1.4fr',
        render: (row) => (
          <span className="block truncate">
            {displayValue(readVendorConfig(row.config).company)}
          </span>
        ),
      },
      {
        key: 'contact_no',
        label: 'Mobile',
        width: '1.1fr',
        render: (row) => (
          <span className="block truncate">{displayValue(row.contact_no)}</span>
        ),
      },
      {
        key: 'created_by',
        label: 'Created by',
        width: '1.2fr',
        render: (row) => (
          <span className="block truncate">{displayValue(row.created_by)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '0.9fr',
        render: (row) => <StatusPill status={row.status} />,
      },
    ],
    [],
  )

  const actions: ActionType<VendorRecord>[] = useMemo(
    () => [
      {
        label: 'View',
        icon: Eye,
        onClick: (row) => dispatch(setSelectedVendorId(row.id)),
      },
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (row) => navigate(`/vendors/${row.id}/edit`),
      },
      {
        label: 'Status',
        icon: Power,
        title: (row) => (row.status === 'Active' ? 'Deactivate' : 'Activate'),
        onClick: changeStatus,
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: (row) => dispatch(requestDeleteVendor(row.id)),
      },
    ],
    [changeStatus, dispatch, navigate],
  )

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title="Vendors"
          subtitle={`${total} vendors`}
          actionLabel="Create vendor"
          actionDisabled={!vendorRoleId}
          onAction={() => navigate('/vendors/new')}
        />

        <Toolbar
          searchValue={searchText}
          onSearchChange={(value) => {
            setSearchText(value)
            if (searchTimer.current) window.clearTimeout(searchTimer.current)
            searchTimer.current = window.setTimeout(() => {
              loadList({ search: value.trim(), page: 1 })
            }, 500)
          }}
          searchPlaceholder="Search name or mobile"
          filters={
            <FilterDropdown
              options={designations.map((item) => ({
                label: item.designation,
                value: item.id,
              }))}
              selected={query.designation}
              placeholder="Designation"
              onChange={(value) => loadList({ designation: value, page: 1 })}
            />
          }
        />

        <DataTable<VendorRecord>
          columns={columns}
          data={items}
          actions={actions}
          loading={loading || designationsLoading}
          error={listError ? 'The vendor list could not be loaded.' : null}
          onRetry={() => loadList({})}
          onRowClick={(row) => dispatch(setSelectedVendorId(row.id))}
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          totalPages={total === 0 ? 0 : totalPages}
          onPageChange={(page) => loadList({ page })}
          onPageSizeChange={(limit) => loadList({ limit, page: 1 })}
          selectedRowId={selectedId}
          emptyMessage="No vendors found."
          minWidth="980px"
        />
      </div>

      <VendorDetailDrawer
        vendor={selectedVendor}
        onClose={() => dispatch(setSelectedVendorId(null))}
        onEdit={(vendor) => {
          dispatch(setSelectedVendorId(null))
          navigate(`/vendors/${vendor.id}/edit`)
        }}
        onDelete={(vendor) => {
          dispatch(setSelectedVendorId(null))
          dispatch(requestDeleteVendor(vendor.id))
        }}
      />

      <Dialog
        title="Delete vendor"
        label="Delete"
        open={Boolean(deleteTargetId)}
        loading={actionLoading}
        onClose={() => dispatch(cancelDeleteVendor())}
        handleSubmit={() => {
          if (!deleteTargetId) return
          dispatch(deleteVendor())
          dispatch({
            type: sagaActions.DELETE_VENDOR,
            payload: {
              query: `/users/${deleteTargetId}`,
              method: 'DELETE',
              showToast: true,
              successMessage: 'Vendor deleted',
              onSuccess: () => {
                dispatch(deleteVendorFinished())
                dispatchVendorList(dispatch, store.getState().vendors.query)
              },
              onFailure: () => dispatch(deleteVendorFinished()),
            },
          })
        }}
      >
        <p>
          {deleteTarget
            ? `Delete ${displayName(deleteTarget)}? This cannot be undone.`
            : 'Delete this vendor?'}
        </p>
      </Dialog>
    </AdminLayout>
  )
}
