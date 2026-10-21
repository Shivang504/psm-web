import { Activity, Lock, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { BrandMark } from '../../atoms/BrandMark'

type AuthLayoutProps = {
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
    <main className="min-h-svh bg-white">
      <section className="grid min-h-svh w-full bg-white lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)]">
        {/* Left Form Area */}
        <div className="flex min-h-svh min-w-0 flex-col justify-between px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
          <BrandLockup />
          <div className="my-auto flex min-w-0 flex-col justify-center py-4">
            {children}
          </div>
          <p className="text-xs text-slate-400">Secure admin access</p>
        </div>

        {/* Right Aside Area */}
        <aside className="relative hidden min-h-svh overflow-hidden bg-[linear-gradient(165deg,#2a2578_0%,#4f46e5_52%,#7c73f6_100%)] px-8 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-10 xl:py-10">
          <div className="pointer-events-none absolute -top-20 -right-12 size-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-[#ddd6fe]/25" />

          <p className="relative text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">
            {variant === 'login' ? 'Admin panel' : 'Verification'}
          </p>

          <div className="relative my-auto py-4">
            {variant === 'login' ? <LoginPanel /> : <OtpPanel />}
          </div>

          <ul className="relative space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon

              return (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold sm:text-sm">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-normal text-white/75 sm:text-sm sm:leading-5">
                      {item.detail}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </aside>
      </section>
    </main>
  )
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="size-10 rounded-2xl" />
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-slate-900">
          Admin
        </p>
        <p className="text-xs text-slate-400">Manage · Monitor · Grow</p>
      </div>
    </div>
  )
}

function LoginPanel() {
  return (
    <div>
      <BrandMark className="size-14 rounded-[20px] shadow-lg shadow-indigo-950/30" />
      <h2 className="mt-6 text-3xl leading-[1.12] font-semibold tracking-tight xl:text-4xl">
        Better control.
        <br />
        Clearer operations.
      </h2>
      <p className="mt-3 max-w-sm text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">
        Sign in to keep admin work moving, with a quick code check before you
        are in.
      </p>
    </div>
  )
}

function OtpPanel() {
  return (
    <div>
      <div className="flex size-14 items-center justify-center rounded-[20px] bg-white/15 ring-1 ring-white/30">
        <Lock className="size-6" strokeWidth={1.75} />
      </div>
      <h2 className="mt-6 text-3xl leading-[1.12] font-semibold tracking-tight xl:text-4xl">
        Confirm it is you.
      </h2>
      <p className="mt-3 max-w-sm text-xs leading-5 text-white/75 sm:text-sm sm:leading-6">
        Enter the 6-digit code sent to your mobile number. It is the last step
        before the panel opens.
      </p>
    </div>
  )
}
