import { useEffect } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { COLLEGE } from './config';
import { useServerStatus } from './lib/server';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Raise from './pages/Raise';

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `border-b-2 pb-1 text-body transition-colors ${
          isActive ? 'border-paper font-medium text-paper' : 'border-transparent text-paper/75 hover:text-paper'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function ConnectionBanner() {
  const { online, recheck } = useServerStatus();
  if (online !== false) return null;
  return (
    <div role="alert" className="animate-rise-in border-b border-state-breached/30 bg-[#F6E9E5]">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 text-body text-state-breached sm:px-6">
        <p>
          <span className="font-semibold">The ticket server is not running.</span> Open a terminal in the{' '}
          <code>backend</code> folder and run <code>python run.py</code>. This page reconnects automatically.
        </p>
        <button type="button" onClick={recheck} className="btn-quiet text-state-breached">
          Check again
        </button>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <header className="bg-ink text-paper">
        <div className="mx-auto flex max-w-page flex-wrap items-end justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
          <Link to="/" className="leading-tight">
            <span className="block font-serif text-[1.3rem] font-semibold">{COLLEGE.name}</span>
            <span className="block text-meta text-paper/70">
              {COLLEGE.office}, {COLLEGE.city}
            </span>
          </Link>
          <nav className="flex gap-6" aria-label="Main">
            <NavItem to="/raise">Raise a ticket</NavItem>
            <NavItem to="/dashboard">Staff dashboard</NavItem>
          </nav>
        </div>
      </header>
      <div className="h-[5px] border-b border-ink bg-paper" aria-hidden />
      <ConnectionBanner />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/raise" element={<Raise />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-page px-4 py-20 sm:px-6">
                <h1 className="text-title font-semibold">This page does not exist</h1>
                <p className="mt-2 text-ink-muted">Check the address, or go back to the start.</p>
                <Link to="/" className="btn-secondary mt-6">Go to the start page</Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-page px-4 py-5 text-meta text-ink-muted sm:px-6">
          {COLLEGE.counter} This is a demo; {COLLEGE.name} is a fictional institution.
        </div>
      </footer>
    </div>
  );
}
