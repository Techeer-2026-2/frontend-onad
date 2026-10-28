import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Music2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

const initialFormData = {
  artistId: '',
  title: '',
  body: '',
  linkUrl: '',
  startAt: '',
  endAt: '',
}

const inputClassName =
  'mt-1.5 block w-full rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-3 text-sm text-[#232528] outline-none transition placeholder:text-[#98A2B3] focus:border-[#0B7CFF] focus:ring-2 focus:ring-[#0B7CFF]/15'


function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateForm(formData) {
  const errors = {}
  if (!formData.artistId.trim()) errors.artistId = '아티스트 ID를 입력해 주세요.'
  if (!formData.title.trim()) errors.title = '캠페인 제목을 입력해 주세요.'
  if (!formData.body.trim()) errors.body = '캠페인 내용을 입력해 주세요.'

  if (formData.linkUrl.trim() && !isHttpUrl(formData.linkUrl.trim())) errors.linkUrl = 'http 또는 https로 시작하는 URL을 입력해 주세요.'
  if (!formData.startAt) errors.startAt = '시작 일시를 입력해 주세요.'
  if (!formData.endAt) errors.endAt = '종료 일시를 입력해 주세요.'
  if (formData.startAt && formData.endAt && new Date(formData.endAt) <= new Date(formData.startAt)) {
    errors.endAt = '종료 일시는 시작 일시보다 늦어야 합니다.'
  }
  return errors
}

function FormField({ id, label, required = false, description, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-[#232528]">
        {label}{required && <span className="ml-1 text-rose-600">*</span>}
      </label>
      {children}
      {description && !error && <p className="mt-1.5 text-[11px] leading-5 text-[#667085]">{description}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600"><AlertCircle size={13} aria-hidden="true" />{error}</p>}
    </div>
  )
}

function SectionCard({ number, title, children }) {
  return (
    <section className="space-y-5 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-[#232528]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C0C0D] text-[10px] text-white">{number}</span>{title}
      </h2>
      {children}
    </section>
  )
}

function CampaignCreate() {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef(null)
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(['20대', '30대'])
  const [selectedGender, setSelectedGender] = useState('all')

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleChange(event) {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)
    setNotice('')
    if (hasSubmitted) setErrors(validateForm(nextFormData))
  }

  function toggleAgeGroup(ageGroup) {
    setSelectedAgeGroups((current) => {
      if (ageGroup === '전체') {
        return ['전체']
      }

      const withoutAll = current.filter((age) => age !== '전체')
      if (withoutAll.includes(ageGroup)) {
        const next = withoutAll.filter((age) => age !== ageGroup)
        return next.length > 0 ? next : ['전체']
      }
      return [...withoutAll, ageGroup]
    })
  }
  function handleImageChange(event) {
    const file = event.target.files?.[0]
    setNotice('')
    setImageError('')

    if (!file) {
      setSelectedImage(null)
      setPreviewUrl('')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageError('JPG, PNG 또는 WebP 이미지 파일을 선택해 주세요.')
      event.target.value = ''
      setSelectedImage(null)
      setPreviewUrl('')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('이미지 파일은 10MB 이하로 선택해 주세요.')
      event.target.value = ''
      setSelectedImage(null)
      setPreviewUrl('')
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }
  function handleSubmit(event) {
    event.preventDefault()
    setHasSubmitted(true)
    const submittedFormData = Object.fromEntries(new FormData(event.currentTarget))
    setFormData(submittedFormData)
    const nextErrors = validateForm(submittedFormData)
    if (imageError) nextErrors.imageFile = imageError
    setErrors(nextErrors)
    setNotice(Object.keys(nextErrors).length === 0
      ? '입력값 확인됨.'
      : '')
  }

  const describedBy = (id, error) => error ? `${id}-error` : undefined
  const previewTitle = formData.title.trim() || '캠페인 타이틀이 여기에 표시됩니다'
  const previewBody = formData.body.trim() || '캠페인 설명을 입력하면 미리보기에 실시간으로 반영됩니다.'
  const audienceLabel = selectedAgeGroups.includes('전체') ? '전체 연령' : selectedAgeGroups.join(', ')
  const genderLabel = { all: '전체 성별', female: '여성', male: '남성' }[selectedGender]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B7CFF]">
            ONAD ADVERTISER PORTAL
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#232528]">신규 캠페인 등록</h1>
          <p className="mt-1 text-sm text-[#667085]">
            광고 콘텐츠와 캠페인 운영 기간을 설정합니다.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <form noValidate onSubmit={handleSubmit} className="space-y-6 lg:col-span-7">
          <SectionCard number="01" title="기본 광고 정보 설정">
            <div className="space-y-4">
              <FormField id="artistId" label="아티스트 ID" required error={errors.artistId}>
                <input id="artistId" name="artistId" value={formData.artistId} onChange={handleChange} aria-invalid={Boolean(errors.artistId)} aria-describedby={describedBy('artistId', errors.artistId)} autoComplete="off" className={inputClassName} placeholder="예: 12345" />
              </FormField>
              <FormField id="title" label="광고 타이틀 (헤드라인)" required error={errors.title}>
                <input id="title" name="title" value={formData.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} aria-describedby={describedBy('title', errors.title)} className={inputClassName} placeholder="예: 새로운 음악을 만나보세요" />
              </FormField>
              <FormField id="body" label="광고 본문 문구" required error={errors.body}>
                <textarea id="body" name="body" rows={3} value={formData.body} onChange={handleChange} aria-invalid={Boolean(errors.body)} aria-describedby={describedBy('body', errors.body)} className={`${inputClassName} resize-y`} placeholder="캠페인 메시지를 입력해 주세요." />
              </FormField>
              <FormField id="imageFile" label="배너 이미지 파일" description="JPG, PNG, WebP 최대 10MB" error={imageError}>
                <input ref={imageInputRef} id="imageFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} aria-invalid={Boolean(imageError)} aria-describedby={imageError ? 'imageFile-error' : undefined} className="mt-1.5 block w-full rounded-lg border border-[#E5E5E5] bg-white px-3.5 py-3 text-sm text-[#232528] outline-none transition focus:border-[#0B7CFF] focus:ring-2 focus:ring-[#0B7CFF]/15 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#0B7CFF]" />
                {selectedImage && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[#F7F9FC] px-3 py-2 text-xs text-[#475467]">
                    <span className="min-w-0 truncate">{selectedImage.name} · {(selectedImage.size / (1024 * 1024)).toFixed(1)}MB</span>
                    <button type="button" onClick={() => { setSelectedImage(null); setPreviewUrl(''); setImageError(''); if (imageInputRef.current) imageInputRef.current.value = '' }} className="shrink-0 font-semibold text-[#0B7CFF] hover:underline">삭제</button>
                  </div>
                )}
              </FormField>
              <FormField id="linkUrl" label="랜딩 페이지 URL" description="배너 클릭 시 연결할 주소입니다. 선택 입력 항목입니다." error={errors.linkUrl}>
                <input id="linkUrl" name="linkUrl" type="url" value={formData.linkUrl} onChange={handleChange} aria-invalid={Boolean(errors.linkUrl)} aria-describedby={describedBy('linkUrl', errors.linkUrl)} className={`${inputClassName} font-mono text-xs`} placeholder="https://example.com" />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard number="02" title="타겟 조건 설정">
            <div className="space-y-5">
              <fieldset>
                <legend className="text-xs font-bold text-[#232528]">연령대 타겟 <span className="font-normal text-[#667085]">(중복 선택 가능)</span></legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['전체', '20대', '30대', '40대', '50대+'].map((ageGroup) => {
                    const isSelected = selectedAgeGroups.includes(ageGroup)
                    return (
                      <button
                        key={ageGroup}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleAgeGroup(ageGroup)}
                        className={isSelected
                          ? 'rounded-lg bg-[#0B7CFF] px-3.5 py-2 text-xs font-bold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]'
                          : 'rounded-lg border border-[#E5E5E5] px-3.5 py-2 text-xs font-medium text-[#232528] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]'}
                      >
                        {ageGroup}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-bold text-[#232528]">성별 타겟</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[['all', '전체 성별'], ['female', '여성'], ['male', '남성']].map(([value, label]) => {
                    const isSelected = selectedGender === value
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        aria-checked={isSelected}
                        onClick={() => setSelectedGender(value)}
                        className={isSelected
                          ? 'rounded-lg bg-[#0B7CFF] px-3.5 py-2 text-xs font-bold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]'
                          : 'rounded-lg border border-[#E5E5E5] px-3.5 py-2 text-xs font-medium text-[#232528] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7CFF]'}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
              <p className="text-[11px] leading-5 text-[#667085]">선택 조건은 현재 화면 상태로만 유지됩니다. 등록 API 연동은 타겟 조건 필드에 대한 백엔드 계약 확인 후 진행합니다.</p>
            </div>
          </SectionCard>

          <SectionCard number="03" title="캠페인 일정 설정">
            <p className="-mt-2 text-[11px] text-[#667085]">캠페인이 노출될 시작·종료 일시를 지정합니다.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="startAt" label="시작 일시" required error={errors.startAt}>
                <input id="startAt" name="startAt" type="datetime-local" value={formData.startAt} onChange={handleChange} aria-invalid={Boolean(errors.startAt)} aria-describedby={describedBy('startAt', errors.startAt)} className={inputClassName} />
              </FormField>
              <FormField id="endAt" label="종료 일시" required error={errors.endAt}>
                <input id="endAt" name="endAt" type="datetime-local" value={formData.endAt} onChange={handleChange} aria-invalid={Boolean(errors.endAt)} aria-describedby={describedBy('endAt', errors.endAt)} className={inputClassName} />
              </FormField>
            </div>
          </SectionCard>

          {notice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link to="/campaigns" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-5 text-sm font-semibold text-[#344054] hover:bg-gray-50">취소</Link>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0B7CFF] px-5 text-sm font-semibold text-white hover:bg-blue-700">등록하기</button>
          </div>
        </form>

        <aside className="lg:col-span-5">
          <div className="space-y-4 rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div><h2 className="text-xs font-extrabold tracking-wide text-[#0B7CFF]">PREVIEW</h2><p className="mt-1 text-[10px] text-[#667085]">작성 중인 콘텐츠를 미리 확인합니다.</p></div>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-[#0B7CFF]">대상 연령 · {audienceLabel}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-[#475467]">{genderLabel}</span>
            </div>
            <div className="mx-auto max-w-67.5 rounded-4xl border-[7px] border-[#17191D] bg-[#101216] p-2.5 text-white shadow-xl">
              <div className="flex items-center justify-between px-2 pb-3 pt-1 text-[9px] font-semibold"><span>9:41</span><span>●●● ▰</span></div>
              <div className="rounded-2xl bg-[#1B1E24] p-3">
                <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B7CFF]"><Music2 size={14} /></div><span className="text-[11px] font-bold">ONAD</span></div><span className="text-[9px] text-white/50">광고</span></div>
                <div className="overflow-hidden rounded-xl bg-[#282C34]">
                                    {previewUrl
                    ? <img src={previewUrl} alt="선택한 캠페인 배너 미리보기" className="aspect-square w-full object-cover" />
                    : <div className="flex aspect-square w-full flex-col items-center justify-center bg-linear-to-br from-[#0B7CFF] via-[#3557A8] to-[#181A20] text-white/70"><Music2 size={34} /><span className="mt-2 text-[9px]">배너 이미지 미리보기</span></div>}
                  <div className="space-y-2 p-3"><p className="line-clamp-2 text-xs font-bold leading-5">{previewTitle}</p><p className="line-clamp-2 text-[10px] leading-4 text-white/65">{previewBody}</p><button type="button" className="flex w-full items-center justify-center gap-1 rounded-full bg-[#0B7CFF] py-2 text-[10px] font-bold"><Play size={11} fill="currentColor" />자세히 보기</button></div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#22252B] p-2"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-blue-500"><Music2 size={14} /></div><div className="min-w-0 flex-1"><p className="truncate text-[9px] font-semibold">ONAD 추천 콘텐츠</p><p className="text-[8px] text-white/50">캠페인 미리보기</p></div><Play size={12} /></div>
                <div className="mt-4 flex justify-around border-t border-white/10 pt-3 text-[8px] text-white/45"><span>홈</span><span className="text-white">탐색</span><span>보관함</span><span>내 정보</span></div>
              </div>
              <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-white/70" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CampaignCreate
