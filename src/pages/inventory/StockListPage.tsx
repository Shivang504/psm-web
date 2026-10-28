import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useFieldArray } from 'react-hook-form'
import { useParams } from 'react-router-dom'
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
  fetchProducts,
  fetchProductsFailure,
  fetchProductsSuccess,
  fetchStocks,
  fetchStocksFailure,
  fetchStocksSuccess,
  finishInventoryAction,
  saveInventory,
  saveInventoryFailure,
  saveInventorySuccess,
  startInventoryAction,
} from '@/store/slices/inventorySlice'
import { displayValue } from '@/utils/helper'
import type {
  InventoryProduct,
  InventoryProductListResponse,
  StockFormValues,
  StockListResponse,
  StockRecord,
} from '@/utils/types'
import { InventoryFrame } from './InventoryTabs'
import {
  activeProducts,
  displayDate,
  readProducts,
  readStocks,
  stockCreateBody,
} from './inventoryModel'
import { stockSchema } from './stockSchema'
import { usePagedItems } from './usePagedItems'

const emptyLine = { productName: '', quantity: '', batchCode: '' }

function StockFormDialog({
  stock,
  products,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  stock: StockRecord | null
  products: InventoryProduct[]
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (values: StockFormValues) => void
}) {
  const methods = useFormHandler<StockFormValues>({
    schema: stockSchema,
    defaultValues: {
      lines: [
        stock
          ? {
              productName: stock.product_name ?? '',
              quantity: stock.quantity == null ? '' : String(stock.quantity),
              batchCode: stock.batch_code ?? '',
            }
          : emptyLine,
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'lines',
  })
  const options = activeProducts(products, { name: stock?.product_name }).map(
    (item) => ({ label: item.product_name, value: item.product_name }),
  )

  return (
    <Dialog
      open
      title={stock ? 'Edit stock' : 'Add stock'}
      onClose={onClose}
      closeOnOutsideClick={!saving}
      panelClassName="max-h-[85vh] max-w-3xl overflow-y-auto"
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
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_1fr_auto]"
            >
              <SelectField<StockFormValues>
                name={`lines.${index}.productName`}
                label="Product name"
                placeholder="Select product"
                isRequired
                isSearch
                disabled={Boolean(stock)}
                options={options}
              />
              <InputField<StockFormValues>
                name={`lines.${index}.quantity`}
                label="Stock"
                placeholder="Quantity"
                isRequired
              />
              <InputField<StockFormValues>
                name={`lines.${index}.batchCode`}
                label="Batch number"
                placeholder="Batch number"
                disabled={Boolean(stock)}
              />
              {!stock && fields.length > 1 ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-6 h-[44px] cursor-pointer text-xs font-semibold text-[#DC2626]"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          {!stock ? (
            <button
              type="button"
              onClick={() => append(emptyLine)}
              className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-semibold text-[#4F46E5]"
            >
              <Plus className="size-4" />
              Add another product
            </button>
          ) : null}
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
              {saving ? 'Saving...' : stock ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default function StockListPage() {
  const { productId } = useParams()
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(
    (state) => state.inventory.stocks,
  )
  const products = useAppSelector((state) => state.inventory.products.items)
  const { saving, saveError, actionLoading } = useAppSelector(
    (state) => state.inventory,
  )
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<StockRecord | null | undefined>(
    undefined,
  )
  const [deleteTarget, setDeleteTarget] = useState<StockRecord | null>(null)
  const savingRef = useRef(false)
  const scoped = useMemo(
    () =>
      productId ? items.filter((item) => item.product_id === productId) : items,
    [items, productId],
  )
  const match = useCallback((item: StockRecord, query: string) => {
    return [
      item.product_name,
      item.product_hsncode,
      item.category_name,
      item.batch_code,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
  }, [])
  const pageState = usePagedItems(scoped, search, match)
  const currentProduct = products.find((item) => item.id === productId)

  const load = useCallback(() => {
    dispatch(fetchStocks())
    dispatch({
      type: sagaActions.GET_STOCKS,
      payload: {
        query: '/stocks',
        method: 'GET',
        onSuccess: (response: StockListResponse) => {
          dispatch(fetchStocksSuccess(readStocks(response.data)))
        },
        onFailure: (message: string) => dispatch(fetchStocksFailure(message)),
      },
    })
    dispatch(fetchProducts())
    dispatch({
      type: sagaActions.GET_INVENTORY_PRODUCTS,
      payload: {
        query: '/products',
        method: 'GET',
        onSuccess: (response: InventoryProductListResponse) => {
          dispatch(fetchProductsSuccess(readProducts(response.data)))
        },
        onFailure: (message: string) => dispatch(fetchProductsFailure(message)),
      },
    })
  }, [dispatch])

  useEffect(() => {
    dispatch(clearInventorySave())
    load()
  }, [dispatch, load])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) {
      setEditor(undefined)
      load()
    }
    savingRef.current = saving
  }, [load, saveError, saving])

  const columns: ColumnType<StockRecord>[] = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date',
        width: '1fr',
        render: (row) => displayDate(row.date),
      },
      {
        key: 'product_hsncode',
        label: 'Product HSN code',
        width: '1fr',
        render: (row) => displayValue(row.product_hsncode),
      },
      {
        key: 'batch_code',
        label: 'Batch number',
        width: '1fr',
        render: (row) => displayValue(row.batch_code),
      },
      {
        key: 'product_name',
        label: 'Product name',
        width: '1.4fr',
        render: (row) => (
          <span className="block truncate font-semibold text-[#1E1B4B]">
            {displayValue(row.product_name)}
          </span>
        ),
      },
      {
        key: 'category_name',
        label: 'Product category',
        width: '1.2fr',
        render: (row) => displayValue(row.category_name),
      },
      {
        key: 'quantity',
        label: 'Stock',
        width: '0.7fr',
        render: (row) =>
          displayValue(row.quantity == null ? '' : String(row.quantity)),
      },
    ],
    [],
  )

  const actions: ActionType<StockRecord>[] = useMemo(
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
      title="Stock"
      subtitle={
        currentProduct
          ? `${pageState.total} stock rows for ${currentProduct.product_name}`
          : `${pageState.total} stock rows`
      }
      actionLabel="Add stock"
      onAction={() => {
        dispatch(clearInventorySave())
        setEditor(null)
      }}
    >
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product, HSN, or batch"
      />
      <DataTable
        columns={columns}
        data={pageState.pageItems}
        actions={actions}
        loading={loading}
        error={error ? 'The stock list could not be loaded.' : null}
        onRetry={load}
        page={pageState.page}
        pageSize={pageState.limit}
        totalItems={pageState.total}
        totalPages={pageState.totalPages}
        onPageChange={pageState.setPage}
        onPageSizeChange={pageState.setLimit}
        emptyMessage="No stock found."
        minWidth="980px"
      />

      {editor !== undefined ? (
        <StockFormDialog
          key={editor?.id ?? 'new'}
          stock={editor}
          products={products}
          saving={saving}
          error={saveError}
          onClose={() => setEditor(undefined)}
          onSubmit={(values) => {
            const rows = stockCreateBody(values, products)
            if (rows.some((row) => !row.productId)) {
              dispatch(saveInventoryFailure('Select a valid product.'))
              return
            }
            dispatch(saveInventory())
            if (editor) {
              dispatch({
                type: sagaActions.UPDATE_STOCK,
                payload: {
                  query: `/stocks/${editor.id}`,
                  method: 'PUT',
                  showToast: true,
                  successMessage: 'Stock updated',
                  variables: {
                    productId: rows[0].productId,
                    quantity: rows[0].quantity,
                  },
                  onSuccess: () => dispatch(saveInventorySuccess()),
                  onFailure: (message: string) =>
                    dispatch(saveInventoryFailure(message)),
                },
              })
              return
            }
            dispatch({
              type: sagaActions.ADD_STOCKS,
              payload: {
                query: '/stocks',
                method: 'POST',
                showToast: true,
                successMessage: 'Stock added',
                variables: rows,
                onSuccess: () => dispatch(saveInventorySuccess()),
                onFailure: (message: string) =>
                  dispatch(saveInventoryFailure(message)),
              },
            })
          }}
        />
      ) : null}

      <Dialog
        title="Delete stock"
        label="Delete"
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        handleSubmit={() => {
          if (!deleteTarget) return
          dispatch(startInventoryAction())
          dispatch({
            type: sagaActions.DELETE_STOCK,
            payload: {
              query: `/stocks/${deleteTarget.id}`,
              method: 'DELETE',
              showToast: true,
              successMessage: 'Stock deleted',
              onSuccess: () => {
                dispatch(finishInventoryAction())
                setDeleteTarget(null)
                load()
              },
              onFailure: () => dispatch(finishInventoryAction()),
            },
          })
        }}
      >
        <p>
          Delete stock for {deleteTarget?.product_name ?? 'this product'}? This
          cannot be undone.
        </p>
      </Dialog>
    </InventoryFrame>
  )
}
