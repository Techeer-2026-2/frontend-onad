import { useState } from 'react'
import { Check, ChevronDown, Megaphone } from 'lucide-react'

function CampaignSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-onad-dark">캠페인</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`캠페인 선택: ${selected?.label ?? '없음'}`}
          className="inline-flex min-h-11 w-64 items-center justify-between gap-3 rounded-xl border border-[#E4E1F0] bg-white px-4 text-sm font-semibold text-onad-dark shadow-sm transition hover:border-[#CFC4FF] hover:bg-[#FCFBFF] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-onad-purple"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Megaphone size={16} className="shrink-0 text-onad-purple" aria-hidden="true" />
            <span className="truncate">{selected?.label ?? '캠페인 선택'}</span>
          </span>
          <ChevronDown size={16} className={`shrink-0 text-[#7C6DB9] transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {isOpen && (
          <div role="menu" aria-label="캠페인 선택" className="absolute left-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[#E4E1F0] bg-white p-1.5 shadow-xl shadow-[#342B68]/10">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${isSelected ? 'bg-[#F0ECFF] text-onad-purple' : 'text-[#4B485C] hover:bg-[#F7F5FF] hover:text-onad-purple'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={15} className="shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignSelect
