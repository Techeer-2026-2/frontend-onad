import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getCampaignHistory } from '../api/campaigns'
import CampaignHistoryTable from './CampaignHistoryTable'

function CampaignHistoryPanel() {
  const [request, setRequest] = useState({ page: 0, size: 20 })
  const [result, setResult] = useState(null)
  const isLoading = result?.request !== request
  const data = isLoading ? null : result?.data
  const errorMessage = isLoading ? '' : result?.errorMessage || ''

  useEffect(() => {
    const controller = new AbortController()

    getCampaignHistory({ ...request, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        if (
          !Array.isArray(response?.content) ||
          !Number.isInteger(response.page) || response.page < 0 ||
          !Number.isInteger(response.size) || response.size < 1 ||
          !Number.isInteger(response.totalPages) || response.totalPages < 0 ||
          !Number.isInteger(response.totalElements) || response.totalElements < 0
        ) {
          throw new Error('캠페인 이력 응답 형식이 올바르지 않습니다.')
        }

        // 조회 도중 마지막 페이지의 항목이 삭제되었으면 유효한 페이지로 돌아갑니다.
        const lastPage = Math.max(0, response.totalPages - 1)
        if (request.page > lastPage) {
          setRequest((current) => ({ ...current, page: lastPage }))
          return
        }
        setResult({ request, data: response, errorMessage: '' })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setResult({
          request,
          data: null,
          errorMessage: error instanceof TypeError
            ? '서버에 연결할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.'
            : error.message || '캠페인 이력을 불러오지 못했습니다.',
        })
      })

    return () => controller.abort()
  }, [request])

  function changePage(page) {
    setRequest((current) => ({ ...current, page }))
  }

  return (
      <section className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-sm" aria-busy={isLoading}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5E5] p-5">
          <div>
            <h2 className="text-base font-bold text-[#232528]">종료된 캠페인</h2>
            <p className="mt-0.5 text-xs text-[#364964]">최근 종료된 순으로 타겟 조건과 성과를 확인할 수 있습니다.</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#667085]">
            표시 개수
            <select
              value={request.size}
              disabled={isLoading}
              onChange={(event) => setRequest({ page: 0, size: Number(event.target.value) })}
              className="rounded-lg border border-[#D0D5DD] bg-white px-2 py-2 text-[#344054] disabled:opacity-50"
            >
              {[20, 50, 100].map((size) => <option key={size} value={size}>{size}개</option>)}
            </select>
          </label>
        </div>

        <CampaignHistoryTable
          campaigns={data?.content || []}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => setRequest((current) => ({ ...current }))}
        />

        <nav aria-label="캠페인 이력 페이지" className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5E5] px-5 py-4">
          <p className="text-xs text-[#667085]" aria-live="polite">
            {data ? '총 ' + data.totalElements.toLocaleString('ko-KR') + '건' : isLoading ? '조회 중…' : '조회 실패'}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => changePage(request.page - 1)} disabled={isLoading || request.page === 0} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#344054] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <ChevronLeft size={15} aria-hidden="true" /> 이전
            </button>
            <span className="text-xs text-[#344054]">
              {data ? (data.totalPages === 0 ? '0 / 0' : (data.page + 1) + ' / ' + data.totalPages) : (request.page + 1) + ' 페이지'}
            </span>
            <button type="button" onClick={() => changePage(request.page + 1)} disabled={isLoading || !data || data.page + 1 >= data.totalPages} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#D0D5DD] px-3 text-xs font-semibold text-[#344054] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              다음 <ChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </section>
  )
}

export default CampaignHistoryPanel
