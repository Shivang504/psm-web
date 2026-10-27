import { displayName } from '@/utils/helper'
import type {
  Designation,
  Lead,
  LeadFormValues,
  UserListItem,
} from '@/utils/types'

const emptyValues: LeadFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  designationId: '',
  address: '',
  employeeId: '',
  leadType: '',
  origin: '',
  value: '',
  productName: '',
}

export function toLeadFormValues(
  lead: Lead | null | undefined,
  designations: Designation[],
  employees: UserListItem[],
): LeadFormValues {
  if (!lead) return emptyValues

  const designationId =
    lead.designation_id ||
    designations.find((item) => item.designation === lead.designation)?.id ||
    ''
  const employeeId =
    lead.employee_id ||
    employees.find((item) => displayName(item) === lead.config?.employee)?.id ||
    ''

  return {
    firstName: lead.first_name ?? '',
    lastName: lead.last_name ?? '',
    phone: lead.contact_no ?? '',
    company: lead.config?.company || lead.config?.companyName || '',
    designationId,
    address: lead.config?.address ?? '',
    employeeId,
    leadType: lead.config?.leadtype ?? '',
    origin: lead.config?.origin ?? '',
    value: lead.config?.valueoflead ?? '',
    productName: lead.config?.productname ?? '',
  }
}

export function leadPayload(
  values: LeadFormValues,
  designations: Designation[],
  employees: UserListItem[],
  current?: Lead | null,
) {
  const employee = employees.find((item) => item.id === values.employeeId)

  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    contact_no: values.phone.trim(),
    designation_id: designations.find(
      (item) => item.id === values.designationId,
    )?.id,
    ...(employee ? { employee_id: employee.id } : {}),
    config: {
      company: values.company.trim(),
      address: values.address.trim(),
      leadtype: values.leadType.trim(),
      origin: values.origin.trim(),
      valueoflead: values.value.trim(),
      productname: values.productName.trim(),
      employee: employee ? displayName(employee) : '',
      buyer_id: current?.config?.buyer_id ?? Date.now(),
    },
  }
}
