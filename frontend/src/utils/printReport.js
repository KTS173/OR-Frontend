export async function printReport(element) {
  if (!element) throw new Error('ไม่พบเนื้อหารายงาน')
  const frame = document.createElement('iframe')
  frame.title = 'พิมพ์รายงาน SSI'
  frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:1200px;height:900px;border:0'
  document.body.appendChild(frame)
  const cleanup = () => frame.remove()
  try {
    const doc = frame.contentDocument
    const style = doc.createElement('style')
    style.textContent = [...document.styleSheets].map(sheet => {
      try { return [...sheet.cssRules].map(rule => rule.cssText).join('\n') } catch { return '' }
    }).join('\n') + '\n@page{size:A4 landscape;margin:10mm} body{margin:0;background:white} *{animation:none!important;transition:none!important;print-color-adjust:exact} [data-report-controls],button{display:none!important} article,tr{break-inside:avoid} .overflow-x-auto{overflow:visible!important}'
    doc.head.appendChild(style)
    doc.title = 'รายงาน SSI'
    const copy = element.cloneNode(true)
    copy.querySelectorAll('[data-report-controls]').forEach(node => node.remove())
    copy.querySelectorAll('input,select,textarea').forEach(node => {
      const text = doc.createElement('span')
      text.textContent = node.tagName === 'SELECT' ? node.selectedOptions[0]?.textContent : node.value
      node.replaceWith(text)
    })
    doc.body.appendChild(copy)
    await doc.fonts.ready
    await new Promise(resolve => frame.contentWindow.requestAnimationFrame(() => frame.contentWindow.requestAnimationFrame(resolve)))
    frame.contentWindow.addEventListener('afterprint', cleanup, { once: true })
    frame.contentWindow.focus()
    frame.contentWindow.print()
    // Keep the document available while the browser's print preview is open.
    setTimeout(cleanup, 300000)
  } catch (error) {
    cleanup()
    throw error
  }
}
