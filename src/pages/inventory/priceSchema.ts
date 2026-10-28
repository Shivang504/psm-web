import * as yup from 'yup'
import { validationSchema } from '@/utils/validationSchema'

export const priceSchema = yup.object({
  basedOn: validationSchema.priceBasedOn,
  regionName: validationSchema.regionName,
  vendorType: validationSchema.vendorType,
  company: validationSchema.company,
  productName: yup.string().when('basedOn', {
    is: 'Product',
    then: () => validationSchema.productName,
    otherwise: () => validationSchema.optionalField.clone(),
  }),
  hsnCode: yup.string().when('basedOn', {
    is: 'SKN/HSN Code',
    then: () => validationSchema.hsnCode,
    otherwise: () => validationSchema.optionalField.clone(),
  }),
  price: validationSchema.productPrice,
})
