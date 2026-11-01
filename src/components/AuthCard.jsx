function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F4FB] p-4 py-8">
      <section className="flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border border-[#ECEAF5] bg-white p-7 shadow-[0_20px_60px_-15px_rgba(42,44,65,0.16)] sm:p-9">
        <header className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#6C48F5] text-lg font-black text-white shadow-lg shadow-[#6C48F5]/25">O</div>
          <p className="pt-2 text-xs font-bold tracking-[0.14em] text-[#6C48F5]">ONAD ADVERTISER PORTAL</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#2A2C41]">
            {title}
          </h1>
          <p className="text-xs text-[#858296]">{subtitle}</p>
        </header>

        {children}

        {footer && (
          <footer className="border-t border-[#F0EFF7] pt-4 text-center">
            {footer}
          </footer>
        )}
      </section>
    </main>
  )
}

export default AuthCard
