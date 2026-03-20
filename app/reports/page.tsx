'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SellerStats {
  id: string;
  name: string;
  username: string;
  role: string;
  proposals: number;
  sales: number;
  periodSales: number;
  revenue: number;
  activities: number;
  lastActivity: string | null;
  lastLogin: string | null;
  conversionRate: number;
  avgTicket: number;
  totalLeads: number;
  proposedValue: number;
  rank?: number;
}

export default function SellerReportsPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SellerStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    // Check for query param from notification
    const searchParams = new URLSearchParams(window.location.search);
    const periodParam = searchParams.get('period');
    if (periodParam === 'daily') {
      setPeriod('daily');
    }
  }, []);

  useEffect(() => {
    // Commented out auth redirect for bypass
    /*
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    */

    async function fetchData() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        
        // 1. Fetch all sellers
        const { data: sellersData, error: sellersError } = await supabase
          .from('internal_users')
          .select('*')
          .eq('role', 'vendedor');

        if (sellersError) {
          console.error('Error fetching sellers:', sellersError);
          // If we can't fetch all sellers, at least try to use the current user if they are a vendedor
          if (profile?.role === 'vendedor') {
            // Continue with just the current user
          } else {
            throw sellersError;
          }
        }

        // 2. Fetch all leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*');

        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
          // If leads fail, we can't really do a report
          if (leadsError.code !== '42P01') throw leadsError;
        }

        // 3. Fetch all activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
          // Activities are optional for some metrics, but nice to have
          if (activitiesError.code !== '42P01') {
            // If it's just a permission error, we might want to continue with empty activities
            console.warn('Continuing without activities due to error');
          }
        }

        // 4. Determine time range based on period
        const now = new Date();
        let startDate = new Date();
        
        if (period === 'daily') {
          startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
        } else if (period === 'monthly') {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        }

        // 5. Aggregate data
        console.log('Aggregating data for reports...');
        const sellersToProcess = (sellersData || (profile?.role === 'vendedor' ? [profile] : [])).filter(Boolean);
        console.log(`Processing ${sellersToProcess.length} sellers for period: ${period}`);
        
        const sellerStats: SellerStats[] = sellersToProcess.map(seller => {
          if (!seller) return null;
          const sellerLeads = (leadsData || []).filter(l => {
            const leadSalespersonId = l.salesperson_id;
            const leadVendedor = l.Vendedor || l.vendedor || l["Vendedor."];
            
            // Match by ID
            if (leadSalespersonId === seller.id) return true;
            
            // Match by Name
            if (leadVendedor === seller.name) return true;
            
            // Match legacy names
            if (seller.name === 'Jonathan' && leadVendedor === 'Vendas') return true;
            if (seller.name === 'Isabele' && leadVendedor === 'Administrador principal Indavent Exaustores') return true;
            
            return false;
          });

          const sellerActivities = (activitiesData || []).filter(a => a.user_id === seller.id);
          
          const periodLeads = sellerLeads.filter(l => {
            const date = new Date(l.created_at);
            return date >= startDate;
          });

          const proposals = periodLeads.filter(l => 
            ['Proposta Solicitada', 'Fechamento', 'Cliente'].includes(l.Estágio || l.stage || l.estagio)
          ).length;

          const salesLeads = periodLeads.filter(l => 
            (l.Estágio || l.stage || l.estagio) === 'Cliente'
          );

          const sales = salesLeads.length;
          
          const revenue = periodLeads.reduce((acc, curr) => {
            if (curr.total_sold_value !== undefined && curr.total_sold_value !== null) {
              return acc + (Number(curr.total_sold_value) || 0);
            }
            return (curr.Estágio || curr.stage || curr.estagio) === 'Cliente' 
              ? acc + (Number(curr.Orçamento || curr.budget || curr.orcamento) || 0)
              : acc;
          }, 0);

          const proposedValue = periodLeads.reduce((acc, curr) => {
            if (curr.total_proposed_value !== undefined && curr.total_proposed_value !== null) {
              return acc + (Number(curr.total_proposed_value) || 0);
            }
            return (['Proposta Solicitada', 'Fechamento'].includes(curr.Estágio || curr.stage || curr.estagio))
              ? acc + (Number(curr.Orçamento || curr.budget || curr.orcamento) || 0)
              : acc;
          }, 0);
          
          const lastActivity = sellerActivities.length > 0 ? sellerActivities[0].created_at : null;
          
          const loginActivities = sellerActivities.filter(a => a.type === 'Login');
          const lastLogin = loginActivities.length > 0 ? loginActivities[0].created_at : null;

          const periodSales = salesLeads.length;

          // Count all activities for the period as engagement
          const totalActivities = sellerActivities.filter(a => new Date(a.created_at) >= startDate).length;

          return {
            id: seller.id,
            name: seller.name,
            username: seller.username,
            role: seller.role,
            proposals,
            sales,
            periodSales,
            revenue,
            activities: totalActivities,
            lastActivity,
            lastLogin,
            conversionRate: periodLeads.length > 0 ? (sales / periodLeads.length) * 100 : 0,
            avgTicket: sales > 0 ? revenue / sales : 0,
            totalLeads: periodLeads.length,
            proposedValue
          };
        }).filter((s): s is SellerStats => s !== null);

        // Sort by multi-level criteria for ranking
        const rankedStats = sellerStats
          .sort((a, b) => {
            if (b.revenue !== a.revenue) return b.revenue - a.revenue;
            if (b.proposedValue !== a.proposedValue) return b.proposedValue - a.proposedValue;
            if (b.sales !== a.sales) return b.sales - a.sales;
            if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate;
            return b.proposals - a.proposals;
          })
          .map((s, index) => ({ ...s, rank: index + 1 }));

        // 6. Prepare Time Series Data
        const timeSeriesMap: Record<string, Record<string, number>> = {};
        const top3Sellers = rankedStats.slice(0, 3);
        const timeSeries: any[] = [];

        if (period === 'daily') {
          // Group by hour
          for (let i = 0; i < 24; i++) {
            const hourStr = `${i.toString().padStart(2, '0')}:00`;
            timeSeriesMap[hourStr] = {};
            timeSeries.push({ date: hourStr, fullDate: hourStr });
          }

          (leadsData || []).forEach(l => {
            const isSale = (l.Estágio || l.stage || l.estagio) === 'Cliente';
            if (!isSale) return;
            const date = new Date(l.updated_at || l.created_at);
            if (date < startDate) return;
            
            const hourStr = `${date.getHours().toString().padStart(2, '0')}:00`;
            const sellerName = l.salesperson_name || l.Vendedor || l.vendedor || 'Desconhecido';
            
            if (timeSeriesMap[hourStr]) {
              timeSeriesMap[hourStr][sellerName] = (timeSeriesMap[hourStr][sellerName] || 0) + 1;
            }
          });
        } else if (period === 'weekly') {
          // Group by day of week
          const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
          daysOfWeek.forEach(day => {
            timeSeriesMap[day] = {};
            timeSeries.push({ date: day, fullDate: day });
          });

          (leadsData || []).forEach(l => {
            const isSale = (l.Estágio || l.stage || l.estagio) === 'Cliente';
            if (!isSale) return;
            const date = new Date(l.updated_at || l.created_at);
            if (date < startDate) return;
            
            const dayIndex = (date.getDay() + 6) % 7; // Adjust to start from Monday
            const dayStr = daysOfWeek[dayIndex];
            const sellerName = l.salesperson_name || l.Vendedor || l.vendedor || 'Desconhecido';
            
            if (timeSeriesMap[dayStr]) {
              timeSeriesMap[dayStr][sellerName] = (timeSeriesMap[dayStr][sellerName] || 0) + 1;
            }
          });
        } else if (period === 'monthly') {
          // Group by day of month
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            const dayStr = i.toString().padStart(2, '0');
            timeSeriesMap[dayStr] = {};
            timeSeries.push({ date: dayStr, fullDate: dayStr });
          }

          (leadsData || []).forEach(l => {
            const isSale = (l.Estágio || l.stage || l.estagio) === 'Cliente';
            if (!isSale) return;
            const date = new Date(l.updated_at || l.created_at);
            if (date < startDate) return;
            
            const dayStr = date.getDate().toString().padStart(2, '0');
            const sellerName = l.salesperson_name || l.Vendedor || l.vendedor || 'Desconhecido';
            
            if (timeSeriesMap[dayStr]) {
              timeSeriesMap[dayStr][sellerName] = (timeSeriesMap[dayStr][sellerName] || 0) + 1;
            }
          });
        }

        // Fill in values for top 3 sellers
        timeSeries.forEach(entry => {
          top3Sellers.forEach(seller => {
            entry[seller.name] = (timeSeriesMap[entry.date] && timeSeriesMap[entry.date][seller.name]) || 0;
          });
        });

        setTimeSeriesData(timeSeries);
        setStats(rankedStats);
      } catch (err: any) {
        console.error('Error fetching report data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, router, profile, period]);

  const totals = useMemo(() => {
    return stats.reduce((acc, curr) => ({
      proposals: acc.proposals + curr.proposals,
      sales: acc.sales + curr.sales,
      revenue: acc.revenue + curr.revenue,
      activities: acc.activities + curr.activities,
      totalLeads: acc.totalLeads + curr.totalLeads,
      proposedValue: acc.proposedValue + curr.proposedValue
    }), { proposals: 0, sales: 0, revenue: 0, activities: 0, totalLeads: 0, proposedValue: 0 });
  }, [stats]);

  const metricRefs = useMemo(() => {
    if (stats.length === 0) return null;
    
    const getSecondHighest = (key: string) => {
      const values = stats.map(s => Number(s[key as keyof typeof s]) || 0).sort((a, b) => b - a);
      return values.length > 1 ? values[1] : values[0];
    };

    return {
      proposals: getSecondHighest('proposals'),
      sales: getSecondHighest('sales'),
      periodSales: getSecondHighest('periodSales'),
      conversionRate: getSecondHighest('conversionRate'),
      revenue: getSecondHighest('revenue'),
      proposedValue: getSecondHighest('proposedValue'),
      avgTicket: getSecondHighest('avgTicket'),
      activities: getSecondHighest('activities')
    };
  }, [stats]);

  const calculateDiff = (current: number, reference: number | undefined) => {
    if (reference === undefined) return null;
    if (current === reference) return 0;
    if (reference === 0) return current; 
    return ((current - reference) / reference) * 100;
  };

  const DiffBadge = ({ value }: { value: number | null }) => {
    if (value === null || isNaN(value) || !isFinite(value)) return null;
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isZero = value === 0;
    
    return (
      <span className={cn(
        "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter inline-flex items-center",
        isZero ? "text-slate-400 bg-slate-50" : 
        isPositive ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
      )}>
        {isPositive ? '+' : ''}{value.toFixed(2).replace('.', ',')}%
      </span>
    );
  };

  const chartData = useMemo(() => {
    return [...stats]
      .sort((a, b) => {
        if (b.revenue !== a.revenue) return b.revenue - a.revenue;
        if (b.proposedValue !== a.proposedValue) return b.proposedValue - a.proposedValue;
        if (b.sales !== a.sales) return b.sales - a.sales;
        if (b.conversionRate !== a.conversionRate) return b.conversionRate - a.conversionRate;
        return b.proposals - a.proposals;
      })
      .map(s => ({
        name: s.name.split(' ')[0],
        Vendas: s.sales,
        Propostas: s.proposals,
        Atividades: s.activities,
        Receita: s.revenue,
        'Em Proposta': s.proposedValue
      }));
  }, [stats]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="text-blue-600 animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <TopBar title="Relatório de Performance de Vendedores" />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Period Filter */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Período de Análise</h3>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setPeriod('daily')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  period === 'daily' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Diário
              </button>
              <button 
                onClick={() => setPeriod('weekly')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  period === 'weekly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Semanal
              </button>
              <button 
                onClick={() => setPeriod('monthly')}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  period === 'monthly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Mensal
              </button>
            </div>
          </div>

          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <DollarSign size={20} />
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">Total Geral</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.revenue)}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Faturamento total acumulado</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-widest">Em Proposta</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.proposedValue)}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Valor total em aberto</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-widest">Conversão</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">
                {totals.totalLeads > 0 ? ((totals.sales / totals.totalLeads) * 100).toFixed(1) : 0}%
              </h3>
              <p className="text-xs text-slate-500 font-medium">Leads para Clientes</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-widest">Volume</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{totals.proposals}</h3>
              <p className="text-xs text-slate-500 font-medium">Propostas geradas no período</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">Sucesso</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">{totals.sales}</h3>
              <p className="text-xs text-slate-500 font-medium">Vendas concretizadas</p>
            </motion.div>
          </div>

          {/* Detailed Ranking Table */}
          {stats.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center shadow-sm rounded-2xl">
              <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhum dado de performance encontrado</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Não foi possível carregar as estatísticas dos vendedores. Certifique-se de que existem usuários com o cargo de &quot;vendedor&quot; e que eles possuem leads vinculados.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  Ranking de Performance e Gestão
                </h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ordenado por Faturamento
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Posição</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Vendedor</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Propostas</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Vendas</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Conversão</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Receita Total</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Em Proposta</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Ticket Médio</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Última Atividade</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Último Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center font-black text-xs",
                            idx === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" :
                            idx === 1 ? "bg-slate-100 text-slate-600 border border-slate-200" :
                            idx === 2 ? "bg-orange-100 text-orange-600 border border-orange-200" :
                            "bg-slate-50 text-slate-400"
                          )}>
                            {s.rank}º
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase border border-slate-200">
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{s.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">@{s.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">{s.proposals}</span>
                            <DiffBadge value={calculateDiff(s.proposals, metricRefs?.proposals)} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">{s.sales}</span>
                            <DiffBadge value={calculateDiff(s.sales, metricRefs?.sales)} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${Math.min(s.conversionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-emerald-600">{s.conversionRate.toFixed(1)}%</span>
                            <DiffBadge value={calculateDiff(s.conversionRate, metricRefs?.conversionRate)} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.revenue)}
                              </p>
                              <DiffBadge value={calculateDiff(s.revenue, metricRefs?.revenue)} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-amber-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.proposedValue)}
                            </p>
                            <DiffBadge value={calculateDiff(s.proposedValue, metricRefs?.proposedValue)} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.avgTicket)}
                            </span>
                            <DiffBadge value={calculateDiff(s.avgTicket, metricRefs?.avgTicket)} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {s.lastActivity ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} />
                              <span className="text-xs">{new Date(s.lastActivity).toLocaleDateString('pt-BR')}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Sem atividade</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {s.lastLogin ? (
                            <div className="flex items-center gap-2 text-blue-500">
                              <Calendar size={12} />
                              <span className="text-xs">{new Date(s.lastLogin).toLocaleDateString('pt-BR')}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Nunca logou</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Line Chart: Vendas x Período */}
          {timeSeriesData.length > 0 && stats.length > 0 && (
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Vendas x Período de Tempo ({period === 'daily' ? 'Horas' : period === 'weekly' ? 'Dias da Semana' : 'Dias do Mês'})
                </h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {period === 'daily' ? 'Hoje' : period === 'weekly' ? 'Esta Semana' : 'Este Mês'}
                </div>
              </div>
              <div className="h-80 w-full">
                {/* Top Performers Summary with Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {stats.slice(0, 3).map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {idx + 1}º
                      </div>
                      <span className="text-xs font-bold text-slate-700">{s.name.split(' ')[0]}</span>
                      <DiffBadge value={calculateDiff(s.periodSales, metricRefs?.periodSales)} />
                      {idx === 0 && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Líder</span>
                      )}
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      interval={Math.floor(timeSeriesData.length / 10)}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
                    {stats.slice(0, 3).map((seller, idx) => (
                      <Line 
                        key={seller.id}
                        type="monotone" 
                        dataKey={seller.name} 
                        stroke={idx === 0 ? "#2563eb" : idx === 1 ? "#10b981" : "#8b5cf6"} 
                        dot={{ r: 4, fill: idx === 0 ? "#2563eb" : idx === 1 ? "#10b981" : "#8b5cf6" }} 
                        activeDot={{ r: 6 }}
                        strokeWidth={3} 
                        name={seller.name.split(' ')[0]}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  Comparativo de Vendas vs Propostas
                </h3>
              </div>
              <div className="h-80 w-full">
                {/* Top Performers Summary with Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {stats.slice(0, 3).map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {idx + 1}º
                      </div>
                      <span className="text-xs font-bold text-slate-700">{s.name.split(' ')[0]}</span>
                      <DiffBadge value={calculateDiff(s.revenue, metricRefs?.revenue)} />
                      {idx === 0 && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Líder</span>
                      )}
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      fontWeight="bold"
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingTop: '20px' }} />
                    <Bar dataKey="Propostas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="Vendas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-purple-600" />
                  Engajamento e Atualizações no Sistema
                </h3>
              </div>
              <div className="h-80 w-full">
                {/* Top Performers Summary with Badges */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {stats.slice(0, 3).map((s, idx) => {
                    return (
                      <div key={s.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-700">{s.name.split(' ')[0]}</span>
                        <DiffBadge value={calculateDiff(s.activities, metricRefs?.activities)} />
                        {idx === 0 && (
                          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Top</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      fontWeight="bold"
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Atividades" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
