import type {
  CategoryListResponse,
  CategoryRecord,
  InventoryProduct,
  InventoryProductListResponse,
  PackageListResponse,
  PackageRecord,
  PriceFormValues,
  PriceListResponse,
  PriceRecord,
  ProductFormValues,
  RegionItem,
  StockFormValues,
  StockListResponse,
  StockRecord,
  VendorRecord,
} from '@/utils/types'
import { readVendorConfig } from '@/pages/vendors/vendorModel'

export function isActiveStatus(status?: string | null) {
  const value = status?.trim().toLowerCase()
  return value === 'active' || value === '1'
}

export function nextStatus(status?: string | null) {
  return isActiveStatus(status) ? 'Inactive' : 'Active'
}

export function readCategories(data: CategoryListResponse['data']) {
  const categories = data?.categories
  if (Array.isArray(categories)) return categories
  return categories?.category ?? []
}

export function readProducts(data: InventoryProductListResponse['data']) {
  return data?.productList?.products ?? []
}

export function readPackages(data: PackageListResponse['data']) {
  return data?.packages?.packageData ?? []
}

export function readStocks(data: StockListResponse['data']): StockRecord[] {
  return (data?.stockList?.stocks ?? []).map((stock) => ({
    ...stock,
    id: stock.stock_id || stock.id,
  }))
}

export function readPrices(data: PriceListResponse['data']) {
  return data?.priceList?.price ?? []
}

export function displayDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}-${month}-${date.getFullYear()}`
}

export function activeCategories(
  categories: CategoryRecord[],
  currentName?: string,
) {
  return categories.filter(
    (item) => isActiveStatus(item.status) || item.category_name === currentName,
  )
}

export function activePackages(
  packages: PackageRecord[],
  currentName?: string,
) {
  return packages.filter(
    (item) =>
      isActiveStatus(item.config?.status) || item.package_name === currentName,
  )
}

export function activeProducts(
  products: InventoryProduct[],
  current?: { name?: string | null; hsn?: string | null },
) {
  return products.filter(
    (item) =>
      isActiveStatus(item.status) ||
      item.product_name === current?.name ||
      item.product_hsncode === current?.hsn,
  )
}

export function toProductForm(
  product: InventoryProduct | null,
  designations: { designation: string }[],
): ProductFormValues {
  return {
    productName: product?.product_name ?? '',
    hsnCode: product?.product_hsncode ?? '',
    categoryName: product?.category_name ?? '',
    packageName: product?.config?.package ?? '',
    mrp: product?.mrp == null ? '' : String(product.mrp),
    vendorPrices: designations.map((item) => ({
      designation: item.designation,
      price:
        product?.config?.vendorPrices?.[item.designation] == null
          ? ''
          : String(product.config.vendorPrices[item.designation]),
      packages: (product?.config?.vendorPackages?.[item.designation] ?? [])
        .map((entry) => entry.package_name)
        .filter((name): name is string => Boolean(name)),
    })),
  }
}

export function productBody(
  values: ProductFormValues,
  categories: CategoryRecord[],
  packages: PackageRecord[],
) {
  const category = categories.find(
    (item) => item.category_name === values.categoryName,
  )
  const selectedPackage = packages.find(
    (item) => item.package_name === values.packageName,
  )
  const vendorPrices: Record<string, string> = {}
  const vendorPackages: Record<
    string,
    { packageId: string; package_name: string; qty: number | string }[]
  > = {}

  values.vendorPrices.forEach((row) => {
    vendorPrices[row.designation] = row.price.trim()
    vendorPackages[row.designation] = row.packages.map((name) => {
      const match = packages.find((item) => item.package_name === name)
      return {
        packageId: match?.id ?? '',
        package_name: match?.package_name ?? name,
        qty: match?.config?.quantityOfPackage ?? '',
      }
    })
  })

  return {
    name: values.productName.trim(),
    hsncode: values.hsnCode.trim(),
    mrp: values.mrp.trim(),
    categoryId: category?.id ?? '',
    config: {
      package: values.packageName,
      packageId: selectedPackage?.id ?? '',
      quantityOfPackage: selectedPackage?.config?.quantityOfPackage ?? '',
      vendorPrices,
      vendorPackages,
    },
  }
}

export function stockCreateBody(
  values: StockFormValues,
  products: InventoryProduct[],
) {
  return values.lines.map((line) => {
    const product = products.find(
      (item) => item.product_name === line.productName,
    )
    const row: { productId: string; quantity: string; batch_code?: string } = {
      productId: product?.id ?? '',
      quantity: line.quantity.trim(),
    }
    const batch = line.batchCode.trim()
    if (batch) row.batch_code = batch
    return row
  })
}

export function companyOptionValue(vendor: VendorRecord) {
  const company = readVendorConfig(vendor.config).company ?? ''
  return `${company}|${vendor.id}`
}

export function toPriceForm(
  price: PriceRecord | null,
  vendors: VendorRecord[],
): PriceFormValues {
  const basedOn =
    price?.config?.priceList_basedOn === 'Product' ? 'Product' : 'SKN/HSN Code'
  const vendor =
    vendors.find((item) => item.id === price?.config?.vendor_id) ??
    vendors.find(
      (item) =>
        readVendorConfig(item.config).company === price?.config?.company_name,
    )

  return {
    basedOn,
    regionName: price?.region ?? '',
    vendorType: price?.config?.vendor_type ?? '',
    company: vendor
      ? companyOptionValue(vendor)
      : price?.config?.company_name && price.config.vendor_id
        ? `${price.config.company_name}|${price.config.vendor_id}`
        : '',
    productName: price?.config?.product_name ?? '',
    hsnCode: price?.config?.HSN_CODE ?? '',
    price: price?.price == null ? '' : String(price.price),
  }
}

export function priceBody(values: PriceFormValues, regions: RegionItem[]) {
  const region = regions.find((item) => item.region === values.regionName)
  const [companyName, vendorId] = values.company.split('|')
  const byProduct = values.basedOn === 'Product'

  return {
    region: region?.id ?? '',
    price: values.price.trim(),
    config: {
      vendor_type: values.vendorType,
      company_name: companyName,
      vendor_id: vendorId,
      HSN_CODE: byProduct ? null : values.hsnCode,
      product_name: byProduct ? values.productName : null,
      priceList_basedOn: values.basedOn,
    },
  }
}
