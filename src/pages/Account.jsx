import { Building2, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getMyAccount, updateMyAccount } from '../api/owners'

function Account() {
  const [account, setAccount] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    getMyAccount()
      .then((data) => {
        if (!active) return
        setAccount(data)
        setBusinessName(data?.businessName ?? '')
      })
      .catch((err) => {
        if (active) setError(err.message || '계정 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const trimmedName = businessName.trim()
  const changed = account && trimmedName !== account.businessName

  async function handleSubmit(event) {
    event.preventDefault()
    if (!changed || !trimmedName || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await updateMyAccount(trimmedName)
      setAccount(updated)
      setBusinessName(updated.businessName)
      setNotice('광고주 정보가 저장되었습니다.')
    } catch (err) {
      setError(err.message || '계정 정보를 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7CFF]">ONAD ADVERTISER PORTAL</p>
          <h1 className="mt-2 text-2xl font-bold text-[#232528]">광고주 계정 관리</h1>
          <p className="mt-1 text-sm text-[#667085]">광고주 계정 정보를 확인하고 관리합니다.</p>
        </div>
      </header>

      {loading && <p role="status" className="text-sm text-[#667085]">계정 정보를 불러오는 중입니다...</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

      {!loading && account && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section aria-labelledby="account-info-heading" className="space-y-5 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 id="account-info-heading" className="flex items-center gap-2 text-sm font-bold text-[#232528]">
                <Building2 size={16} className="text-[#0B7CFF]" aria-hidden="true" /> 광고주 정보
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <label htmlFor="business-name" className="block font-bold text-[#232528]">광고주명</label>
                <input
                  id="business-name"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) => { setBusinessName(event.target.value); setNotice('') }}
                  autoComplete="organization"
                  required
                  disabled={saving}
                  className="mt-1.5 w-full rounded-lg border border-[#E5E5E5] bg-white p-3 text-sm text-[#232528] outline-none transition focus:border-[#0B7CFF] focus:ring-2 focus:ring-[#0B7CFF]/15"
                />
              </div>
              <div>
                <label htmlFor="account-email" className="block font-bold text-[#232528]">이메일</label>
                <div className="relative mt-1.5">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
                  <input id="account-email" name="email" type="email" value={account.email ?? ''} readOnly aria-readonly="true" className="w-full rounded-lg border border-[#E5E5E5] bg-slate-50 py-3 pl-9 pr-3 text-sm text-[#667085] outline-none" />
                </div>
              </div>
            </div>
          </section>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!changed || !trimmedName || saving}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0B7CFF] px-6 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? '저장 중...' : '정보 저장'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Account
