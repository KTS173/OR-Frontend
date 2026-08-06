import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Phone, FileText, Image, Eye, ClipboardList, AlertTriangle } from 'lucide-react'

/**
 * EvaluationHistory React Component for Case Detail page
 * Displays the latest evaluation history cards aligned horizontally in a 5-column grid.
 */
export default function EvaluationHistory({
  evaluations = [],
  activeCardIndex = null,
  onCardClick = () => {},
  onViewDetail = () => {},
  onEvaluate = () => {},
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-semibold text-[#002d73] border-b border-slate-100 pb-2 text-left">
        ประวัติการประเมินล่าสุด
      </h3>

      <div className="space-y-4">
        {evaluations.map((item, idx) => {
          const isCompleted = item.status === 'completed' || item.status === 'interrupt_activity'
          const isPending = item.status === 'pending'
          const isInterrupt = item.status === 'interrupt_activity'
          const isActive = activeCardIndex === idx

          // Card border classes based on active state and type
          const cardBorderClass = isActive
            ? 'border-orange-200 ring-1 ring-orange-200 bg-orange-50/10'
            : item.sspiFlag
            ? 'border-orange-200 hover:bg-orange-50/10'
            : 'border-slate-200 hover:bg-slate-50/50'

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => onCardClick(item, idx)}
              className={`rounded-xl border bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer transition-all ${cardBorderClass} text-[13px]`}
            >
              {/* Col 1: Title & Info (3 columns) */}
              <div className="md:col-span-3 text-left">
                <strong
                  className={`text-[14.5px] font-semibold block ${
                    isInterrupt ? 'text-orange-500' : 'text-[#002d73]'
                  }`}
                >
                  {isInterrupt ? 'กิจกรรมแทรก' : `รอบที่ ${item.roundNumber} (${item.dayLabel})`}
                </strong>
                <p className="text-[12px] text-slate-400 mt-1 leading-normal">
                  {item.date} | {item.time}
                  <br />
                  โดย {item.nurseName}
                </p>
              </div>

              {/* Col 2: Badge Status (2 columns) */}
              <div className="md:col-span-2 flex flex-wrap gap-1.5 justify-start items-center">
                {isCompleted && (
                  <span className="rounded bg-[#ecfdf5] border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-[#10b981]">
                    {isInterrupt ? 'เสร็จสิ้น' : 'ประเมินเสร็จสิ้น'}
                  </span>
                )}
                {isPending && (
                  <span className="rounded bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    รอดำเนินการ
                  </span>
                )}
                {item.sspiFlag && (
                  <span className="rounded bg-orange-50 border border-orange-200 px-2.5 py-1 text-[11px] font-semibold text-orange-500 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-orange-500" />
                    สงสัย SSI
                  </span>
                )}
              </div>

              {/* Col 3: Description content (3 columns) */}
              <div className="md:col-span-3 text-left">
                {isCompleted ? (
                  item.reason ? (
                    <div className="text-slate-700">
                      <strong className="block font-semibold text-slate-700">{item.woundCondition}</strong>
                      <span className="text-[12px] text-slate-500 block mt-1">เหตุผล: {item.reason}</span>
                    </div>
                  ) : (
                    <div className="text-slate-700">
                      <strong className="block font-semibold text-slate-700">{item.woundCondition}</strong>
                      <span className="text-[12px] text-slate-500 block mt-1">ความเสี่ยง SSI: {item.riskLevel}</span>
                      <span className="text-[12px] text-slate-500 block mt-0.5">อาการอื่นๆ: {item.otherSymptoms}</span>
                    </div>
                  )
                ) : (
                  <div className="text-slate-400">
                    <strong className="block font-medium">ยังไม่มีผลการประเมิน</strong>
                    <span className="text-[12px] text-slate-300 block mt-1">-</span>
                    <span className="text-[12px] text-slate-300 block">-</span>
                  </div>
                )}
              </div>

              {/* Col 4: Right stats panel (3 columns) */}
              <div className="md:col-span-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="w-full space-y-1 md:pr-4 text-[12px] text-slate-500">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-1">
                      {item.contactChannel?.hasPhone && <Phone size={12} className="text-slate-400" />}
                      ช่องทางการติดตาม
                    </span>
                    <strong className="text-slate-700 font-semibold">
                      {item.contactChannel?.hasPhone ? 'โทรศัพท์' : '-'}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      ไฟล์เอกสาร
                    </span>
                    <strong className="text-slate-700 font-semibold">
                      {item.contactChannel?.fileCount > 0 ? `${item.contactChannel.fileCount} ไฟล์` : '-'}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Image size={12} className="text-slate-400" />
                      ไฟล์รูปภาพ
                    </span>
                    <strong className="text-slate-700 font-semibold">
                      {item.contactChannel?.imageCount > 0 ? `${item.contactChannel.imageCount} ไฟล์` : '-'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Col 5: Actions (1 column) */}
              <div className="md:col-span-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                {isCompleted ? (
                  <button
                    onClick={() => onViewDetail(item, idx)}
                    className="rounded-full border border-slate-200 p-2 text-[#002d73] hover:bg-slate-50 transition-colors shadow-sm"
                    aria-label="ดูรายละเอียดการประเมิน"
                  >
                    <Eye size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => onEvaluate(item, idx)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <ClipboardList size={14} className="text-slate-400" />
                    <span>รอประเมิน</span>
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Note banner & Legend */}
      <div className="mt-4 rounded-lg bg-slate-100/70 p-3 text-[12px] text-slate-500 text-left font-medium">
        หมายเหตุ วันที่อาจเปลี่ยนแปลงได้ตามการกำหนดของโรงพยาบาล
      </div>

      <div className="mt-4 flex items-center gap-6 text-[12.5px] text-slate-600 font-medium text-left">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          ประเมินเสร็จสิ้น
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          รอดำเนินการ
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          เกินกำหนด
        </span>
      </div>
    </div>
  )
}

EvaluationHistory.propTypes = {
  evaluations: PropTypes.arrayOf(
    PropTypes.shape({
      roundNumber: PropTypes.number.isRequired,
      dayLabel: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      nurseName: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['completed', 'pending', 'interrupt_activity']).isRequired,
      sspiFlag: PropTypes.bool,
      woundCondition: PropTypes.string,
      riskLevel: PropTypes.string,
      otherSymptoms: PropTypes.string,
      reason: PropTypes.string,
      contactChannel: PropTypes.shape({
        hasPhone: PropTypes.bool,
        fileCount: PropTypes.number,
        imageCount: PropTypes.number,
      }),
      isOverdue: PropTypes.bool,
    })
  ),
  activeCardIndex: PropTypes.number,
  onCardClick: PropTypes.func,
  onViewDetail: PropTypes.func,
  onEvaluate: PropTypes.func,
}
