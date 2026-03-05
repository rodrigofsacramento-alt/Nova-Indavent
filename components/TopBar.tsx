'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export function TopBar({ title }: { title?: string }) {
  const { profile } = useAuth();
  
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center flex-1 max-w-xl">
        <h2 className="text-lg font-black text-slate-100 uppercase tracking-widest">{title || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        </button>
        <div className="h-6 w-px bg-slate-800 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold leading-none">{profile?.name || 'Carregando...'}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">{profile?.role || '...'}</p>
          </div>
          <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase ring-2 ring-slate-800 relative">
            {profile?.name?.[0] || profile?.username?.[0] || '?'}
          </div>
        </div>
      </div>
    </header>
  );
}
