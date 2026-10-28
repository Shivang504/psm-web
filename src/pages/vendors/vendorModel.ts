import type { UserActivityRecord } from '@/utils/employeeDetail'
import { readConfig } from '@/utils/employee'
import type {
  Designation,
  RegionItem,
  VendorConfig,
  VendorDetailResponse,
  VendorFormValues,
  VendorListQuery,
  VendorRecord,
} from '@/utils/types'

export function vendorListParams(query: VendorListQuery) {
  const params: Record<string, string | number> = {
    role: query.role,
    page: query.page,
    limit: query.limit,
  }
  if (query.designation) params.designation = query.designation
  const search = query.search.trim()
  if (search) params.searchText = search
  return params
}

export function readVendor(data: VendorDetailResponse['data']) {
  const user = data?.user
  if (Array.isArray(user)) return user[0] ?? null
  return user ?? null
}

export function readVendorConfig(config: unknown): VendorConfig {
  return readConfig(config) as VendorConfig
}

export function readVendorOrders(activities: unknown): UserActivityRecord[] {
  if (Array.isArray(activities)) return activities as UserActivityRecord[]
  if (
    activities &&
    typeof activities === 'object' &&
    Array.isArray((activities as { order?: unknown }).order)
  ) {
    return (activities as { order: UserActivityRecord[] }).order
  }
  return []
}

export function toVendorFormValues(
  vendor: VendorRecord,
  designations: Designation[],
): VendorFormValues {
  const config = readVendorConfig(vendor.config)
  const designationId =
    vendor.designation_id ||
    designations.find((item) => item.designation === vendor.designation)?.id ||
    ''

  return {
    firstName: vendor.first_name ?? '',
    lastName: vendor.last_name ?? '',
    designation: designationId,
    phone: vendor.contact_no ?? '',
    email: vendor.email ?? '',
    birthDate: config.birthDate ?? '',
    regionName: config.regionName ?? '',
    territories: config.territories ?? '',
    company: config.company ?? '',
    address: config.address ?? '',
    gstn: config.GSTN ?? '',
    landline: config.landlineNumber ?? '',
    state: config.state ?? '',
    city: config.city ?? '',
    country: config.country ?? 'India',
    pincode: config.pincode ?? '',
    pan: config.pancardNo ?? '',
    aadhar: config.aadharNo ?? '',
    fssai: config.fssaiLicenseNo ?? '',
    bankName: config.BankName ?? '',
    bankAccount: config.BankAccountNumber ?? '',
    bankIfsc: config.BankIFSC ?? '',
  }
}

function vendorConfig(
  values: VendorFormValues,
  regions: RegionItem[],
  existing?: VendorConfig,
): VendorConfig {
  const region = regions.find(
    (item) =>
      item.region === values.regionName || item.id === values.regionName,
  )

  return {
    ...existing,
    birthDate: values.birthDate,
    regionName: values.regionName.trim(),
    regionID: region?.id || existing?.regionID || values.regionName.trim(),
    territories: values.territories.trim(),
    company: values.company.trim(),
    GSTN: values.gstn.trim().toUpperCase(),
    landlineNumber: values.landline.trim(),
    address: values.address.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    country: values.country.trim() || 'India',
    pincode: values.pincode.trim(),
    pancardNo: values.pan.trim().toUpperCase(),
    aadharNo: values.aadhar.trim(),
    fssaiLicenseNo: values.fssai.trim(),
    BankName: values.bankName.trim(),
    BankAccountNumber: values.bankAccount.trim(),
    BankIFSC: values.bankIfsc.trim().toUpperCase(),
    hierarchy: existing?.hierarchy ?? { parent: [], child: [], vendor: [] },
  }
}

export function vendorCreateBody(
  values: VendorFormValues,
  designations: Designation[],
  regions: RegionItem[],
  roleId: string,
) {
  const designation = designations.find(
    (item) => item.id === values.designation,
  )

  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    contact_no: values.phone.trim(),
    email: values.email.trim(),
    status: 'Active',
    role: 'vendor',
    role_id: roleId,
    designation: designation?.designation ?? '',
    designation_id: values.designation,
    config: vendorConfig(values, regions),
  }
}

export function vendorUpdateBody(
  values: VendorFormValues,
  vendor: VendorRecord,
  designations: Designation[],
  regions: RegionItem[],
  status = vendor.status || 'Active',
) {
  const designation = designations.find(
    (item) => item.id === values.designation,
  )

  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    contact_no: values.phone.trim(),
    email: values.email.trim(),
    status,
    role: 'vendor',
    designation: designation?.designation ?? vendor.designation ?? '',
    config: vendorConfig(values, regions, readVendorConfig(vendor.config)),
  }
}

export function vendorStatusBody(vendor: VendorRecord, status: string) {
  return {
    id: vendor.id,
    first_name: vendor.first_name ?? '',
    last_name: vendor.last_name ?? '',
    email: vendor.email ?? '',
    contact_no: vendor.contact_no ?? '',
    role: 'vendor',
    status,
    designation: vendor.designation ?? '',
    config: readVendorConfig(vendor.config),
  }
}
