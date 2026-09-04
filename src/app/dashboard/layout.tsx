'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ListChecks, Plus, LogOut, Menu, X } from 'lucide-react';
import { getAuthToken, getUser, clearAuthToken } from '@/lib/auth';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/requests', label: 'Requests', icon: ListChecks, exact: false },
  { href: '/dashboard/requests/new', label: 'New Request', icon: Plus, exact: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace('/auth/login');
      return;
    }
    setUser(getUser());
    setChecked(true);
  }, [router]);

  const logout = () => {
    clearAuthToken();
    if (typeof window !== 'undefined') localStorage.removeItem('user');
    router.replace('/auth/login');
  };

  // Don't flash protected content before the token check completes
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = (item: typeof nav[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-300">
        <div className="px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 -ml-2 hover:bg-neutral-200 rounded-lg transition-smooth"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/images/brand/logo-icon.png" alt="" fill className="object-contain" />
              </div>
              <span className="font-bold text-neutral-900 hidden sm:block">ServicePilot AI</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    isActive(item)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-neutral-900 leading-tight">
                {user?.name}
              </div>
              <div className="text-xs text-neutral-500 leading-tight">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 rounded-lg transition-smooth"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-neutral-200 px-4 py-3 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(item)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-600'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}