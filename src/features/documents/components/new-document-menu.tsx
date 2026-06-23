import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { FilePlus2, FileText, GitBranch } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { chainTypesOf } from '@/features/documents/data/doc-type'
import { useDocTypesStore } from '@/features/documents/store/use-doc-types-store'
import { useModelsStore } from '@/features/models/store/use-models-store'

/**
 * Botao "Novo documento". Quando so existe a cadeia padrao (DFD), e um link
 * direto. Havendo tipos avulsos com modelo PUBLICADO, vira um menu: a cadeia +
 * cada tipo avulso iniciavel (via `?tipo=`). Reage ao registry de tipos e a
 * publicacao de modelos. Tipos avulsos sem modelo publicado ficam de fora (nao
 * geram documento concluivel).
 */
export function NewDocumentMenu() {
  const types = useDocTypesStore((state) => state.types)
  const models = useModelsStore((state) => state.models)

  const standaloneTypes = useMemo(() => {
    const publishedIds = new Set(
      models
        .filter((model) => model.state === 'published')
        .map((model) => model.docType)
    )
    return [...types]
      .sort((a, b) => a.order - b.order)
      .filter(
        (type) =>
          chainTypesOf(type.id).length === 1 && publishedIds.has(type.id)
      )
  }, [types, models])

  if (standaloneTypes.length === 0) {
    return (
      <Button asChild className='rounded-xl'>
        <Link to='/documentos/novo'>
          <FilePlus2 aria-hidden='true' className='size-4' />
          Novo documento
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='rounded-xl'>
          <FilePlus2 aria-hidden='true' className='size-4' />
          Novo documento
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuItem asChild>
          <Link to='/documentos/novo'>
            <GitBranch aria-hidden='true' className='size-4' />
            Cadeia da fase preparatória (DFD)
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Documento avulso</DropdownMenuLabel>
        {standaloneTypes.map((type) => (
          <DropdownMenuItem key={type.id} asChild>
            <Link to='/documentos/novo' search={{ tipo: type.id }}>
              <FileText aria-hidden='true' className='size-4' />
              <span translate='no'>{type.sigla}</span> - {type.nome}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
