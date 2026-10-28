import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  CategoryRecord,
  Designation,
  InventoryProduct,
  PackageRecord,
  PriceRecord,
  RegionItem,
  StockRecord,
  VendorRecord,
} from '@/utils/types'
import { logout } from './authSlice'

interface ResourceState<T> {
  items: T[]
  loading: boolean
  loaded: boolean
  error: string
}

function resource<T>(): ResourceState<T> {
  return { items: [], loading: false, loaded: false, error: '' }
}

export interface InventoryState {
  categories: ResourceState<CategoryRecord>
  products: ResourceState<InventoryProduct>
  stocks: ResourceState<StockRecord>
  prices: ResourceState<PriceRecord>
  packages: PackageRecord[]
  packagesLoading: boolean
  packagesLoaded: boolean
  designations: Designation[]
  regions: RegionItem[]
  vendors: VendorRecord[]
  vendorRoleId: string
  lookupsLoading: boolean
  lookupsLoaded: boolean
  lookupsError: string
  saving: boolean
  saveError: string
  actionLoading: boolean
}

const initialState: InventoryState = {
  categories: resource(),
  products: resource(),
  stocks: resource(),
  prices: resource(),
  packages: [],
  packagesLoading: false,
  packagesLoaded: false,
  designations: [],
  regions: [],
  vendors: [],
  vendorRoleId: '',
  lookupsLoading: false,
  lookupsLoaded: false,
  lookupsError: '',
  saving: false,
  saveError: '',
  actionLoading: false,
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    fetchCategories: (state) => {
      state.categories.loading = true
      state.categories.error = ''
    },
    fetchCategoriesSuccess: (
      state,
      action: PayloadAction<CategoryRecord[]>,
    ) => {
      state.categories.loading = false
      state.categories.loaded = true
      state.categories.items = action.payload
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.categories.loading = false
      state.categories.loaded = true
      state.categories.items = []
      state.categories.error = action.payload
    },
    fetchProducts: (state) => {
      state.products.loading = true
      state.products.error = ''
    },
    fetchProductsSuccess: (
      state,
      action: PayloadAction<InventoryProduct[]>,
    ) => {
      state.products.loading = false
      state.products.loaded = true
      state.products.items = action.payload
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.products.loading = false
      state.products.loaded = true
      state.products.items = []
      state.products.error = action.payload
    },
    fetchStocks: (state) => {
      state.stocks.loading = true
      state.stocks.error = ''
    },
    fetchStocksSuccess: (state, action: PayloadAction<StockRecord[]>) => {
      state.stocks.loading = false
      state.stocks.loaded = true
      state.stocks.items = action.payload
    },
    fetchStocksFailure: (state, action: PayloadAction<string>) => {
      state.stocks.loading = false
      state.stocks.loaded = true
      state.stocks.items = []
      state.stocks.error = action.payload
    },
    fetchPrices: (state) => {
      state.prices.loading = true
      state.prices.error = ''
    },
    fetchPricesSuccess: (state, action: PayloadAction<PriceRecord[]>) => {
      state.prices.loading = false
      state.prices.loaded = true
      state.prices.items = action.payload
    },
    fetchPricesFailure: (state, action: PayloadAction<string>) => {
      state.prices.loading = false
      state.prices.loaded = true
      state.prices.items = []
      state.prices.error = action.payload
    },
    fetchPackages: (state) => {
      state.packagesLoading = true
    },
    fetchPackagesSuccess: (state, action: PayloadAction<PackageRecord[]>) => {
      state.packagesLoading = false
      state.packagesLoaded = true
      state.packages = action.payload
    },
    fetchPackagesFailure: (state) => {
      state.packagesLoading = false
      state.packagesLoaded = true
      state.packages = []
    },
    fetchLookups: (state) => {
      state.lookupsLoading = true
      state.lookupsError = ''
    },
    fetchLookupsSuccess: (
      state,
      action: PayloadAction<{
        designations?: Designation[]
        regions?: RegionItem[]
        vendors?: VendorRecord[]
        vendorRoleId?: string
      }>,
    ) => {
      state.lookupsLoading = false
      state.lookupsLoaded = true
      if (action.payload.designations) {
        state.designations = action.payload.designations
      }
      if (action.payload.regions) state.regions = action.payload.regions
      if (action.payload.vendors) state.vendors = action.payload.vendors
      if (action.payload.vendorRoleId !== undefined) {
        state.vendorRoleId = action.payload.vendorRoleId
      }
    },
    fetchLookupsFailure: (state, action: PayloadAction<string>) => {
      state.lookupsLoading = false
      state.lookupsLoaded = true
      state.lookupsError = action.payload
    },
    saveInventory: (state) => {
      state.saving = true
      state.saveError = ''
    },
    saveInventorySuccess: (state) => {
      state.saving = false
      state.saveError = ''
    },
    saveInventoryFailure: (state, action: PayloadAction<string>) => {
      state.saving = false
      state.saveError = action.payload
    },
    clearInventorySave: (state) => {
      state.saving = false
      state.saveError = ''
    },
    startInventoryAction: (state) => {
      state.actionLoading = true
    },
    finishInventoryAction: (state) => {
      state.actionLoading = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchCategories,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchProducts,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchStocks,
  fetchStocksSuccess,
  fetchStocksFailure,
  fetchPrices,
  fetchPricesSuccess,
  fetchPricesFailure,
  fetchPackages,
  fetchPackagesSuccess,
  fetchPackagesFailure,
  fetchLookups,
  fetchLookupsSuccess,
  fetchLookupsFailure,
  saveInventory,
  saveInventorySuccess,
  saveInventoryFailure,
  clearInventorySave,
  startInventoryAction,
  finishInventoryAction,
} = inventorySlice.actions

export default inventorySlice.reducer
