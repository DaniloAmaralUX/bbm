import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TRListPage } from '@/features/documents'
import {
  trNatureValues,
  trStatusValues,
  trUnitValues,
} from '@/features/documents/data/schema'

const trSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z.array(z.enum(trStatusValues)).optional().catch([]),
  unit: z.array(z.enum(trUnitValues)).optional().catch([]),
  nature: z.array(z.enum(trNatureValues)).optional().catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/documentos/')({
  validateSearch: trSearchSchema,
  component: TRListPage,
})
