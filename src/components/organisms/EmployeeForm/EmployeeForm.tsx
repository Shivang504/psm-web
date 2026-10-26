import { FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { FormLayout } from '@/components/layout/FormLayout'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import useFormHandler from '@/hooks/useFormHandler'
import type { Designation, EmployeeFormValues } from '@/utils/types'

type EmployeeFormProps = {
  designations: Designation[]
  locationOptions: string[]
  stateOptions: string[]
  regionOptions: string[]
  territoryOptions: string[]
  saving: boolean
  error: string
  saveText?: string
  defaultValues?: EmployeeFormValues
  onCancel: () => void
  onSubmit: (values: EmployeeFormValues) => void
  isEdit: boolean
}

const emptyValues: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  employeeCode: '',
  designation: '',
  location: '',
  state: '',
  regionName: '',
  territories: '',
  phone: '',
  email: '',
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

function createEmployeeSchema(requireTerritory: boolean) {
  return yup.object({
    firstName: yup.string().trim().required('First name is required'),
    lastName: yup.string().trim().required('Last name is required'),
    employeeCode: yup.string().trim().required('Employee code is required'),
    designation: yup.string().required('Designation is required'),
    location: yup.string().trim().required('SBU is required'),
    state: yup.string().trim().required('Zone is required'),
    regionName: yup.string().trim().required('Regional is required'),
    territories: requireTerritory
      ? yup.string().trim().required('Territory is required')
      : yup.string().trim().defined(),
    phone: yup
      .string()
      .required('Mobile number is required')
      .matches(/^[0-9]{10}$/, 'Enter a 10 digit mobile number'),
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Enter a valid email'),
  })
}

export function EmployeeForm({
  designations,
  locationOptions,
  stateOptions,
  regionOptions,
  territoryOptions,
  saving,
  error,
  saveText = 'Create',
  defaultValues,
  onCancel,
  onSubmit,
  isEdit = false,
}: EmployeeFormProps) {
  const methods = useFormHandler<EmployeeFormValues>({
    schema: createEmployeeSchema(territoryOptions.length > 0),
    defaultValues: defaultValues ?? {
      ...emptyValues,
      designation: designations[0]?.id ?? '',
    },
  })

  return (
    <FormProvider {...methods}>
      <form
        className="h-full flex flex-col flex-1 min-h-0"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        <FormLayout onCancel={onCancel} saving={saving} saveText={saveText}>
          {error ? (
            <div className="rounded-[14px] border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-[#DC2626]">
              {error}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-5">
            {/* Section 1: Basic Identity */}
            <InputField<EmployeeFormValues>
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              isRequired
            />
            <InputField<EmployeeFormValues>
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              isRequired
            />
            <InputField<EmployeeFormValues>
              name="employeeCode"
              label="Employee Code"
              placeholder="Enter employee code"
              type="capital"
              isRequired
            />
            <SelectField<EmployeeFormValues>
              name="designation"
              label="Designation"
              placeholder="Select designation"
              isRequired
              isSearch
              disabled={isEdit}
              options={designations.map((item) => ({
                label: item.designation,
                value: item.id,
              }))}
            />

            {/* Section 2: Contact Information */}
            <InputField<EmployeeFormValues>
              name="phone"
              label="Mobile Number"
              placeholder="Enter 10-digit mobile"
              type="tel"
              maxLength={10}
              isRequired
              isMobileNumber
            />
            <InputField<EmployeeFormValues>
              name="email"
              label="Email Address"
              placeholder="Enter email address"
              type="email"
              isRequired
            />

            {/* Section 3: Hierarchy & Regional Assignment */}
            {locationOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="location"
                label="SBU / Location"
                placeholder="Select SBU"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(locationOptions)}
              />
            ) : (
              <InputField<EmployeeFormValues>
                name="location"
                label="SBU / Location"
                placeholder="Enter SBU"
                isRequired
              />
            )}

            {stateOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="state"
                label="Zone / State"
                placeholder="Select zone"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(stateOptions)}
              />
            ) : (
              <InputField<EmployeeFormValues>
                name="state"
                label="Zone / State"
                placeholder="Enter zone"
                isRequired
              />
            )}

            {regionOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="regionName"
                label="Regional"
                placeholder="Select regional"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(regionOptions)}
              />
            ) : (
              <InputField<EmployeeFormValues>
                name="regionName"
                label="Regional"
                placeholder="Enter regional"
                isRequired
              />
            )}

            {territoryOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="territories"
                label="Territory / Area"
                placeholder="Select territory"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(territoryOptions)}
              />
            ) : null}
          </div>
        </FormLayout>
      </form>
    </FormProvider>
  )
}
