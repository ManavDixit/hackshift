import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { AiDoctor } from '@/components/AiDoctor';
import { Logo } from '@/components/PublicHeader';
import { useApp } from '@/lib/appContext';

export function SignInPage() {
  const { navigate, setProfile } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProfile({ email, name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Aarav' });
      navigate('onboarding');
    }, 900);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex" style={{ background: 'linear-gradient(160deg,#E9F2FF 0%,#FFFFFF 45%,#DFF7EC 100%)' }}>
        <Logo onClick={() => navigate('home')} />
        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-[30px] font-extrabold leading-tight tracking-tight text-ink">
            Connected care, from first question to final follow-up.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
            Sign in to compare care options, understand your health information, and keep every step
            of your recovery organized.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-8 right-0 opacity-90">
          <AiDoctor size={300} />
        </div>
        <p className="relative z-10 flex items-center gap-2 text-[12px] font-semibold text-ink-faint">
          <ShieldCheck size={14} className="text-teal-500" /> Consent-first · Sample data only in this demo
        </p>
      </div>

      <div className="flex items-center justify-center bg-white px-5 py-10">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <Logo onClick={() => navigate('home')} />
          </div>
          <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-soft">Sign in to your MediLink account.</p>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">Email or username</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  id="email"
                  type="email"
                  className={`input pl-10 ${errors.email ? 'border-coral-400 ring-4 ring-coral-50' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-err' : undefined}
                />
              </div>
              {errors.email && <p id="email-err" className="mt-1.5 text-[12px] font-semibold text-coral-600 animate-fade-in">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={`input pl-10 pr-11 ${errors.password ? 'border-coral-400 ring-4 ring-coral-50' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'pw-err' : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-faint hover:text-ink"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p id="pw-err" className="mt-1.5 text-[12px] font-semibold text-coral-600 animate-fade-in">{errors.password}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-ink-soft">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-line accent-primary-500" />
                Remember me
              </label>
              <button type="button" className="text-[13px] font-semibold text-primary-600 hover:underline">Forgot password?</button>
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] font-semibold text-ink-faint">New to MediLink?</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <button className="btn-secondary w-full py-3" onClick={() => navigate('onboarding')}>
            Create Account
          </button>
          <p className="mt-6 text-center text-[12px] leading-relaxed text-ink-faint">
            Demonstration sign-in — credentials are not verified and no real account is created.
          </p>
        </div>
      </div>
    </div>
  );
}
