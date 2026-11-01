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
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6C48F5]">ONAD ADVERTISER PORTAL</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#2A2C41] md:text-3xl">광고주 계정 관리</h1>
          <p className="mt-2 text-sm text-[#858296]">광고주 계정 정보를 확인하고 관리합니다.</p>
        </div>
      </header>

      {loading && <p role="status" className="text-sm text-[#858296]">계정 정보를 불러오는 중입니다...</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

      {!loading && account && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section aria-labelledby="account-info-heading" className="space-y-5 rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-[#F0EFF7] pb-3">
              <h2 id="account-info-heading" className="flex items-center gap-2 text-sm font-bold text-[#2A2C41]">
                <Building2 size={16} className="text-[#6C48F5]" aria-hidden="true" /> 광고주 정보
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div>
                <label htmlFor="business-name" className="block font-bold text-[#2A2C41]">광고주명</label>
                <input
                  id="business-name"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(event) => { setBusinessName(event.target.value); setNotice('') }}
                  autoComplete="organization"
                  required
                  disabled={saving}
                  className="mt-1.5 w-full rounded-xl border border-[#E8E6F2] bg-white p-3 text-sm text-[#2A2C41] outline-none transition focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/10"
                />
              </div>
              <div>
                <label htmlFor="account-email" className="block font-bold text-[#2A2C41]">이메일</label>
                <div className="relative mt-1.5">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
                  <input id="account-email" name="email" type="email" value={account.email ?? ''} readOnly aria-readonly="true" className="w-full rounded-xl border border-[#E8E6F2] bg-[#FAFAFD] py-3 pl-9 pr-3 text-sm text-[#858296] outline-none" />
                </div>
              </div>
            </div>
          </section>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!changed || !trimmedName || saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#6C48F5] px-6 text-xs font-bold text-white shadow-lg shadow-[#6C48F5]/20 hover:bg-[#5839DB] disabled:cursor-not-allowed disabled:opacity-50"
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
