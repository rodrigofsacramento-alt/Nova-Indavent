'use client';

import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AlertCircle, CheckCircle2, XCircle, Database, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SupabaseAudit() {
  const { user, profile, isAdmin } = useAuth();
  const [status, setStatus] = useState<{
    connection: 'pending' | 'success' | 'error';
    leadsTable: 'pending' | 'success' | 'error';
    activitiesTable: 'pending' | 'success' | 'error';
    usersTable: 'pending' | 'success' | 'error';
    error?: string;
  }>({
    connection: 'pending',
    leadsTable: 'pending',
    activitiesTable: 'pending',
    usersTable: 'pending',
  });

  useEffect(() => {
    async function runAudit() {
      if (!isSupabaseConfigured || !supabase) {
        setStatus(prev => ({ ...prev, connection: 'error', error: 'Variáveis de ambiente do Supabase não configuradas (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)' }));
        return;
      }

      try {
        // Test connection
        const { data: connTest, error: connError } = await supabase.from('internal_users').select('count', { count: 'exact', head: true });
        if (connError) throw connError;
        setStatus(prev => ({ ...prev, connection: 'success' }));

        // Test leads table
        const { error: leadsError } = await supabase.from('leads').select('id').limit(1);
        setStatus(prev => ({ ...prev, leadsTable: leadsError ? 'error' : 'success' }));

        // Test activities table
        const { error: actsError } = await supabase.from('activities').select('id').limit(1);
        setStatus(prev => ({ ...prev, activitiesTable: actsError ? 'error' : 'success' }));

        // Test users table
        const { error: usersError } = await supabase.from('internal_users').select('id').limit(1);
        setStatus(prev => ({ ...prev, usersTable: usersError ? 'error' : 'success' }));

      } catch (err: any) {
        console.error('Audit failed:', err);
        setStatus(prev => ({ ...prev, connection: 'error', error: err.message || 'Erro desconhecido ao conectar ao Supabase' }));
      }
    }

    runAudit();
  }, []);

  if (status.connection === 'success' && status.leadsTable === 'success' && status.activitiesTable === 'success' && status.usersTable === 'success') {
    return null; // Don't show if everything is fine
  }

  return (
    <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Database className="text-blue-500" size={20} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest">Auditoria de Conexão Supabase</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase">Verificando integridade do banco de dados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusItem 
          label="Conexão API" 
          status={status.connection} 
          icon={Shield}
          error={status.error}
        />
        <StatusItem 
          label="Tabela Leads" 
          status={status.leadsTable} 
          icon={Database}
        />
        <StatusItem 
          label="Tabela Atividades" 
          status={status.activitiesTable} 
          icon={Database}
        />
        <StatusItem 
          label="Tabela Usuários" 
          status={status.usersTable} 
          icon={User}
        />
      </div>

      {!user && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={18} />
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase mb-1">Usuário não autenticado</p>
            <p className="text-[11px] text-slate-400">
              Você não está logado formalmente. O sistema pode estar operando em modo de demonstração ou bypass, o que pode afetar a visibilidade dos dados.
            </p>
          </div>
        </div>
      )}

      {status.error && (
        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <XCircle className="text-rose-500 shrink-0" size={18} />
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase mb-1">Erro de Configuração</p>
            <p className="text-[11px] text-slate-400">{status.error}</p>
            <p className="text-[10px] text-slate-500 mt-2">
              Verifique se as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY foram adicionadas aos segredos do projeto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusItem({ label, status, icon: Icon, error }: { label: string, status: 'pending' | 'success' | 'error', icon: any, error?: string }) {
  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-900 rounded-lg">
          <Icon size={14} className="text-slate-500" />
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
      </div>
      {status === 'pending' && <div className="size-2 bg-slate-800 rounded-full animate-pulse" />}
      {status === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
      {status === 'error' && <XCircle size={16} className="text-rose-500" />}
    </div>
  );
}
