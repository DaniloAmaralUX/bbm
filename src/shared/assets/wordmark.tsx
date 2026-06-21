import { type SVGProps } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Logotipo do Doc Fácil GoV: wordmark em caixa alta, serifada (Merriweather, já
 * carregada — sem peso extra), com tracking. "GOV" recebe o verde do tema como
 * acento (nod ao gov.br). Usa `currentColor` no restante, então herda a cor do
 * contexto e fica temável. O viewBox é calibrado ao texto para não distorcer; o
 * SVG escala pela largura do container.
 */
export function Wordmark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 -5 176 29'
      xmlns='http://www.w3.org/2000/svg'
      role='img'
      aria-label='Doc Fácil GoV'
      className={cn('h-auto w-full', className)}
      {...props}
    >
      <text
        x='0'
        y='17'
        fontFamily='"Merriweather Variable", Merriweather, Georgia, serif'
        fontSize='20'
        fontWeight='700'
        letterSpacing='1.4'
        fill='currentColor'
      >
        DOC FÁCIL <tspan className='fill-primary'>GOV</tspan>
      </text>
    </svg>
  )
}
