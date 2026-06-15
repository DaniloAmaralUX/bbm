import { appIdentity } from './app'
import { docTypeFullLabel } from './doc-type'
import { type DocumentSection } from './templates'
import { getTRDocument } from './tr-document'

/**
 * Exportação de TR para arquivo (protótipo, dados mockados).
 *
 * Reusa `getTRDocument(trId)` como fonte única do documento — os mesmos
 * metadados e seções já exibidos em `/tr/$trId`. Serializa para um HTML
 * autossuficiente e oferece:
 *  - Word: download instantâneo de um `.doc` (HTML que o Word/Docs abrem).
 *  - PDF: abre janela dedicada e dispara o diálogo de impressão (Salvar como PDF).
 */

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  approved: 'Aprovado',
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Preserva quebras de linha do conteúdo mockado (\n -> <br>). */
function escapeWithBreaks(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

function sectionToHtml(section: DocumentSection): string {
  const heading = `<h2>${escapeHtml(section.title)}</h2>`

  if (section.kind === 'prose') {
    if (!section.content.trim()) return ''
    return `<section>${heading}<p>${escapeWithBreaks(section.content)}</p></section>`
  }

  if (section.kind === 'keyValue') {
    if (!section.items.length) return ''
    const rows = section.items
      .map(
        (item) =>
          `<tr><th scope="row">${escapeHtml(item.label)}</th><td>${escapeWithBreaks(
            item.value
          )}</td></tr>`
      )
      .join('')
    return `<section>${heading}<table class="kv"><tbody>${rows}</tbody></table></section>`
  }

  // table
  if (!section.rows.length) {
    const empty =
      section.emptyMessage ?? 'Sem registros para exibir nesta seção.'
    return `<section>${heading}<p class="empty">${escapeHtml(empty)}</p></section>`
  }
  const head = section.columns
    .map((column) => `<th scope="col">${escapeHtml(column)}</th>`)
    .join('')
  const body = section.rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeWithBreaks(cell)}</td>`)
          .join('')}</tr>`
    )
    .join('')
  return `<section>${heading}<table class="grid"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></section>`
}

const documentStyles = `
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #1a1a1a;
    line-height: 1.6;
    font-size: 12pt;
    margin: 0;
    padding: 24px;
  }
  .doc-header {
    border-bottom: 2px solid #1f3a8a;
    padding-bottom: 16px;
    margin-bottom: 28px;
  }
  .doc-eyebrow {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1f3a8a;
    font-weight: 700;
    margin: 0 0 6px;
  }
  .doc-title { font-size: 20pt; font-weight: 700; margin: 0 0 14px; line-height: 1.25; }
  .doc-meta {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px 24px;
    color: #444;
  }
  .doc-meta strong { color: #1a1a1a; font-weight: 700; }
  h2 {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12.5pt;
    font-weight: 700;
    margin: 24px 0 8px;
    color: #1f3a8a;
  }
  section { break-inside: avoid; }
  p { margin: 0 0 8px; text-align: justify; }
  p.empty { color: #777; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 4px; font-size: 10.5pt; }
  table.kv th {
    text-align: left;
    width: 34%;
    vertical-align: top;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #555;
    padding: 7px 12px 7px 0;
    border-bottom: 1px solid #e5e5e5;
  }
  table.kv td { vertical-align: top; padding: 7px 0; border-bottom: 1px solid #e5e5e5; }
  table.grid th, table.grid td {
    border: 1px solid #d4d4d4;
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
  }
  table.grid th {
    background: #f1f4fb;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
  }
  .doc-footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid #e5e5e5;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.5pt;
    color: #888;
  }
  .doc-brand { margin-bottom: 14px; }
  .doc-logo { height: 42px; width: auto; display: block; }
  .doc-logo-fallback {
    display: none;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16pt;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #1f3a8a;
  }
  .doc-signatures { margin-top: 64px; break-inside: avoid; }
  .sign-place-date {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5pt;
    margin: 0 0 56px;
  }
  .sign-block { width: 300px; margin: 0 auto; text-align: center; }
  .sign-line { border-top: 1px solid #1a1a1a; margin-bottom: 8px; }
  .sign-name { font-weight: 700; font-size: 11pt; }
  .sign-role,
  .sign-unit {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    color: #555;
  }
`

export function buildDocumentHtml(trId: string): {
  filename: string
  html: string
  title: string
} {
  const doc = getTRDocument(trId)
  const statusLabel = statusLabels[doc.status] ?? doc.status

  const meta = [
    ['Referência', doc.id],
    ['Unidade responsável', doc.responsibleUnit],
    ['Modelo', doc.model],
    ['Responsável', doc.owner],
    ['Atualizado em', doc.updatedAt],
    ['Situação', statusLabel],
  ]
    .map(
      ([label, value]) =>
        `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(
          String(value)
        )}</div>`
    )
    .join('')

  const body = doc.sections.map(sectionToHtml).filter(Boolean).join('')

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapeHtml(doc.id)} - ${escapeHtml(doc.title)}</title>
<style>${documentStyles}</style>
</head>
<body>
  <header class="doc-header">
    <div class="doc-brand">
      <span class="doc-logo-fallback">${escapeHtml(appIdentity.name)}</span>
    </div>
    <p class="doc-eyebrow">${escapeHtml(docTypeFullLabel(doc.docType))}</p>
    <h1 class="doc-title">${escapeHtml(doc.title)}</h1>
    <div class="doc-meta">${meta}</div>
  </header>
  <main>${body}</main>
  <section class="doc-signatures">
    <p class="sign-place-date">Recife, _____ de ________________ de 20____.</p>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-name">${escapeHtml(doc.owner)}</div>
      <div class="sign-role">Responsável pela elaboração</div>
      <div class="sign-unit">${escapeHtml(doc.responsibleUnit)}</div>
    </div>
  </section>
  <footer class="doc-footer">
    Documento gerado pela Fase Preparatória - protótipo de validação. Conteúdo ilustrativo.
  </footer>
</body>
</html>`

  return { filename: doc.id, html, title: doc.title }
}

export function downloadTRWord(trId: string): void {
  const { filename, html } = buildDocumentHtml(trId)
  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename}.doc`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoga no próximo tick para garantir que o download iniciou.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Imprime o documento via iframe oculto — sem pop-up, à prova de bloqueador.
 * Escreve o HTML num iframe fora da tela, dispara o diálogo de impressão e
 * remove o iframe quando o diálogo fecha. Retorna false só em falha rara de DOM.
 */
export function printTRToPdf(trId: string): boolean {
  const { html } = buildDocumentHtml(trId)

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  if (!win) {
    iframe.remove()
    return false
  }

  let printed = false
  const triggerPrint = () => {
    if (printed) return
    printed = true
    win.focus()
    win.print()
  }

  // Remove o iframe depois que o diálogo de impressão fecha.
  win.onafterprint = () => window.setTimeout(() => iframe.remove(), 300)
  // onload cobre o carregamento; o timeout é fallback caso já tenha carregado.
  iframe.onload = () => window.setTimeout(triggerPrint, 50)
  window.setTimeout(triggerPrint, 500)

  win.document.open()
  win.document.write(html)
  win.document.close()

  return true
}
