'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationManager() {
  const { user, profile } = useAuth();

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body,
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200], // Vibration pattern for Android
        tag: 'daily-performance',
        renotify: true, // Notify again if the tag is the same
        data: {
          url: '/reports?period=daily'
        }
      });
    }
  }, []);

  const checkAndSendDailyNotification = useCallback(async () => {
    if (!user || !profile || profile.role !== 'vendedor') return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's 16:00 (4 PM)
    if (currentHour === 16 && currentMinute >= 0 && currentMinute < 5) {
      if (!supabase) return;
      
      // Check if we already sent it today
      const lastSentDate = localStorage.getItem('last_notification_sent_date');
      const today = now.toISOString().split('T')[0];

      if (lastSentDate !== today) {
        try {
          // Fetch today's performance
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const { data: leadsData, error } = await supabase
            .from('leads')
            .select('*')
            .eq('salesperson_id', user.id)
            .gte('created_at', startOfDay.toISOString());

          if (error) throw error;

          const todayLeads = leadsData || [];
          const proposals = todayLeads.filter(l => 
            ['Proposta Solicitada', 'Fechamento', 'Cliente'].includes(l.Estágio || l.stage || l.estagio)
          );
          
          const proposalsCount = proposals.length;
          const totalValue = proposals.reduce((acc, curr) => acc + (Number(curr.Orçamento || curr.budget || curr.orcamento) || 0), 0);
          const avgValue = proposalsCount > 0 ? totalValue / proposalsCount : 0;

          const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });

          const title = '🔴 Desempenho do Dia';
          const body = `${formatter.format(totalValue)} em Propostas hoje, ${proposalsCount} propostas geradas (valor unitário gerado no dia ${formatter.format(avgValue)})`;

          await sendNotification(title, body);
          localStorage.setItem('last_notification_sent_date', today);
        } catch (err) {
          console.error('Error sending daily notification:', err);
        }
      }
    }
  }, [user, profile, sendNotification]);

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    }

    // Check every minute
    const interval = setInterval(checkAndSendDailyNotification, 60000);
    
    // Also check immediately
    checkAndSendDailyNotification();

    return () => clearInterval(interval);
  }, [checkAndSendDailyNotification]);

  return null;
}
