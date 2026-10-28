import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/atoms/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearVendorForm,
  fetchVendor,
  fetchVendorFailure,
  fetchVendorOptions,
  fetchVendorOptionsFailure,
  fetchVendorOptionsSuccess,
  fetchVendorSuccess,
  fetchVendors,
  fetchVendorsFailure,
  fetchVendorsSuccess,
  saveVendor,
  saveVendorFailure,
  saveVendorSuccess,
} from '@/store/slices/vendorsSlice'
import {
  findRoleId,
  readDesignations,
  readFormOptions,
  readRegions,
  readRoles,
} from '@/utils/employee'
import { displayName } from '@/utils/helper'
import type {
  Designation,
  DesignationListResponse,
  RegionItem,
  RegionsResponse,
  RolesResponse,
  TerritoryMasterResponse,
  VendorFormValues,
  VendorListQuery,
} from '@/utils/types'
import { VendorForm } from './VendorForm'
import {
  readVendor,
  readVendorConfig,
  toVendorFormValues,
  vendorCreateBody,
  vendorListParams,
  vendorUpdateBody,
} from './vendorModel'
import type { VendorDetailResponse, VendorListResponse } from '@/utils/types'

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

export default function VendorFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    designations,
    designationsLoading,
    designationsError,
    vendorRoleId,
    formOptions,
    formOptionsLoading,
    formOptionsLoaded,
    editing,
    editingLoading,
    editingError,
    saving,
    saveError,
  } = useAppSelector((state) => state.vendors)
  const savingRef = useRef(false)

  useEffect(() => {
    dispatch(clearVendorForm())
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

    if (id) {
      dispatch(fetchVendor())
      dispatch({
        type: sagaActions.GET_VENDOR,
        payload: {
          query: `/users/${id}`,
          method: 'GET',
          onSuccess: (response: VendorDetailResponse) => {
            const vendor = readVendor(response.data)
            if (!vendor) {
              dispatch(fetchVendorFailure('Vendor could not be found.'))
              return
            }
            dispatch(
              fetchVendorSuccess({
                ...vendor,
                config: readVendorConfig(vendor.config),
              }),
            )
          },
          onFailure: (message: string) => {
            dispatch(fetchVendorFailure(message))
          },
        },
      })
    }

    return () => {
      dispatch(clearVendorForm())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) navigate('/vendors')
    savingRef.current = saving
  }, [navigate, saveError, saving])

  const canShowForm =
    formOptionsLoaded &&
    !formOptionsLoading &&
    !designationsLoading &&
    !designationsError &&
    (!isEdit || (!editingLoading && Boolean(editing)))

  const handleSubmit = (values: VendorFormValues) => {
    if (!vendorRoleId) {
      toast.error('Vendor role is not available.')
      return
    }

    dispatch(saveVendor())
    if (isEdit && id && editing) {
      dispatch({
        type: sagaActions.UPDATE_VENDOR,
        payload: {
          query: `/users/${id}`,
          method: 'PUT',
          showToast: true,
          successMessage: 'Vendor updated',
          variables: vendorUpdateBody(
            values,
            editing,
            designations,
            formOptions.regions,
          ),
          onSuccess: () => {
            dispatch(saveVendorSuccess())
            dispatchVendorList(dispatch, store.getState().vendors.query)
          },
          onFailure: (message: string) => {
            dispatch(saveVendorFailure(message))
          },
        },
      })
      return
    }

    dispatch({
      type: sagaActions.CREATE_VENDOR,
      payload: {
        query: '/users',
        method: 'POST',
        showToast: true,
        successMessage: 'Vendor created',
        variables: vendorCreateBody(
          values,
          designations,
          formOptions.regions,
          vendorRoleId,
        ),
        onSuccess: () => {
          dispatch(saveVendorSuccess())
          const current = store.getState().vendors.query
          dispatchVendorList(dispatch, { ...current, page: 1 })
        },
        onFailure: (message: string) => {
          dispatch(saveVendorFailure(message))
        },
      },
    })
  }

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title={isEdit ? 'Edit vendor' : 'Create vendor'}
          subtitle={
            isEdit
              ? `Update ${editing ? displayName(editing) : 'this vendor'}`
              : 'Add a vendor with company and contact details'
          }
          extraAction={
            <button
              type="button"
              onClick={() => navigate('/vendors')}
              className="inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/70 px-4 text-xs font-semibold text-[#312E81] hover:bg-white"
            >
              <ArrowLeft className="size-4" />
              Back to list
            </button>
          }
        />

        {editingError || designationsError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50/80 p-3 text-xs text-[#DC2626]">
            {editingError || designationsError}
          </div>
        ) : null}

        {canShowForm ? (
          <VendorForm
            key={isEdit ? editing?.id : 'create'}
            designations={designations}
            regionOptions={formOptions.regionOptions}
            territoryOptions={formOptions.territoryOptions}
            saving={saving}
            error={saveError}
            isEdit={isEdit}
            saveText={isEdit ? 'Save changes' : 'Create vendor'}
            defaultValues={
              isEdit && editing
                ? toVendorFormValues(editing, designations)
                : undefined
            }
            onCancel={() => navigate('/vendors')}
            onSubmit={handleSubmit}
          />
        ) : editingError ? null : (
          <div className="glass-card flex-1 space-y-4 p-6">
            <Skeleton className="h-5 w-40 rounded bg-indigo-100/60" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-[44px] rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] rounded-[14px] bg-indigo-100/40" />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
