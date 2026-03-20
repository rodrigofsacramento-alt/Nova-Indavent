'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Shield, 
  User, 
  Mail, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UsersManagementPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    /*
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }
    */

    async function fetchUsers() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('internal_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user || !authLoading) {
      fetchUsers();
    }
  }, [user, isAdmin, authLoading, router]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('internal_users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(`Erro ao atualizar cargo: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <TopBar title="Gerenciamento de Usuários" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nome ou usuário..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-blue-600/50 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
              <UserPlus size={16} />
              Novo Usuário
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Usuário</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cargo</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Cadastro</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold uppercase">
                          {u.name?.[0] || u.username?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{u.name || 'Sem nome'}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                            <Shield size={10} />
                            Administrador
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                            <User size={10} />
                            Vendedor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                        <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        >
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="size-16 bg-slate-800 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                  <User size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-200">Nenhum usuário encontrado</h4>
                  <p className="text-sm text-slate-500">Tente ajustar sua busca.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
