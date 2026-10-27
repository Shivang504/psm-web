import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch, type Resolver } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import * as yup from 'yup'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import { Skeleton } from '@/components/atoms/Skeleton'
import { FormLayout } from '@/components/layout/FormLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchProfile,
  fetchProfileFailure,
  fetchProfileSuccess,
  setProfileSaving,
} from '@/store/slices/profileSlice'
import { setStoredRoleId } from '@/utils/auth'
import { todayDateInput } from '@/utils/helper'
import { citiesForState, statesAndCities } from '@/utils/statesAndCities'
import type {
  ProfileFormValues,
  ProfileResponse,
  ProfileSection,
  UserProfile,
} from '@/utils/types'
import { validationSchema } from '@/utils/validationSchema'

const SECTIONS: { id: ProfileSection; label: string }[] = [
  { id: 'personal-information', label: 'Personal information' },
  { id: 'company-detail', label: 'Company detail' },
  { id: 'bank-detail', label: 'Bank detail' },
]

function isProfileSection(value: string | undefined): value is ProfileSection {
  return SECTIONS.some((section) => section.id === value)
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

function withCurrent(values: string[], current: string) {
  if (current && !values.includes(current)) return [current, ...values]
  return values
}

function toProfileFormValues(profile: UserProfile): ProfileFormValues {
  const config = profile.config
  const company = profile.company_config

  return {
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    phone: profile.contact_no ?? '',
    email: profile.email ?? '',
    birthDate: config?.birthDate?.slice(0, 10) ?? '',
    companyName: profile.company_name || config?.companyName || '',
    state: profile.company_state || config?.state || '',
    city: profile.company_city || config?.city || '',
    gstin: company?.GSTN || config?.GSTN || '',
    landlineNumber: company?.landlineNumber || config?.landlineNumber || '',
    country: profile.company_country || config?.country || 'India',
    address: profile.company_address || config?.address || '',
    pincode: profile.company_pincode || config?.pincode || '',
    bankName: config?.BankName ?? '',
    bankIfsc: config?.BankIFSC ?? '',
    bankAccountNumber: config?.BankAccountNumber ?? '',
  }
}

function profileSchema(section: ProfileSection) {
  const optional = yup.string().defined()
  const onPersonal = section === 'personal-information'
  const onCompany = section === 'company-detail'
  const onBank = section === 'bank-detail'
  const today = todayDateInput()
  const nameSchema = yup
    .string()
    .trim()
    .required('Name is required')
    .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Enter a valid name')

  return yup.object({
    firstName: onPersonal ? nameSchema : optional,
    lastName: onPersonal ? nameSchema : optional,
    phone: onPersonal ? validationSchema.mobile : optional,
    email: onPersonal ? validationSchema.email : optional,
    birthDate: onPersonal
      ? yup
          .string()
          .required('Birth date is required')
          .test(
            'not-future',
            'Birth date must be on or before today',
            (value) => Boolean(value && value <= today),
          )
      : optional,
    companyName: onCompany
      ? yup.string().trim().required('Company name is required')
      : optional,
    state: onCompany ? yup.string().required('State is required') : optional,
    city: onCompany ? yup.string().required('City is required') : optional,
    gstin: onCompany
      ? yup
          .string()
          .trim()
          .required('GST number is required')
          .matches(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
            'Enter a valid GST number',
          )
      : optional,
    landlineNumber: yup
      .string()
      .defined()
      .max(15, 'Maximum length exceeded')
      .test('landline', 'Enter a valid landline number', (value) => {
        const text = value?.trim() ?? ''
        if (!text) return true
        return /^[\d()-]+$/.test(text)
      }),
    country: optional,
    address: onCompany
      ? yup.string().trim().required('Address is required')
      : optional,
    pincode: onCompany
      ? yup
          .string()
          .required('Pincode is required')
          .matches(/^\d{6}$/, 'Must be exactly 6 digits')
      : optional,
    bankName: onBank
      ? yup
          .string()
          .trim()
          .required('Bank name is required')
          .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Enter a valid bank name')
      : optional,
    bankIfsc: onBank
      ? yup
          .string()
          .trim()
          .required('Bank IFSC is required')
          .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code')
      : optional,
    bankAccountNumber: onBank
      ? yup
          .string()
          .required('Bank account number is required')
          .matches(/^\d{9,18}$/, 'Enter a valid account number')
      : optional,
  })
}

function buildProfilePayload(profile: UserProfile, values: ProfileFormValues) {
  return {
    id: profile.id,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    email: values.email.trim(),
    contact_no: values.phone.trim(),
    status: profile.status || 'Active',
    role: profile.role || 'admin',
    config: {
      ...profile.config,
      birthDate: values.birthDate,
      companyName: values.companyName.trim(),
      GSTN: values.gstin.trim().toUpperCase(),
      landlineNumber: values.landlineNumber.trim(),
      address: values.address.trim(),
      state: values.state,
      city: values.city,
      country: values.country.trim() || 'India',
      pincode: values.pincode.trim(),
      BankName: values.bankName.trim(),
      BankAccountNumber: values.bankAccountNumber.trim(),
      BankIFSC: values.bankIfsc.trim().toUpperCase(),
    },
  }
}

function storeProfile(dispatch: AppDispatch, response: ProfileResponse) {
  const profile = response.data?.profile
  const roleId = profile?.role_id?.trim() ?? ''

  if (!profile || !roleId) {
    dispatch(fetchProfileFailure('Profile did not include a role.'))
    return false
  }

  setStoredRoleId(roleId)
  dispatch(fetchProfileSuccess({ profile, roleId }))
  return true
}

function ProfileForm({
  profile,
  section,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  profile: UserProfile
  section: ProfileSection
  saving: boolean
  error: string
  onSubmit: (values: ProfileFormValues) => void
  onCancel: () => void
}) {
  const sectionRef = useRef(section)

  useEffect(() => {
    sectionRef.current = section
  }, [section])

  const methods = useForm<ProfileFormValues>({
    mode: 'onTouched',
    defaultValues: toProfileFormValues(profile),
    resolver: ((values, context, options) =>
      yupResolver(profileSchema(sectionRef.current))(
        values,
        context,
        options,
      )) as Resolver<ProfileFormValues>,
  })
  const selectedState = useWatch({ control: methods.control, name: 'state' })
  const selectedCity = useWatch({ control: methods.control, name: 'city' })
  const stateOptions = toOptions(
    withCurrent(
      statesAndCities.map((item) => item.state),
      selectedState,
    ),
  )
  const cityOptions = toOptions(
    withCurrent(citiesForState(selectedState), selectedCity),
  )

  return (
    <FormProvider {...methods}>
      <form
        className="flex h-full min-h-0 flex-1 flex-col"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        <FormLayout onCancel={onCancel} saving={saving} saveText="Save">
          {error ? (
            <div className="rounded-[14px] border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-[#DC2626]">
              {error}
            </div>
          ) : null}

          {section === 'personal-information' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField<ProfileFormValues>
                name="firstName"
                label="First name"
                placeholder="Enter first name"
                isRequired
              />
              <InputField<ProfileFormValues>
                name="lastName"
                label="Last name"
                placeholder="Enter last name"
                isRequired
              />
              <InputField<ProfileFormValues>
                name="phone"
                label="Phone number"
                placeholder="Enter 10-digit mobile"
                type="tel"
                isMobileNumber
                maxLength={10}
                isRequired
              />
              <InputField<ProfileFormValues>
                name="email"
                label="Email address"
                placeholder="Enter email"
                type="email"
                isRequired
              />
              <InputField<ProfileFormValues>
                name="birthDate"
                label="Birth date"
                type="date"
                isRequired
              />
            </div>
          ) : null}

          {section === 'company-detail' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField<ProfileFormValues>
                name="companyName"
                label="Company name"
                placeholder="Enter company name"
                isRequired
              />
              <SelectField<ProfileFormValues>
                name="state"
                label="State"
                placeholder="Select state"
                options={stateOptions}
                isSearch
                isRequired
                onValueChange={(value) => {
                  const city = methods.getValues('city')
                  if (city && !citiesForState(value).includes(city)) {
                    methods.setValue('city', '')
                  }
                }}
              />
              <InputField<ProfileFormValues>
                name="gstin"
                label="GSTIN"
                placeholder="Enter GST number"
                type="capital"
                maxLength={15}
                isRequired
              />
              <SelectField<ProfileFormValues>
                name="city"
                label="City"
                placeholder="Select city"
                options={cityOptions}
                isSearch
                isRequired
              />
              <InputField<ProfileFormValues>
                name="landlineNumber"
                label="Landline / office number"
                placeholder="Optional"
                maxLength={15}
              />
              <InputField<ProfileFormValues>
                name="country"
                label="Country"
                disabled
              />
              <InputField<ProfileFormValues>
                name="address"
                label="Address"
                placeholder="Enter address"
                isRequired
              />
              <InputField<ProfileFormValues>
                name="pincode"
                label="Pincode"
                placeholder="6-digit pincode"
                type="tel"
                maxLength={6}
                isRequired
              />
            </div>
          ) : null}

          {section === 'bank-detail' ? (
            <div className="grid max-w-md grid-cols-1 gap-5">
              <InputField<ProfileFormValues>
                name="bankName"
                label="Bank name"
                placeholder="Enter bank name"
                isRequired
              />
              <InputField<ProfileFormValues>
                name="bankIfsc"
                label="Bank IFSC"
                placeholder="Enter IFSC code"
                type="capital"
                maxLength={11}
                isRequired
              />
              <InputField<ProfileFormValues>
                name="bankAccountNumber"
                label="Bank account number"
                placeholder="Enter account number"
                type="tel"
                maxLength={18}
                isRequired
              />
            </div>
          ) : null}
        </FormLayout>
      </form>
    </FormProvider>
  )
}

export default function ProfilePage() {
  const { section: sectionParam } = useParams()
  const section = isProfileSection(sectionParam) ? sectionParam : null
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { profile, loading, saving, error } = useAppSelector(
    (state) => state.profile,
  )
  const [formVersion, setFormVersion] = useState(0)

  useEffect(() => {
    if (!store.getState().profile.profile) dispatch(fetchProfile())

    dispatch({
      type: sagaActions.GET_PROFILE,
      payload: {
        query: '/profile',
        method: 'GET',
        onSuccess: (response: ProfileResponse) => {
          storeProfile(dispatch, response)
        },
        onFailure: (message: string) => {
          dispatch(fetchProfileFailure(message))
        },
      },
    })
  }, [dispatch])

  if (!section) {
    return <Navigate to="/profile/personal-information" replace />
  }

  const handleSubmit = (values: ProfileFormValues) => {
    if (!profile || saving) return

    dispatch(setProfileSaving(true))
    dispatch({
      type: sagaActions.UPDATE_PROFILE,
      payload: {
        query: `/users/${profile.id}`,
        method: 'PUT',
        variables: buildProfilePayload(profile, values),
        showToast: true,
        successMessage: 'Profile updated',
        onSuccess: () => {
          dispatch({
            type: sagaActions.GET_PROFILE,
            payload: {
              query: '/profile',
              method: 'GET',
              onSuccess: (response: ProfileResponse) => {
                storeProfile(dispatch, response)
                dispatch(setProfileSaving(false))
                setFormVersion((current) => current + 1)
              },
              onFailure: (message: string) => {
                dispatch(fetchProfileFailure(message))
                dispatch(setProfileSaving(false))
              },
            },
          })
        },
        onFailure: () => {
          dispatch(setProfileSaving(false))
        },
      },
    })
  }

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title="Profile"
          subtitle="Update your personal, company, and bank details."
        />

        <div
          role="tablist"
          aria-label="Profile sections"
          className="inline-flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1 shadow-[0_2px_8px_rgba(79,70,229,0.04)] backdrop-blur-md"
        >
          {SECTIONS.map((item) => {
            const selected = item.id === section

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => navigate(`/profile/${item.id}`)}
                className={`h-[36px] cursor-pointer rounded-[11px] px-4 text-[13px] transition duration-150 select-none ${
                  selected
                    ? 'bg-[#4F46E5] font-semibold text-white shadow-sm'
                    : 'font-medium text-[#312E81] hover:bg-white/45'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {profile ? (
          <ProfileForm
            key={`${profile.id}-${formVersion}`}
            profile={profile}
            section={section}
            saving={saving}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
          />
        ) : loading ? (
          <div className="glass-card flex-1 space-y-4 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
              <Skeleton className="h-[44px] w-full rounded-[14px] bg-indigo-100/40" />
            </div>
          </div>
        ) : (
          <div className="rounded-[14px] border border-red-200 bg-red-50/80 p-3 text-xs text-[#DC2626]">
            {error || 'Profile could not be loaded.'}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
