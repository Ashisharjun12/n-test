import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth.store'

const FEATURES = [
  { icon: ShieldCheck, text: 'No credit card required' },
  { icon: TrendingUp,  text: 'Unlimited invoices & quotations' },
  { icon: Clock,       text: 'Multi-company from day one' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, login, isLoading, error, clearError } = useAuthStore()
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    clearError()
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (_) {}
  }

  return (
    <div className="flex min-h-screen font-sans">

      {/* ── Left: brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0a0b0d] p-16">
        <div>
          <span className="text-xl font-semibold tracking-tight text-white">
            <span className="text-[#0052ff]">N</span>ero
          </span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-[44px] font-normal leading-[1.09] tracking-[-1px] text-white">
              Start billing<br />smarter.
            </h1>
            <p className="text-[16px] leading-relaxed text-[#a8acb3] max-w-xs">
              Join thousands of businesses creating professional invoices with Nero — free to start.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#16181c]">
                  <Icon className="size-4 text-[#0052ff]" />
                </div>
                <span className="text-sm text-[#a8acb3]">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#5b616e]">© 2026 Nero. All rights reserved.</p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Header */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.5px] text-[#0052ff]">
              Get started free
            </p>
            <h2 className="text-[32px] font-normal tracking-[-0.4px] text-[#0a0b0d]">
              Create your account
            </h2>
            <p className="text-sm text-[#5b616e]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#0052ff] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[14px] font-medium text-[#0a0b0d]">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Ashish Raj"
                className="h-12 rounded-[12px] border-[#dee1e6] bg-white px-4 text-[#0a0b0d] placeholder:text-[#a8acb3] text-base focus-visible:border-[#0052ff] focus-visible:ring-[#0052ff]/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[14px] font-medium text-[#0a0b0d]">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="h-12 rounded-[12px] border-[#dee1e6] bg-white px-4 text-[#0a0b0d] placeholder:text-[#a8acb3] text-base focus-visible:border-[#0052ff] focus-visible:ring-[#0052ff]/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[14px] font-medium text-[#0a0b0d]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="h-12 rounded-[12px] border-[#dee1e6] bg-white px-4 pr-12 text-[#0a0b0d] placeholder:text-[#a8acb3] text-base focus-visible:border-[#0052ff] focus-visible:ring-[#0052ff]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#7c828a] hover:text-[#0a0b0d]"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-[#cf202f]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full h-11 cursor-pointer rounded-full bg-[#0052ff] text-base font-semibold text-white',
                'hover:bg-[#003ecc] transition-colors',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-[#7c828a] leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="cursor-pointer text-[#0052ff]">Terms of Service</span>{' '}
              and{' '}
              <span className="cursor-pointer text-[#0052ff]">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
