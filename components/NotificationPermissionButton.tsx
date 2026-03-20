'use client';

import React, { useState, useEffect } from 'react';
import { BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationPermissionButton() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    
    // Only show if permission is still 'default'
    if (Notification.permission === 'default') {
      // Small delay to not annoy immediately
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setShowPrompt(false);
      // Optional: show a success notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Notificações Ativadas!', {
          body: 'Você receberá seu resumo de desempenho diariamente às 16:00.',
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    } else {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-between gap-4 border border-blue-400/30 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Ativar Notificações?</p>
              <p className="text-[10px] opacity-80">Receba seu resumo de vendas diário às 16h.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPrompt(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
            <button 
              onClick={requestPermission}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-50 transition-colors shadow-sm"
            >
              Ativar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
