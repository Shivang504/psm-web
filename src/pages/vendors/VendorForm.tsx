import { FormProvider } from 'react-hook-form'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import { FormLayout } from '@/components/layout/FormLayout'
import useFormHandler from '@/hooks/useFormHandler'
import { citiesForState, statesAndCities } from '@/utils/statesAndCities'
import type { Designation, VendorFormValues } from '@/utils/types'
import { createSchema } from './vendorSchema'

type VendorFormProps = {
  designations: Designation[]
  regionOptions: string[]
  territoryOptions: string[]
  saving: boolean
  error: string
  isEdit: boolean
  saveText: string
  defaultValues?: VendorFormValues
  onCancel: () => void
  onSubmit: (values: VendorFormValues) => void
}

const emptyValues: VendorFormValues = {
  firstName: '',
  lastName: '',
  designation: '',
  phone: '',
  email: '',
  birthDate: '',
  regionName: '',
  territories: '',
  company: '',
  address: '',
  gstn: '',
  landline: '',
  state: '',
  city: '',
  country: 'India',
  pincode: '',
  pan: '',
  aadhar: '',
  fssai: '',
  bankName: '',
  bankAccount: '',
  bankIfsc: '',
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="col-span-full text-[15px] font-semibold text-[#312E81]">
      {children}
    </h2>
  )
}

export function VendorForm({
  designations,
  regionOptions,
  territoryOptions,
  saving,
  error,
  isEdit,
  saveText,
  defaultValues,
  onCancel,
  onSubmit,
}: VendorFormProps) {
  const methods = useFormHandler<VendorFormValues>({
    schema: createSchema(territoryOptions.length > 0),
    defaultValues: defaultValues ?? {
      ...emptyValues,
      designation: designations[0]?.id ?? '',
    },
  })
  const selectedState = methods.watch('state')
  const cities = citiesForState(selectedState)

  return (
    <FormProvider {...methods}>
      <form
        className="flex h-full min-h-0 flex-1 flex-col"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        <FormLayout onCancel={onCancel} saving={saving} saveText={saveText}>
          {error ? (
            <div className="rounded-[14px] border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-[#DC2626]">
              {error}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SectionTitle>Personal information</SectionTitle>
            <SelectField<VendorFormValues>
              name="designation"
              label="Designation"
              placeholder="Select designation"
              isRequired
              isSearch
              disabled={isEdit || saving}
              options={designations.map((item) => ({
                label: item.designation,
                value: item.id,
              }))}
            />
            <InputField<VendorFormValues>
              name="firstName"
              label="First name"
              placeholder="Enter first name"
              isRequired
            />
            <InputField<VendorFormValues>
              name="lastName"
              label="Last name"
              placeholder="Enter last name"
              isRequired
            />
            <InputField<VendorFormValues>
              name="phone"
              label="Mobile number"
              placeholder="Enter 10-digit mobile"
              type="tel"
              maxLength={10}
              isRequired
              isMobileNumber
            />
            <InputField<VendorFormValues>
              name="email"
              label="Email"
              placeholder="Enter email address"
              type="email"
              isRequired
            />
            <InputField<VendorFormValues>
              name="birthDate"
              label="Birth date"
              type="date"
              isRequired
            />
            {regionOptions.length ? (
              <SelectField<VendorFormValues>
                name="regionName"
                label="Region"
                placeholder="Select region"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(regionOptions)}
              />
            ) : (
              <InputField<VendorFormValues>
                name="regionName"
                label="Region"
                placeholder="Enter region"
                isRequired
              />
            )}
            {territoryOptions.length ? (
              <SelectField<VendorFormValues>
                name="territories"
                label="Territory"
                placeholder="Select territory"
                isRequired
                isSearch
                disabled={saving}
                options={toOptions(territoryOptions)}
              />
            ) : null}

            <SectionTitle>Company</SectionTitle>
            <InputField<VendorFormValues>
              name="company"
              label="Company name"
              placeholder="Enter company name"
              isRequired
            />
            <InputField<VendorFormValues>
              name="gstn"
              label="GST number"
              placeholder="15 character GSTIN"
            />
            <div className="col-span-full">
              <InputField<VendorFormValues>
                name="address"
                label="Address"
                placeholder="Enter address"
                isRequired
              />
            </div>
            <InputField<VendorFormValues>
              name="landline"
              label="Landline"
              placeholder="Landline number"
            />
            <SelectField<VendorFormValues>
              name="state"
              label="State"
              placeholder="Select state"
              isSearch
              disabled={saving}
              options={statesAndCities.map((item) => ({
                label: item.state,
                value: item.state,
              }))}
              onValueChange={() => methods.setValue('city', '')}
            />
            {cities.length ? (
              <SelectField<VendorFormValues>
                name="city"
                label="City"
                placeholder="Select city"
                isSearch
                disabled={saving || !selectedState}
                options={toOptions(cities)}
              />
            ) : (
              <InputField<VendorFormValues>
                name="city"
                label="City"
                placeholder="Enter city"
              />
            )}
            <InputField<VendorFormValues>
              name="country"
              label="Country"
              placeholder="Country"
            />
            <InputField<VendorFormValues>
              name="pincode"
              label="Pincode"
              placeholder="6 digit pincode"
              maxLength={6}
            />
            <InputField<VendorFormValues>
              name="pan"
              label="PAN"
              placeholder="PAN number"
            />
            <InputField<VendorFormValues>
              name="aadhar"
              label="Aadhaar"
              placeholder="12 digit Aadhaar"
              maxLength={12}
            />
            <InputField<VendorFormValues>
              name="fssai"
              label="FSSAI"
              placeholder="14 digit FSSAI"
              maxLength={14}
            />

            <SectionTitle>Bank</SectionTitle>
            <InputField<VendorFormValues>
              name="bankName"
              label="Bank name"
              placeholder="Bank name"
            />
            <InputField<VendorFormValues>
              name="bankAccount"
              label="Account number"
              placeholder="Account number"
            />
            <InputField<VendorFormValues>
              name="bankIfsc"
              label="IFSC"
              placeholder="IFSC code"
            />
          </div>
        </FormLayout>
      </form>
    </FormProvider>
  )
}
