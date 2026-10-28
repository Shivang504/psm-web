import { FormProvider, useFieldArray } from 'react-hook-form'
import { InputField } from '@/components/atoms/InputField'
import { SelectField } from '@/components/atoms/SelectField'
import { FormLayout } from '@/components/layout/FormLayout'
import useFormHandler from '@/hooks/useFormHandler'
import type {
  CategoryRecord,
  PackageRecord,
  ProductFormValues,
} from '@/utils/types'
import { activeCategories, activePackages } from './inventoryModel'
import { createProductSchema } from './productSchema'

type ProductFormProps = {
  categories: CategoryRecord[]
  packages: PackageRecord[]
  saving: boolean
  error: string
  isEdit: boolean
  defaultValues: ProductFormValues
  onCancel: () => void
  onSubmit: (values: ProductFormValues) => void
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="col-span-full text-[15px] font-semibold text-[#312E81]">
      {children}
    </h2>
  )
}

export function ProductForm({
  categories,
  packages,
  saving,
  error,
  isEdit,
  defaultValues,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const methods = useFormHandler<ProductFormValues>({
    schema: createProductSchema(),
    defaultValues,
  })
  const { fields } = useFieldArray({
    control: methods.control,
    name: 'vendorPrices',
  })
  const categoryName = methods.watch('categoryName')
  const packageName = methods.watch('packageName')
  const categoryOptions = activeCategories(categories, categoryName).map(
    (item) => ({ label: item.category_name, value: item.category_name }),
  )
  const packageOptions = activePackages(packages, packageName).map((item) => ({
    label: item.package_name,
    value: item.package_name,
  }))

  return (
    <FormProvider {...methods}>
      <form
        className="flex h-full min-h-0 flex-1 flex-col"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
      >
        <FormLayout
          onCancel={onCancel}
          saving={saving}
          saveText={isEdit ? 'Save product' : 'Add product'}
        >
          {error ? (
            <div className="rounded-[14px] border border-red-200 bg-red-50/80 px-4 py-3 text-xs text-[#DC2626]">
              {error}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SectionTitle>Product detail</SectionTitle>
            <InputField<ProductFormValues>
              name="productName"
              label="Product name"
              placeholder="Enter product name"
              isRequired
            />
            <InputField<ProductFormValues>
              name="hsnCode"
              label="Product HSN code"
              placeholder="Enter HSN code"
              isRequired
              maxLength={8}
            />
            <SelectField<ProductFormValues>
              name="categoryName"
              label="Product category"
              placeholder="Select category"
              isRequired
              isSearch
              options={categoryOptions}
            />
            <SelectField<ProductFormValues>
              name="packageName"
              label="Package name"
              placeholder="Select package"
              isRequired
              isSearch
              options={packageOptions}
            />
            <InputField<ProductFormValues>
              name="mrp"
              label="MRP"
              placeholder="Enter MRP"
              isRequired
            />
            {fields.length ? (
              <>
                <SectionTitle>Price for vendor</SectionTitle>
                {fields.map((field, index) => (
                  <InputField<ProductFormValues>
                    key={field.id}
                    name={`vendorPrices.${index}.price`}
                    label={field.designation}
                    placeholder="Enter price"
                    isRequired
                  />
                ))}
                <SectionTitle>Package for vendor</SectionTitle>
                {fields.map((field, index) => {
                  const selected =
                    methods.watch(`vendorPrices.${index}.packages`) ?? []
                  return (
                    <fieldset
                      key={`${field.id}-packages`}
                      className="space-y-2"
                    >
                      <legend className="text-[13px] font-semibold text-[#1E1B4B]">
                        {field.designation}
                      </legend>
                      <div className="max-h-40 space-y-1 overflow-y-auto rounded-[14px] border border-white/85 bg-white/70 p-3">
                        {packageOptions.length ? (
                          packageOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 text-[13px] text-[#312E81]"
                            >
                              <input
                                type="checkbox"
                                className="size-4 accent-[#4F46E5]"
                                checked={selected.includes(option.value)}
                                onChange={() => {
                                  const next = selected.includes(option.value)
                                    ? selected.filter(
                                        (value) => value !== option.value,
                                      )
                                    : [...selected, option.value]
                                  methods.setValue(
                                    `vendorPrices.${index}.packages`,
                                    next,
                                    { shouldDirty: true },
                                  )
                                }}
                              />
                              {option.label}
                            </label>
                          ))
                        ) : (
                          <p className="text-[13px] text-[#4C4A7A]">
                            No packages available.
                          </p>
                        )}
                      </div>
                    </fieldset>
                  )
                })}
              </>
            ) : null}
          </div>
        </FormLayout>
      </form>
    </FormProvider>
  )
}
