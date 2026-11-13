import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { getCampaignSummary } from '../api/campaignPerformance'

function AiSummaryCard({ campaignId }) {
  // status: 'idle'(요청 전) | 'loading' | 'done' | 'error'
  const [state, setState] = useState({ status: 'idle', summary: null, error: '' })
  const controllerRef = useRef(null)

  // 페이지를 나가면 진행 중인 요청을 취소한다
  useEffect(() => () => controllerRef.current?.abort(), [])

  async function loadSummary() {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setState({ status: 'loading', summary: null, error: '' })
    try {
      const result = await getCampaignSummary(campaignId, { signal: controller.signal })
      setState({ status: 'done', summary: result?.summary?.trim() || null, error: '' })
    } catch (error) {
      if (error.name === 'AbortError') return
      setState({ status: 'error', summary: null, error: error.message || 'AI 성과 요약을 불러오지 못했습니다.' })
    }
  }

  const lines = state.summary ? state.summary.split('\n').filter((line) => line.trim()) : []
  const isLoading = state.status === 'loading'

  return (
    <section aria-labelledby="ai-summary-title" aria-busy={isLoading} className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-[#F0EFF7] pb-3">
        <h2 id="ai-summary-title" className="flex items-center gap-2 text-sm font-bold text-[#2A2C41]">
          <Sparkles size={16} className="text-[#6C48F5]" aria-hidden="true" />AI 성과 요약
        </h2>
        {state.status !== 'idle' && !isLoading && (
          <button type="button" onClick={loadSummary} className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#6C48F5] hover:bg-[#F0EDFF]">다시 요약</button>
        )}
      </div>

      <div className="mt-4">
        {state.status === 'idle' && (
          <div className="space-y-3 text-center">
            <p className="text-sm leading-6 text-[#6F6C80]">버튼을 누르면 AI가 이 캠페인의 성과를 분석해 요약해 드려요.</p>
            <button
              type="button"
              onClick={loadSummary}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#6C48F5] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#5839DB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]"
            >
              <Sparkles size={15} aria-hidden="true" />AI 성과 요약 보기
            </button>
          </div>
        )}

        {isLoading && (
          <div>
            <p role="status" className="flex items-center gap-2 text-sm font-medium text-[#6C48F5]">
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />AI가 성과를 분석하는 중이에요…
            </p>
            <div className="mt-4 space-y-2.5" aria-hidden="true">
              <div className="h-3 w-full animate-pulse rounded-full bg-[#ECEAF5]" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-[#ECEAF5]" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#ECEAF5]" />
            </div>
          </div>
        )}

        {state.status === 'done' && lines.length > 0 && (
          <ul className="space-y-2.5">
            {lines.map((line) => (
              <li key={line} className="flex gap-2 text-sm leading-6 text-[#344054]">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C48F5]" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        )}

        {state.status === 'done' && lines.length === 0 && (
          <div className="py-2 text-center">
            <p className="text-sm font-semibold text-[#2A2C41]">아직 분석할 성과 데이터가 없어요.</p>
            <p className="mt-1 text-xs text-[#858296]">캠페인이 집행되고 데이터가 쌓이면 AI 요약을 받아볼 수 있어요.</p>
          </div>
        )}

        {state.status === 'error' && <p role="alert" className="text-sm text-[#667085]">{state.error}</p>}
      </div>
    </section>
  )
}

export default AiSummaryCard
