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
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Leads', icon: Users, href: '/leads' },
  { name: 'Contatos', icon: UserCircle, href: '/contacts' },
  { name: 'Oportunidades', icon: Briefcase, href: '/opportunities' },
  { name: 'WhatsApp', icon: MessageSquare, href: '/whatsapp' },
  { name: 'Relatórios', icon: BarChart3, href: '/reports' },
];

import Image from 'next/image';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('auth_session');
    router.push('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-6 flex flex-col h-full">
        {/* Brand */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-black italic text-blue-500 tracking-tighter">Nova</span>
            <span className="text-2xl font-black text-slate-400 tracking-tighter uppercase">Indavent</span>
          </div>
          <div className="h-[1px] w-full bg-slate-800 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-slate-400 opacity-50"></div>
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">Exaustores e Perfis</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
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
            <div className="size-9 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-800 relative">
              <Image 
                className="w-full h-full object-cover" 
                src="https://picsum.photos/seed/user1/100/100" 
                alt="User profile"
                fill
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">João Martins</p>
              <p className="text-[10px] text-slate-500 truncate">Administrador</p>
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
