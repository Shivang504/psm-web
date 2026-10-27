import { createPortal } from 'react-dom'
import { Dialog } from '@/components/molecules/Dialog'
import type { ActivityProduct } from '@/utils/employeeDetail'

type ProductListProps = {
  products: ActivityProduct[]
  onClose: () => void
}

export function ProductList({ products, onClose }: ProductListProps) {
  return createPortal(
    <Dialog
      open
      title="Product details"
      onClose={onClose}
      panelClassName="max-w-lg"
    >
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[#4338CA]">
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
                className="border-t border-[rgba(79,70,229,0.12)]"
              >
                <td className="px-2 py-2 font-medium text-[#1E1B4B]">
                  {product.product_name || '—'}
                </td>
                <td className="px-2 py-2 text-[#4C4A7A]">
                  {product.quantity ?? '—'}
                </td>
                <td className="px-2 py-2 text-[#4C4A7A]">
                  {product.price ?? '—'}
                </td>
                <td className="px-2 py-2 text-[#4C4A7A]">
                  {product.total_price ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>,
    document.body,
  )
}
