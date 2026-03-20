'use client';

import React from 'react';
import { Bell, CheckCircle2, Mail, AlertCircle, UserPlus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatTimeAgo } from '@/lib/utils';

export function NotificationBell() {
  const { user, profile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const bellRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 1. Fetch from activities table (Real-time logs)
      const { data: acts, error: actsError } = await supabase
        .from('activities')
        .select('id, type, description, created_at, leads(Nome)')
        .order('created_at', { ascending: false })
        .limit(10);

      // 2. Derive notifications from leads table (Follow-ups)
      let query = supabase.from('leads').select('*').order('updated_at', { ascending: false });
      
      if (!isAdmin && profile) {
        // Tenta filtrar por ID ou por nome (Vendedor), incluindo nomes legados
        const filter = [`salesperson_id.eq.${profile.id}`, `Vendedor.eq."${profile.name}"`];
        if (profile.name === 'Jonathan') filter.push('Vendedor.eq."Vendas"');
        if (profile.name === 'Isabele') filter.push('Vendedor.eq."Administrador principal Indavent Exaustores"');
        query = query.or(filter.join(','));
      }

      const { data: leads, error } = await query.limit(20);

      if (error) throw error;

      const now = new Date();
      const derivedNotifications: any[] = [];

      // Add activities as notifications
      if (acts) {
        acts.forEach(a => {
          derivedNotifications.push({
            id: `act-${a.id}`,
            type: a.type === 'Message' ? 'purple' : a.type === 'Call' ? 'success' : 'primary',
            title: a.type === 'Message' ? 'Nova Proposta' : a.type === 'Call' ? 'Ligação' : 'Atualização',
            description: `${a.description} para ${(a.leads as any)?.Nome || 'Lead'}`,
            time: formatTimeAgo(a.created_at),
            icon: a.type === 'Message' ? Mail : a.type === 'Call' ? CheckCircle2 : UserPlus,
            leadId: (a as any).lead_id
          });
        });
      }

      // Add follow-up alerts from leads
      if (leads) {
        leads.forEach(l => {
          const stage = l["Estágio"] || l["stage"] || l["estagio"];
          const name = l["Nome"] || l["name"] || l["nome"];
          const updatedAt = new Date(l.updated_at || l.created_at);
          const diffMs = now.getTime() - updatedAt.getTime();

          // Check for Follow-up out of deadline
          const proposalDateStr = l["Data da Proposta"] || l["proposal_date"];
          if (proposalDateStr && stage !== 'Cliente' && stage !== 'Perdido') {
            const propDate = new Date(proposalDateStr);
            const daysSinceProp = Math.floor((now.getTime() - propDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceProp >= 2) {
              derivedNotifications.push({
                id: `followup-${l.id}`,
                type: 'danger',
                title: 'Follow-up fora do prazo!',
                description: `${name} está sem retorno há ${daysSinceProp} dias. (SLA: ${formatTimeAgo(updatedAt)})`,
                time: 'Urgente',
                icon: AlertCircle,
                leadId: l.id
              });
            }
          }
        });
      }

      // Sort by time (if possible, though we mixed sources)
      setNotifications(derivedNotifications.slice(0, 15));
      setUnreadCount(derivedNotifications.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user, profile, isAdmin]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest">Notificações</h3>
              <span className="text-[10px] font-bold text-slate-500">{notifications.length} alertas</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-slate-800 mb-3" />
                  <p className="text-xs font-bold text-slate-500 uppercase">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                      <div className="flex gap-3">
                        <div className={cn(
                          "size-8 rounded-full flex items-center justify-center shrink-0",
                          notif.type === 'success' && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                          notif.type === 'danger' && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                          notif.type === 'purple' && "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
                        )}>
                          <notif.icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-100 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {notif.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            <Clock size={10} />
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-center">
              <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
                Ver todas as atividades
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
