import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TRListPage } from '@/features/documents'
import { chainRoleValues } from '@/features/documents/data/chain'
import {
  docTypeValues,
  trNatureValues,
  trStatusValues,
  trUnitValues,
} from '@/features/documents/data/schema'

const trSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  docType: z.array(z.enum(docTypeValues)).optional().catch([]),
  status: z.array(z.enum(trStatusValues)).optional().catch([]),
  unit: z.array(z.enum(trUnitValues)).optional().catch([]),
  nature: z.array(z.enum(trNatureValues)).optional().catch([]),
  chainRole: z.array(z.enum(chainRoleValues)).optional().catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/documentos/')({
  validateSearch: trSearchSchema,
  component: TRListPage,
})
