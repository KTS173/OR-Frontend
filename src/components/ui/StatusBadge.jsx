const styles = {
  'รอตรวจสอบ': 'bg-amber-50 text-amber-700 ring-amber-200',
  'กำลังติดตาม': 'bg-blue-50 text-blue-700 ring-blue-200',
  'ครบกำหนดวันนี้': 'bg-violet-50 text-violet-700 ring-violet-200',
  'ติดตามเสร็จแล้ว': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'เกินกำหนด': 'bg-red-50 text-red-700 ring-red-200',
  'สงสัย SSI': 'bg-orange-50 text-orange-700 ring-orange-200',
  'ยืนยัน SSI': 'bg-rose-50 text-rose-700 ring-rose-200',
  'ใช้งาน': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'เผยแพร่': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'ระงับ': 'bg-slate-100 text-slate-600 ring-slate-200',
  'ฉบับร่าง': 'bg-amber-50 text-amber-700 ring-amber-200',
}

export default function StatusBadge({ children }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[16px] font-semibold ring-1 ring-inset ${styles[children] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{children}</span>
}
