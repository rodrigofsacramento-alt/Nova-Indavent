'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color?: string;
}

export function KPICard({ title, value, change, trend, icon: Icon, color = "blue" }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-emerald-500' : 'text-rose-500';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          color === 'blue' && "bg-blue-50 text-blue-600 border border-blue-100",
          color === 'emerald' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
          color === 'amber' && "bg-amber-50 text-amber-600 border border-amber-100",
          color === 'purple' && "bg-purple-50 text-purple-600 border border-purple-100",
        )}>
          <Icon size={20} />
        </div>
        {change && (
          <span className={cn("text-xs font-bold flex items-center gap-0.5", trendColor)}>
            <TrendIcon size={14} />
            {change}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
    </div>
  );
}
