import { authenticatedFetch, ApiError } from './client'

const RETRY_DELAY_MS = 3000

function parseStats(payload) {
  if (!payload || typeof payload !== 'object') return null
  // The Swagger PDF describes stats events as JSON, but does not publish a
  // concrete event schema. Support the existing campaign-detail field names.
  const stats = payload.data && typeof payload.data === 'object' ? payload.data : payload
  const { impressionCount, clickCount } = stats
  if (!Number.isFinite(impressionCount) || impressionCount < 0 ||
      !Number.isFinite(clickCount) || clickCount < 0) return null
  return { impressionCount, clickCount }
}

function waitForRetry(signal) {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve(false)
    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve(true)
    }, RETRY_DELAY_MS)
    function onAbort() {
      clearTimeout(timeout)
      resolve(false)
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/** Subscribe to a campaign's SSE stats stream; returns when aborted. */
export async function subscribeCampaignStats(campaignId, { signal, onStats, onStatus, onError }) {
  const path = `/api/v1/campaigns/${encodeURIComponent(campaignId)}/stats/stream`
  while (!signal.aborted) {
    try {
      onStatus('connecting')
      const response = await authenticatedFetch(path, {
        headers: { Accept: 'text/event-stream' },
        signal,
      })
      if (!response.ok) {
        throw new ApiError(`실시간 통계 연결 실패 (${response.status})`, response.status)
      }
      if (!response.body) throw new Error('실시간 통계 스트림을 읽을 수 없습니다.')
      onStatus('connected')
      onError('')

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      let eventName = ''
      let dataLines = []
      function dispatchEvent() {
        if ((eventName === '' || eventName === 'stats') && dataLines.length) {
          try {
            const parsed = parseStats(JSON.parse(dataLines.join('\n')))
            if (parsed) onStats(parsed)
          } catch {
            // Ignore an individual malformed event and keep the stream alive.
          }
        }
        eventName = ''
        dataLines = []
      }
      try {
        while (!signal.aborted) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          let newline
          while ((newline = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newline)
            buffer = buffer.slice(newline + 1)
            if (!line) dispatchEvent()
            else if (line.startsWith('event:')) eventName = line.slice(6).trim()
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
          }
        }
      } finally {
        await reader.cancel().catch(() => {})
        reader.releaseLock()
      }
      if (signal.aborted) break
      dispatchEvent()
      onError('연결이 종료되어 다시 연결하는 중입니다.')
    } catch (error) {
      if (signal.aborted || error.name === 'AbortError') break
      // A deleted/unauthorized campaign should not create an endless retry loop.
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        onError(error.message)
        onStatus('stopped')
        return
      }
      onError(error.message || '실시간 통계 연결에 실패했습니다.')
    }
    if (signal.aborted) break
    onStatus('reconnecting')
    if (!(await waitForRetry(signal))) break
  }
}
