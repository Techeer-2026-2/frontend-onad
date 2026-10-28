function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C0C0D] p-4 py-8">
      <section className="flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-[#E5E5E5] bg-white p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#232528]">
            {title}
          </h1>
          <p className="text-xs text-[#364964]">{subtitle}</p>
        </header>

        {children}

        {footer && (
          <footer className="border-t border-[#E5E5E5] pt-4 text-center">
            {footer}
          </footer>
        )}
      </section>
    </main>
  )
}

export default AuthCard
