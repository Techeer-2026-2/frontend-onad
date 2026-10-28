import { BadgeCheck, Building2, CreditCard, Mail, Save, RotateCcw } from 'lucide-react'
import { useState } from 'react'

const initialBusinessName = '테커 카페'
const sampleEmail = 'owner@techeer.com'

function Account() {
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [hasEditedBusinessName, setHasEditedBusinessName] = useState(false)

  function handleBusinessNameChange(event) {
    setBusinessName(event.target.value)
    setHasEditedBusinessName(true)
  }

  function preventSubmit(event) {
    event.preventDefault()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col justify-between gap-3 border-b border-[#E5E5E5] pb-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0B7CFF]">ONAD ADVERTISER PORTAL</p>
          <h1 className="mt-1 text-xl font-bold text-[#232528]">사업자 인증 및 계정 관리</h1>
          <p className="mt-1 text-xs text-[#667085]">ONAD 광고주 계정 정보를 확인하고 관리합니다.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 px-3 py-1.5 text-xs font-bold text-[#168743]">
          <BadgeCheck size={14} aria-hidden="true" /> 광고주 계정
        </span>
      </header>

      <form onSubmit={preventSubmit} className="space-y-6">
        <section aria-labelledby="account-info-heading" className="space-y-5 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 id="account-info-heading" className="flex items-center gap-2 text-sm font-bold text-[#232528]">
              <Building2 size={16} className="text-[#0B7CFF]" aria-hidden="true" /> 사업자 인증 정보
            </h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-[#667085]">내 정보</span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <label htmlFor="business-name" className="block font-bold text-[#232528]">사업자 상호명</label>
              <input
                id="business-name"
                name="businessName"
                type="text"
                value={businessName}
                onChange={handleBusinessNameChange}
                autoComplete="organization"
                className="mt-1.5 w-full rounded-lg border border-[#E5E5E5] bg-white p-3 text-sm text-[#232528] outline-none transition focus:border-[#0B7CFF] focus:ring-2 focus:ring-[#0B7CFF]/15"
              />
            </div>

            <div>
              <label htmlFor="account-email" className="block font-bold text-[#232528]">담당자 이메일 <span className="font-medium text-[#667085]">(읽기 전용)</span></label>
              <div className="relative mt-1.5">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" aria-hidden="true" />
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  value={sampleEmail}
                  readOnly
                  aria-readonly="true"
                  className="w-full rounded-lg border border-[#E5E5E5] bg-slate-50 py-3 pl-9 pr-3 text-sm text-[#667085] outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <span className="block font-bold text-[#232528]">요금제</span>
              <div className="mt-1.5 flex min-h-11 items-center justify-between rounded-lg border border-[#E5E5E5] bg-slate-50 px-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#232528]">
                  <CreditCard size={15} className="text-[#667085]" aria-hidden="true" /> 현재 이용 요금제
                </span>
                <span className="rounded-md bg-[#0C0C0D] px-2.5 py-1 text-[11px] font-bold text-white">FREE</span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-[#364964] sm:flex-row sm:items-start">
          <span className="font-bold text-[#0B7CFF]">안내</span>
          <p>현재 표시된 계정 정보는 Swagger 예시이며, 실제 계정 조회 및 사업자명 저장은 API 연동 후 제공됩니다.{hasEditedBusinessName ? ' 입력한 변경 내용은 저장되지 않습니다.' : ''}</p>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] px-5 text-xs font-bold text-[#667085] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <RotateCcw size={14} aria-hidden="true" /> 원래대로
          </button>
          <button
            type="submit"
            disabled
            title="사업자명 저장 API가 연결되면 사용할 수 있습니다."
            className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#0B7CFF] px-6 text-xs font-bold text-white opacity-50"
          >
            <Save size={14} aria-hidden="true" /> 정보 저장
          </button>
        </div>
      </form>
    </div>
  )
}

export default Account
