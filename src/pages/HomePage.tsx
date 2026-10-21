import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/slices/authSlice'
import { clearAuthSession } from '../utils/auth'

export default function HomePage() {
  const [count, setCount] = useState(0)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const mobile = useAppSelector((state) => state.auth.mobile)

  const handleSignOut = () => {
    clearAuthSession()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-medium tracking-wide text-sky-400">
          my-react-app
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          React, Vite, and TypeScript
        </h1>
        <p className="mt-3 text-slate-300">
          Tailwind CSS, ESLint, Prettier, and Lefthook are configured.
        </p>
        {mobile ? (
          <p className="mt-3 text-sm text-slate-400">Signed in as {mobile}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400"
            onClick={() => setCount((value) => value + 1)}
          >
            Count is {count}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-100 transition hover:bg-slate-800"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </section>
    </main>
  )
}
