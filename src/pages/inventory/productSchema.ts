import * as yup from 'yup'
import { validationSchema } from '@/utils/validationSchema'
import type { ProductFormValues, VendorPriceFormValue } from '@/utils/types'

function vendorPriceField() {
  return validationSchema.vendorPrice
    .clone()
    .test(
      'lte-mrp',
      'Enter a price less than or equal to MRP',
      function validateMrp(value) {
        const root = this.from?.[this.from.length - 1]?.value as
          ProductFormValues | undefined
        if (!value || !root?.mrp) return true
        return Number(value) <= Number(root.mrp)
      },
    )
    .test(
      'next-designation',
      'Price should not be greater than the next level designation',
      function validateNext(value) {
        const list = (
          this.from?.[1]?.value as { vendorPrices?: VendorPriceFormValue[] }
        )?.vendorPrices
        if (!value || !list) return true
        const parent = this.parent as VendorPriceFormValue
        const index = list.findIndex(
          (item) => item.designation === parent.designation,
        )
        const next = list[index + 1]?.price
        if (!next) return true
        return Number(value) <= Number(next)
      },
    )
}

export function createProductSchema() {
  return yup.object({
    productName: validationSchema.productName,
    hsnCode: validationSchema.hsnCode,
    categoryName: validationSchema.categoryName,
    packageName: validationSchema.packageName,
    mrp: validationSchema.mrp,
    vendorPrices: yup
      .array()
      .of(
        yup.object({
          designation: yup.string().defined(),
          price: vendorPriceField(),
          packages: yup.array().of(yup.string().defined()).defined(),
        }),
      )
      .defined(),
  })
}
