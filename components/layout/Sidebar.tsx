"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  CalendarCheck, 
  ClipboardList,
  Calendar,
  CreditCard,
  Receipt,
  TrendingUp,
  Wrench,
  Globe,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
  { href: '/vehicles', label: 'Véhicules', icon: Car, roles: ['admin', 'agent'] },
  { href: '/clients', label: 'Clients', icon: Users, roles: ['admin', 'agent'] },
  { href: '/reservations', label: 'Réservations', icon: CalendarCheck, roles: ['admin', 'agent'] },
  { href: '/locations', label: 'Locations', icon: ClipboardList, roles: ['admin', 'agent'] },
  { href: '/planning', label: 'Planning', icon: Calendar, roles: ['admin', 'agent'] },
  { href: '/payments', label: 'Paiements', icon: CreditCard, roles: ['admin', 'agent'] },
  { href: '/expenses', label: 'Dépenses', icon: Receipt, roles: ['admin', 'agent'] },
  { href: '/finances', label: 'Finances', icon: TrendingUp, roles: ['admin'] },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'agent'] },
  { href: '/public-site', label: 'Mini-site', icon: Globe, roles: ['admin', 'agent'] }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  }

  if (!user) {
    return (
      <>
        {/* Mobile Header Skeleton */}
        <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-gradient-to-r from-royal-900 to-royal-950 px-4 lg:hidden">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-royal-800/50" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-royal-800/50" />
        </div>
        {/* Desktop Sidebar Skeleton */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 bg-gradient-to-b from-royal-900 via-royal-950 to-accent p-6 lg:block">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-royal-800/50" />
          <div className="mt-8 space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-royal-800/30" />
            ))}
          </div>
        </aside>
      </>
    );
  }

  const allowedLinks = links.filter(l => l.roles.includes(user.role));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="mb-6 px-3 lg:mb-8">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-royal-400 to-royal-500 shadow-lg shadow-royal-500/30 lg:h-10 lg:w-10 lg:rounded-xl">
            <Sparkles className="h-4 w-4 text-white lg:h-5 lg:w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white lg:text-xl">Auto</span>
            <span className="text-lg font-extrabold tracking-tight text-royal-400 lg:text-xl">Rent</span>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="mb-4 rounded-lg bg-royal-800/30 p-3 backdrop-blur-sm lg:mb-6 lg:rounded-xl lg:p-4">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-royal-500 to-royal-600 text-xs font-bold text-white shadow-lg shadow-royal-500/30 lg:h-10 lg:w-10 lg:text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white lg:text-base">{user.name}</p>
            <p className="text-xs capitalize text-royal-400">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto lg:space-y-1.5">
        {allowedLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={twMerge(
                'group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 lg:gap-3 lg:rounded-xl lg:px-4 lg:py-3',
                isActive 
                  ? 'bg-gradient-to-r from-royal-500 to-royal-600 text-white shadow-lg shadow-royal-500/30' 
                  : 'text-royal-300 hover:bg-royal-800/40 hover:text-white'
              )}
            >
              <Icon className={twMerge(
                'h-4 w-4 transition-transform duration-200 lg:h-5 lg:w-5',
                isActive ? 'text-white' : 'text-royal-400 group-hover:text-royal-300',
                'group-hover:scale-110'
              )} />
              <span className="flex-1">{link.label}</span>
              {isActive && (
                <ChevronRight className="h-3 w-3 text-royal-200 lg:h-4 lg:w-4" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-4 border-t border-royal-800/50 pt-3 lg:mt-6 lg:pt-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300 lg:gap-3 lg:rounded-xl lg:px-4 lg:py-3"
        >
          <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 lg:h-5 lg:w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-gradient-to-r from-royal-900 to-royal-950 px-4 shadow-lg lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-royal-400 to-royal-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white">Auto</span>
            <span className="text-lg font-extrabold text-royal-400">Rent</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal-800/50 text-white transition-colors hover:bg-royal-700/50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={twMerge(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col bg-gradient-to-b from-royal-900 via-royal-950 to-accent px-3 py-4 shadow-2xl transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-gradient-to-b from-royal-900 via-royal-950 to-accent px-3 py-6 shadow-2xl shadow-royal-950/50 lg:flex">
        <SidebarContent />
      </aside>
    </>
  );
}