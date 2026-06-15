const docDateFormatter = new Intl.DateTimeFormat('pt-BR')

/**
 * Formata a data de um documento em pt-BR (DD/MM/AAAA) fazendo parse LOCAL.
 *
 * Strings no formato `AAAA-MM-DD` (data sem hora) são interpretadas como meia-
 * noite LOCAL: `new Date('2026-04-10')` seria meia-noite UTC e, em fuso BRT
 * (UTC-3), recuaria para o dia anterior (09/04). Timestamps ISO completos (com
 * hora/fuso, ex.: vindos de `toISOString()`) já carregam o fuso e são repassados
 * direto. Garante a MESMA data em listagem, cards, view e dashboard (RF-14).
 */
export function formatDocDate(iso: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T00:00:00`)
    : new Date(iso)
  return docDateFormatter.format(date)
}
