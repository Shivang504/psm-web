import { FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { FormLayout } from '../../layout/FormLayout'
import { InputField } from '../../atoms/InputField'
import { SelectField } from '../../atoms/SelectField'
import useFormHandler from '../../../hooks/useFormHandler'
import type { Designation, EmployeeFormValues } from '../../../utils/types'

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
      <form className="h-full" onSubmit={methods.handleSubmit(onSubmit)}>
        <FormLayout onCancel={onCancel} saving={saving} saveText={saveText}>
          {error ? (
            <p className="rounded-xl bg-error-soft px-4 py-3 text-sm text-error">
              {error}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-border bg-background-surface p-5 shadow-card">
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
            {locationOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="location"
                label="SBU"
                placeholder="Select SBU"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(locationOptions)}
              />
            ) : (
              <InputField<EmployeeFormValues>
                name="location"
                label="SBU"
                placeholder="Enter SBU"
                isRequired
              />
            )}
            {stateOptions.length ? (
              <SelectField<EmployeeFormValues>
                name="state"
                label="Zone"
                placeholder="Select zone"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(stateOptions)}
              />
            ) : (
              <InputField<EmployeeFormValues>
                name="state"
                label="Zone"
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
                label="Territory"
                placeholder="Select territory"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(territoryOptions)}
              />
            ) : null}
            <InputField<EmployeeFormValues>
              name="phone"
              label="Mobile Number"
              placeholder="Enter mobile number"
              type="tel"
              maxLength={10}
              isRequired
            />
            <InputField<EmployeeFormValues>
              name="email"
              label="Email"
              placeholder="Enter email"
              type="email"
              isRequired
            />
          </div>
        </FormLayout>
      </form>
    </FormProvider>
  )
}
