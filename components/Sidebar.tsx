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
import { useMobileMenu } from '@/context/MobileMenuContext';
import { X } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isAdmin } = useAuth();
  const { isOpen, close } = useMobileMenu();
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          {/* Brand */}
          <div className="flex flex-col gap-1 mb-8">
            <div className="flex items-center justify-between lg:block mb-2">
              <div className="relative w-40 h-12 flex items-center">
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
              <button 
                onClick={close}
                className="lg:hidden p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-[1px] w-full bg-slate-800 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-400 opacity-50"></div>
            </div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center mt-1">Exaustor e Perfis</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={close}
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
              onClick={close}
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
    </>
  );
}
