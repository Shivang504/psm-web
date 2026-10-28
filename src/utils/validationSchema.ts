import * as yup from 'yup'
import { regex } from './constants'

function optionalPattern(pattern: RegExp, message: string) {
  return yup
    .string()
    .trim()
    .defined()
    .test('pattern', message, (value) => !value || pattern.test(value))
}

const mobileSchema = yup
  .string()
  .required('Mobile number is required')
  .matches(regex.mobileNUmber, 'Enter valid mobile number')
const otpSchema = yup.string().required('OTP is required')
const passwordSchema = yup
  .string()
  .required('Password is required')
  .matches(new RegExp(regex?.passwordRegex), 'Invalid password')
const emailSchema = yup
  .string()
  .required('Email is required')
  .matches(regex.email, 'Enter a valid email address')
const firstNameSchema = yup.string().trim().required('First name is required')
const lastNameSchema = yup.string().trim().required('Last name is required')
const designationSchema = yup.string().required('Designation is required')
const birthDateSchema = yup
  .string()
  .required('Birth date is required')
  .test('not-future', 'Birth date must be on or before today', (value) => {
    if (!value) return true
    const today = new Date().toISOString().slice(0, 10)
    return value <= today
  })
const regionNameSchema = yup.string().trim().required('Region is required')
const territoriesSchema = yup.string().trim().required('Territory is required')
const optionalFieldSchema = () => yup.string().trim().defined()
const companySchema = yup.string().trim().required('Company name is required')
const addressSchema = yup.string().trim().required('Address is required')
const gstnSchema = optionalPattern(
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i,
  'Enter a valid GST number',
)
const landlineSchema = optionalPattern(
  /^[0-9]+$/,
  'Landline should contain digits only',
)
const pincodeSchema = optionalPattern(
  /^[1-9][0-9]{5}$/,
  'Enter a 6 digit pincode',
)
const panSchema = optionalPattern(
  /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
  'Enter a valid PAN number',
)
const aadharSchema = optionalPattern(
  /^[0-9]{12}$/,
  'Aadhaar number must be 12 digits',
)
const fssaiSchema = optionalPattern(
  /^[0-9]{14}$/,
  'FSSAI number must be 14 digits',
)
const bankAccountSchema = optionalPattern(
  regex.accountNumber,
  'Account number must be 9 to 18 digits',
)
const bankIfscSchema = optionalPattern(regex.ifsc, 'Enter a valid IFSC')
const lettersAndNumbers = /^[a-zA-Z0-9][a-zA-Z0-9 ]*$/
const moneyPattern = /^\d{1,8}(\.\d{1,4})?$/

function namedText(label: string) {
  return yup
    .string()
    .trim()
    .required(`${label} is required`)
    .matches(lettersAndNumbers, 'Please use only numbers and letters.')
}

function moneyField(label: string, allowZero = false) {
  return yup
    .string()
    .trim()
    .required(`${label} is required`)
    .matches(moneyPattern, 'The field should have digits only')
    .test(
      'not-zero',
      `${label} cannot be zero`,
      (value) => allowZero || !value || Number(value) !== 0,
    )
}

export const validationSchema = {
  mobile: mobileSchema,
  otp: otpSchema,
  password: passwordSchema,
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  designation: designationSchema,
  birthDate: birthDateSchema,
  regionName: regionNameSchema,
  territories: territoriesSchema,
  optionalField: optionalFieldSchema(),
  company: companySchema,
  address: addressSchema,
  gstn: gstnSchema,
  landline: landlineSchema,
  state: optionalFieldSchema(),
  city: optionalFieldSchema(),
  country: optionalFieldSchema(),
  pincode: pincodeSchema,
  pan: panSchema,
  aadhar: aadharSchema,
  fssai: fssaiSchema,
  bankName: optionalFieldSchema(),
  bankAccount: bankAccountSchema,
  bankIfsc: bankIfscSchema,
  categoryName: namedText('Category name'),
  productName: namedText('Product name'),
  hsnCode: yup
    .string()
    .trim()
    .required('Product HSN code is required')
    .matches(/^\d{1,8}$/, 'HSN code should be up to 8 digits'),
  mrp: moneyField('MRP'),
  packageName: yup.string().trim().required('Package is required'),
  vendorPrice: moneyField('Price'),
  stockQuantity: moneyField('Stock', true),
  batchCode: optionalFieldSchema(),
  productPrice: moneyField('Product price'),
  vendorType: yup.string().trim().required('Vendor type is required'),
  priceBasedOn: yup
    .string()
    .oneOf(['SKN/HSN Code', 'Product'])
    .required('Choose how the price is based'),
}
