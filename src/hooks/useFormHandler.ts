import { yupResolver } from '@hookform/resolvers/yup'
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import type { AnyObjectSchema } from 'yup'

interface UseFormHandlerProps<T extends FieldValues> {
  schema: AnyObjectSchema
  defaultValues: DefaultValues<T>
}

const useFormHandler = <T extends FieldValues>({
  schema,
  defaultValues,
}: UseFormHandlerProps<T>): UseFormReturn<T> => {
  return useForm<T>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  })
}

export default useFormHandler
