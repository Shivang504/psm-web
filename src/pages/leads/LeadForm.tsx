import { FormProvider, useFormContext } from 'react-hook-form'
import * as yup from 'yup'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import useFormHandler from '@/hooks/useFormHandler'
import { displayName } from '@/utils/helper'
import type {
  Designation,
  LeadFormValues,
  LeadProduct,
  UserListItem,
} from '@/utils/types'
import { validationSchema } from '@/utils/validationSchema'

const leadSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Enter a valid name'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Enter a valid name'),
  phone: validationSchema.mobile,
  company: yup.string().trim().required('Company is required'),
  designationId: yup.string().required('Role is required'),
  address: yup.string().trim().required('Address is required'),
  employeeId: yup.string().defined(),
  leadType: yup.string().defined(),
  origin: yup.string().defined(),
  value: yup.string().defined(),
  productName: yup.string().defined(),
})

function AddressField() {
  const { register, formState } = useFormContext<LeadFormValues>()
  const error = formState.errors.address?.message

  return (
    <div className="sm:col-span-2">
      <label
        htmlFor="lead-address"
        className="mb-1.5 block text-[13px] font-semibold tracking-wide text-[#1E1B4B]"
      >
        Address <span className="text-error">*</span>
      </label>
      <textarea
        id="lead-address"
        rows={3}
        placeholder="Enter address"
        {...register('address')}
        className={`w-full rounded-[14px] border bg-white/70 px-4 py-3 text-[13px] text-[#1E1B4B] outline-none backdrop-blur-sm placeholder:text-[#4C4A7A]/60 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-white/85 focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15'
        }`}
      />
      {error ? <p className="mt-2 text-xs text-error">{error}</p> : null}
    </div>
  )
}

function optionsWithBlank(
  values: { label: string; value: string }[],
  blankLabel: string,
) {
  return [{ label: blankLabel, value: '' }, ...values]
}

type LeadFormProps = {
  designations: Designation[]
  employees: UserListItem[]
  products: LeadProduct[]
  defaultValues: LeadFormValues
  onSubmit: (values: LeadFormValues) => void
}

export function LeadForm({
  designations,
  employees,
  products,
  defaultValues,
  onSubmit,
}: LeadFormProps) {
  const methods = useFormHandler<LeadFormValues>({
    schema: leadSchema,
    defaultValues,
  })
  const productNames = products
    .map((item) => item.product_name?.trim() ?? '')
    .filter(Boolean)
  const productOptions = Array.from(
    new Set(
      defaultValues.productName
        ? [defaultValues.productName, ...productNames]
        : productNames,
    ),
  )

  return (
    <FormProvider {...methods}>
      <form
        id="lead-form"
        className="space-y-6"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E1B4B]">
            Personal information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField<LeadFormValues>
              name="designationId"
              label="Role"
              placeholder="Select role"
              options={designations.map((item) => ({
                label: item.designation,
                value: item.id,
              }))}
              isSearch
              isRequired
            />
            <InputField<LeadFormValues>
              name="firstName"
              label="First name"
              placeholder="Enter first name"
              isRequired
            />
            <InputField<LeadFormValues>
              name="lastName"
              label="Last name"
              placeholder="Enter last name"
              isRequired
            />
            <InputField<LeadFormValues>
              name="phone"
              label="Mobile number"
              placeholder="Enter 10-digit mobile"
              type="tel"
              isMobileNumber
              maxLength={10}
              isRequired
            />
            <InputField<LeadFormValues>
              name="company"
              label="Company name"
              placeholder="Enter company"
              isRequired
            />
            <AddressField />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E1B4B]">Assign employee</h3>
          <SelectField<LeadFormValues>
            name="employeeId"
            label="Employee"
            placeholder="Select employee"
            options={optionsWithBlank(
              employees.map((item) => ({
                label: displayName(item),
                value: item.id,
              })),
              'Not assigned',
            )}
            isSearch
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#1E1B4B]">More information</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField<LeadFormValues>
              name="leadType"
              label="Lead type"
              placeholder="Enter lead type"
            />
            <InputField<LeadFormValues>
              name="origin"
              label="Lead origin"
              placeholder="Enter origin"
            />
            <InputField<LeadFormValues>
              name="value"
              label="Value of lead"
              placeholder="Enter value"
            />
            <SelectField<LeadFormValues>
              name="productName"
              label="Product name"
              placeholder="Select product"
              options={optionsWithBlank(
                productOptions.map((name) => ({ label: name, value: name })),
                'No product',
              )}
              isSearch
            />
          </div>
        </section>
      </form>
    </FormProvider>
  )
}
