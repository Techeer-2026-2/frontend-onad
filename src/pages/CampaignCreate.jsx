import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createCampaign, getCampaign, updateCampaign } from '../api/campaigns'
import CampaignPreview from '../components/CampaignPreview'

const initialFormData = {
  title: '',
  body: '',
  linkUrl: '',
  startAt: '',
  endAt: '',
  budget: '',
  bidPrice: '',
  targetClicks: '',
}

const numericFields = ['budget', 'bidPrice', 'targetClicks']

function toDigits(value) {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 12)
}

function formatThousands(digits) {
  return digits ? Number(digits).toLocaleString('ko-KR') : ''
}

function toFormNumber(value) {
  return value > 0 ? String(value) : ''
}

const inputClassName =
  'mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/20'


function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validateForm(formData, { deliveryLocked, isEditMode, savedFields }) {
  const errors = {}
  if (!formData.title.trim()) errors.title = '캠페인 제목을 입력해 주세요.'
  if (!formData.body.trim()) errors.body = '캠페인 내용을 입력해 주세요.'
  if (deliveryLocked) return errors

  if (formData.linkUrl.trim() && !isHttpUrl(formData.linkUrl.trim())) errors.linkUrl = 'http 또는 https로 시작하는 URL을 입력해 주세요.'
  if (!formData.startAt && (!isEditMode || savedFields?.startAt)) errors.startAt = '시작 일시를 입력해 주세요.'
  if (!formData.endAt && (!isEditMode || savedFields?.endAt)) errors.endAt = '종료 일시를 입력해 주세요.'
  if (formData.startAt && formData.endAt && formData.endAt <= formData.startAt) {
    errors.endAt = '종료 일시는 시작 일시보다 늦어야 합니다.'
  }
  const totalBudget = Number(formData.budget)
  const bidPrice = Number(formData.bidPrice)
  const targetClicks = Number(formData.targetClicks)
  if (!isEditMode || totalBudget !== savedFields?.totalBudget) {
    if (totalBudget < 10_000 || totalBudget > 1_000_000_000) {
      errors.budget = '캠페인 예산은 10,000원 ~ 10억 원 사이로 입력해 주세요.'
    }
  }
  if (!isEditMode || bidPrice !== savedFields?.bidPrice || totalBudget !== savedFields?.totalBudget) {
    if (bidPrice < 1 || bidPrice > totalBudget) errors.bidPrice = '입찰가는 1원 이상이고 총 예산 이하여야 합니다.'
  }
  if (!isEditMode || targetClicks !== savedFields?.targetClicks) {
    if (targetClicks < 1 || targetClicks > 10_000_000) errors.targetClicks = '목표 클릭수는 1회 ~ 1,000만 회 사이로 입력해 주세요.'
  }
  return errors
}

const ageGroupValues = {
  '10대': '10s',
  '20대': '20s',
  '30대': '30s',
  '40대': '40s',
  '50대+': '50s',
}
const genderValues = { 전체: 'all', 남성: 'male', 여성: 'female' }

function toDateTimeInput(value) {
  // The API sends Korea-local timestamps without a timezone offset.
  return value?.slice(0, 16) || ''
}

function campaignFields(formData, ageGroups, genders) {
  return {
    title: formData.title.trim(),
    body: formData.body.trim(),
    linkUrl: formData.linkUrl.trim(),
    startAt: formData.startAt,
    endAt: formData.endAt,
    totalBudget: Number(formData.budget),
    bidPrice: Number(formData.bidPrice),
    targetClicks: Number(formData.targetClicks),
    targetAgeGroups: ageGroups.map(age => ageGroupValues[age]).sort(),
    targetGenders: genders.map(gender => genderValues[gender]).sort(),
  }
}

function FormField({ id, label, required = false, description, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
        {label}{required && <span className="ml-1 text-rose-600">*</span>}
      </label>
      {children}
      {description && !error && <p className="mt-1.5 text-xs leading-5 text-gray-500">{description}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-rose-600"><AlertCircle size={13} aria-hidden="true" />{error}</p>}
    </div>
  )
}

function SectionCard({ number, title, children }) {
  return (
    <section className="space-y-5 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6C48F5]/10 text-xs text-[#6C48F5]">{number.replace(/^0/, '')}</span>{title}
      </h2>
      {children}
    </section>
  )
}

function CampaignCreate() {
  const { campaignId } = useParams()
  return <CampaignForm key={campaignId ?? 'new'} campaignId={campaignId} />
}

function CampaignForm({ campaignId }) {
  const navigate = useNavigate()
  const isEditMode = Boolean(campaignId)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageError, setImageError] = useState('')
  const imageInputRef = useRef(null)
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(['20대', '30대'])
  const [selectedGenders, setSelectedGenders] = useState(['전체'])
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [campaignStatus, setCampaignStatus] = useState('')
  const [savedFields, setSavedFields] = useState(null)
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(isEditMode)
  const [loadError, setLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const deliveryLocked = campaignStatus === 'ONGOING'
  const validationOptions = { deliveryLocked, isEditMode, savedFields }

  useEffect(() => {
    if (!isEditMode) return undefined

    const controller = new AbortController()
    getCampaign(campaignId, { signal: controller.signal })
      .then((campaign) => {
        if (controller.signal.aborted) return
        if (String(campaign?.campaignId) !== campaignId) throw new Error('캠페인 상세 응답 형식이 올바르지 않습니다.')
        const fields = {
          title: campaign.title || '',
          body: campaign.body || '',
          linkUrl: campaign.linkUrl || '',
          startAt: toDateTimeInput(campaign.startAt),
          endAt: toDateTimeInput(campaign.endAt),
          budget: toFormNumber(campaign.totalBudget),
          bidPrice: toFormNumber(campaign.bidPrice),
          targetClicks: toFormNumber(campaign.targetClicks),
        }
        const ages = (campaign.targetAgeGroups ?? [])
          .map(value => Object.keys(ageGroupValues).find(age => ageGroupValues[age] === value)).filter(Boolean)
        const genders = (campaign.targetGenders ?? [])
          .map(value => Object.keys(genderValues).find(gender => genderValues[gender] === value)).filter(Boolean)
        setFormData(fields)
        setSavedFields(campaignFields(fields, ages, genders))
        setExistingImageUrl(campaign.imageUrl || '')
        setCampaignStatus(campaign.status || '')
        setSelectedAgeGroups(ages)
        setSelectedGenders(genders)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message || '캠페인 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingCampaign(false)
      })

    return () => controller.abort()
  }, [campaignId, isEditMode])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleChange(event) {
    const { name, value } = event.target
    const nextFormData = { ...formData, [name]: numericFields.includes(name) ? toDigits(value) : value }
    setFormData(nextFormData)
    setNotice('')
    if (hasSubmitted) setErrors(validateForm(nextFormData, validationOptions))
  }

  function toggleAgeGroup(ageGroup) {
    setSelectedAgeGroups((current) => {
      if (current.includes(ageGroup)) {
        return current.filter((age) => age !== ageGroup)
      }
      return [...current, ageGroup]
    })
  }

  function toggleGender(gender) {
    setSelectedGenders((current) => {
      if (gender === '전체') return ['전체']
      const withoutAll = current.filter((item) => item !== '전체')
      if (withoutAll.includes(gender)) {
        const next = withoutAll.filter((item) => item !== gender)
        return next.length > 0 ? next : ['전체']
      }
      return [...withoutAll, gender]
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

    if (file.size > 5 * 1024 * 1024) {
      setImageError('이미지 파일은 5MB 이하로 선택해 주세요.')
      event.target.value = ''
      setSelectedImage(null)
      setPreviewUrl('')
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }
  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return
    setHasSubmitted(true)
    const submittedFormData = { ...formData, ...Object.fromEntries(new FormData(event.currentTarget)) }
    for (const name of numericFields) submittedFormData[name] = toDigits(submittedFormData[name])
    setFormData(submittedFormData)
    const nextErrors = validateForm(submittedFormData, validationOptions)
    if (imageError) nextErrors.imageFile = imageError
    if (!isEditMode && !selectedImage) nextErrors.imageFile = '배너 이미지 파일을 선택해 주세요.'
    if (!deliveryLocked) {
      if (!selectedAgeGroups.length && (!isEditMode || savedFields?.targetAgeGroups.length)) {
        nextErrors.targetAgeGroups = '타겟 연령을 선택해 주세요.'
      }
      if (!selectedGenders.length && (!isEditMode || savedFields?.targetGenders.length)) {
        nextErrors.targetGenders = '타겟 성별을 선택해 주세요.'
      }
    }
    setErrors(nextErrors)
    setNotice('')
    if (Object.keys(nextErrors).length > 0) return

    const fields = campaignFields(submittedFormData, selectedAgeGroups, selectedGenders)
    const editableFields = deliveryLocked ? { title: fields.title, body: fields.body } : fields
    const payload = isEditMode
      ? Object.fromEntries(Object.entries(editableFields).filter(([key, value]) =>
        JSON.stringify(value) !== JSON.stringify(savedFields[key])))
      : fields
    const hasChanges = Object.keys(payload).length > 0
    if (isEditMode && !hasChanges && !selectedImage) {
      setNotice('변경된 내용이 없습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode) {
        await updateCampaign(campaignId, hasChanges ? payload : null, selectedImage)
        navigate(`/campaigns/${campaignId}`, { replace: true, state: { notice: '캠페인을 수정했습니다.' } })
      } else {
        const createdCampaign = await createCampaign(payload, selectedImage)
        if (createdCampaign?.campaignId) {
          navigate(`/campaigns/${createdCampaign.campaignId}`, { replace: true, state: { notice: '캠페인을 등록했습니다.' } })
        } else {
          navigate('/campaigns', { replace: true, state: { notice: '캠페인을 등록했습니다.' } })
        }
      }
    } catch (error) {
      setNotice(error.message || `캠페인을 ${isEditMode ? '수정' : '등록'}하지 못했습니다.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const describedBy = (id, error) => error ? `${id}-error` : undefined
  const previewTitle = formData.title.trim() || '광고 타이틀'
  const previewBody = formData.body.trim() || '광고 본문 문구'

  if (isLoadingCampaign) {
    return <p role="status" className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-16 text-center text-sm text-[#667085]">캠페인 정보를 불러오는 중입니다…</p>
  }

  if (loadError) {
    return <section className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center"><p role="alert" className="text-sm text-red-700">{loadError}</p><Link to={`/campaigns/${campaignId}`} className="mt-4 inline-flex text-sm font-semibold text-[#0B7CFF]">캠페인 상세로</Link></section>
  }

  if (isEditMode && campaignStatus === 'ENDED') {
    return <section className="rounded-xl border border-[#E5E5E5] bg-white px-6 py-12 text-center"><p role="alert" className="text-sm text-[#667085]">종료된 캠페인은 수정할 수 없습니다.</p><Link to={`/campaigns/${campaignId}`} className="mt-4 inline-flex text-sm font-semibold text-[#6C48F5]">캠페인 상세로</Link></section>
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="이전 페이지로 돌아가기"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F7F7FB] text-[#65748A] transition hover:bg-[#F0ECFF] hover:text-[#6C48F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]"
          >
            <ArrowLeft size={25} aria-hidden="true" />
          </button>
          <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? '캠페인 수정' : '새 캠페인 등록'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            ONBEAT 청취자들에게 새로운 광고를 선보이세요.
          </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <form noValidate onSubmit={handleSubmit} className="flex-1 space-y-6">
          {deliveryLocked && <p className="text-sm text-[#667085]">진행 중인 캠페인은 제목, 본문, 배너 이미지를 수정할 수 있습니다.</p>}
          <SectionCard number="01" title="기본 광고 정보 설정">
            <div className="space-y-4">
              <FormField id="title" label="광고 타이틀" required error={errors.title}>
                <input id="title" name="title" value={formData.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} aria-describedby={describedBy('title', errors.title)} className={inputClassName} placeholder="예: 인디 밴드 페스티벌 티켓 오픈" />
              </FormField>
              <FormField id="body" label="광고 본문 문구" required error={errors.body}>
                <textarea id="body" name="body" rows={3} value={formData.body} onChange={handleChange} aria-invalid={Boolean(errors.body)} aria-describedby={describedBy('body', errors.body)} className={`${inputClassName} resize-y`} placeholder="캠페인 메시지를 입력해 주세요." />
              </FormField>
              <FormField id="imageFile" label="배너 이미지 파일" required={!isEditMode} description={existingImageUrl ? '새 이미지를 선택하지 않으면 현재 이미지를 유지합니다.' : 'PNG, JPG, WebP 형식의 5MB 이하 이미지를 선택해 주세요.'} error={errors.imageFile || imageError}>
                <input ref={imageInputRef} id="imageFile" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} aria-invalid={Boolean(errors.imageFile || imageError)} aria-describedby={errors.imageFile || imageError ? 'imageFile-error' : undefined} className="mt-1.5 block w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-700 outline-none transition hover:border-[#6C48F5]/50 hover:bg-white focus:border-[#6C48F5] focus:ring-2 focus:ring-[#6C48F5]/20 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F0EDFF] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#6C48F5] disabled:bg-slate-50" />
                {selectedImage && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-[#F7F6FC] px-3 py-2 text-xs text-[#5D5A6E]">
                    <span className="min-w-0 truncate">{selectedImage.name} · {(selectedImage.size / (1024 * 1024)).toFixed(1)}MB</span>
                    <button type="button" onClick={() => { setSelectedImage(null); setPreviewUrl(''); setImageError(''); if (imageInputRef.current) imageInputRef.current.value = '' }} className="shrink-0 font-semibold text-[#6C48F5] hover:underline">삭제</button>
                  </div>
                )}
              </FormField>
              <FormField id="linkUrl" label="랜딩 페이지 URL" description="배너 클릭 시 연결할 주소입니다." error={errors.linkUrl}>
                <input id="linkUrl" name="linkUrl" type="url" value={formData.linkUrl} onChange={handleChange} disabled={deliveryLocked} aria-invalid={Boolean(errors.linkUrl)} aria-describedby={describedBy('linkUrl', errors.linkUrl)} className={`${inputClassName} font-mono text-xs`} placeholder="https://example.com" />
              </FormField>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard number="02" title="타겟 조건 설정">
              <div className="space-y-5">
              <fieldset disabled={deliveryLocked} aria-describedby={errors.targetAgeGroups ? 'targetAgeGroups-error' : undefined}>
                <legend className="text-sm font-semibold text-gray-700">연령대 타겟 <span className="font-normal text-gray-500">(중복 선택 가능)</span></legend>
                <div className="mt-2 flex flex-wrap gap-2">
                {['10대', '20대', '30대', '40대', '50대+'].map((ageGroup) => {
                    const isSelected = selectedAgeGroups.includes(ageGroup)
                    return (
                      <button
                        key={ageGroup}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleAgeGroup(ageGroup)}
                        className={isSelected
                          ? 'rounded-xl bg-[#6C48F5] px-3.5 py-2 text-xs font-bold text-white shadow-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]'
                          : 'rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C48F5]'}
                      >
                        {ageGroup}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              {errors.targetAgeGroups && <p id="targetAgeGroups-error" role="alert" className="text-xs text-rose-600">{errors.targetAgeGroups}</p>}

              <fieldset disabled={deliveryLocked} aria-describedby={errors.targetGenders ? 'targetGenders-error' : undefined}>
                <legend className="text-sm font-semibold text-gray-700">성별 타겟 <span className="font-normal text-gray-500">(중복 선택 가능)</span></legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['전체', '남성', '여성'].map((gender) => {
                    const isSelected = selectedGenders.includes(gender)
                    return <button key={gender} type="button" aria-pressed={isSelected} onClick={() => toggleGender(gender)} className={isSelected ? 'rounded-xl bg-[#6C48F5] px-3.5 py-2 text-xs font-bold text-white' : 'rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-white'}>{gender}</button>
                  })}
                </div>
                {errors.targetGenders && <p id="targetGenders-error" role="alert" className="mt-2 text-xs text-rose-600">{errors.targetGenders}</p>}
              </fieldset>
              </div>
            </SectionCard>

            <SectionCard number="03" title="캠페인 일정 설정">
              <div className="grid gap-4 sm:grid-rows-2">
                <FormField id="startAt" label="시작 일시" required error={errors.startAt}>
                  <input id="startAt" name="startAt" type="datetime-local" value={formData.startAt} onInput={handleChange} disabled={deliveryLocked} aria-invalid={Boolean(errors.startAt)} aria-describedby={describedBy('startAt', errors.startAt)} className={inputClassName} />
                </FormField>
                <FormField id="endAt" label="종료 일시" required error={errors.endAt}>
                  <input id="endAt" name="endAt" type="datetime-local" value={formData.endAt} onInput={handleChange} disabled={deliveryLocked} aria-invalid={Boolean(errors.endAt)} aria-describedby={describedBy('endAt', errors.endAt)} className={inputClassName} />
                </FormField>
              </div>
            </SectionCard>
          </div>

          {!deliveryLocked && (
            <SectionCard number="04" title="목표 및 예산 설정">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="targetClicks" label="목표 클릭수" required description="캠페인의 목표 총 클릭수입니다." error={errors.targetClicks}>
                  <div className="relative">
                    <input
                      id="targetClicks"
                      name="targetClicks"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={formatThousands(formData.targetClicks)}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.targetClicks)}
                      aria-describedby={describedBy('targetClicks', errors.targetClicks)}
                      className={`${inputClassName} pr-10`}
                      placeholder="예: 10,000"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-4 top-1.5 flex items-center text-sm text-gray-400">회</span>
                  </div>
                </FormField>

                <FormField id="budget" label="캠페인 예산" required description="10,000원 ~ 10억 원 사이로 입력해 주세요." error={errors.budget}>
                  <div className="relative">
                    <input
                      id="budget"
                      name="budget"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={formatThousands(formData.budget)}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.budget)}
                      aria-describedby={describedBy('budget', errors.budget)}
                      className={`${inputClassName} pr-10`}
                      placeholder="예: 5,000,000"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-4 top-1.5 flex items-center text-sm text-gray-400">원</span>
                  </div>
                </FormField>

                <FormField id="bidPrice" label="노출당 입찰가" required description="노출 1회에 지불할 최대 금액입니다." error={errors.bidPrice}>
                  <input id="bidPrice" name="bidPrice" type="text" inputMode="numeric"
                    value={formatThousands(formData.bidPrice)} onChange={handleChange}
                    aria-invalid={Boolean(errors.bidPrice)} aria-describedby={describedBy('bidPrice', errors.bidPrice)}
                    className={inputClassName} placeholder="예: 50" />
                </FormField>
              </div>
            </SectionCard>
          )}

          {notice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link to="/campaigns" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-100 px-6 text-sm font-bold text-gray-600 hover:bg-gray-200">취소</Link>
            <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#6C48F5] px-8 text-sm font-bold text-white shadow-lg shadow-[#6C48F5]/30 transition-all hover:-translate-y-0.5 hover:bg-[#5839DB] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? '저장 중…' : isEditMode ? '수정 내용 저장' : '캠페인 등록 완료'}</button>
          </div>
        </form>

        <aside className="w-full shrink-0 lg:w-[360px]">
          <div className="rounded-[2rem] border border-[#ECEAF5] bg-white p-5 shadow-sm lg:sticky lg:top-10">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Live Preview</h2>
            <CampaignPreview title={previewTitle} body={previewBody} imageUrl={previewUrl || existingImageUrl} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CampaignCreate
