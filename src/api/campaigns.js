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

function createCampaignFormData(payload, image) {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  if (image) formData.append('image', image)
  return formData
}

export function createCampaign(payload, image) {
  return apiRequest('/api/v1/campaigns', {
    method: 'POST',
    body: createCampaignFormData(payload, image),
  })
}

export function updateCampaign(campaignId, payload, image) {
  return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'PATCH',
    body: createCampaignFormData(payload, image),
  })
}

export function deleteCampaign(campaignId) {
  return apiRequest(`/api/v1/campaigns/${encodeURIComponent(campaignId)}`, {
    method: 'DELETE',
  })
}
