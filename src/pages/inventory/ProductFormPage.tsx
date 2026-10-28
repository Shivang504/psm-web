import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/atoms/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearInventorySave,
  fetchCategories,
  fetchCategoriesFailure,
  fetchCategoriesSuccess,
  fetchLookups,
  fetchLookupsFailure,
  fetchLookupsSuccess,
  fetchPackages,
  fetchPackagesFailure,
  fetchPackagesSuccess,
  fetchProducts,
  fetchProductsFailure,
  fetchProductsSuccess,
  saveInventory,
  saveInventoryFailure,
  saveInventorySuccess,
} from '@/store/slices/inventorySlice'
import { readDesignations } from '@/utils/employee'
import type {
  CategoryListResponse,
  DesignationListResponse,
  InventoryProductListResponse,
  PackageListResponse,
  ProductFormValues,
} from '@/utils/types'
import {
  productBody,
  readCategories,
  readPackages,
  readProducts,
  toProductForm,
} from './inventoryModel'
import { ProductForm } from './ProductForm'

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    categories,
    products,
    packages,
    packagesLoaded,
    designations,
    lookupsLoaded,
    lookupsError,
    saving,
    saveError,
  } = useAppSelector((state) => state.inventory)
  const savingRef = useRef(false)
  const product = products.items.find((item) => item.id === id) ?? null
  const ready =
    categories.loaded && products.loaded && packagesLoaded && lookupsLoaded

  useEffect(() => {
    dispatch(clearInventorySave())
    dispatch(fetchCategories())
    dispatch({
      type: sagaActions.GET_CATEGORIES,
      payload: {
        query: '/categories',
        method: 'GET',
        onSuccess: (response: CategoryListResponse) => {
          dispatch(fetchCategoriesSuccess(readCategories(response.data)))
        },
        onFailure: (message: string) => {
          dispatch(fetchCategoriesFailure(message))
        },
      },
    })
    dispatch(fetchProducts())
    dispatch({
      type: sagaActions.GET_INVENTORY_PRODUCTS,
      payload: {
        query: '/products',
        method: 'GET',
        onSuccess: (response: InventoryProductListResponse) => {
          dispatch(fetchProductsSuccess(readProducts(response.data)))
        },
        onFailure: (message: string) => {
          dispatch(fetchProductsFailure(message))
        },
      },
    })
    dispatch(fetchPackages())
    dispatch({
      type: sagaActions.GET_PACKAGES,
      payload: {
        query: '/packages',
        method: 'GET',
        onSuccess: (response: PackageListResponse) => {
          dispatch(fetchPackagesSuccess(readPackages(response.data)))
        },
        onFailure: () => {
          dispatch(fetchPackagesFailure())
        },
      },
    })
    dispatch(fetchLookups())
    dispatch({
      type: sagaActions.GET_DESIGNATIONS,
      payload: {
        query: '/designations/',
        method: 'GET',
        variables: { dept: 'vendor' },
        onSuccess: (response: DesignationListResponse) => {
          dispatch(
            fetchLookupsSuccess({
              designations: readDesignations(response.data),
            }),
          )
        },
        onFailure: (message: string) => {
          dispatch(fetchLookupsFailure(message))
        },
      },
    })
  }, [dispatch])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) {
      navigate('/inventory/products')
    }
    savingRef.current = saving
  }, [navigate, saveError, saving])

  const missingProduct = isEdit && ready && !product
  const showForm =
    ready &&
    !categories.error &&
    !products.error &&
    !lookupsError &&
    !missingProduct

  const handleSubmit = (values: ProductFormValues) => {
    dispatch(saveInventory())
    dispatch({
      type: isEdit
        ? sagaActions.UPDATE_INVENTORY_PRODUCT
        : sagaActions.ADD_INVENTORY_PRODUCT,
      payload: {
        query: isEdit ? `/products/${id}` : '/products',
        method: isEdit ? 'PUT' : 'POST',
        showToast: true,
        successMessage: isEdit ? 'Product updated' : 'Product added',
        variables: productBody(values, categories.items, packages),
        onSuccess: () => dispatch(saveInventorySuccess()),
        onFailure: (message: string) => dispatch(saveInventoryFailure(message)),
      },
    })
  }

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title={isEdit ? 'Edit product' : 'Add product'}
          subtitle="Product detail, vendor prices, and packages"
          extraAction={
            <button
              type="button"
              onClick={() => navigate('/inventory/products')}
              className="inline-flex h-[46px] cursor-pointer items-center gap-2 rounded-[16px] border border-white/85 bg-white/70 px-4 text-[14px] font-semibold text-[#312E81]"
            >
              <ArrowLeft className="size-4" />
              Products
            </button>
          }
        />
        {showForm ? (
          <ProductForm
            categories={categories.items}
            packages={packages}
            saving={saving}
            error={saveError}
            isEdit={isEdit}
            defaultValues={toProductForm(product, designations)}
            onCancel={() => navigate('/inventory/products')}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="glass-card flex-1 rounded-[22px] p-6">
            {categories.error ||
            products.error ||
            lookupsError ||
            missingProduct ? (
              <p className="text-sm text-[#DC2626]">
                {missingProduct
                  ? 'This product could not be found.'
                  : categories.error || products.error || lookupsError}
              </p>
            ) : (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
