'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const session = Cookies.get('auth_session');
    if (session === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!supabase) {
      setError('O sistema não está configurado corretamente.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Iniciando tentativa de login para:', username);
      
      // Busca o usuário na tabela interna
      const { data: user, error: queryError } = await supabase
        .from('internal_users')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Verificação simples para v1
        .single();

      if (queryError || !user) {
        throw new Error('Usuário ou senha incorretos.');
      }

      console.log('Login realizado com sucesso:', user.name);

      // Salva os dados do usuário no cookie para manter a sessão
      Cookies.set('auth_session', 'true', { expires: 7, sameSite: 'none', secure: true });
      Cookies.set('user_data', JSON.stringify(user), { expires: 7, sameSite: 'none', secure: true });
      
      router.push('/dashboard');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao realizar login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-2xl shadow-blue-600/10 border border-slate-200 flex flex-col items-center">
              <div className="flex items-baseline gap-0.5">
                <span className="text-4xl font-black italic text-blue-600 tracking-tighter">Nova</span>
                <span className="text-4xl font-black text-slate-700 tracking-tighter uppercase">Indavent</span>
              </div>
              <div className="w-full h-[2px] bg-slate-300 my-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 opacity-30"></div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Exaustores e Perfis</p>
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100">Portal do Colaborador</h1>
            <p className="text-slate-500 text-sm">Acesse o sistema de gestão de leads e vendas</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Usuário</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-200 placeholder:text-slate-600"
                  placeholder="ex: admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Senha</label>
                <a href="#" className="text-[10px] font-bold text-blue-500 hover:underline">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none text-slate-200 placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Entrando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-slate-900 px-2 text-slate-600">Suporte Técnico</span>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            Problemas para acessar? <a href="#" className="text-blue-500 font-bold hover:underline">Contate o administrador</a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} Indavent CRM. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
