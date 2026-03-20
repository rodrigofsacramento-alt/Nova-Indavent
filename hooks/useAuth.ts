'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export type UserRole = 'admin' | 'vendedor';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (!supabase || userId === 'default-admin') return null;
    try {
      const { data, error } = await supabase
        .from('internal_users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
        Cookies.set('user_data', JSON.stringify(updatedProfile), { expires: 7 });
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      let session = Cookies.get('auth_session');
      let userDataStr = Cookies.get('user_data');

      // If no session, set a default admin session for development/bypass
      if (session !== 'true' || !userDataStr) {
        const defaultUser: UserProfile = {
          id: 'default-admin',
          username: 'admin',
          name: 'Administrador (Acesso Direto)',
          role: 'admin'
        };
        Cookies.set('auth_session', 'true', { expires: 7, path: '/' });
        Cookies.set('user_data', JSON.stringify(defaultUser), { expires: 7, path: '/' });
        session = 'true';
        userDataStr = JSON.stringify(defaultUser);
      }

      if (session === 'true' && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
          setProfile(userData);
          
          // Try to get fresh data from Supabase
          if (supabase) {
            const freshProfile = await fetchProfile(userData.id);
            if (freshProfile) {
              setProfile(freshProfile);
              Cookies.set('user_data', JSON.stringify(freshProfile), { expires: 7 });
            }
          }
        } catch (err) {
          console.error('Erro ao processar dados do usuário:', err);
          Cookies.remove('auth_session');
          Cookies.remove('user_data');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    console.log('Iniciando logout...');
    // Remove cookies with explicit path to ensure they are cleared
    Cookies.remove('auth_session', { path: '/' });
    Cookies.remove('user_data', { path: '/' });
    
    // Clear all storage to prevent any cached session data
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Sessão limpa, redirecionando...');
    // Fallback for iframe environments
    window.location.replace('/');
  };

  return { 
    user, 
    profile, 
    loading, 
    isAdmin: profile?.role === 'admin',
    logout,
    refreshProfile
  };
}
