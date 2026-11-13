import { ApiError, apiRequest, authenticatedFetch } from './client'

function campaignPath(campaignId) {
  return `/api/v1/campaigns/${encodeURIComponent(campaignId)}`
}

export function getCampaignTimeseries(campaignId, { from, to, granularity = 'day', signal } = {}) {
  const query = new URLSearchParams({ granularity })
  if (from) query.set('from', from)
  if (to) query.set('to', to)
  return apiRequest(`${campaignPath(campaignId)}/stats/timeseries?${query}`, { signal })
}

export function toTrendSeries(buckets, granularity) {
  if (!Array.isArray(buckets)) throw new Error('성과 추이 응답 형식이 올바르지 않습니다.')
  return {
    labels: buckets.map(({ bucketStart }) => {
      const date = bucketStart.slice(5, 10).replace('-', '.')
      return granularity === 'hour' ? `${date} ${bucketStart.slice(11, 16)}` : date
    }),
    impressions: buckets.map(({ impressionCount }) => impressionCount),
    clicks: buckets.map(({ clickCount }) => clickCount),
    ctr: buckets.map(({ ctr }) => ctr),
    cpc: buckets.map(({ cpc }) => cpc),
    cpm: buckets.map(({ cpm }) => cpm),
  }
}

export function getCampaignAgeStats(campaignId, { signal } = {}) {
  return apiRequest(`${campaignPath(campaignId)}/stats/by-age`, { signal })
}

export function getCampaignSummary(campaignId, { signal } = {}) {
  return apiRequest(`${campaignPath(campaignId)}/summary`, { signal })
}

export async function downloadCampaignReport(campaignId, format, { signal } = {}) {
  const response = await authenticatedFetch(`${campaignPath(campaignId)}/report/${format}`, { signal })
  const expectedType = format === 'pdf' ? 'application/pdf' : 'text/csv'

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new ApiError(error?.message || '리포트를 내려받지 못했습니다.', response.status)
  }
  if (!response.headers.get('content-type')?.includes(expectedType)) {
    throw new Error('리포트 파일 형식이 올바르지 않습니다.')
  }

  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = `campaign-${campaignId}-report.${format}`
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
