'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export type UserRole = 'admin' | 'vendedor';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const session = Cookies.get('auth_session');
      const userDataStr = Cookies.get('user_data');

      if (session === 'true' && userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setUser(userData);
          setProfile(userData);
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

  return { 
    user, 
    profile, 
    loading, 
    isAdmin: profile?.role === 'admin' 
  };
}
