import { Building2, CheckCircle2, Mail, Pencil, PlayCircle, Target, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getCampaigns } from '../api/campaigns'
import { getMyAccount, updateMyAccount } from '../api/owners'
import { mockCampaigns } from '../mock/campaigns'

function getCampaignSummary(campaigns) {
  return {
    total: campaigns.length,
    ongoing: campaigns.filter((campaign) => campaign.status === 'ONGOING').length,
    completed: campaigns.filter((campaign) => campaign.status === 'ENDED').length,
  }
}

function Account() {
  const [account, setAccount] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getMyAccount(), getCampaigns().catch(() => null)])
      .then(([accountData, campaignData]) => {
        if (!active) return
        setAccount(accountData)
        setBusinessName(accountData?.businessName ?? '')
        setCampaigns(Array.isArray(campaignData) ? campaignData : mockCampaigns)
      })
      .catch((err) => {
        if (active) setError(err.message || '계정 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const trimmedName = businessName.trim()
  const changed = account && trimmedName !== account.businessName
  const campaignSummary = useMemo(() => getCampaignSummary(campaigns), [campaigns])
  const profileInitial = (businessName || 'OA').trim().slice(0, 1).toUpperCase()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!changed || !trimmedName || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateMyAccount(trimmedName)
      const updatedBusinessName = updated?.businessName?.trim() || trimmedName
      setAccount((current) => ({ ...(current || {}), ...(updated || {}), businessName: updatedBusinessName }))
      setBusinessName(updatedBusinessName)
      window.dispatchEvent(new CustomEvent('account-updated', { detail: { businessName: updatedBusinessName } }))
      setNotice('광고주 정보가 저장되었습니다.')
    } catch (err) {
      setError(err.message || '계정 정보를 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const summaryCards = [
    { label: '총 캠페인 수', value: campaignSummary.total, Icon: Target, tone: 'bg-[#F0EDFF] text-[#6C48F5]' },
    { label: '현재 진행중', value: campaignSummary.ongoing, Icon: PlayCircle, tone: 'bg-[#DCFCE7] text-[#16A34A]' },
    { label: '완료된 캠페인', value: campaignSummary.completed, Icon: CheckCircle2, tone: 'bg-[#FFF0F3] text-[#FF6B8B]' },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#2A2C41]">내 정보</h1>
      </header>

      {loading && <p role="status" className="text-sm text-[#858296]">계정 정보를 불러오는 중입니다...</p>}
      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && account && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="account-overview-layout">
            <article aria-labelledby="profile-heading" className="rounded-[2rem] border border-[#ECEAF5] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <h2 id="profile-heading" className="flex items-center gap-2 text-base font-bold text-[#2A2C41]"><UserRound size={18} className="text-[#6C48F5]" /> 광고주 프로필</h2>
              </div>
              <div className="mt-8 flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br bg-[#2A2C41] text-3xl font-black text-white shadow-lg">{profileInitial}</div>
                <p className="mt-4 text-lg font-bold text-[#2A2C41]">{businessName || '광고주'}</p>
              </div>
              <div className="mt-8 space-y-4">
                <div>
                  <label htmlFor="business-name" className="mb-1.5 block text-xs font-bold text-[#2A2C41]">광고주명</label>
                  <div className="relative"><Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A97A7]" /><input id="business-name" name="businessName" type="text" value={businessName} onChange={(event) => { const nextName = event.target.value; setBusinessName(nextName); setNotice(''); window.dispatchEvent(new CustomEvent('account-updated', { detail: { businessName: nextName } })) }} autoComplete="organization" required disabled={saving} className="w-full rounded-xl border border-[#E8E6F2] bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#2A2C41] outline-none transition focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/10" /><Pencil size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6C48F5]" /></div>
                </div>
                <div>
                  <label htmlFor="account-email" className="mb-1.5 block text-xs font-bold text-[#2A2C41]">이메일</label>
                  <div className="relative"><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9A97A7]" /><input id="account-email" name="email" type="email" value={account.email ?? ''} readOnly aria-readonly="true" className="w-full cursor-not-allowed rounded-xl border border-[#E8E6F2] bg-[#FAFAFD] py-3 pl-10 pr-3 text-sm text-[#858296] outline-none" /></div>
                </div>
              </div>
              <button type="submit" disabled={!changed || !trimmedName || saving} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#6C48F5] px-6 text-sm font-bold text-white shadow-lg shadow-[#6C48F5]/20 transition hover:bg-[#5839DB] disabled:cursor-not-allowed disabled:opacity-50">{saving ? '저장 중...' : '프로필 저장'}</button>
            </article>

            <div className="space-y-6">
              <section aria-label="캠페인 현황" className="account-campaign-summary">
                {summaryCards.map(({ label, value, Icon, tone }) => (
                  <article key={label} className="min-h-40 rounded-[1.75rem] border border-[#ECEAF5] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span>
                    <p className="mt-5 text-3xl font-black tracking-tight text-[#2A2C41]">{value}<span className="ml-1 text-sm font-bold text-[#858296]">개</span></p>
                    <p className="mt-1 text-sm font-semibold text-[#6F6C80]">{label}</p>
                  </article>
                ))}
              </section>

              <section aria-label="캠페인 수익 현황 예정 영역" className="flex min-h-[22rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#DCD8F1] bg-[#FCFBFF] p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#6C48F5]"><Target size={21} /></div>
                <h2 className="mt-4 text-base font-bold text-[#2A2C41]">캠페인 수익 현황</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#858296]">캠페인으로 얻은 성과와 수익을 확인할 표가 이곳에 제공될 예정입니다.</p>
              </section>
            </div>
          </section>
        </form>
      )}

      {notice && (
        <div role="status" aria-live="polite" className="fixed bottom-10 left-1/2 z-[70] -translate-x-1/2 rounded-2xl border border-[#C8F0D5] bg-[#F0FDF4] px-6 py-5 text-base font-medium text-[#2A2C41] shadow-xl shadow-[#15803D]/10">
          {notice}
        </div>
      )}
    </div>
  )
}

export default Account
