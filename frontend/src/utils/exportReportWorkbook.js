export async function exportReportWorkbook({ sheets, fileName = 'ssi-report.xlsx' }) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'OR Smart'
  workbook.created = new Date()
  for (const { name, headers, rows, widths, autoFilter = true } of sheets) {
    const sheet = workbook.addWorksheet(name)
    sheet.addRow(headers)
    for (const row of rows) {
      // Rows are plain arrays, { group } patient header rows, or { values, fill, fillColumn } highlighted rows.
      if (Array.isArray(row)) sheet.addRow(row)
      else if (row.group) {
        const added = sheet.addRow([row.group])
        sheet.mergeCells(added.number, 1, added.number, headers.length)
        added.font = { bold: true, color: { argb: 'FF002D73' } }
        added.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }
      } else {
        const added = sheet.addRow(row.values)
        if (row.fill) added.getCell(row.fillColumn).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: row.fill } }
      }
    }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D73' } }
    sheet.columns.forEach((column, index) => {
      column.width = widths?.[index] ?? 26
      column.alignment = { vertical: 'top', wrapText: true }
    })
    if (autoFilter) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } }
  }
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
