const periodOptions = [
  { days: 7, label: '최근 7일' },
  { days: 30, label: '최근 30일' },
]

function PeriodToggle({ value, onChange }) {
  return (
    <div role="group" aria-label="조회 기간" className="inline-flex self-start rounded-lg border border-[#E8E6F2] bg-[#F7F7FB] p-0.5 text-xs font-medium sm:self-auto">
      {periodOptions.map((option) => (
        <button
          key={option.days}
          type="button"
          aria-pressed={value === option.days}
          onClick={() => onChange(option.days)}
          className={`rounded-md px-3 py-1.5 ${value === option.days ? 'bg-white font-bold text-[#6C48F5] shadow-sm' : 'text-[#6F6C80] hover:text-[#2A2C41]'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default PeriodToggle
