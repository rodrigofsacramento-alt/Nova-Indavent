'use client';

import React from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { KPICard } from '@/components/KPICard';
import { 
  Mail, 
  Edit3, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  LayoutGrid, 
  Paintbrush, 
  Ruler, 
  Hammer,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

const performanceData = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 16500 },
  { month: 'Apr', value: 24000 },
  { month: 'May', value: 21000 },
  { month: 'Jun', value: 27000 },
];

const topProducts = [
  { name: 'Placas de Drywall', units: '1.240 units', value: '$14.5k', icon: LayoutGrid },
  { name: 'Massas e Tintas', units: '850 units', value: '$9.2k', icon: Paintbrush },
  { name: 'Perfis de Aço', units: '420 units', value: '$11.8k', icon: Ruler },
  { name: 'Parafusos e Fixação', units: '5.000+ units', value: '$4.1k', icon: Hammer },
];

const opportunities = [
  { client: 'Edificações São Paulo S.A.', stage: 'Negotiation', value: '$12,450', date: 'Oct 24, 2023', probability: 75, color: 'amber' },
  { client: 'Residencial Alvorada', stage: 'Initial Contact', value: '$8,100', date: 'Nov 12, 2023', probability: 30, color: 'blue' },
  { client: 'Construtora Delta', stage: 'Proposal Sent', value: '$22,000', date: 'Oct 30, 2023', probability: 90, color: 'emerald' },
];

export default function SalespersonProfilePage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Profile Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="size-20 rounded-2xl bg-blue-600/20 flex items-center justify-center border-2 border-blue-600/30 overflow-hidden relative">
                <Image 
                  className="size-full object-cover" 
                  src="https://picsum.photos/seed/jonathan/200/200" 
                  alt="Jonathan"
                  fill
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-100">Jonathan</h1>
                <p className="text-slate-500 font-medium">Senior Sales Executive • West Region</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all font-semibold text-sm text-slate-300">
                <Edit3 size={18} />
                Editar Perfil
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold text-sm">
                <Mail size={18} />
                Enviar Mensagem
              </button>
            </div>
          </header>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
              <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wide">Meta vs Realizado</p>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">$42,000 / $50,000</h3>
              <div className="w-full bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }}></div>
              </div>
              <p className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                <TrendingUp size={14} /> 84% da Meta Mensal
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
              <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wide">Taxa de Conversão</p>
              <h3 className="text-4xl font-black text-slate-100 mb-2">24.5%</h3>
              <p className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                <ArrowUp size={14} /> +2.1% desde o mês passado
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
              <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wide">Leads Ativos</p>
              <h3 className="text-4xl font-black text-slate-100 mb-2">18</h3>
              <p className="text-rose-500 text-sm font-bold flex items-center gap-1">
                <ArrowDown size={14} /> -5% uso de capacidade
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
              <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wide">Win/Loss Ratio</p>
              <h3 className="text-4xl font-black text-slate-100 mb-2">3.2:1</h3>
              <p className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                <Plus size={14} /> +0.4 melhoria
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Graph */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-100">Performance Mensal de Vendas</h2>
                <select className="bg-slate-800 border-none rounded-lg text-xs font-bold py-1 px-3 text-slate-400">
                  <option>Últimos 6 Meses</option>
                  <option>Ano Atual</option>
                </select>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === performanceData.length - 1 ? '#3b82f6' : '#3b82f644'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products Sold */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-6">Principais Produtos Vendidos</h2>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-500">
                        <product.icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-200">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.units}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-500">{product.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors border border-slate-800 rounded-lg">
                Ver Relatório Detalhado de Estoque
              </button>
            </div>
          </div>

          {/* Active Opportunities Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Oportunidades Ativas (Jonathan)</h2>
              <button className="text-blue-500 text-sm font-bold hover:underline">Ver Todas</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Conta / Cliente</th>
                    <th className="px-6 py-4">Estágio</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4">Data de Fechamento</th>
                    <th className="px-6 py-4">Probabilidade</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {opportunities.map((opp) => (
                    <tr key={opp.client} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-slate-200">{opp.client}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-black uppercase",
                          opp.color === 'amber' && "bg-amber-900/30 text-amber-400",
                          opp.color === 'blue' && "bg-blue-900/30 text-blue-400",
                          opp.color === 'emerald' && "bg-emerald-900/30 text-emerald-400",
                        )}>
                          {opp.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-sm text-slate-200">{opp.value}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{opp.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full">
                            <div className={cn(
                              "h-full rounded-full",
                              opp.probability > 80 ? "bg-emerald-500" : opp.probability > 50 ? "bg-blue-500" : "bg-amber-500"
                            )} style={{ width: `${opp.probability}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-300">{opp.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-500 hover:text-blue-500">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
