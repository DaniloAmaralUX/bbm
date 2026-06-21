import { type SVGProps } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Marca do Doc Fácil GoV: monograma "DF" num badge quadrado de cantos
 * arredondados (linguagem de radius da UI). O badge usa `currentColor`, então
 * herda o verde do tema (`text-primary`) e fica temável em claro/escuro; as
 * letras são vazadas em branco. Escala de 16px (favicon) a tamanhos grandes.
 */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      id='app-logo'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      height='24'
      width='24'
      className={cn('size-6', className)}
      {...props}
    >
      <title>Doc Fácil GoV</title>
      <rect
        x='1.5'
        y='1.5'
        width='21'
        height='21'
        rx='5.5'
        fill='currentColor'
      />
      <text
        x='12'
        y='12.6'
        textAnchor='middle'
        dominantBaseline='central'
        fontFamily='"Montserrat Variable", Montserrat, ui-sans-serif, sans-serif'
        fontSize='10.5'
        fontWeight='700'
        letterSpacing='-0.6'
        fill='#ffffff'
      >
        DF
      </text>
    </svg>
  )
}
