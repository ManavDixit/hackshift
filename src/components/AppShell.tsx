import { useState, type ReactNode } from 'react';
import {
  Activity,
  Bell,
  Building2,
  CalendarCheck2,
  Droplets,
  FileText,
  FlaskConical,
  Compass,
  HeartPulse,
  IndianRupee,
  Languages,
  LogOut,
  Menu,
  Pill,
  Settings,
  ShieldCheck,
  Stethoscope,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/lib/appContext';
import { t } from '@/lib/i18n';
import { Logo } from './PublicHeader';
import { DoctorWidget } from './DoctorWidget';

interface NavItem {
  id: string;
  labelKey: 'overview' | 'aiDoctor' | 'findCare' | 'costEstimator' | 'findSpecialists' | 'medicines' | 'bloodBank' | 'labsReferrals' | 'careloop' | 'healthRecords' | 'notifications' | 'settings' | 'mediCoverAI';
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { id: 'overview', labelKey: 'overview', icon: Activity },
  { id: 'aidoctor', labelKey: 'aiDoctor', icon: HeartPulse },
  { id: 'find-care', labelKey: 'findCare', icon: Compass },
  { id: 'cost-estimator', labelKey: 'costEstimator', icon: IndianRupee },
  { id: 'specialists', labelKey: 'findSpecialists', icon: Stethoscope },
  { id: 'medicines', labelKey: 'medicines', icon: Pill },
  { id: 'bloodbank', labelKey: 'bloodBank', icon: Droplets },
  { id: 'labs', labelKey: 'labsReferrals', icon: FlaskConical },
  { id: 'careloop', labelKey: 'careloop', icon: Workflow },
  { id: 'medicover', labelKey: 'mediCoverAI', icon: ShieldCheck },
];

const secondaryNav: NavItem[] = [
  { id: 'records', labelKey: 'healthRecords', icon: FileText },
  { id: 'notifications', labelKey: 'notifications', icon: Bell },
  { id: 'settings', labelKey: 'settings', icon: Settings },
];

function NavButton({
  item,
  active,
  onClick,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-all duration-200 ${
        active ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-primary-50/60 hover:text-ink'
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary-500 transition-all duration-200 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <Icon size={17} strokeWidth={2.2} className={active ? 'text-primary-500' : 'text-ink-faint group-hover:text-primary-400'} />
      {!compact && <span className="truncate">{t(useApp().lang)[item.labelKey]}</span>}
    </button>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { page, navigate, profile, lang, setLang } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const strings = t(lang);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-4">
        <Logo onClick={() => navigate('overview')} />
        <button className="rounded-lg p-1.5 text-ink-soft hover:bg-primary-50 xl:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Application">
        {mainNav.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={() => {
              navigate(item.id);
              setMobileOpen(false);
            }}
          />
        ))}
        <div className="!mt-5 mb-2 px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-faint">
          {lang === 'hi' ? 'अधिक' : 'More'}
        </div>
        {secondaryNav.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={() => {
              navigate(item.id);
              setMobileOpen(false);
            }}
          />
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-sky px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 font-display text-[13px] font-bold text-white">
            {profile.name.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{profile.name}</p>
            <p className="text-[11px] font-medium text-ink-soft capitalize">
              {profile.role === 'patient' ? (lang === 'hi' ? 'रोगी / देखभालकर्ता' : 'Patient / Caregiver') : lang === 'hi' ? 'स्वास्थ्य कार्यकर्ता' : 'Healthcare Worker'}
            </p>
          </div>
          <button
            className="rounded-lg p-1.5 text-ink-faint hover:bg-white hover:text-coral-500"
            title={lang === 'hi' ? 'साइन आउट' : 'Sign out'}
            onClick={() => navigate('home')}
          >
            <LogOut size={15} />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-1">
          <Languages size={14} className="text-ink-faint" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'hi')}
            className="w-full cursor-pointer rounded-lg border border-line bg-white px-2 py-1.5 text-[12px] font-semibold text-ink-soft focus:outline-none"
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-line bg-white xl:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[270px] bg-white shadow-lift animate-fade-in">{sidebar}</aside>
        </div>
      )}

      <div className="xl:pl-[240px]">
        <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-lg p-2 text-ink hover:bg-primary-50 xl:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[17px] font-bold tracking-tight text-ink">{title}</h1>
              {subtitle && <p className="truncate text-[12px] font-medium text-ink-soft">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
      <DoctorWidget />
    </div>
  );
}
