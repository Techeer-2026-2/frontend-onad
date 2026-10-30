import { apiRequest } from './client'

export function getCampaigns({ status, signal } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return apiRequest(`/api/v1/campaigns${query}`, { signal })
}

export function getCampaignHistory({ page = 0, size = 20, signal } = {}) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  return apiRequest('/api/v1/campaigns/history?' + query, { signal })
}

export function getCampaign(campaignId, { signal } = {}) {
  return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}`, { signal })
}

export function createCampaign(payload) {
  return apiRequest('/api/v1/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCampaign(campaignId, payload) {
  return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCampaign(campaignId) {
  return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'DELETE',
  })
}
