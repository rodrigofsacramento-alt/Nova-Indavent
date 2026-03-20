'use client';

import React from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  Search, 
  Paperclip, 
  Phone, 
  Send, 
  Smile, 
  Eye, 
  MoreVertical, 
  FileText,
  CheckCircle2,
  Circle,
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const chats = [
  {
    id: 1,
    name: 'BRASVALI GESSOS',
    avatar: 'https://picsum.photos/seed/bg/100/100',
    lastMessage: 'Olá, qual o status da proposta dos Perfis de Drywall?',
    time: '14:30',
    active: true,
    online: true,
    email: 'brasvali@contato.com.br',
    stage: 'Proposta Solicitada'
  },
  {
    id: 2,
    name: 'DECORA CAMPINAS',
    avatar: 'https://picsum.photos/seed/dc/100/100',
    lastMessage: 'Pode enviar o catálogo atualizado?',
    time: '10:15',
    active: false,
    online: false,
    email: 'contato@decoracampinas.com.br',
    stage: '1 Contato'
  },
  {
    id: 3,
    name: 'SOLUÇÕES PAULISTA',
    avatar: 'https://picsum.photos/seed/sp/100/100',
    lastMessage: 'Agradeço o atendimento, Jonathan.',
    time: 'Ontem',
    active: false,
    online: false,
    email: 'vendas@solucoesp.com.br',
    stage: 'Follow Up'
  }
];

const messages = [
  { id: 1, type: 'received', text: 'Bom dia! Consegue me enviar a lista de preços dos Perfis de Drywall?', time: '09:12' },
  { id: 2, type: 'sent', text: 'Olá! Com certeza. Estou anexando o catálogo e a proposta comercial com as condições especiais para Campinas.', time: '09:15' },
  { id: 3, type: 'sent', file: { name: 'Proposta_Drywall_V1.pdf', size: '2.4 MB' }, time: '09:16' },
  { id: 4, type: 'received', text: 'Olá, qual o status da proposta dos Perfis de Drywall? Acabamos de validar o orçamento interno aqui.', time: '14:30' },
];

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function WhatsAppPage() {
  const { user, profile } = useAuth();

  const logWhatsAppActivity = async (action: string) => {
    if (!supabase || !user) return;
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'WhatsApp',
      description: `${profile?.name || user.username} ${action} no WhatsApp`,
      created_at: new Date().toISOString()
    });
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden lg:pl-64">
      <Sidebar />
      
      {/* Chat List Panel */}
      <section className="w-80 flex flex-col border-r border-slate-800 bg-slate-950 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold mb-4 text-slate-100">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              className="w-full bg-slate-900 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-blue-600 placeholder:text-slate-500 text-slate-200" 
              placeholder="Pesquisar conversas..." 
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              className={cn(
                "p-4 flex gap-3 cursor-pointer transition-colors border-l-4",
                chat.active 
                  ? "bg-blue-600/10 border-blue-600" 
                  : "hover:bg-slate-900 border-transparent"
              )}
            >
              <div className="size-12 rounded-full bg-slate-800 flex-shrink-0 relative overflow-hidden">
                <Image className="w-full h-full object-cover" src={chat.avatar} alt={chat.name} fill referrerPolicy="no-referrer" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-slate-950 rounded-full z-10"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm truncate text-slate-200">{chat.name}</h3>
                  <span className={cn("text-[10px] font-medium", chat.active ? "text-blue-500" : "text-slate-500")}>
                    {chat.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => logWhatsAppActivity('iniciou novo chat')}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
            <Plus size={16} />
            Novo Chat
          </button>
        </div>
      </section>

      {/* Main Chat Window */}
      <main className="flex-1 flex flex-col bg-slate-950 relative">
        {/* Chat Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-slate-800 overflow-hidden relative">
              <Image className="w-full h-full object-cover" src={chats[0].avatar} alt={chats[0].name} fill referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-slate-100">{chats[0].name}</h2>
              <div className="flex items-center gap-1.5">
                <div className="size-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[11px] text-emerald-500 font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors">
              <Eye size={14} />
              Ver Detalhes do Lead
            </button>
            <button className="size-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-900 transition-colors">
              <Paperclip size={18} />
            </button>
            <button 
              onClick={() => logWhatsAppActivity('clicou em ligar')}
              className="size-9 rounded-lg border border-slate-800 flex items-center justify-center text-blue-500 hover:bg-slate-900 transition-colors"
            >
              <Phone size={18} />
            </button>
          </div>
        </header>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-slate-900 text-[10px] rounded-full text-slate-500 font-bold uppercase tracking-wider">Hoje</span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col gap-1 max-w-[70%]",
                msg.type === 'sent' ? "ml-auto items-end" : "items-start"
              )}
            >
              {msg.text && (
                <div className={cn(
                  "p-3 rounded-xl text-sm shadow-sm",
                  msg.type === 'sent' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800"
                )}>
                  {msg.text}
                  <div className={cn(
                    "text-[10px] mt-1 text-right italic",
                    msg.type === 'sent' ? "text-blue-100/70" : "text-slate-500"
                  )}>
                    {msg.time}
                  </div>
                </div>
              )}
              {msg.file && (
                <div className="bg-blue-600 text-white p-2 rounded-xl rounded-tr-none shadow-md flex items-center gap-3 border border-blue-500/20">
                  <div className="size-10 rounded bg-white/20 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div className="pr-2">
                    <p className="text-xs font-bold leading-tight">{msg.file.name}</p>
                    <p className="text-[10px] opacity-70">{msg.file.size}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input Area */}
        <footer className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-end gap-3 max-w-5xl mx-auto">
            <div className="flex gap-1 pb-1">
              <button className="size-10 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors">
                <Smile size={20} />
              </button>
              <button className="size-10 flex items-center justify-center text-slate-500 hover:text-blue-500 transition-colors">
                <Paperclip size={20} />
              </button>
            </div>
            <div className="flex-1">
              <textarea 
                className="w-full bg-slate-900 border-none rounded-2xl py-3 px-4 text-sm focus:ring-1 focus:ring-blue-600 placeholder:text-slate-500 text-slate-200 resize-none min-h-[44px] max-h-32" 
                placeholder="Escreva uma mensagem..." 
                rows={1}
              />
            </div>
            <button 
              onClick={() => logWhatsAppActivity('enviou mensagem')}
              className="size-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      </main>

      {/* Right Info Panel */}
      <aside className="w-72 border-l border-slate-800 bg-slate-950 hidden xl:flex flex-col overflow-y-auto">
        <div className="p-6 text-center border-b border-slate-800">
          <div className="size-20 rounded-full bg-slate-800 mx-auto mb-4 overflow-hidden relative">
            <Image className="w-full h-full object-cover" src={chats[0].avatar} alt={chats[0].name} fill referrerPolicy="no-referrer" />
          </div>
          <h3 className="font-bold text-base text-slate-100">{chats[0].name}</h3>
          <p className="text-xs text-slate-500 mt-1">{chats[0].email}</p>
          <div className="mt-4 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-600/10 text-blue-500 text-[11px] font-bold">
            {chats[0].stage}
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Dados do Negócio</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Valor</span>
                <span className="text-sm font-bold text-emerald-500">R$ 12.450,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Responsável</span>
                <span className="text-sm font-medium text-slate-300">Jonathan Sales</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Fonte</span>
                <span className="text-sm font-medium flex items-center gap-1 text-slate-300">
                  <MessageSquare size={12} className="text-emerald-500" />
                  WhatsApp
                </span>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Atividades Recentes</h4>
            <div className="space-y-4">
              <div className="flex gap-3 relative before:absolute before:left-2 before:top-6 before:bottom-[-20px] before:w-[1px] before:bg-slate-800">
                <div className="size-4 rounded-full bg-blue-600 ring-4 ring-blue-600/10 flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-xs font-bold leading-tight text-slate-200">Proposta Criada</p>
                  <p className="text-[10px] text-slate-500">Há 2 horas</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-4 rounded-full bg-slate-800 flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-xs font-medium leading-tight text-slate-500">Lead Convertido</p>
                  <p className="text-[10px] text-slate-400">Há 2 dias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 flex gap-2">
          <button className="flex-1 py-2 text-xs font-bold text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/10 transition-colors">Perdido</button>
          <button className="flex-1 py-2 text-xs font-bold text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors">Ganho</button>
        </div>
      </aside>
    </div>
  );
}
