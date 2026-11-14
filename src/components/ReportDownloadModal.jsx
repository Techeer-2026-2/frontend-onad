import { useEffect, useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Download, FileSpreadsheet, FileText, LoaderCircle, X } from 'lucide-react'
import { getCampaignReport } from '../api/campaignPerformance'
import { saveBlob } from '../utils/saveFile'
import PeriodToggle from './PeriodToggle'

const formatOptions = [
  { value: 'csv', label: 'CSV', description: '엑셀에서 날짜별 수치를 분석해요', icon: FileSpreadsheet },
  { value: 'pdf', label: 'PDF', description: '공유·인쇄용 요약 리포트예요', icon: FileText },
]

function ReportDownloadModal({ campaignId, onClose }) {
  const [format, setFormat] = useState('csv')
  const [days, setDays] = useState(7)
  // phase: 'idle' | 'downloading' | 'success' | 'error'
  const [status, setStatus] = useState({ phase: 'idle' })
  const controllerRef = useRef(null)
  const dialogRef = useRef(null)
  const isDownloading = status.phase === 'downloading'

  // 열릴 때: 모달로 포커스 이동 / 닫힐 때: 진행 중인 다운로드 취소 + 원래 버튼으로 포커스 복귀
  useEffect(() => {
    const previousFocus = document.activeElement
    dialogRef.current?.focus()
    return () => {
      controllerRef.current?.abort()
      previousFocus?.focus?.()
    }
  }, [])

  // ESC 키로 닫기
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleDownload() {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setStatus({ phase: 'downloading' })
    try {
      const report = await getCampaignReport(campaignId, { format, days, signal: controller.signal })
      if (report.blob) saveBlob(report.blob, report.filename)
      setStatus({ phase: 'success', filename: report.filename, isSample: report.isSample })
    } catch (error) {
      if (error.name === 'AbortError') return
      setStatus({ phase: 'error', message: error.message || '리포트를 내려받지 못했습니다.' })
    }
  }

  function handleCancel() {
    if (isDownloading) {
      // 진행 중이면 다운로드만 취소하고 모달은 유지한다
      controllerRef.current?.abort()
      setStatus({ phase: 'idle' })
      return
    }
    onClose()
  }

  // 형식이나 기간을 바꾸면 이전 결과 안내를 지운다
  function changeFormat(value) {
    setFormat(value)
    setStatus({ phase: 'idle' })
  }

  function changeDays(value) {
    setDays(value)
    setStatus({ phase: 'idle' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1D2B]/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDownloading) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="report-modal-title" className="text-lg font-bold text-[#2A2C41]">성과 리포트 다운로드</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="flex h-8 w-8 items-center justify-center rounded-full text-[#858296] transition hover:bg-[#F7F6FC] hover:text-[#2A2C41]">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <fieldset className="mt-5" disabled={isDownloading}>
          <legend className="text-sm font-semibold text-[#2A2C41]">파일 형식</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {formatOptions.map((option) => {
              const Icon = option.icon
              const isSelected = format === option.value
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border-2 p-3.5 transition ${isSelected ? 'border-[#6C48F5] bg-[#F8F6FF]' : 'border-[#ECEAF5] hover:border-[#CFC4FF]'}`}
                >
                  <input
                    type="radio"
                    name="report-format"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => changeFormat(option.value)}
                    className="sr-only"
                  />
                  <span className={`flex items-center gap-2 text-sm font-bold ${isSelected ? 'text-[#6C48F5]' : 'text-[#2A2C41]'}`}>
                    <Icon size={18} aria-hidden="true" />
                    {option.label}
                  </span>
                  <span className="text-xs leading-5 text-[#858296]">{option.description}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#2A2C41]">조회 기간</span>
          <PeriodToggle value={days} onChange={changeDays} />
        </div>

        <div aria-live="polite" className="mt-5 min-h-6">
          {isDownloading && (
            <p className="flex items-center gap-2 text-sm font-medium text-[#6C48F5]">
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />리포트를 만드는 중이에요…
            </p>
          )}
          {status.phase === 'success' && (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CircleCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {status.isSample
                ? `샘플 모드예요. PDF 파일은 API 연동 후 받을 수 있어요. (${status.filename})`
                : `${status.filename} 파일을 내려받았어요.`}
            </p>
          )}
          {status.phase === 'error' && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {status.message}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={handleCancel} className="inline-flex min-h-10 items-center rounded-xl bg-gray-100 px-4 text-sm font-bold text-gray-600 hover:bg-gray-200">
            {status.phase === 'success' ? '닫기' : '취소'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#6C48F5] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5839DB] disabled:cursor-wait disabled:opacity-60"
          >
            {isDownloading
              ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />다운로드 중…</>
              : <><Download size={16} aria-hidden="true" />{status.phase === 'error' ? '다시 시도' : '다운로드'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportDownloadModal
