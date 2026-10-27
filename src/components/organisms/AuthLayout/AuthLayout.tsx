import type { ReactNode } from 'react'

export type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10 sm:px-6">
      <section className="glass-card w-full max-w-[420px] px-6 py-8 shadow-[0_12px_40px_rgba(79,70,229,0.08)] sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src="/logo-only.png"
            alt="PSM"
            className="w-[150px] h-[70px] object-contain"
          />
        </div>
        {children}
      </section>
    </main>
  )
}
