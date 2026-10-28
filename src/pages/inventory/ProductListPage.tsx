import { Eye, Pencil, Power, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusPill } from '@/components/atoms/StatusPill'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProducts,
  fetchProductsFailure,
  fetchProductsSuccess,
  finishInventoryAction,
  startInventoryAction,
} from '@/store/slices/inventorySlice'
import { displayValue } from '@/utils/helper'
import type {
  InventoryProduct,
  InventoryProductListResponse,
} from '@/utils/types'
import { InventoryFrame } from './InventoryTabs'
import { isActiveStatus, nextStatus, readProducts } from './inventoryModel'
import { usePagedItems } from './usePagedItems'

export default function ProductListPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(
    (state) => state.inventory.products,
  )
  const actionLoading = useAppSelector((state) => state.inventory.actionLoading)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<InventoryProduct | null>(
    null,
  )
  const blocked = Number(deleteTarget?.quantity ?? 0) > 0
  const match = useCallback((item: InventoryProduct, query: string) => {
    return [item.product_name, item.category_name, item.product_hsncode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query)
  }, [])
  const pageState = usePagedItems(items, search, match)

  const load = useCallback(() => {
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
    load()
  }, [load])

  const columns: ColumnType<InventoryProduct>[] = useMemo(
    () => [
      {
        key: 'product_name',
        label: 'Product name',
        width: '1.6fr',
        render: (row) => (
          <span className="block truncate font-semibold text-[#1E1B4B]">
            {displayValue(row.product_name)}
          </span>
        ),
      },
      {
        key: 'mrp',
        label: 'Product price',
        width: '0.9fr',
        render: (row) => displayValue(row.mrp == null ? '' : String(row.mrp)),
      },
      {
        key: 'package',
        label: 'Unit',
        width: '1fr',
        render: (row) => displayValue(row.config?.package),
      },
      {
        key: 'category_name',
        label: 'Product category',
        width: '1.2fr',
        render: (row) => displayValue(row.category_name),
      },
      {
        key: 'product_hsncode',
        label: 'HSN code',
        width: '0.9fr',
        render: (row) => displayValue(row.product_hsncode),
      },
      {
        key: 'quantity',
        label: 'Available stock',
        width: '0.9fr',
        render: (row) =>
          displayValue(row.quantity == null ? '' : String(row.quantity)),
      },
      {
        key: 'status',
        label: 'Status',
        width: '0.8fr',
        render: (row) => <StatusPill status={row.status} />,
      },
    ],
    [],
  )

  const actions: ActionType<InventoryProduct>[] = useMemo(
    () => [
      {
        label: 'View stock',
        icon: Eye,
        onClick: (row) => navigate(`/inventory/stock/${row.id}`),
      },
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (row) => navigate(`/inventory/products/${row.id}/edit`),
      },
      {
        label: 'Status',
        icon: Power,
        title: (row) =>
          isActiveStatus(row.status) ? 'Deactivate' : 'Activate',
        onClick: (row) => {
          dispatch(startInventoryAction())
          dispatch({
            type: sagaActions.UPDATE_INVENTORY_PRODUCT_STATUS,
            payload: {
              query: `/products/status/${row.id}`,
              method: 'PUT',
              showToast: true,
              successMessage: 'Product status updated',
              variables: { status: nextStatus(row.status) },
              onSuccess: () => {
                dispatch(finishInventoryAction())
                load()
              },
              onFailure: () => dispatch(finishInventoryAction()),
            },
          })
        },
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: setDeleteTarget,
      },
    ],
    [dispatch, load, navigate],
  )

  return (
    <InventoryFrame
      title="Product"
      subtitle={`${pageState.total} products`}
      actionLabel="Create product"
      onAction={() => navigate('/inventory/products/new')}
    >
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product, category, or HSN"
      />
      <DataTable
        columns={columns}
        data={pageState.pageItems}
        actions={actions}
        loading={loading}
        error={error ? 'The product list could not be loaded.' : null}
        onRetry={load}
        page={pageState.page}
        pageSize={pageState.limit}
        totalItems={pageState.total}
        totalPages={pageState.totalPages}
        onPageChange={pageState.setPage}
        onPageSizeChange={pageState.setLimit}
        emptyMessage="No products found."
        minWidth="1100px"
      />

      <Dialog
        title={blocked ? 'Stock exists' : 'Delete product'}
        label="Delete"
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        handleSubmit={
          blocked
            ? undefined
            : () => {
                if (!deleteTarget) return
                dispatch(startInventoryAction())
                dispatch({
                  type: sagaActions.DELETE_INVENTORY_PRODUCT,
                  payload: {
                    query: `/products/${deleteTarget.id}`,
                    method: 'DELETE',
                    showToast: true,
                    successMessage: 'Product deleted',
                    onSuccess: () => {
                      dispatch(finishInventoryAction())
                      setDeleteTarget(null)
                      load()
                    },
                    onFailure: () => dispatch(finishInventoryAction()),
                  },
                })
              }
        }
      >
        <p>
          {blocked
            ? `${deleteTarget?.product_name ?? 'This product'} still has stock, so it cannot be deleted.`
            : `Delete ${deleteTarget?.product_name ?? 'this product'}? This cannot be undone.`}
        </p>
      </Dialog>
    </InventoryFrame>
  )
}
