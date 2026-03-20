'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { KPICard } from '@/components/KPICard';
import { cn, formatTimeAgo } from '@/lib/utils';
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
  CalendarDays,
  DollarSign,
  Target,
  Zap
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
import { SupabaseAudit } from '@/components/SupabaseAudit';

const teamData = [
  { name: 'Ana', sales: 90 },
  { name: 'Bruno', sales: 40 },
  { name: 'Carla', sales: 25 },
  { name: 'João', sales: 75 },
  { name: 'Maria', sales: 65 },
  { name: 'Pedro', sales: 50 },
  { name: 'Sofia', sales: 35 },
];

const leadDistribution = [
  { stage: 'Awareness', count: 624, percentage: 100 },
  { stage: 'Interest', count: 412, percentage: 66 },
  { stage: 'Consideration', count: 218, percentage: 35 },
  { stage: 'Negotiation', count: 95, percentage: 15 },
  { stage: 'Closed Won', count: 32, percentage: 5 },
];

const recentActivityMock = [
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
    conversionRate: 0,
    totalRevenue: 0,
    avgSalesCycle: 0,
    leadsQuarter: 0,
    convertedQuarter: 0
  });
  const [productSales, setProductSales] = React.useState([
    { name: 'Perfis de Drywall', value: 0 },
    { name: 'Exaustor Eólico', value: 0 },
  ]);
  const [performanceData, setPerformanceData] = React.useState([
    { month: 'Jan', generated: 0, converted: 0 },
    { month: 'Fev', generated: 0, converted: 0 },
    { month: 'Mar', generated: 0, converted: 0 },
    { month: 'Abr', generated: 0, converted: 0 },
    { month: 'Mai', generated: 0, converted: 0 },
    { month: 'Jun', generated: 0, converted: 0 },
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
        // if (!authLoading && !user) router.push('/');
        console.warn('Supabase is not configured or user not logged in');
        setActivities(recentActivityMock);
        setIsLoading(false);
        return;
      }
      try {
        let leadActivities: any[] = [];
        // Fetch Leads for Stats and Distribution
        let query = supabase.from('leads').select('*');
        
        // Filter by salesperson if not admin
        if (!isAdmin && profile) {
          // Tenta filtrar por ID ou por nome (Vendedor), incluindo nomes legados
          const filter = [`salesperson_id.eq.${profile.id}`, `Vendedor.eq."${profile.name}"`];
          if (profile.name === 'Jonathan') filter.push('Vendedor.eq."Vendas"');
          if (profile.name === 'Isabele') filter.push('Vendedor.eq."Administrador principal Indavent Exaustores"');
          query = query.or(filter.join(','));
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

          // Stats for last 30 days
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          
          const leads30Days = leads.filter(l => new Date(l.created_at) >= thirtyDaysAgo);
          const converted30Days = leads.filter(l => {
            const isConverted = (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente';
            const convertedDate = new Date(l.updated_at || l.created_at);
            return isConverted && convertedDate >= thirtyDaysAgo;
          });
          
          const conversionRate30Days = leads30Days.length > 0 
            ? Math.round((converted30Days.length / leads30Days.length) * 100) 
            : overallConversionRate;

          const leads90Days = leads.filter(l => new Date(l.created_at) >= ninetyDaysAgo);
          const converted90Days = leads.filter(l => {
            const isConverted = (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente';
            const convertedDate = new Date(l.updated_at || l.created_at);
            return isConverted && convertedDate >= ninetyDaysAgo;
          });

          const revenue30Days = leads
            .filter(l => {
              const isConverted = (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente';
              const convertedDate = new Date(l.updated_at || l.created_at);
              return isConverted && convertedDate >= thirtyDaysAgo;
            })
            .reduce((acc, curr) => acc + (Number(curr["Orçamento"] || curr["budget"] || curr["orcamento"]) || 0), 0);

          // Cycle calculation
          const convertedLeads = leads.filter(l => (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente');
          let avgCycle = 0;
          if (convertedLeads.length > 0) {
            const totalDays = convertedLeads.reduce((acc, l) => {
              const start = new Date(l.created_at);
              const end = new Date(l.updated_at || l.created_at);
              return acc + Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            }, 0);
            avgCycle = Math.round(totalDays / convertedLeads.length);
          }

          // Performance Data (Last 6 Months)
          const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const last6Months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthIndex = d.getMonth();
            const year = d.getFullYear();
            
            const generated = leads.filter(l => {
              const ld = new Date(l.created_at);
              return ld.getMonth() === monthIndex && ld.getFullYear() === year;
            }).length;
            
            const converted = leads.filter(l => {
              const ld = new Date(l.updated_at || l.created_at);
              const isConverted = (l["Estágio"] || l["stage"] || l["estagio"]) === 'Cliente';
              return ld.getMonth() === monthIndex && ld.getFullYear() === year && isConverted;
            }).length;
            
            last6Months.push({ month: monthsNames[monthIndex], generated, converted });
          }
          setPerformanceData(last6Months);

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

          setStats({
            totalLeads: total,
            totalRevenue: revenue30Days || revenue,
            conversionRate: conversionRate30Days,
            avgSalesCycle: avgCycle || 18,
            leadsQuarter: leads90Days.length,
            convertedQuarter: converted90Days.length
          });
          setDistribution(dist);
          
          // Generate real activities from leads
          leadActivities = leads
            .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
            .slice(0, 10)
            .map(l => {
              const stage = l["Estágio"] || l["stage"] || l["estagio"];
              const name = l["Nome"] || l["name"] || l["nome"];
              const updatedAt = l.updated_at || l.created_at;
              const timeStr = formatTimeAgo(updatedAt);

              let type = 'primary';
              let title = `Lead atualizado: ${name}`;
              let icon = UserPlus;

              if (stage === 'Cliente') {
                type = 'success';
                title = `Negócio fechado com ${name}`;
                icon = CheckCircle2;
              } else if (stage === 'Proposta Solicitada') {
                type = 'purple';
                title = `Proposta solicitada por ${name}`;
                icon = Mail;
              } else if (stage === 'Perdido') {
                type = 'danger';
                title = `Lead perdido: ${name}`;
                icon = AlertCircle;
              }

              return {
                id: l.id,
                type,
                title: `${title} (SLA: ${timeStr})`,
                user: l.Vendedor || l.vendedor || l["Vendedor."] || 'Vendedor',
                time: timeStr,
                icon
              };
            });
          
          setActivities(leadActivities.length > 0 ? leadActivities : recentActivityMock);
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
          setActivities(leadActivities.length > 0 ? leadActivities : recentActivityMock);
        } else if (acts && acts.length > 0) {
          const formattedActs = acts.map(a => ({
            id: a.id,
            type: a.type === 'Message' ? 'primary' : a.type === 'Call' ? 'success' : 'purple',
            title: `${a.type}: ${a.description} para ${(a.leads as any)?.["Nome"] || 'Lead'} (SLA: ${formatTimeAgo(a.created_at)})`,
            user: (a.leads as any)?.["Nome"] || 'Lead',
            time: formatTimeAgo(a.created_at),
            icon: a.type === 'Message' ? Mail : a.type === 'Call' ? CheckCircle2 : CalendarDays
          }));
          setActivities(formattedActs);
        } else {
          setActivities(leadActivities.length > 0 ? leadActivities : recentActivityMock);
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
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden lg:pl-64">
        <TopBar title="Dashboard" />
        
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto bg-white">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Dashboard de Performance</h2>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[9px] sm:text-[10px] tracking-widest">Visão geral do pipeline de vendas e atividades da equipe.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-slate-300 hover:bg-slate-800 transition-colors">
                <Calendar size={16} />
                Últimos 30 Dias
              </button>
              <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>

          <SupabaseAudit />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <KPICard 
              title="Total de Leads" 
              value={stats.totalLeads.toLocaleString('pt-BR')} 
              change="+12%" 
              trend="up"
              icon={Users} 
              color="blue"
              description="Base total de leads"
            />
            <KPICard 
              title="Receita (30d)" 
              value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)} 
              change="+8%" 
              trend="up"
              icon={DollarSign} 
              color="emerald"
              description="Vendas convertidas no mês"
            />
            <KPICard 
              title="Conversão (30d)" 
              value={`${stats.conversionRate}%`} 
              change="+2%" 
              trend="up"
              icon={Target} 
              color="amber"
              description="Eficiência de fechamento"
            />
            <KPICard 
              title="Ciclo Médio" 
              value={`${stats.avgSalesCycle} dias`} 
              change="-3 dias" 
              trend="down"
              icon={Zap} 
              color="purple"
              description="Tempo médio de conversão"
            />
          </div>

          {/* Quarter Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Leads Gerados (Trimestre)</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.leadsQuarter || 0}</h3>
              </div>
              <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Leads Convertidos (Trimestre)</p>
                <h3 className="text-2xl font-black text-slate-900">{stats.convertedQuarter || 0}</h3>
              </div>
              <div className="size-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Bar Chart: Sales by Product */}
            <div className="lg:col-span-2 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h4 className="font-bold text-lg text-slate-900">Vendas por Produto</h4>
                <div className="flex items-center gap-4 text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="size-2 bg-blue-600 rounded-full"></span> Receita (R$)
                  </div>
                </div>
              </div>
              <div className="h-48 sm:h-64 w-full">
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
            <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg text-slate-900 mb-6">Funil de Conversão</h4>
              <div className="space-y-4 sm:space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Line Chart: Leads vs Converted */}
            <div className="lg:col-span-2 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900">Leads Gerados vs. Convertidos</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500">Detalhamento mensal da eficiência</p>
                </div>
                <div className="flex gap-4 text-[10px] sm:text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-blue-600 rounded-full"></span> Gerados
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-emerald-500 rounded-full"></span> Convertidos
                  </div>
                </div>
              </div>
              <div className="h-48 sm:h-64 w-full">
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
            <div className="p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[400px] lg:h-auto">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-lg text-slate-900">Atividade Recente</h4>
                <button className="text-xs text-blue-600 font-semibold hover:underline">Ver Tudo</button>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
