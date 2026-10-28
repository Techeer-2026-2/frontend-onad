import { useState } from 'react'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { ApiError } from '../api/client'
import AuthCard from '../components/AuthCard'
import { useAuthStore } from '../stores/authStore'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const accessToken = useAuthStore((state) => state.accessToken)
  const location = useLocation()
  const navigate = useNavigate()

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const nextErrors = {}
    if (!email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = '올바른 이메일 형식을 입력해 주세요.'
    }
    if (!password) nextErrors.password = '비밀번호를 입력해 주세요.'

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      await login({ email: email.trim(), password })
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage('이메일 또는 비밀번호를 확인해 주세요.')
      } else {
        setErrorMessage('로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function clearFieldError(field) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  return (
    <AuthCard
      title="광고주 로그인"
      subtitle="광고 캠페인 관리 플랫폼"
      footer={(
        <>
          <p className="text-xs text-[#364964]">
            아직 ONAD 사업자 계정이 없으신가요?
          </p>
          <Link
            to="/register"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#0B7CFF] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]"
          >
            신규 사업자 회원가입
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
        </>
      )}
    >
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          <div>
            <label htmlFor="email" className="mb-1 block font-bold text-[#232528]">
              이메일 계정 <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                clearFieldError('email')
              }}
              placeholder="name@company.com"
              className={`w-full rounded-lg border p-3 text-xs outline-none transition-colors focus:border-[#0B7CFF] ${fieldErrors.email ? 'border-red-500' : 'border-[#E5E5E5]'}`}
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-[11px] text-red-500">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-bold text-[#232528]">
              비밀번호 <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearFieldError('password')
                }}
                placeholder="비밀번호를 입력하세요"
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
              <p id="password-error" className="mt-1 text-[11px] text-red-500">
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
            className="w-full rounded-lg bg-[#0B7CFF] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              '로그인 중…'
            ) : (
              <span className="flex items-center justify-center gap-2">
                광고주 포털 접속
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            )}
          </button>
        </form>
    </AuthCard>
  )
}

export default Login
