'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

export function TopBar({ title }: { title?: string }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border-none rounded-lg focus:ring-2 focus:ring-blue-600 text-sm placeholder:text-slate-500 text-slate-200" 
            placeholder="Pesquisar leads, contatos ou relatórios..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="h-6 w-px bg-slate-800 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold leading-none">João Martins</p>
            <p className="text-[10px] text-slate-500 mt-1">Administrador</p>
          </div>
          <div className="size-9 rounded-full bg-slate-800 overflow-hidden ring-2 ring-slate-800 relative">
            <Image 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/user1/100/100" 
              alt="User profile"
              fill
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
