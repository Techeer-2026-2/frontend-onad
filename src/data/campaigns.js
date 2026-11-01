// Fallback data used only when the campaign API successfully returns no campaigns.
// Keep this shape aligned with CampaignTable so every page can share the same mock state.
export const mockCampaigns = [
  {
    id: 'mock-summer-release',
    name: 'ONBEAT 여름 신곡 프로모션',
    status: 'ONGOING',
    targetAudience: '20대, 30대 (전체 성별)',
    sent: 1205000,
    clicks: 40260,
    ctr: 3.34,
    period: '2026. 7. 1. ~ 2026. 8. 31.',
  },
  {
    id: 'mock-indie-festival',
    name: '인디 밴드 페스티벌 티켓 오픈',
    status: 'PENDING',
    targetAudience: '20대, 30대 (전체 성별)',
    sent: 0,
    clicks: 0,
    ctr: 0,
    period: '2026. 9. 1. ~ 2026. 9. 30.',
  },
  {
    id: 'mock-headphone-event',
    name: '프리미엄 헤드폰 브랜드 기획전',
    status: 'ONGOING',
    targetAudience: '20대, 30대 (남성)',
    sent: 840000,
    clicks: 25200,
    ctr: 3,
    period: '2026. 7. 15. ~ 2026. 8. 15.',
  },
  {
    id: 'mock-spring-playlist',
    name: '봄맞이 플레이리스트 스폰서십',
    status: 'ENDED',
    targetAudience: '전체 연령 (전체 성별)',
    sent: 3100000,
    clicks: 77500,
    ctr: 2.5,
    period: '2026. 3. 1. ~ 2026. 4. 30.',
  },
]

export default mockCampaigns
