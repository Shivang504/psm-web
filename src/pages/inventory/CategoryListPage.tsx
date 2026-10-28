import { Pencil, Power, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { InputField } from '@/components/atoms/InputField'
import { StatusPill } from '@/components/atoms/StatusPill'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import useFormHandler from '@/hooks/useFormHandler'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  clearInventorySave,
  fetchCategories,
  fetchCategoriesFailure,
  fetchCategoriesSuccess,
  finishInventoryAction,
  saveInventory,
  saveInventoryFailure,
  saveInventorySuccess,
  startInventoryAction,
} from '@/store/slices/inventorySlice'
import { displayValue } from '@/utils/helper'
import { validationSchema } from '@/utils/validationSchema'
import type { CategoryListResponse, CategoryRecord } from '@/utils/types'
import { InventoryFrame } from './InventoryTabs'
import { isActiveStatus, nextStatus, readCategories } from './inventoryModel'
import { usePagedItems } from './usePagedItems'

const categorySchema = yup.object({
  name: validationSchema.categoryName,
})

function CategoryFormDialog({
  category,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  category: CategoryRecord | null
  saving: boolean
  error: string
  onClose: () => void
  onSubmit: (name: string) => void
}) {
  const methods = useFormHandler<{ name: string }>({
    schema: categorySchema,
    defaultValues: { name: category?.category_name ?? '' },
  })

  return (
    <Dialog
      open
      title={category ? 'Edit category' : 'Add category'}
      onClose={onClose}
      closeOnOutsideClick={!saving}
      panelClassName="max-w-lg"
    >
      <FormProvider {...methods}>
        <form
          className="mt-4 space-y-4"
          onSubmit={methods.handleSubmit((values) => onSubmit(values.name))}
          noValidate
        >
          {error ? (
            <p className="rounded-[12px] bg-red-50 px-3 py-2 text-xs text-[#DC2626]">
              {error}
            </p>
          ) : null}
          <InputField<{ name: string }>
            name="name"
            label="Category name"
            placeholder="Enter category name"
            isRequired
          />
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : category ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default function CategoryListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(
    (state) => state.inventory.categories,
  )
  const { saving, saveError, actionLoading } = useAppSelector(
    (state) => state.inventory,
  )
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<CategoryRecord | null | undefined>(
    undefined,
  )
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null)
  const savingRef = useRef(false)
  const match = useCallback(
    (item: CategoryRecord, query: string) =>
      item.category_name.toLowerCase().includes(query),
    [],
  )
  const pageState = usePagedItems(items, search, match)

  const load = useCallback(() => {
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
  }, [dispatch])

  useEffect(() => {
    dispatch(clearInventorySave())
    load()
  }, [dispatch, load])

  useEffect(() => {
    if (savingRef.current && !saving && !saveError) {
      setEditor(undefined)
      load()
    }
    savingRef.current = saving
  }, [load, saveError, saving])

  const columns: ColumnType<CategoryRecord>[] = useMemo(
    () => [
      {
        key: 'category_name',
        label: 'Category name',
        width: '2fr',
        render: (row) => (
          <span className="font-semibold text-[#1E1B4B]">
            {displayValue(row.category_name)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '1fr',
        render: (row) => <StatusPill status={row.status} />,
      },
    ],
    [],
  )

  const actions: ActionType<CategoryRecord>[] = useMemo(
    () => [
      {
        label: 'Edit',
        icon: Pencil,
        onClick: (row) => {
          dispatch(clearInventorySave())
          setEditor(row)
        },
      },
      {
        label: 'Status',
        icon: Power,
        title: (row) =>
          isActiveStatus(row.status) ? 'Deactivate' : 'Activate',
        onClick: (row) => {
          dispatch(startInventoryAction())
          dispatch({
            type: sagaActions.UPDATE_CATEGORY,
            payload: {
              query: `/categories/${row.id}`,
              method: 'PUT',
              showToast: true,
              successMessage: 'Category status updated',
              variables: {
                category_name: row.category_name,
                status: nextStatus(row.status),
              },
              onSuccess: () => {
                dispatch(finishInventoryAction())
                load()
              },
              onFailure: () => dispatch(finishInventoryAction()),
            },
          })
        },
      },
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'danger',
        onClick: setDeleteTarget,
      },
    ],
    [dispatch, load],
  )

  return (
    <InventoryFrame
      title="Category"
      subtitle={`${pageState.total} categories`}
      actionLabel="Create category"
      onAction={() => {
        dispatch(clearInventorySave())
        setEditor(null)
      }}
    >
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search category"
      />
      <DataTable
        columns={columns}
        data={pageState.pageItems}
        actions={actions}
        loading={loading}
        error={error ? 'The category list could not be loaded.' : null}
        onRetry={load}
        page={pageState.page}
        pageSize={pageState.limit}
        totalItems={pageState.total}
        totalPages={pageState.totalPages}
        onPageChange={pageState.setPage}
        onPageSizeChange={pageState.setLimit}
        emptyMessage="No categories found."
        minWidth="640px"
      />

      {editor !== undefined ? (
        <CategoryFormDialog
          key={editor?.id ?? 'new'}
          category={editor}
          saving={saving}
          error={saveError}
          onClose={() => setEditor(undefined)}
          onSubmit={(name) => {
            const trimmed = name.trim()
            dispatch(saveInventory())
            dispatch({
              type: editor
                ? sagaActions.UPDATE_CATEGORY
                : sagaActions.ADD_CATEGORY,
              payload: {
                query: editor ? `/categories/${editor.id}` : '/categories',
                method: editor ? 'PUT' : 'POST',
                showToast: true,
                successMessage: editor ? 'Category updated' : 'Category added',
                variables: editor
                  ? {
                      category_name: trimmed,
                      status: editor.status || 'Active',
                    }
                  : { category_name: trimmed },
                onSuccess: () => dispatch(saveInventorySuccess()),
                onFailure: (message: string) =>
                  dispatch(saveInventoryFailure(message)),
              },
            })
          }}
        />
      ) : null}

      <Dialog
        title="Delete category"
        label="Delete"
        open={Boolean(deleteTarget)}
        loading={actionLoading}
        onClose={() => setDeleteTarget(null)}
        handleSubmit={() => {
          if (!deleteTarget) return
          dispatch(startInventoryAction())
          dispatch({
            type: sagaActions.DELETE_CATEGORY,
            payload: {
              query: `/categories/${deleteTarget.id}`,
              method: 'DELETE',
              showToast: true,
              successMessage: 'Category deleted',
              onSuccess: () => {
                dispatch(finishInventoryAction())
                setDeleteTarget(null)
                load()
              },
              onFailure: () => dispatch(finishInventoryAction()),
            },
          })
        }}
      >
        <p>
          Delete {deleteTarget?.category_name ?? 'this category'}? This cannot
          be undone.
        </p>
      </Dialog>
    </InventoryFrame>
  )
}
