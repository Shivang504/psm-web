import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/atoms/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { EmployeeForm } from '@/components/organisms/EmployeeForm'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearEmployeeFormState,
  createEmployee,
  createEmployeeFailure,
  createEmployeeSuccess,
  fetchDesignations,
  fetchDesignationsFailure,
  fetchDesignationsSuccess,
  fetchEmployee,
  fetchEmployeeFailure,
  fetchEmployeeFormOptions,
  fetchEmployeeFormOptionsFailure,
  fetchEmployeeFormOptionsSuccess,
  fetchEmployeeSuccess,
  fetchUserList,
  fetchUserListFailure,
  fetchUserListSuccess,
  updateEmployee,
  updateEmployeeFailure,
  updateEmployeeSuccess,
} from '@/store/slices/usersSlice'
import {
  buildEmployeeConfig,
  findRoleId,
  readConfig,
  readDesignations,
  readEmployeeRecord,
  readFormOptions,
  readRegions,
  readRoles,
  userListParams,
} from '@/utils/employee'
import type {
  Designation,
  DesignationListResponse,
  EmployeeFormValues,
  RegionItem,
  RegionsResponse,
  RolesResponse,
  TerritoryMasterResponse,
  UserByIdResponse,
  UserListItem,
  UserListQuery,
  UserListResponse,
} from '@/utils/types'
import { displayName } from '@/utils/helper'

function toFormValues(
  user: UserListItem,
  designations: Designation[],
): EmployeeFormValues {
  const designationId =
    designations.find((item) => item.designation === user.designation)?.id ?? ''

  return {
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    employeeCode: user.config?.employeeCode ?? '',
    designation: designationId,
    location: user.config?.location ?? '',
    state: user.config?.state ?? '',
    regionName: user.config?.regionName ?? '',
    territories: user.config?.territories ?? '',
    phone: user.contact_no ?? '',
    email: user.email ?? '',
  }
}

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

function reloadUserList(dispatch: AppDispatch) {
  const query = store.getState().users.query
  if (query.role) dispatchUserList(dispatch, query)
}

export default function EmployeeFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const savingRef = useRef(false)
  const {
    designations,
    designationsLoading,
    designationsError,
    formOptions,
    formOptionsLoading,
    formOptionsLoaded,
    editingUser,
    editingLoading,
    editingError,
    saving,
    saveError,
    employeeRoleId,
  } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(clearEmployeeFormState())
    dispatch(fetchEmployeeFormOptions())
    dispatch(fetchDesignations())

    let regions: RegionItem[] | undefined
    let territoryData: unknown
    let failures = 0
    let completed = 0

    const finishOptions = () => {
      completed += 1
      if (completed < 2) return
      if (failures === 2) {
        dispatch(fetchEmployeeFormOptionsFailure())
        return
      }

      dispatch(
        fetchEmployeeFormOptionsSuccess(
          readFormOptions(regions ?? [], territoryData),
        ),
      )
    }

    dispatch({
      type: sagaActions.GET_REGIONS,
      payload: {
        query: '/regions',
        method: 'GET',
        onSuccess: (response: RegionsResponse) => {
          regions = readRegions(response.data)
          finishOptions()
        },
        onFailure: () => {
          failures += 1
          finishOptions()
        },
      },
    })

    dispatch({
      type: sagaActions.GET_TERRITORIES,
      payload: {
        query: '/territorymaster',
        method: 'GET',
        onSuccess: (response: TerritoryMasterResponse) => {
          territoryData = response.data?.territoryMaster?.data
          finishOptions()
        },
        onFailure: () => {
          failures += 1
          finishOptions()
        },
      },
    })

    const currentQuery = store.getState().users.query
    let designationList: ReturnType<typeof readDesignations> | undefined
    let nextRoleId = ''
    let roleLoaded = false
    let settled = false

    const failDesignations = (message: string) => {
      if (settled) return
      settled = true
      dispatch(fetchDesignationsFailure(message))
    }

    const finishDesignations = () => {
      if (settled || designationList === undefined || !roleLoaded) return
      settled = true
      dispatch(
        fetchDesignationsSuccess({
          designations: designationList,
          employeeRoleId: nextRoleId,
        }),
      )

      const role = nextRoleId || currentQuery.role
      if (!role) {
        dispatch(fetchUserListSuccess({ items: [], total: 0 }))
        return
      }

      dispatchUserList(dispatch, {
        ...currentQuery,
        role,
        designation: currentQuery.designation,
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
          finishDesignations()
        },
        onFailure: failDesignations,
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
          finishDesignations()
        },
        onFailure: failDesignations,
      },
    })

    if (id) {
      dispatch(fetchEmployee(id))
      dispatch({
        type: sagaActions.GET_EMPLOYEE,
        payload: {
          query: `/users/${id}`,
          method: 'GET',
          onSuccess: (response: UserByIdResponse) => {
            const employee = readEmployeeRecord(response.data)
            if (!employee) {
              dispatch(fetchEmployeeFailure('Employee could not be found.'))
              return
            }

            dispatch(
              fetchEmployeeSuccess({
                ...employee,
                config: readConfig(employee.config),
              }),
            )
          },
          onFailure: (message: string) => {
            dispatch(fetchEmployeeFailure(message))
          },
        },
      })
    }
  }, [dispatch, id])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) {
      navigate('/home')
    }
    savingRef.current = saving
  }, [navigate, saveError, saving])

  const designationsReady =
    !designationsLoading &&
    (designations.length > 0 || Boolean(designationsError))
  const optionsReady = formOptionsLoaded && !formOptionsLoading
  const employeeReady = !isEdit || (!editingLoading && Boolean(editingUser))
  const canShowForm = optionsReady && designationsReady && employeeReady

  const handleSubmit = (values: EmployeeFormValues) => {
    if (!employeeRoleId) {
      const message = 'Employee role is not available.'
      dispatch(createEmployeeFailure(message))
      toast.error(message)
      return
    }

    if (isEdit && id) {
      dispatch(updateEmployee({ id, values }))
      dispatch({
        type: sagaActions.UPDATE_EMPLOYEE,
        payload: {
          query: `/users/${id}`,
          method: 'PUT',
          showToast: true,
          variables: {
            first_name: values.firstName.trim(),
            last_name: values.lastName.trim(),
            email: values.email.trim(),
            contact_no: values.phone.trim(),
            // role_id: employeeRoleId,
            role: 'employee',
            status: editingUser?.status || 'Active',
            // designation_id: values.designation,
            config: buildEmployeeConfig(
              values,
              formOptions.regions,
              readConfig(editingUser?.config),
            ),
          },
          onSuccess: () => {
            dispatch(updateEmployeeSuccess())
            reloadUserList(dispatch)
          },
          onFailure: (message: string) => {
            dispatch(updateEmployeeFailure(message))
          },
        },
      })
      return
    }

    dispatch(createEmployee(values))
    dispatch({
      type: sagaActions.CREATE_EMPLOYEE,
      payload: {
        query: '/users',
        method: 'POST',
        showToast: true,
        successMessage: 'Employee created',
        variables: {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          email: values.email.trim(),
          contact_no: values.phone.trim(),
          config: buildEmployeeConfig(values, formOptions.regions),
          role_id: employeeRoleId,
          role: 'employee',
          designation_id: values.designation,
        },
        onSuccess: () => {
          dispatch(createEmployeeSuccess())
          reloadUserList(dispatch)
        },
        onFailure: (message: string) => {
          dispatch(createEmployeeFailure(message))
        },
      },
    })
  }

  return (
    <AdminLayout hideHeader={true}>
      <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
        {/* Page Header */}
        <PageHeader
          title={isEdit ? 'Edit employee' : 'Create employee'}
          subtitle={
            isEdit
              ? `Update details and assignments for ${
                  editingUser ? displayName(editingUser) : 'this employee'
                }`
              : 'Add a new employee to the team'
          }
          extraAction={
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/70 px-4 text-xs font-semibold text-[#312E81] hover:bg-white transition"
            >
              <ArrowLeft className="size-4" />
              <span>Back to list</span>
            </button>
          }
        />

        {editingError || designationsError ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50/80 p-3 text-xs text-[#DC2626]">
            {editingError || designationsError}
          </div>
        ) : null}

        {canShowForm ? (
          <EmployeeForm
            key={
              isEdit
                ? `${editingUser?.id}-${editingUser?.designation}`
                : 'create'
            }
            designations={designations}
            locationOptions={formOptions.locationOptions}
            stateOptions={formOptions.stateOptions}
            regionOptions={formOptions.regionOptions}
            territoryOptions={formOptions.territoryOptions}
            saving={saving}
            error={saveError}
            isEdit={isEdit}
            saveText={isEdit ? 'Save Changes' : 'Create Employee'}
            defaultValues={
              isEdit && editingUser
                ? toFormValues(editingUser, designations)
                : undefined
            }
            onCancel={() => navigate('/home')}
            onSubmit={handleSubmit}
          />
        ) : editingError ? null : (
          <div className="glass-card flex-1 p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40 bg-indigo-100/60 rounded" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-[rgba(79,70,229,0.1)]">
              <Skeleton className="h-5 w-40 bg-indigo-100/60 rounded" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
                <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
