export default function SystemAnnouncement({
  date = '15 มิ.ย. 2569',
  message = 'ระบบจะปิดปรับปรุงชั่วคราวในวันเสาร์ที่ 15 มิถุนายน 2569 เวลา 22:00 - 02:00 น.',
  className = '',
}) {
  return (
    <section className={`flex min-h-[50px] items-center rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm sm:px-7 ${className}`}>
      <div className="flex flex-col gap-1.5 text-[12px] leading-4 text-[#175beb] sm:flex-row sm:items-center sm:gap-12">
        <span className="inline-flex shrink-0 items-center gap-2">
          <img src="/assets/icon/megaphone.png" alt="" className="h-[15px] w-4 shrink-0 object-contain" />
          {date}
        </span>
        <span>{message}</span>
      </div>
    </section>
  )
}
