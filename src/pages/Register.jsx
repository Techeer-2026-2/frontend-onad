import { useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { signup } from '../api/auth'
import AuthCard from '../components/AuthCard'

function Register() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  function clearFieldError(field) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const nextErrors = {}
    if (!businessName.trim()) nextErrors.businessName = '사업자명을 입력해 주세요.'
    if (!email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.'
    }
    if (!password) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    } else if (password.length < 8) {
      nextErrors.password = '비밀번호는 8자 이상이어야 합니다.'
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await signup({
        email: email.trim(),
        password,
        businessName: businessName.trim(),
      })
      setIsRegistered(true)
    } catch {
      setErrorMessage('회원가입을 완료할 수 없습니다. 입력 정보를 확인해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="신규 사업자 회원가입"
      subtitle="광고 캠페인 관리를 위한 광고주 계정을 만듭니다."
      footer={!isRegistered && (
        <>
          <p className="text-xs text-[#364964]">이미 계정이 있으신가요?</p>
          <Link
            to="/login"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#0B7CFF] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]"
          >
            로그인으로 돌아가기
          </Link>
        </>
      )}
    >
        {isRegistered ? (
          <div className="space-y-4 text-center">
            <p role="status" className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-[#364964]">
              회원가입이 완료되었습니다. 등록한 이메일로 로그인해 주세요.
            </p>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B7CFF] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]"
            >
              로그인 화면으로 이동
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
            <div>
              <label htmlFor="businessName" className="mb-1 block font-bold text-[#232528]">
                사업자 상호명 <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                autoComplete="organization"
                value={businessName}
                aria-invalid={Boolean(fieldErrors.businessName)}
                aria-describedby={fieldErrors.businessName ? 'businessName-error' : undefined}
                onChange={(event) => {
                  setBusinessName(event.target.value)
                  clearFieldError('businessName')
                }}
                placeholder="사업자명을 입력해 주세요"
                className={`w-full rounded-lg border p-3 text-xs outline-none transition-colors focus:border-[#0B7CFF] ${fieldErrors.businessName ? 'border-red-500' : 'border-[#E5E5E5]'}`}
              />
              {fieldErrors.businessName && (
                <p id="businessName-error" className="mt-1 text-[11px] text-red-500">
                  {fieldErrors.businessName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="registerEmail" className="mb-1 block font-bold text-[#232528]">
                담당자 이메일 주소 <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <input
                id="registerEmail"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'registerEmail-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value)
                  clearFieldError('email')
                }}
                placeholder="name@company.com"
                className={`w-full rounded-lg border p-3 text-xs outline-none transition-colors focus:border-[#0B7CFF] ${fieldErrors.email ? 'border-red-500' : 'border-[#E5E5E5]'}`}
              />
              {fieldErrors.email && (
                <p id="registerEmail-error" className="mt-1 text-[11px] text-red-500">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="registerPassword" className="mb-1 block font-bold text-[#232528]">
                비밀번호 <span aria-hidden="true" className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="registerPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'registerPassword-error' : undefined}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearFieldError('password')
                  }}
                  placeholder="비밀번호를 입력해 주세요"
                  className={`w-full rounded-lg border p-3 pr-10 text-xs outline-none transition-colors focus:border-[#0B7CFF] ${fieldErrors.password ? 'border-red-500' : 'border-[#E5E5E5]'}`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#232528] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="registerPassword-error" className="mt-1 text-[11px] text-red-500">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {errorMessage && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B7CFF] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? '가입 중…' : '광고주 계정 만들기'}
              {!isSubmitting && <ArrowRight size={14} aria-hidden="true" />}
            </button>
          </form>
        )}
    </AuthCard>
  )
}

export default Register
