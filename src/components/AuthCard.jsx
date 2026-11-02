import { Music2 } from 'lucide-react'

function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#F3F4FB] p-4 text-[#2A2C41] md:p-8">
      <section className="grid h-full min-h-0 w-full max-w-[1600px] overflow-hidden rounded-[2rem] border border-[#ECEAF5] bg-white shadow-[0_20px_60px_-15px_rgba(42,44,65,0.16)] lg:grid-cols-2">
        <aside className="relative hidden min-h-0 overflow-hidden bg-linear-to-br from-[#8061F9] via-[#6C48F5] to-[#35216F] p-7 text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full border-[48px] border-white/10" />
          <div className="relative flex items-center gap-3">
            <span className="text-3xl font-bold tracking-tight">ONAD</span>
          </div>
          <div className="relative mx-auto flex h-[clamp(230px,44vh,520px)] w-[clamp(230px,44vh,520px)] shrink items-center justify-center rounded-[2.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
            <span className="absolute h-56 w-56 rounded-full bg-[#B9A9FF]/50 blur-3xl" />
            <span className="absolute left-10 top-14 h-24 w-24 rounded-full border-[18px] border-white/35" />
            <span className="absolute bottom-12 right-10 h-32 w-32 rotate-12 rounded-[2rem] bg-white/20" />
            <span className="relative flex h-40 w-40 items-center justify-center rounded-[3rem] bg-white/20 shadow-[0_18px_40px_rgba(30,15,80,0.28)] backdrop-blur-md">
              <Music2 size={70} strokeWidth={1.5} />
            </span>
          </div>
          <div className="relative max-w-md">
            <p className="mt-3 text-3xl font-extrabold leading-tight">음악 팬에게 닿는<br />더 나은 광고 경험</p>
            <p className="mt-4 text-sm leading-6 text-white/75">ONAD와 함께 캠페인 성과를 관리하세요.</p>
          </div>
        </aside>

        <div className="flex min-h-0 items-center justify-center overflow-hidden p-5 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-[34rem] flex-col gap-4">
            <header className="space-y-2">
              <p className="text-xs font-bold tracking-[0.14em] text-[#6C48F5]">ONAD</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#2A2C41]">{title}</h1>
              <p className="text-sm text-[#858296]">{subtitle}</p>
            </header>

            {children}

            {footer && <footer className="border-t border-[#F0EFF7] pt-4 text-center">{footer}</footer>}
          </div>
        </div>
      </section>
    </main>
  )
}

export default AuthCard
