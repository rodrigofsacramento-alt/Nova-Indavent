'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Briefcase, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Plus,
  LogOut,
  Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Leads', icon: Users, href: '/leads' },
  { name: 'Contatos', icon: UserCircle, href: '/contacts' },
  { name: 'Oportunidades', icon: Briefcase, href: '/opportunities' },
  { name: 'WhatsApp', icon: MessageSquare, href: '/whatsapp' },
  { name: 'Relatórios', icon: BarChart3, href: '/reports' },
];

import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isAdmin } = useAuth();
  const [logoError, setLogoError] = React.useState(false);

  const handleLogout = () => {
    Cookies.remove('auth_session');
    Cookies.remove('user_data');
    router.push('/');
  };

  const filteredNavItems = [
    ...navItems,
    ...(isAdmin ? [{ name: 'Usuários', icon: Settings, href: '/admin/users' }] : [])
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-6 flex flex-col h-full">
        {/* Brand */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="relative w-full h-12 mb-2 flex items-center">
            {!logoError ? (
              <Image 
                src="/logo.png" 
                alt="Indavent Logo" 
                fill 
                className="object-contain object-left brightness-0 invert"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-black tracking-tighter text-white italic">NovaINDAVENT</span>
            )}
          </div>
          <div className="h-[1px] w-full bg-slate-800 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-400 opacity-50"></div>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">Exaustor e Perfis</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive 
                    ? "bg-blue-600/10 text-blue-500" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              pathname === '/settings' ? "bg-blue-600/10 text-blue-500" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            )}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
          
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
            <Plus size={18} />
            <span className="text-sm">Novo Lead</span>
          </button>

          <div className="flex items-center gap-3 p-2 mt-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase ring-2 ring-slate-800 relative">
              {profile?.name?.[0] || profile?.username?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.name || 'Carregando...'}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold">{profile?.role || '...'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
