export const casePriorities = [
  { value: 'HIGH', label: 'สูง', color: '#dc2626', background: '#fef2f2' },
  { value: 'MEDIUM', label: 'กลาง', color: '#ea580c', background: '#fff7ed' },
  { value: 'LOW', label: 'ต่ำ', color: '#16a34a', background: '#f0fdf4' },
]

export default function CasePriorityBadge({ priority = 'LOW' }) {
  const level = casePriorities.find(item => item.value === priority) || casePriorities[2]
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-semibold" style={{ color: level.color, backgroundColor: level.background }}><span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: level.color }} />{level.label}</span>
}
