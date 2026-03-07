'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { KPICard } from '@/components/KPICard';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  TrendingUp, 
  Euro, 
  Clock, 
  Calendar, 
  Download,
  CheckCircle2,
  UserPlus,
  Mail,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const teamData = [
  { name: 'Ana', sales: 90 },
  { name: 'Bruno', sales: 40 },
  { name: 'Carla', sales: 25 },
  { name: 'João', sales: 75 },
  { name: 'Maria', sales: 65 },
  { name: 'Pedro', sales: 50 },
  { name: 'Sofia', sales: 35 },
];

const performanceData = [
  { month: 'Jan', generated: 40, converted: 20 },
  { month: 'Fev', generated: 60, converted: 35 },
  { month: 'Mar', generated: 45, converted: 25 },
  { month: 'Abr', generated: 80, converted: 50 },
  { month: 'Mai', generated: 70, converted: 45 },
  { month: 'Jun', generated: 90, converted: 60 },
];

const leadDistribution = [
  { stage: 'Awareness', count: 624, percentage: 100 },
  { stage: 'Interest', count: 412, percentage: 66 },
  { stage: 'Consideration', count: 218, percentage: 35 },
  { stage: 'Negotiation', count: 95, percentage: 15 },
  { stage: 'Closed Won', count: 32, percentage: 5 },
];

const recentActivity = [
  { id: 1, type: 'success', title: 'Negócio fechado com Globex Corp', time: '2 horas atrás', user: 'Ana Silva', icon: CheckCircle2 },
  { id: 2, type: 'primary', title: 'Novo lead atribuído: Mark Thompson', time: '5 horas atrás', user: 'Marketing Flow', icon: UserPlus },
  { id: 3, type: 'warning', title: 'Campanha de e-mail Q4 Outreach iniciada', time: '1 dia atrás', user: 'João Martins', icon: Mail },
  { id: 4, type: 'danger', title: 'Aviso de lead parado: TechSolutions', time: '2 dias atrás', user: 'System Alert', icon: AlertCircle },
  { id: 5, type: 'purple', title: 'Reunião agendada com Vertex Ltd', time: '2 dias atrás', user: 'Pedro Lima', icon: CalendarDays },
];

export default function DashboardPage() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [stats, setStats] = React.useState({
    totalLeads: 0,
    conversionRate: 14.2,
    totalRevenue: 425000,
    avgSalesCycle: 18
  });
  const [productSales, setProductSales] = React.useState([
    { name: 'Perfis de Drywall', value: 0 },
    { name: 'Exaustor Eólico', value: 0 },
  ]);
  const [distribution, setDistribution] = React.useState([
    { stage: 'Cadastrado', count: 0, percentage: 0, conversionRate: 0 },
    { stage: '1° Contato', count: 0, percentage: 0, conversionRate: 0 },
    { stage: 'Follow Up', count: 0, percentage: 0, conversionRate: 0 },
    { stage: 'Proposta Solicitada', count: 0, percentage: 0, conversionRate: 0 },
    { stage: 'Fechamento', count: 0, percentage: 0, conversionRate: 0 },
    { stage: 'Cliente', count: 0, percentage: 0, conversionRate: 0 },
  ]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase || !user) {
        if (!authLoading && !user) router.push('/');
        console.warn('Supabase is not configured or user not logged in');
        setActivities(recentActivity);
        setIsLoading(false);
        return;
      }
      try {
        // Fetch Leads for Stats and Distribution
        let query = supabase.from('leads').select('*');
        
        // Filter by salesperson if not admin
        if (!isAdmin && profile) {
          query = query.eq('salesperson_name', profile.name);
        }

        const { data: leads, error: leadsError } = await query;

        if (leadsError) {
          console.error('Leads query error:', leadsError);
          throw leadsError;
        }

        if (leads) {
          console.log(`Dashboard: Fetched ${leads.length} leads`);
          
          const total = leads.length;
          const stages = ['Cadastrado', '1° Contato', 'Follow Up', 'Proposta Solicitada', 'Fechamento', 'Cliente'];
          
          const dist = stages.map((s, index) => {
            const count = leads.filter(l => {
              const leadStage = l["Estágio"] || l["stage"] || l["estagio"];
              return leadStage === s;
            }).length;
            
            // Calculate conversion rate from previous stage
            let conversionRate = 0;
            if (index > 0) {
              const previousStageCount = leads.filter(l => {
                const leadStage = l["Estágio"] || l["stage"] || l["estagio"];
                return leadStage === stages[index - 1];
              }).length;
              if (previousStageCount > 0) {
                conversionRate = Math.round((count / previousStageCount) * 100);
              }
            }

            return {
              stage: s,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0,
              conversionRate
            };
          });
          
          const revenue = leads
            .filter(l => (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente')
            .reduce((acc, curr) => acc + (Number(curr["Orçamento"] || curr["budget"] || curr["orcamento"]) || 0), 0);

          const totalConverted = leads.filter(l => (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente').length;
          const overallConversionRate = total > 0 ? Math.round((totalConverted / total) * 100) : 0;

          // Product Sales
          const drywallSales = leads
            .filter(l => (l["Produto"] || l["product"] || l["produto"]) === 'Perfis de Drywall' && (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente')
            .reduce((acc, curr) => acc + (Number(curr["Orçamento"] || curr["budget"] || curr["orcamento"]) || 0), 0);
          const exhaustSales = leads
            .filter(l => (l["Produto"] || l["product"] || l["produto"]) === 'Exaustor Eólico' && (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente')
            .reduce((acc, curr) => acc + (Number(curr["Orçamento"] || curr["budget"] || curr["orcamento"]) || 0), 0);

          setProductSales([
            { name: 'Perfis de Drywall', value: drywallSales },
            { name: 'Exaustor Eólico', value: exhaustSales },
          ]);

          setStats(prev => ({
            ...prev,
            totalLeads: total,
            totalRevenue: revenue || prev.totalRevenue,
            conversionRate: overallConversionRate || prev.conversionRate
          }));
          setDistribution(dist);
        }

        // Fetch Recent Activities
        let acts = null;
        let actsError = null;
        
        try {
          let actsQuery = supabase
            .from('activities')
            .select('id, type, description, created_at, leads(Nome, salesperson_id)')
            .order('created_at', { ascending: false });

          if (!isAdmin) {
            actsQuery = actsQuery.eq('user_id', user.id);
          }

          const result = await actsQuery.limit(5);
          acts = result.data;
          actsError = result.error;
        } catch (e) {
          console.error('Activities fetch exception:', e);
        }

        if (actsError) {
          console.warn('Activities query error:', actsError.message || actsError);
          setActivities(recentActivity);
        } else if (acts && acts.length > 0) {
          const formattedActs = acts.map(a => ({
            id: a.id,
            type: a.type === 'Message' ? 'primary' : a.type === 'Call' ? 'success' : 'purple',
            title: `${a.type}: ${a.description} para `,
            user: (a.leads as any)?.["Nome"] || 'Lead',
            time: new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            icon: a.type === 'Message' ? Mail : a.type === 'Call' ? CheckCircle2 : CalendarDays
          }));
          setActivities(formattedActs);
        } else {
          setActivities(recentActivity);
        }

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
    setMounted(true);
  }, [user, profile, isAdmin, authLoading, router]);

  if (!mounted) return <div className="flex min-h-screen bg-white" />;

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar title="Dashboard" />
        
        <div className="p-8 space-y-8 overflow-y-auto bg-white">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Dashboard de Performance</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Visão geral do pipeline de vendas e atividades da equipe.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium flex items-center gap-2 text-slate-300 hover:bg-slate-800 transition-colors">
                <Calendar size={16} />
                Últimos 30 Dias
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Exportar Relatório
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Total de Leads" 
              value={stats.totalLeads.toLocaleString('pt-BR')} 
              change="+12.5%" 
              trend="up" 
              icon={Users} 
              color="blue" 
            />
            <KPICard 
              title="Taxa de Conversão" 
              value={`${stats.conversionRate}%`} 
              change="+2.1%" 
              trend="up" 
              icon={TrendingUp} 
              color="emerald" 
            />
            <KPICard 
              title="Receita Total" 
              value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR')}`} 
              change="-3.4%" 
              trend="down" 
              icon={Euro} 
              color="amber" 
            />
            <KPICard 
              title="Ciclo Médio de Vendas" 
              value={`${stats.avgSalesCycle} dias`} 
              change="+1 dia" 
              trend="up" 
              icon={Clock} 
              color="purple" 
            />
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bar Chart: Sales by Product */}
            <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-bold text-lg text-slate-900">Vendas por Produto (Fechados)</h4>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="size-2 bg-blue-600 rounded-full"></span> Receita (R$)
                  </div>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productSales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                      barSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead Distribution: Funnel */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg text-slate-900 mb-6">Funil de Conversão</h4>
              <div className="space-y-6">
                {distribution.map((item, index) => (
                  <div key={item.stage} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{item.stage}</span>
                      <span className="text-slate-500 font-mono">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.stage === 'Cliente' ? "bg-emerald-500" : "bg-blue-600"
                        )} 
                        style={{ width: `${item.percentage}%`, opacity: (item.percentage / 100) + 0.3 }}
                      ></div>
                    </div>
                    {index > 0 && item.conversionRate > 0 && (
                      <div className="absolute -top-4 right-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        ↑ {item.conversionRate}% conv.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Area: Line Chart & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Line Chart: Leads vs Converted */}
            <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900">Leads Gerados vs. Convertidos</h4>
                  <p className="text-xs text-slate-500">Detalhamento mensal da eficiência de marketing</p>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-blue-600 rounded-full"></span> Gerados
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-emerald-500 rounded-full"></span> Convertidos
                  </div>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorConverted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="generated" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorGenerated)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="converted" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorConverted)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-lg text-slate-900">Atividade Recente</h4>
                <button className="text-xs text-blue-600 font-semibold hover:underline">Ver Tudo</button>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0",
                      activity.type === 'success' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                      activity.type === 'primary' && "bg-blue-50 text-blue-600 border border-blue-100",
                      activity.type === 'warning' && "bg-amber-50 text-amber-600 border border-amber-100",
                      activity.type === 'danger' && "bg-rose-50 text-rose-600 border border-rose-100",
                      activity.type === 'purple' && "bg-purple-50 text-purple-600 border border-purple-100",
                    )}>
                      <activity.icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        {activity.title}
                        <span className="font-bold ml-1">{activity.user}</span>
                      </p>
                      <p className="text-xs text-slate-500">{activity.time} • {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
