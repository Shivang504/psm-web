import { Activity, Lock, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type AuthLayoutProps = {
  variant: 'login' | 'otp'
  children: ReactNode
}

type Highlight = {
  icon: LucideIcon
  title: string
  detail: string
}

const loginHighlights: Highlight[] = [
  {
    icon: ShieldCheck,
    title: 'Protected access',
    detail: 'Only verified admins can open the panel.',
  },
  {
    icon: Activity,
    title: 'One working view',
    detail: 'Keep monitoring and daily control in the same place.',
  },
]

const otpHighlights: Highlight[] = [
  {
    icon: Lock,
    title: 'A second check',
    detail: 'The code confirms the sign-in belongs to you.',
  },
  {
    icon: ShieldCheck,
    title: 'Short-lived code',
    detail: 'Request a new one if the first message does not arrive.',
  },
]

export function AuthLayout({ variant, children }: AuthLayoutProps) {
  const highlights = variant === 'login' ? loginHighlights : otpHighlights

  return (
    <>
      {/* Central Glass Card */}
      <section className="glass-card min-h-[640px] w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/70 backdrop-blur-2xl shadow-[0_24px_70px_rgba(79,70,229,0.12)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Area */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-10 lg:p-12">
          {/* Header Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="The PSM Application Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Form Content Wrapper */}
          <div className="w-full max-w-md my-auto py-10 mx-auto sm:mx-0">
            {children}
          </div>

          {/* Footer Note */}
          <p className="text-xs font-medium text-slate-500 flex items-center gap-2 pt-4">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Protected admin access · End-to-end verified
          </p>
        </div>

        {/* Right Frosted Aside Area */}
        <aside className="lg:col-span-5 hidden lg:flex flex-col justify-between my-3 mr-3 p-8 lg:p-10 rounded-[24px] bg-gradient-to-br from-[#4F46E5] via-[#4338CA] to-[#312E81] text-white shadow-xl relative overflow-hidden">
          {/* Ambient decorative background glow */}
          <div className="pointer-events-none absolute -top-20 -right-12 size-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full bg-[#BAE6FD]/20 blur-3xl" />

          {/* Badge / Subtitle */}
          <p className="relative text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">
            {variant === 'login' ? 'Admin Portal' : 'Verification'}
          </p>

          {/* Main Aside Copy */}
          <div className="relative my-auto py-8">
            {variant === 'login' ? (
              <div className="space-y-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-inner backdrop-blur-md">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M4 12a8 8 0 0 1 14-5" />
                    <path d="M20 12a8 8 0 0 1-14 5" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                    Better control.
                    <br />
                    Clearer operations.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Sign in to keep admin workflows moving with real-time
                    employee management and attendance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-inner backdrop-blur-md">
                  <Lock className="size-6 text-white" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                    Confirm it is you.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Enter the 6-digit verification code sent to your mobile
                    phone.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feature Highlights */}
          {highlights.length > 0 && (
            <ul className="relative space-y-4 pt-6 border-t border-white/15">
              {highlights.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
                      {Icon && <Icon className="size-4 text-white" />}
                    </span>
                    <div>
                      <span className="block text-xs font-semibold text-white">
                        {item.title}
                      </span>
                      <span className="block text-[11px] leading-normal text-white/75 mt-0.5">
                        {item.detail}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
      </section>
    </>
  )
}
