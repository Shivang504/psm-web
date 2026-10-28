import * as yup from 'yup'
import { validationSchema } from '@/utils/validationSchema'

export const stockSchema = yup.object({
  lines: yup
    .array()
    .of(
      yup.object({
        productName: validationSchema.productName,
        quantity: validationSchema.stockQuantity,
        batchCode: validationSchema.batchCode,
      }),
    )
    .min(1, 'Add at least one stock row')
    .required(),
})
