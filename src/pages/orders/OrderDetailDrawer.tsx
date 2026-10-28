import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { Drawer } from '@/components/molecules/Drawer'
import { Dialog } from '@/components/molecules/Dialog'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearOrderDetail,
  fetchOrderDetail,
  fetchOrderDetailFailure,
  fetchOrderDetailSuccess,
  setOrderCatalog,
  setOrderSaving,
} from '@/store/slices/ordersSlice'
import type {
  OrderDetailResponse,
  OrderProduct,
  ProductListResponse,
} from '@/utils/types'
import {
  activeCatalog,
  companyName,
  orderConfigPayload,
  orderReason,
  orderText,
  productLineId,
  readOrderDetail,
  statusClass,
  toNumber,
} from './orderModel'

type OrderDetailDrawerProps = {
  orderId: string | null
  refreshToken: number
  onClose: () => void
  onUpdated: () => void
}

type ProductDraft = {
  editing: OrderProduct | null
  productId: string
  quantity: string
  price: string
}

const emptyDraft: ProductDraft = {
  editing: null,
  productId: '',
  quantity: '1',
  price: '',
}

function fieldClassName() {
  return 'mt-2 h-11 w-full rounded-[14px] border border-white/85 bg-white/70 px-4 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]'
}

export function OrderDetailDrawer({
  orderId,
  refreshToken,
  onClose,
  onUpdated,
}: OrderDetailDrawerProps) {
  const dispatch = useAppDispatch()
  const { detail, detailLoading, detailError, saving, catalog } =
    useAppSelector((state) => state.orders)
  const [tab, setTab] = useState<'details' | 'products'>('details')
  const [draft, setDraft] = useState<ProductDraft | null>(null)
  const [draftError, setDraftError] = useState('')
  const [deleteProduct, setDeleteProduct] = useState<OrderProduct | null>(null)
  const [trackedOrderId, setTrackedOrderId] = useState(orderId)

  if (orderId !== trackedOrderId) {
    setTrackedOrderId(orderId)
    setTab('details')
    setDraft(null)
    setDraftError('')
    setDeleteProduct(null)
  }

  useEffect(() => {
    if (!orderId) {
      dispatch(clearOrderDetail())
      return
    }

    dispatch(fetchOrderDetail())
    dispatch({
      type: sagaActions.GET_ORDER,
      payload: {
        query: `/userActivities/${orderId}`,
        method: 'GET',
        onSuccess: (response: OrderDetailResponse) => {
          dispatch(
            fetchOrderDetailSuccess(
              readOrderDetail(response.data?.UserActivities),
            ),
          )
        },
        onFailure: (message: string) => {
          dispatch(fetchOrderDetailFailure(message))
        },
      },
    })
  }, [dispatch, orderId, refreshToken])

  useEffect(() => {
    if (!orderId) return
    dispatch({
      type: sagaActions.GET_PRODUCTS,
      payload: {
        query: '/products',
        method: 'GET',
        onSuccess: (response: ProductListResponse) => {
          dispatch(
            setOrderCatalog(
              activeCatalog(response.data?.productList?.products ?? []),
            ),
          )
        },
      },
    })
  }, [dispatch, orderId])

  const products = detail?.config?.products ?? []
  const catalogName = useMemo(() => {
    const names = new Map<string, string>()
    catalog.forEach((item) => {
      if (item.id) names.set(item.id, item.product_name || 'Product')
    })
    return names
  }, [catalog])

  const reloadDetail = () => {
    if (!orderId) return
    dispatch(fetchOrderDetail())
    dispatch({
      type: sagaActions.GET_ORDER,
      payload: {
        query: `/userActivities/${orderId}`,
        method: 'GET',
        onSuccess: (response: OrderDetailResponse) => {
          dispatch(
            fetchOrderDetailSuccess(
              readOrderDetail(response.data?.UserActivities),
            ),
          )
          dispatch(setOrderSaving(false))
          onUpdated()
        },
        onFailure: (message: string) => {
          dispatch(fetchOrderDetailFailure(message))
          dispatch(setOrderSaving(false))
        },
      },
    })
  }

  const saveProducts = (nextProducts: OrderProduct[]) => {
    if (!detail?.id || saving) return
    dispatch(setOrderSaving(true))
    dispatch({
      type: sagaActions.UPDATE_ORDER,
      payload: {
        query: `/userActivities/status/${detail.id}`,
        method: 'PUT',
        variables: orderConfigPayload(detail, nextProducts),
        showToast: true,
        successMessage: 'Order updated',
        onSuccess: () => reloadDetail(),
        onFailure: () => dispatch(setOrderSaving(false)),
      },
    })
  }

  const submitDraft = () => {
    if (!draft || !detail) return
    const selected = catalog.find((item) => item.id === draft.productId)
    const lineId = draft.productId || productLineId(draft.editing ?? {})
    if (!lineId) {
      setDraftError('Select a product')
      return
    }

    const quantity = toNumber(draft.quantity, 0)
    if (quantity < 1) {
      setDraftError('Quantity must be at least 1')
      return
    }

    const price = toNumber(
      draft.price,
      toNumber(selected?.price ?? draft.editing?.price, 0),
    )
    const nextRow: OrderProduct = {
      ...(draft.editing ?? {}),
      product_id: lineId,
      product_name:
        selected?.product_name ?? draft.editing?.product_name ?? 'Product',
      quantity,
      price,
      total_price: price * quantity,
    }
    const nextProducts = [...products]

    if (draft.editing) {
      const currentId = productLineId(draft.editing)
      const index = nextProducts.findIndex(
        (item) => productLineId(item) === currentId,
      )
      if (index >= 0)
        nextProducts[index] = { ...nextProducts[index], ...nextRow }
      else nextProducts.push(nextRow)
    } else if (nextProducts.some((item) => productLineId(item) === lineId)) {
      setDraftError('This product is already on the order')
      return
    } else {
      nextProducts.push(nextRow)
    }

    setDraft(null)
    saveProducts(nextProducts)
  }

  const reason = detail ? orderReason(detail) : ''
  const detailFields = detail
    ? [
        ['Order id', orderText(detail.config?.order_id)],
        ['Date', orderText(detail.date)],
        ['Employee', orderText(detail.employee)],
        ['Order value', orderText(detail.config?.gross_total)],
        ['Company', companyName(detail)],
        ['Region', orderText(detail.config?.locality)],
      ]
    : []

  return (
    <>
      <Drawer
        open={Boolean(orderId)}
        title={detail ? companyName(detail) : 'Order'}
        subtitle={detail?.config?.order_id || 'Order details'}
        onClose={onClose}
        panelClassName="max-w-3xl"
      >
        <div
          role="tablist"
          aria-label="Order sections"
          className="mb-5 inline-flex h-[40px] items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1"
        >
          {(
            [
              ['details', 'Details'],
              ['products', 'Products'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`h-[32px] cursor-pointer rounded-[11px] px-4 text-[13px] ${
                tab === id
                  ? 'bg-[#4F46E5] font-semibold text-white'
                  : 'font-medium text-[#312E81] hover:bg-white/45'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {detailLoading ? (
          <p className="text-sm text-[#4C4A7A]">Loading order...</p>
        ) : detailError ? (
          <p className="text-sm text-error">{detailError}</p>
        ) : !detail ? (
          <p className="text-sm text-[#4C4A7A]">
            Order details are unavailable.
          </p>
        ) : tab === 'details' ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {detailFields.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[12px] font-semibold text-[#4C4A7A]">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-[#1E1B4B]">{value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[12px] font-semibold text-[#4C4A7A]">
                Status
              </dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${statusClass(detail.config?.order_status)}`}
                >
                  {detail.config?.order_status || 'Pending'}
                </span>
              </dd>
            </div>
            {reason ? (
              <div className="sm:col-span-2">
                <dt className="text-[12px] font-semibold text-[#4C4A7A]">
                  Reason
                </dt>
                <dd className="mt-1 text-sm text-[#1E1B4B]">{reason}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setDraftError('')
                  setDraft(emptyDraft)
                }}
                className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[14px] bg-[#4F46E5] px-4 text-[12px] font-semibold text-white hover:bg-[#4338CA]"
              >
                <Plus className="size-3.5" />
                Add product
              </button>
            </div>
            <div className="overflow-x-auto rounded-[16px] border border-white/85 bg-white/50">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="text-[#4338CA]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">Quantity</th>
                    <th className="px-3 py-3 font-semibold">Package</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Total</th>
                    <th className="px-3 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length ? (
                    products.map((product, index) => {
                      const lineId = productLineId(product)
                      const name =
                        product.product_name || catalogName.get(lineId) || '—'
                      return (
                        <tr
                          key={`${lineId}-${index}`}
                          className="border-t border-[rgba(79,70,229,0.12)]"
                        >
                          <td className="px-3 py-3 font-medium text-[#1E1B4B]">
                            {name}
                          </td>
                          <td className="px-3 py-3 text-[#4C4A7A]">
                            {orderText(product.quantity)}
                          </td>
                          <td className="px-3 py-3 text-[#4C4A7A]">
                            {orderText(product.config?.selected_package)}
                          </td>
                          <td className="px-3 py-3 text-[#4C4A7A]">
                            {orderText(product.price)}
                          </td>
                          <td className="px-3 py-3 text-[#4C4A7A]">
                            {orderText(product.total_price)}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Edit product"
                                onClick={() => {
                                  setDraftError('')
                                  setDraft({
                                    editing: product,
                                    productId: lineId,
                                    quantity: String(product.quantity ?? 1),
                                    price: String(product.price ?? ''),
                                  })
                                }}
                                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-[#312E81] hover:bg-white"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete product"
                                onClick={() => setDeleteProduct(product)}
                                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-error hover:bg-white"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-[#4C4A7A]"
                      >
                        No products on this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Drawer>

      {draft
        ? createPortal(
            <Dialog
              open
              title={draft.editing ? 'Edit product' : 'Add product'}
              onClose={() => {
                if (!saving) setDraft(null)
              }}
            >
              <label className="block text-[13px] font-semibold text-[#1E1B4B]">
                Product
                <select
                  value={draft.productId}
                  disabled={Boolean(draft.editing)}
                  onChange={(event) => {
                    const productId = event.target.value
                    const selected = catalog.find(
                      (item) => item.id === productId,
                    )
                    setDraftError('')
                    setDraft({
                      ...draft,
                      productId,
                      price:
                        draft.editing || !selected
                          ? draft.price
                          : String(selected.price ?? ''),
                    })
                  }}
                  className={fieldClassName()}
                >
                  <option value="">Select product</option>
                  {catalog.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.product_name || 'Product'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block text-[13px] font-semibold text-[#1E1B4B]">
                Quantity
                <input
                  type="number"
                  min={1}
                  value={draft.quantity}
                  onChange={(event) => {
                    setDraftError('')
                    setDraft({ ...draft, quantity: event.target.value })
                  }}
                  className={fieldClassName()}
                />
              </label>
              <label className="mt-3 block text-[13px] font-semibold text-[#1E1B4B]">
                Price
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(event) => {
                    setDraftError('')
                    setDraft({ ...draft, price: event.target.value })
                  }}
                  className={fieldClassName()}
                />
              </label>
              <label className="mt-3 block text-[13px] font-semibold text-[#1E1B4B]">
                Total price
                <input
                  readOnly
                  value={toNumber(draft.price, 0) * toNumber(draft.quantity, 0)}
                  className={fieldClassName()}
                />
              </label>
              {draftError ? (
                <p className="mt-2 text-xs text-error">{draftError}</p>
              ) : null}
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDraft(null)}
                  className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={submitDraft}
                  className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Dialog>,
            document.body,
          )
        : null}

      {deleteProduct
        ? createPortal(
            <Dialog
              open
              title="Delete product"
              label="Delete"
              loading={saving}
              onClose={() => setDeleteProduct(null)}
              handleSubmit={() => {
                const productId = deleteProduct.id ?? deleteProduct.product_id
                if (!detail?.id || !productId) {
                  toast.error('This product cannot be deleted.')
                  return
                }
                dispatch(setOrderSaving(true))
                dispatch({
                  type: sagaActions.DELETE_ORDER_PRODUCT,
                  payload: {
                    query: `/userActivities/product/${detail.id}/${productId}`,
                    method: 'DELETE',
                    showToast: true,
                    successMessage: 'Product deleted',
                    onSuccess: () => {
                      setDeleteProduct(null)
                      reloadDetail()
                    },
                    onFailure: () => dispatch(setOrderSaving(false)),
                  },
                })
              }}
            >
              <p>
                Remove{' '}
                {deleteProduct.product_name ||
                  catalogName.get(productLineId(deleteProduct)) ||
                  'this product'}{' '}
                from the order?
              </p>
            </Dialog>,
            document.body,
          )
        : null}
    </>
  )
}
