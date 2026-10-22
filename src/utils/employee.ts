import type {
  AppRole,
  DesignationListResponse,
  EmployeeFormOptions,
  EmployeeFormValues,
  RegionItem,
  RegionsResponse,
  RolesResponse,
  UserByIdResponse,
  UserConfig,
  UserListItem,
  UserListQuery,
} from './types'

function isRole(value: unknown): value is AppRole {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.id === 'string' && typeof record.role === 'string'
}

export function readRoles(data: RolesResponse['data']): AppRole[] {
  const roles = data?.Roles
  if (Array.isArray(roles)) return roles.filter(isRole)
  if (roles && Array.isArray(roles.role)) return roles.role.filter(isRole)
  return []
}

export function findRoleId(roles: AppRole[], name: string): string {
  return (
    roles.find((item) => item.role.toLowerCase() === name.toLowerCase())?.id ??
    ''
  )
}

function readLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item === 'string') {
      const text = item.trim()
      return text ? [text] : []
    }

    if (typeof item === 'object' && item !== null) {
      const record = item as Record<string, unknown>
      for (const key of ['name', 'territory', 'label', 'region']) {
        const entry = record[key]
        if (typeof entry === 'string' && entry.trim()) return [entry.trim()]
      }
    }

    return []
  })
}

export function readRegions(data: RegionsResponse['data']): RegionItem[] {
  const regions = data?.Regions?.region
  if (!Array.isArray(regions)) return []

  return regions.flatMap((item) => {
    if (!item || typeof item.id !== 'string') return []
    const region = typeof item.region === 'string' ? item.region.trim() : ''
    return region ? [{ id: item.id, region }] : []
  })
}

export function readFormOptions(
  regions: RegionItem[],
  territoryData: unknown,
): EmployeeFormOptions {
  const source =
    territoryData &&
    typeof territoryData === 'object' &&
    !Array.isArray(territoryData)
      ? (territoryData as Record<string, unknown>)
      : {}
  const generalManagers = readLabels(source.general_managers)
  const territoryOptions = Array.isArray(territoryData)
    ? readLabels(territoryData)
    : readLabels(source.territories)

  return {
    regions,
    locationOptions: readLabels(source.regional_managers),
    stateOptions: readLabels(source.zonal_managers),
    regionOptions: generalManagers.length
      ? generalManagers
      : regions.map((item) => item.region),
    territoryOptions,
  }
}

export function readEmployeeRecord(
  data: UserByIdResponse['data'],
): UserListItem | null {
  const user = data?.user
  if (Array.isArray(user)) return user[0] ?? null
  return user ?? null
}

export function readConfig(config: unknown): UserConfig {
  if (!config || typeof config !== 'object') {
    if (typeof config !== 'string') return {}
    try {
      const parsed: unknown = JSON.parse(config)
      if (parsed && typeof parsed === 'object') return parsed as UserConfig
    } catch {
      return {}
    }
    return {}
  }

  return config as UserConfig
}

export function buildEmployeeConfig(
  values: EmployeeFormValues,
  regions: RegionItem[],
  existing?: UserConfig,
) {
  const region = regions.find(
    (item) =>
      item.region === values.regionName || item.id === values.regionName,
  )

  return {
    ...existing,
    regionName: values.regionName.trim(),
    territories: values.territories.trim(),
    regionID: region?.id || existing?.regionID || values.regionName.trim(),
    employeeCode: values.employeeCode.trim(),
    location: values.location.trim(),
    state: values.state.trim(),
    hierarchy: existing?.hierarchy ?? {
      parent: [],
      child: [],
      vendor: [],
    },
  }
}

export function readDesignations(data: DesignationListResponse['data']) {
  return data?.Designations?.designation ?? []
}

export function userListParams(query: UserListQuery) {
  const params: Record<string, string | number | boolean> = {
    role: query.role,
    region: 'undefined',
    limit: query.limit,
    page: query.page,
    sort: query.sort,
    column: query.column,
  }

  if (query.designation && query.designation !== query.role) {
    params.designation = query.designation
  }
  if (query.search) {
    params.searchText = query.search
    params.fieldname = 'first_name,last_name,contact_no'
  }
  if (query.tab === 'Deleted') params.deleted = true
  else params.status = query.tab

  return params
}
