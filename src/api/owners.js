import { apiRequest } from './client'

export function getMyAccount() {
  return apiRequest('/api/v1/owners/me')
}

export function updateMyAccount(businessName) {
  return apiRequest('/api/v1/owners/me', {
    method: 'PATCH',
    body: JSON.stringify({ businessName }),
  })
}
