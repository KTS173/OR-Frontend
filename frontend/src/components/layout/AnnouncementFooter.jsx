import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'

const emptyAnnouncement = { date: '', message: '', enabled: false }

export default function AnnouncementFooter() {
  const [announcement, setAnnouncement] = useState(emptyAnnouncement)

  const loadAnnouncement = () => {
    api.getSettings()
      .then(settings => setAnnouncement(settings.footerAnnouncement || emptyAnnouncement))
      .catch(() => setAnnouncement(emptyAnnouncement))
  }

  useEffect(() => {
    loadAnnouncement()
    window.addEventListener('footer-announcement-updated', loadAnnouncement)
    return () => window.removeEventListener('footer-announcement-updated', loadAnnouncement)
  }, [])

  const visible = announcement.enabled === true && String(announcement.message || '').trim()
  const dateLabel = visible && announcement.date
    ? new Date(`${announcement.date}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

  return (
    <footer className="mx-3 mb-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:mx-6 sm:mb-4 sm:px-6 sm:py-3">
      <div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-[#175beb] sm:flex-nowrap sm:gap-4 sm:text-[14px]">
        <Megaphone size={22} className="shrink-0 fill-[#175beb]" />
        <span className="shrink-0 sm:w-[125px]">{dateLabel}</span>
        <span className="w-full min-w-0 break-words pl-[34px] sm:w-auto sm:pl-0">{visible ? announcement.message : '-'}</span>
      </div>
    </footer>
  )
}
