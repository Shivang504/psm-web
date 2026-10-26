import { X } from 'lucide-react'
import type { ActivityProduct } from '@/utils/employeeDetail'

type ProductListProps = {
  products: ActivityProduct[]
  onClose: () => void
}

export function ProductList({ products, onClose }: ProductListProps) {
  return (
    <div className="glass-panel mb-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-main">Products</h4>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close products"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-text-muted hover:bg-background-surface"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-xs">
          <thead className="text-primary-hover">
            <tr>
              <th className="px-2 py-2 font-semibold">Product</th>
              <th className="px-2 py-2 font-semibold">Quantity</th>
              <th className="px-2 py-2 font-semibold">Price</th>
              <th className="px-2 py-2 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={`${product.product_name}-${index}`}
                className="border-t border-border"
              >
                <td className="px-2 py-2 text-text-main">
                  {product.product_name || '—'}
                </td>
                <td className="px-2 py-2 text-text-muted">
                  {product.quantity ?? '—'}
                </td>
                <td className="px-2 py-2 text-text-muted">
                  {product.price ?? '—'}
                </td>
                <td className="px-2 py-2 text-text-muted">
                  {product.total_price ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
