import * as yup from 'yup'
import { validationSchema } from '@/utils/validationSchema'

export function createSchema(requireTerritory: boolean) {
  return yup.object({
    firstName: validationSchema.firstName,
    lastName: validationSchema.lastName,
    designation: validationSchema.designation,
    phone: validationSchema.mobile,
    email: validationSchema.email,
    birthDate: validationSchema.birthDate,
    regionName: validationSchema.regionName,
    territories: requireTerritory
      ? validationSchema.territories
      : validationSchema.optionalField,
    company: validationSchema.company,
    address: validationSchema.address,
    gstn: validationSchema.gstn,
    landline: validationSchema.landline,
    state: validationSchema.state,
    city: validationSchema.city,
    country: validationSchema.country,
    pincode: validationSchema.pincode,
    pan: validationSchema.pan,
    aadhar: validationSchema.aadhar,
    fssai: validationSchema.fssai,
    bankName: validationSchema.bankName,
    bankAccount: validationSchema.bankAccount,
    bankIfsc: validationSchema.bankIfsc,
  })
}
