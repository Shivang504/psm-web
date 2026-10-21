import * as yup from 'yup'
import { blockedWords, regex } from './constants'

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

const monthlyPriceSchema = yup
  .number()
  .typeError('Must be a number')
  .positive('Must be greater than 0')
  .required('Monthly price is required')

const annualPriceSchema = yup
  .number()
  .typeError('Must be a number')
  .positive('Must be greater than 0')
  .required('Annual price is required')

const consultperMonthSchema = yup
  .number()
  .typeError('Must be a number')
  .min(0, 'Cannot be negative')
  .required('Consults per month is required')

const fairUseCapSchema = yup
  .number()
  .typeError('Must be a number')
  .min(0, 'Cannot be negative')
  .optional()

const sessionDurationShema = yup
  .number()
  .typeError('Must be a number')
  .positive('Must be greater than 0')
  .required('Session duration is required')

const slaSchema = yup
  .number()
  .typeError('Must be a number')
  .positive('Must be greater than 0')
  .required('SLA is required')

const effectiveDateSchema = yup.string().required('Effective date is required')
const roleSchema = yup.string().required('Role is required')
const holdReasonSchema = yup
  .string()
  .required('Reason is required')
  .min(10, 'Reason must be at least 10 characters')
  .max(200, 'Reason must not exceed 200 characters')
const drugNameSchema = yup.string().required('Drug name is required').trim()

const genericNameSchema = yup
  .string()
  .required('Generic name is required')
  .trim()

const manufacturerNameSchema = yup
  .string()
  .required('Manufacturer name is required')
  .trim()
  .max(100, 'Manufacturer name must not exceed 100 characters')

const strengthPowerSchema = yup
  .string()
  .required('Strength/Power is required')
  .trim()
  .max(30, 'Strength/Power must not exceed 30 characters')

const featureFlagKeySchema = yup
  .string()
  .required('Feature flag key is required')
  .trim()
  .max(100, 'Feature flag key must not exceed 100 characters')

const featureFlagValueSchema = yup
  .string()
  .required('Feature flag value is required')
  .trim()
  .max(500, 'Feature flag value must not exceed 500 characters')

const featureFlagValueJsonSchema = yup
  .string()
  .required('Feature flag value is required')
  .trim()
  .test('valid-json-object', 'Value must be a valid JSON object', (value) => {
    if (!value) {
      return false
    }

    try {
      const parsed = JSON.parse(value)
      return (
        typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      )
    } catch {
      return false
    }
  })

const medicineCategoryIdSchema = yup.string().required('Drug class is required')

const scheduleSchema = yup.string().required('Schedule is required')

const speciesSchema = yup.string().required('Species is required')

const speciesNameSchema = yup
  .string()
  .required('Species name is required')
  .trim()

const breedNameSchema = yup.string().required('Breed name is required').trim()

const categoryNameSchema = yup
  .string()
  .required('Category name is required')
  .trim()

const specializationCodeSchema = yup
  .string()
  .required('Specialization code is required')
  .trim()
  .transform((value) =>
    typeof value === 'string'
      ? value.toUpperCase().replace(/\s+/g, '_')
      : value,
  )
  .matches(
    /^[A-Z][A-Z0-9_]*$/,
    'Code must use uppercase letters, numbers, and underscores',
  )

const specializationNameSchema = yup
  .string()
  .required('Specialization name is required')
  .trim()

const intakeConcernCodeSchema = yup
  .string()
  .required('Concern code is required')
  .trim()
  .transform((value) =>
    typeof value === 'string'
      ? value.toUpperCase().replace(/\s+/g, '_')
      : value,
  )
  .matches(
    /^[A-Z][A-Z0-9_]*$/,
    'Code must use uppercase letters, numbers, and underscores',
  )

const intakeConcernNameSchema = yup
  .string()
  .required('Concern name is required')
  .trim()

const breedSchema = yup.string().required('Breed is required')

const vaccinationNameSchema = yup
  .string()
  .required('Vaccination name is required')
  .trim()

const vaccinationMasterIdSchema = yup
  .string()
  .required('Vaccination is required')

const administeredAtSchema = yup.string().required('Given date is required')

const nextDueAtSchema = yup
  .string()
  .default('')
  .test(
    'due-after-given',
    'Due date cannot be earlier than the given date',
    function (value) {
      const given = this.parent.administered_at as string | undefined
      if (!value || !given) return true
      return value >= given
    },
  )

const vaccinationCertificateSchema = yup
  .mixed<File | string>()
  .nullable()
  .default(null)

const sortOrderSchema = yup
  .number()
  .typeError('Sort order must be a number')
  .integer('Sort order must be an integer')
  .min(0, 'Sort order must be 0 or greater')
  .default(0)

const optionalSpeciesIdSchema = yup.string().optional()

const optionalBreedIdSchema = yup.string().optional()

const clinicalNotesSchema = yup
  .string()
  .min(10, 'Clinical notes must be at least 10 characters')

const fullNameSchema = yup
  .string()
  .max(100, 'Full name must be at most 100 characters')
  .required('Full Name is required')

const profileNameSchema = yup
  .string()
  .trim()
  .required('Name is required')
  .max(100, 'Name must be at most 100 characters')
  .matches(regex.acceptCharecters, 'Please enter a valid name.')

const bankSchema = yup.string().required('Please select bank')

const accountNumberSchema = yup
  .string()
  .required('Account number is required')
  .matches(regex.accountNumber, 'Enter a valid account number (9–18 digits)')

const confirmAccountNumberSchema = yup
  .string()
  .oneOf([yup.ref('accountNumber')], 'Account number does not match')
  .required('Please confirm account number')

const ifscCodeSchema = yup
  .string()
  .required('IFSC code is required')
  .transform((value) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  .length(11, 'IFSC code must be 11 characters')
  .matches(regex.ifsc, 'Enter a valid IFSC code')

const branchSchema = yup.string().required('Branch is required').trim()

const upiIdSchema = yup
  .string()
  .required('UPI ID is required')
  .trim()
  .matches(regex.upiId, 'Enter a valid UPI ID (e.g. name@bank)')

const vetBioSchema = yup
  .string()
  .required('Professional bio is required')
  .test(
    'no-phone-number',
    'Phone numbers are not allowed in bio',
    (value) => !value || !regex.phoneRegex.test(value),
  )
  .test(
    'no-social-links',
    'Social handles and links are not allowed in bio',
    (value) =>
      !value || (!regex.socialRegex.test(value) && !regex.urlRegex.test(value)),
  )
  .test(
    'no-blocked-words',
    'Clinic names, social handles, and brand names are not allowed',
    (value) => {
      if (!value) return true

      return !blockedWords.some((word) =>
        value.toLowerCase().includes(word.toLowerCase()),
      )
    },
  )

const vetFullNameSchema = yup.string().required('Full name is required').trim()

const citySchema = yup.string().required('City is required').trim()

const stateSchema = yup.string().required('State is required').trim()

const addressLine1Schema = yup
  .string()
  .required('Address line 1 is required')
  .trim()

const addressLine2Schema = yup.string().optional().trim()

const vciRegistrationNoSchema = yup
  .string()
  .trim()
  .required('VCI registration number is required')
  .max(20, 'VCI registration number must not exceed 20 characters')
const profileImageUrlSchema = yup
  .string()
  .nullable()
  .required('Profile photo is required')

const specializationSchema = yup
  .string()
  .required('Specialization is required')
  .trim()

const yearsOfExperienceSchema = yup
  .string()
  .required('Years of experience is required')
  .matches(/^\d+$/, 'Must be a number')
  .test('min', 'Must be at least 0', (v) => Number(v) >= 0)

const qualificationSchema = yup
  .string()
  .required('Qualification is required')
  .trim()

const speciesTreatedSchema = yup
  .array()
  .of(yup.string().required())
  .min(1, 'Select at least one species')
  .required()

const languagesSchema = yup
  .array()
  .of(yup.string().required())
  .min(1, 'Select at least one language')
  .required()

const vciCertificateSchema = yup
  .string()
  .nullable()
  .required('VCI Certificate is required')
  .test(
    'uploaded-url',
    'Please wait for the document to finish uploading',
    (_value, context) => !(context.originalValue instanceof File),
  )

const degreeCertificateSchema = yup
  .string()
  .nullable()
  .required('Degree Certificate is required')
  .test(
    'uploaded-url',
    'Please wait for the document to finish uploading',
    (_value, context) => !(context.originalValue instanceof File),
  )

const governmentIdSchema = yup
  .string()
  .nullable()
  .required('Government ID is required')
  .test(
    'uploaded-url',
    'Please wait for the document to finish uploading',
    (_value, context) => !(context.originalValue instanceof File),
  )

const otherDocumentsSchema = yup.array().optional()
const optionalDateSchema = yup.string().nullable().optional()
const governmentIdTypeSchema = yup.string().nullable().optional()
const stripHtml = (value?: string) =>
  (value ?? '').replace(/<[^>]*>/g, '').trim()

const requiredRichTextSchedma = (
  fieldLabel: string,
  minChars = 20,
  maxChars = 500,
) =>
  yup
    .string()
    .required(`${fieldLabel} is required`)
    .test(
      'not-empty-html',
      `${fieldLabel} is required`,
      (value) => stripHtml(value).length > 0,
    )
    .test(
      'min-chars',
      `${fieldLabel} must be at least ${minChars} characters`,
      (value) => stripHtml(value).length >= minChars,
    )
    .test(
      'max-chars',
      `${fieldLabel} must not exceed ${maxChars} characters`,
      (value) => stripHtml(value).length <= maxChars,
    )

const startDateSchema = yup
  .string()
  .required('Start date is required')
  .test('today-or-future', 'Start date cannot be in the past', (value) => {
    if (!value) return true

    const selected = new Date(value)
    selected.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return selected >= today
  })
export const textareaSchema = (maxLength = 500) =>
  yup
    .string()
    .trim()
    .required('Reason is required')
    .max(maxLength, `Reason cannot exceed ${maxLength} characters`)

const treatmentPlanTitleSchema = yup
  .string()
  .trim()
  .required('Title is required')
  .max(200, 'Title must be at most 200 characters')

const dietaryRecommendationsSchema = yup
  .string()
  .trim()
  .max(1000, 'Dietary recommendations must be at most 1000 characters')

const activityRestrictionsSchema = yup
  .string()
  .trim()
  .max(1000, 'Activity restrictions must be at most 1000 characters')

const monitoringInstructionsSchema = yup
  .string()
  .trim()
  .max(1000, 'Monitoring instructions must be at most 1000 characters')

const followUpOffsetDaysSchema = yup
  .string()
  .required('Follow-up days is required')
  .matches(/^\d+$/, 'Enter a valid number of days')
  .test(
    'min-days',
    'Follow-up must be at least 1 day',
    (value) => Number(value) >= 1,
  )
  .test(
    'max-days',
    'Follow-up must be at most 365 days',
    (value) => Number(value) <= 365,
  )

const whenToSeekInPersonCareSchema = yup
  .string()
  .trim()
  .required('When to seek in-person care is required')
  .max(1000, 'When to seek in-person care must be at most 1000 characters')

const genderSchema = yup
  .string()
  .oneOf(['Male', 'Female'], 'Gender is required')
  .required('Gender is required')

const petNameSchema = yup.string().trim().required('Pet name is required')

const onboardingPetNameSchema = yup
  .string()
  .trim()
  .required('Pet name is required')
  .min(2, 'Pet name must be at least 2 characters')
  .max(30, 'Pet name must be at most 30 characters')

const onboardingPetBreedSchema = yup
  .string()
  .trim()
  .required('Breed is required')
  .max(80, 'Breed is too long')

const onboardingPetPhotoSchema = yup
  .string()
  .nullable()
  .required('Pet photo is required')

const onboardingDateOfBirthSchema = yup
  .string()
  .trim()
  .required('Date of birth is required')

const petSpeciesSchema = yup
  .string()
  .oneOf(['dog', 'cat'], 'Species is required')
  .required('Species is required')

const petBreedSchema = yup.string().trim().required('Breed is required')

const sexSchema = yup
  .string()
  .oneOf(['Male', 'Female'], 'Sex is required')
  .required('Sex is required')

const petNeuteredSchema = yup
  .boolean()
  .typeError('Neutered is required')
  .required('Neutered is required')

const petDateOfBirthSchema = yup.string().optional()

const petWeightSchema = yup
  .string()
  .trim()
  .required('Current weight is required')
  .test('positive-weight', 'Enter a valid weight', (value) => {
    if (!value) return false
    const weight = Number(value)
    return Number.isFinite(weight) && weight > 0
  })

const petMicrochipNumberSchema = yup
  .string()
  .trim()
  .max(32, 'Microchip number is too long')
  .optional()

const petAllergiesSchema = yup.string().trim().optional()

const petExistingConditionsSchema = yup.string().trim().optional()

const petProfileImageUrlSchema = yup.string().nullable().optional()

export const validationSchema = {
  mobile: mobileSchema,
  otp: otpSchema,
  password: passwordSchema,
  email: emailSchema,
  montlyPrice: monthlyPriceSchema,
  anuualPrice: annualPriceSchema,
  consultMonth: consultperMonthSchema,
  fairUseCap: fairUseCapSchema,
  sessionDuration: sessionDurationShema,
  sla: slaSchema,
  effectiveDate: effectiveDateSchema,
  role: roleSchema,
  holdReason: holdReasonSchema,
  rejectionReason: holdReasonSchema,
  modifyMessage: holdReasonSchema,
  drugName: drugNameSchema,
  genericName: genericNameSchema,
  manufacturerName: manufacturerNameSchema,
  strengthPower: strengthPowerSchema,
  featureFlagKey: featureFlagKeySchema,
  featureFlagValue: featureFlagValueSchema,
  featureFlagValueJson: featureFlagValueJsonSchema,
  medicineCategoryId: medicineCategoryIdSchema,
  schedule: scheduleSchema,
  species: speciesSchema,
  speciesName: speciesNameSchema,
  breedName: breedNameSchema,
  categoryName: categoryNameSchema,
  specializationCode: specializationCodeSchema,
  specializationName: specializationNameSchema,
  intakeConcernCode: intakeConcernCodeSchema,
  intakeConcernName: intakeConcernNameSchema,
  breed: breedSchema,
  vaccinationName: vaccinationNameSchema,
  vaccinationMasterId: vaccinationMasterIdSchema,
  administeredAt: administeredAtSchema,
  nextDueAt: nextDueAtSchema,
  vaccinationCertificate: vaccinationCertificateSchema,
  sortOrder: sortOrderSchema,
  optionalSpeciesId: optionalSpeciesIdSchema,
  optionalBreedId: optionalBreedIdSchema,
  clinicalNotes: clinicalNotesSchema,
  fullName: fullNameSchema,
  profileName: profileNameSchema,
  bank: bankSchema,
  accountNumber: accountNumberSchema,
  confirmAccountNumber: confirmAccountNumberSchema,
  ifscCode: ifscCodeSchema,
  branch: branchSchema,
  upiId: upiIdSchema,
  vetBio: vetBioSchema,
  vetFullName: vetFullNameSchema,
  city: citySchema,
  state: stateSchema,
  addressLine1: addressLine1Schema,
  addressLine2: addressLine2Schema,
  vciRegistrationNo: vciRegistrationNoSchema,
  profileImageUrl: profileImageUrlSchema,
  specialization: specializationSchema,
  yearsOfExperience: yearsOfExperienceSchema,
  qualification: qualificationSchema,
  speciesTreated: speciesTreatedSchema,
  languages: languagesSchema,
  vciCertificate: vciCertificateSchema,
  degreeCertificate: degreeCertificateSchema,
  governmentId: governmentIdSchema,
  otherDocuments: otherDocumentsSchema,
  optionalDate: optionalDateSchema,
  governmentIdType: governmentIdTypeSchema,
  richtextSchema: requiredRichTextSchedma,
  startDate: startDateSchema,
  textarea: textareaSchema,
  treatmentPlanTitle: treatmentPlanTitleSchema,
  dietaryRecommendations: dietaryRecommendationsSchema,
  activityRestrictions: activityRestrictionsSchema,
  monitoringInstructions: monitoringInstructionsSchema,
  followUpOffsetDays: followUpOffsetDaysSchema,
  whenToSeekInPersonCare: whenToSeekInPersonCareSchema,
  gender: genderSchema,
  pet_name: petNameSchema,
  onboarding_pet_name: onboardingPetNameSchema,
  onboarding_pet_breed: onboardingPetBreedSchema,
  onboarding_pet_photo: onboardingPetPhotoSchema,
  onboarding_date_of_birth: onboardingDateOfBirthSchema,
  pet_species: petSpeciesSchema,
  pet_breed: petBreedSchema,
  pet_sex: sexSchema,
  sex: sexSchema,
  is_neutered: petNeuteredSchema,
  date_of_birth: petDateOfBirthSchema,
  weight_kg: petWeightSchema,
  microchip_number: petMicrochipNumberSchema,
  allergies: petAllergiesSchema,
  existing_conditions: petExistingConditionsSchema,
  profile_image_url: petProfileImageUrlSchema,
}
