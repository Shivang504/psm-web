import { Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import useFormHandler from '@/hooks/useFormHandler'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearInventorySave,
  fetchLookups,
  fetchLookupsFailure,
  fetchLookupsSuccess,
  fetchPrices,
  fetchPricesFailure,
  fetchPricesSuccess,
  fetchProducts,
  fetchProductsSuccess,
  finishInventoryAction,
  saveInventory,
  saveInventoryFailure,
  saveInventorySuccess,
  startInventoryAction,
} from '@/store/slices/inventorySlice'
import {
  findRoleId,
  readDesignations,
  readRegions,
  readRoles,
} from '@/utils/employee'
import { displayValue } from '@/utils/helper'
import type {
  Designation,
  DesignationListResponse,
  InventoryProduct,
  InventoryProductListResponse,
  PriceFormValues,
  PriceListResponse,
  PriceRecord,
  RegionItem,
  RegionsResponse,
  RolesResponse,
  VendorListResponse,
  VendorRecord,
} from '@/utils/types'
import { InventoryFrame } from './InventoryTabs'
import {
  activeProducts,
  companyOptionValue,
  isActiveStatus,
  priceBody,
  readPrices,
  readProducts,
  toPriceForm,
} from './inventoryModel'
import { priceSchema } from './priceSchema'
import { usePagedItems } from './usePagedItems'

function PriceFormDialog({
  price,
  products,
  regions,
  designations,
  vendors,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  price: PriceRecord | null
  products: InventoryProduct[]
  regions: RegionItem[]
  designations: Designation[]
  vendors: VendorRecord[]
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: PriceFormValues) => void
}) {
  const methods = useFormHandler<PriceFormValues>({
    schema: priceSchema,
    defaultValues: toPriceForm(price, vendors),
  })
  const basedOn = methods.watch('basedOn')
  const catalog = activeProducts(products, {
    name: price?.config?.product_name,
    hsn: price?.config?.HSN_CODE,
  })
  const companies = vendors.filter(
    (item) =>
      isActiveStatus(item.status) || item.id === price?.config?.vendor_id,
  )

  return (
    <Dialog
      open
      title={price ? 'Edit price' : 'Add price'}
      onClose={onClose}
      closeOnOutsideClick={!saving}
      panelClassName="max-h-[85vh] max-w-2xl overflow-y-auto"
    >
      <FormProvider {...methods}>
        <form
          className="mt-4 space-y-4"
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
        >
          {error ? (
            <p className="rounded-[12px] bg-red-50 px-3 py-2 text-xs text-[#DC2626]">
              {error}
            </p>
          ) : null}
          <div className="flex gap-4">
            {(['SKN/HSN Code', 'Product'] as const).map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 text-[13px] font-medium text-[#312E81]"
              >
                <input
                  type="radio"
                  className="accent-[#4F46E5]"
                  checked={basedOn === option}
                  onChange={() =>
                    methods.setValue('basedOn', option, {
                      shouldValidate: true,
                    })
                  }
                />
                {option}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField<PriceFormValues>
              name="regionName"
              label="Region name"
              placeholder="Select region"
              isRequired
              isSearch
              options={regions.map((item) => ({
                label: item.region,
                value: item.region,
              }))}
            />
            <SelectField<PriceFormValues>
              name="vendorType"
              label="Vendor type"
              placeholder="Select vendor type"
              isRequired
              isSearch
              options={designations.map((item) => ({
                label: item.designation,
                value: item.designation,
              }))}
            />
            <SelectField<PriceFormValues>
              name="company"
              label="Company name"
              placeholder="Select company"
              isRequired
              isSearch
              options={companies.map((item) => ({
                label: companyOptionValue(item).split('|')[0] || '—',
                value: companyOptionValue(item),
              }))}
            />
            {basedOn === 'Product' ? (
              <SelectField<PriceFormValues>
                name="productName"
                label="Product name"
                placeholder="Select product"
                isRequired
                isSearch
                options={catalog.map((item) => ({
                  label: item.product_name,
                  value: item.product_name,
                }))}
              />
            ) : (
              <SelectField<PriceFormValues>
                name="hsnCode"
                label="SKN/HSN code"
                placeholder="Select HSN code"
                isRequired
                isSearch
                options={catalog
                  .filter((item) => item.product_hsncode)
                  .map((item) => ({
                    label: item.product_hsncode ?? '',
                    value: item.product_hsncode ?? '',
                  }))}
              />
            )}
            <InputField<PriceFormValues>
              name="price"
              label="Product price"
              placeholder="Enter price"
              isRequired
            />
          </div>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : price ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default function PriceListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(
    (state) => state.inventory.prices,
  )
  const {
    products,
    regions,
    designations,
    vendors,
    saving,
    saveError,
    actionLoading,
  } = useAppSelector((state) => state.inventory)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<PriceRecord | null | undefined>(
    undefined,
  )
  const [deleteTarget, setDeleteTarget] = useState<PriceRecord | null>(null)
  const savingRef = useRef(false)
  const match = useCallback((item: PriceRecord, query: string) => {
    return [
      item.config?.priceList_basedOn,
      item.region,
      item.config?.vendor_type,
      item.config?.company_name,
      item.config?.HSN_CODE,
      item.config?.product_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
  }, [])
  const pageState = usePagedItems(items, search, match)

  const loadPrices = useCallback(() => {
    dispatch(fetchPrices())
    dispatch({
      type: sagaActions.GET_PRICE_LIST,
      payload: {
        query: '/price-list',
        method: 'GET',
        onSuccess: (response: PriceListResponse) => {
          dispatch(fetchPricesSuccess(readPrices(response.data)))
        },
        onFailure: (message: string) => dispatch(fetchPricesFailure(message)),
      },
    })
  }, [dispatch])

  useEffect(() => {
    dispatch(clearInventorySave())
    loadPrices()
    dispatch(fetchProducts())
    dispatch({
      type: sagaActions.GET_INVENTORY_PRODUCTS,
      payload: {
        query: '/products',
        method: 'GET',
        onSuccess: (response: InventoryProductListResponse) => {
          dispatch(fetchProductsSuccess(readProducts(response.data)))
        },
        onFailure: () => dispatch(fetchProductsSuccess([])),
      },
    })
    dispatch(fetchLookups())
    let designations: Designation[] | undefined
    let regions: RegionItem[] | undefined
    let roleId = ''
    let pending = 3
    let failed = false

    const finish = () => {
      pending -= 1
      if (failed || pending > 0) return
      dispatch(
        fetchLookupsSuccess({
          designations: designations ?? [],
          regions: regions ?? [],
          vendorRoleId: roleId,
        }),
      )
      if (!roleId) return
      dispatch({
        type: sagaActions.GET_VENDORS,
        payload: {
          query: '/users/',
          method: 'GET',
          variables: { role: roleId, page: 1, limit: 200 },
          onSuccess: (response: VendorListResponse) => {
            dispatch(
              fetchLookupsSuccess({
                vendors: response.data?.users?.user ?? [],
              }),
            )
          },
          onFailure: () => dispatch(fetchLookupsSuccess({ vendors: [] })),
        },
      })
    }

    const fail = (message: string) => {
      if (failed) return
      failed = true
      dispatch(fetchLookupsFailure(message))
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
  }, [dispatch, loadPrices])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) {
      setEditor(undefined)
      loadPrices()
    }
    savingRef.current = saving
  }, [loadPrices, saveError, saving])

  const columns: ColumnType<PriceRecord>[] = useMemo(
    () => [
      {
        key: 'basedOn',
        label: 'Price list based on',
        width: '1.2fr',
        render: (row) => displayValue(row.config?.priceList_basedOn),
      },
      {
        key: 'region',
        label: 'Region',
        width: '1fr',
        render: (row) => displayValue(row.region),
      },
      {
        key: 'vendor_type',
        label: 'Vendor type',
        width: '1fr',
        render: (row) => displayValue(row.config?.vendor_type),
      },
      {
        key: 'company_name',
        label: 'Company name',
        width: '1.3fr',
        render: (row) => displayValue(row.config?.company_name),
      },
      {
        key: 'hsn',
        label: 'SKN/HSN code',
        width: '1fr',
        render: (row) => displayValue(row.config?.HSN_CODE),
      },
      {
        key: 'product_name',
        label: 'Product name',
        width: '1.2fr',
        render: (row) => displayValue(row.config?.product_name),
      },
      {
        key: 'price',
        label: 'Product price',
        width: '0.8fr',
        render: (row) =>
          displayValue(row.price == null ? '' : String(row.price)),
      },
    ],
    [],
  )

  const actions: ActionType<PriceRecord>[] = useMemo(
    () => [
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (row) => {
          dispatch(clearInventorySave())
          setEditor(row)
        },
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: setDeleteTarget,
      },
    ],
    [dispatch],
  )

  return (
    <InventoryFrame
      title="Price list"
      subtitle={`${pageState.total} prices`}
      actionLabel="Create price"
      onAction={() => {
        dispatch(clearInventorySave())
        setEditor(null)
      }}
    >
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search region, company, or product"
      />
      <DataTable
        columns={columns}
        data={pageState.pageItems}
        actions={actions}
        loading={loading}
        error={error ? 'The price list could not be loaded.' : null}
        onRetry={loadPrices}
        page={pageState.page}
        pageSize={pageState.limit}
        totalItems={pageState.total}
        totalPages={pageState.totalPages}
        onPageChange={pageState.setPage}
        onPageSizeChange={pageState.setLimit}
        emptyMessage="No prices found."
        minWidth="1100px"
      />

      {editor !== undefined ? (
        <PriceFormDialog
          key={editor?.id ?? 'new'}
          price={editor}
          products={products.items}
          regions={regions}
          designations={designations}
          vendors={vendors}
          saving={saving}
          error={saveError}
          onClose={() => setEditor(undefined)}
          onSubmit={(values) => {
            dispatch(saveInventory())
            dispatch({
              type: editor ? sagaActions.UPDATE_PRICE : sagaActions.ADD_PRICE,
              payload: {
                query: editor ? `/price-list/${editor.id}` : '/price-list',
                method: editor ? 'PUT' : 'POST',
                showToast: true,
                successMessage: editor ? 'Price updated' : 'Price added',
                variables: priceBody(values, regions),
                onSuccess: () => dispatch(saveInventorySuccess()),
                onFailure: (message: string) =>
                  dispatch(saveInventoryFailure(message)),
              },
            })
          }}
        />
      ) : null}

      <Dialog
        title="Delete price"
        label="Delete"
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        handleSubmit={() => {
          if (!deleteTarget) return
          dispatch(startInventoryAction())
          dispatch({
            type: sagaActions.DELETE_PRICE,
            payload: {
              query: `/price-list/${deleteTarget.id}`,
              method: 'DELETE',
              showToast: true,
              successMessage: 'Price deleted',
              onSuccess: () => {
                dispatch(finishInventoryAction())
                setDeleteTarget(null)
                loadPrices()
              },
              onFailure: () => dispatch(finishInventoryAction()),
            },
          })
        }}
      >
        <p>Delete this price? This cannot be undone.</p>
      </Dialog>
    </InventoryFrame>
  )
}
