export async function exportReportWorkbook({ sheets }) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'OR Smart'
  workbook.created = new Date()
  for (const { name, headers, rows } of sheets) {
    const sheet = workbook.addWorksheet(name)
    sheet.addRow(headers)
    sheet.addRows(rows)
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002D73' } }
    sheet.columns.forEach(column => {
      column.width = 26
      column.alignment = { vertical: 'top', wrapText: true }
    })
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } }
  }
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'ssi-report.xlsx'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
