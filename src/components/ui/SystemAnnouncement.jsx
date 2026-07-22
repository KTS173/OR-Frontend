import { Megaphone } from 'lucide-react'

export default function SystemAnnouncement({
  date = '15 มิ.ย. 2569',
  message = 'ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.',
  className = '',
}) {
  return (
    <section className={`flex h-[50px] items-center rounded-lg border border-black/10 bg-white px-7 shadow-sm ${className}`}>
      <div className="flex items-center gap-12 text-[12px] leading-4 text-[#175beb]">
        <span className="inline-flex shrink-0 items-center gap-2">
          <Megaphone size={16} fill="currentColor" />
          {date}
        </span>
        <span>{message}</span>
      </div>
    </section>
  )
}
