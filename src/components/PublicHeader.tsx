import { useEffect, useState } from 'react';
import { HeartPulse, Menu, X } from 'lucide-react';
import { useApp } from '@/lib/appContext';

const links = [
  { id: 'agents', label: 'Product' },
  { id: 'journey', label: 'How It Works' },
  { id: 'services', label: 'Healthcare Services' },
  { id: 'doctor', label: 'AI Doctor' },
  { id: 'about', label: 'About' },
];

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 focus:outline-none" aria-label="MediLink home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 shadow-glow">
        <HeartPulse size={18} className="text-white" strokeWidth={2.4} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-teal-400" />
      </span>
      <span className="font-display text-[19px] font-extrabold tracking-tight text-ink">
        Medi<span className="text-primary-500">Link</span>
      </span>
    </button>
  );
}

export function PublicHeader() {
  const { navigate } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled ? 'border-line bg-white/85 shadow-sm backdrop-blur-md' : 'border-transparent bg-white/60 backdrop-blur-sm'
      }`}
    >
      <div className="container-app flex h-16 items-center justify-between">
        <Logo onClick={() => navigate('home')} />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2.5 lg:flex">
          <button className="btn-ghost" onClick={() => navigate('signin')}>
            Sign In
          </button>
          <button className="btn-primary" onClick={() => navigate('signin')}>
            Get Started
          </button>
        </div>
        <button
          className="rounded-lg p-2 text-ink lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-4 pb-5 pt-3 lg:hidden animate-fade-in">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-primary-50"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex gap-2.5">
              <button className="btn-secondary flex-1" onClick={() => navigate('signin')}>
                Sign In
              </button>
              <button className="btn-primary flex-1" onClick={() => navigate('signin')}>
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
