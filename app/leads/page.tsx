'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import Link from 'next/link';
import { 
  Filter, 
  Plus, 
  ChevronRight, 
  MapPin, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  AlertTriangle,
  ChevronLeft,
  Search,
  X,
  ChevronDown,
  BarChart3,
  LineChart as LineChartIcon,
  ChevronRight as ChevronRightIcon,
  Edit3,
  Package,
  Trash2,
  Copy,
  CheckCircle2
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
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const MOCK_LEADS = [
  {
    id: '1',
    company: 'BRASVALI GESSOS',
    initials: 'BG',
    address: 'Av general guimarães, 627, Valinhos',
    tags: ['Gesseiro'],
    source: 'Google',
    stage: 'Proposta Solicitada',
    salesperson: 'Jonathan',
    salespersonInitials: 'J',
    product: 'Placas de Drywall',
    budget: 'R$ 12.450,00',
    deliveryDeadline: '15 dias',
    proposalDate: '03/03/2026',
    deadline: '2 dias',
    followUp: '🚨Entrar em contato',
    phone: '5519997955448',
    hasDocs: true,
    color: 'blue'
  }
];

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const STAGES = [
  'Cadastrado',
  '1° Contato',
  'Follow Up',
  'Proposta Solicitada',
  'Fechamento',
  'Cliente',
  'Perdido'
];

const SALESPEOPLE = ['Jonathan', 'Isabele', 'Jaqueline'];
const PRODUCTS = ['Placas de Drywall', 'Exaustores Eólicos'];

export default function LeadsPage() {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [leads, setLeads] = React.useState<any[]>([]);
  const [salespeople, setSalespeople] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showAllLeads, setShowAllLeads] = React.useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = React.useState(false);
  const [duplicatesFound, setDuplicatesFound] = React.useState<any[]>([]);
  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  
  // Filter states
  const [stageFilter, setStageFilter] = React.useState('Todos os Estágios');
  const [salespersonFilter, setSalespersonFilter] = React.useState('Todos os Vendedores');
  const [productFilter, setProductFilter] = React.useState('Todos os Produtos');
  const [cityFilter, setCityFilter] = React.useState('Todas as Cidades');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Form states
  const [formData, setFormData] = React.useState<any>({
    "Nome": "",
    "Estágio": "Cadastrado",
    "Data de Envio (Proposta-Follow Up))": "",
    "Endereço": "",
    "Vendedor": "",
    "Responsável da Empresa": "",
    "Como conheceu?": "",
    "Cidade": "",
    "Telefone": "",
    "Tipo": "",
    "Produto": "Placas de Drywall",
    "Orçamento": 0,
    "Ultimo contato (Lead)": new Date().toISOString(),
    "Observações": ""
  });

  // Set default salesperson when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData((prev: any) => {
        if (!prev["Vendedor"]) {
          return { ...prev, "Vendedor": profile.name };
        }
        return prev;
      });
    }
  }, [profile]);

  // Helper to map UI form data to DB columns
  const mapFormDataToDb = (data: any): any => {
    return {
      name: data["Nome"],
      stage: data["Estágio"],
      proposal_sent_at: data["Data de Envio (Proposta-Follow Up))"] || null,
      address: data["Endereço"],
      salesperson_name: data["Vendedor"],
      company_responsible: data["Responsável da Empresa"],
      source_details: data["Como conheceu?"],
      city: data["Cidade"],
      phone: data["Telefone"],
      lead_type: data["Tipo"],
      product: data["Produto"],
      budget: data["Orçamento"],
      last_contact: data["Ultimo contato (Lead)"] || null,
      observations: data["Observações"]
    };
  };

  const cities = React.useMemo(() => {
    const allCities = leads.map(l => l.city).filter(Boolean);
    return ['Todas as Cidades', ...Array.from(new Set(allCities))];
  }, [leads]);

  React.useEffect(() => {
    async function fetchLeads() {
      if (!supabase || !user) {
        if (!authLoading && !user) router.push('/');
        console.warn('Supabase is not configured or user not logged in');
        setIsLoading(false);
        return;
      }
      try {
        // Fetch salespeople for the filter and form
        const { data: usersData } = await supabase
          .from('internal_users')
          .select('id, name, role');
        
        if (usersData) {
          setSalespeople(usersData);
        }

        let query = supabase.from('leads').select('*');
        
        if (!isAdmin && profile) {
          query = query.eq('salesperson_name', profile.name);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching leads from Supabase:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        if (data) {
          console.log(`Fetched ${data.length} leads from Supabase`);
          const formattedLeads = data.map(item => {
            // Priority Formula
            let priorityStatus = '';
            const proposalSentAt = item["Data de Envio (Proposta-Follow Up))"];
            const deadlineDays = item["Prazo de Resposta"] || 2;

            if (item["Estágio"] === "Proposta Solicitada" && proposalSentAt) {
              const proposalDate = new Date(proposalSentAt);
              const today = new Date();
              const targetDate = new Date(proposalDate);
              targetDate.setDate(targetDate.getDate() + (deadlineDays - 2));
              
              const diffTime = today.getTime() - targetDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays > 2) {
                priorityStatus = '🚨Entrar em contato';
              } else {
                priorityStatus = '⌛Aguardando Retorno';
              }
            }

            // Salesperson Mapping
            let mappedSalesperson = 'Jonathan';
            const salespersonName = item["salesperson_name"] || item["Vendedor"] || item["Vendedor."];
            if (salespersonName === 'Administrador principal Indavent Exaustores') {
              mappedSalesperson = 'Isabele';
            } else if (salespersonName === 'Vendas') {
              mappedSalesperson = 'Jonathan';
            } else if (salespersonName) {
              mappedSalesperson = salespersonName;
            }
            
            // Normalize Jaquelina to Jaqueline
            if (mappedSalesperson === 'Jaquelina') mappedSalesperson = 'Jaqueline';

            // Fallback for phone column
            const phoneValue = item["Telefone"] || item["telefone"] || item["Phone"] || item["phone"];

            return {
              ...item,
              id: item.id,
              company: item["Nome"] || item["name"] || "Sem Nome",
              initials: (item["Nome"] || item["name"] || "??").split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              address: item["Endereço"] || item["address"] || 'Endereço não informado',
              city: item["Cidade"] || item["city"],
              tags: item["Tipo"] ? [item["Tipo"]] : [],
              source: item["Como conheceu?"] || item["source"] || 'WhatsApp',
              stage: item["Estágio"] || item["stage"] || 'Cadastrado',
              salesperson: mappedSalesperson,
              salespersonInitials: mappedSalesperson[0],
              product: item["Produto"] || item["product"] || 'Placas de Drywall',
              budget: item["Orçamento"] ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item["Orçamento"]) : 'R$ 0,00',
              budgetValue: Number(item["Orçamento"]) || 0,
              deliveryDeadline: item["Prazo de Entrega"] || item["delivery_deadline"] || 'N/A',
              proposalDate: proposalSentAt ? new Date(proposalSentAt).toLocaleDateString('pt-BR') : 'N/A',
              deadline: `${deadlineDays} dias`,
              followUp: priorityStatus,
              phone: phoneValue,
              hasDocs: !!item["Proposta"],
              proposalLink: item["Proposta"],
              color: item["Estágio"] === 'Cliente' ? 'emerald' : item["Estágio"] === 'Perdido' ? 'rose' : 'blue',
              priorityValue: priorityStatus === '🚨Entrar em contato' ? 1 : 2,
              updatedAt: item.updated_at || item.created_at
            };
          });

          // Sort by priority (🚨 first), then by last update
          formattedLeads.sort((a, b) => {
            if (a.priorityValue !== b.priorityValue) {
              return a.priorityValue - b.priorityValue;
            }
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          
          setLeads(formattedLeads);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeads();
    setMounted(true);
  }, [user, profile, isAdmin, authLoading, router]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    try {
      const dbData = mapFormDataToDb(formData);
      
      // Auto-assign salesperson if not admin
      if (!isAdmin) {
        (dbData as any).salesperson_id = user.id;
        (dbData as any)["Vendedor"] = profile?.name || user.username;
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert([dbData])
        .select();
      
      if (error) throw error;
      window.location.reload();
    } catch (err: any) {
      console.error('Error creating lead:', err.message || err);
      alert(`Erro ao criar lead: ${err.message || 'Verifique os dados e tente novamente.'}`);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    try {
      const dbData = mapFormDataToDb(formData);
      
      // If admin changed the salesperson, we should try to update salesperson_id too
      if (isAdmin && formData["Vendedor"]) {
        const selectedSalesperson = salespeople.find(s => s.name === formData["Vendedor"]);
        if (selectedSalesperson) {
          dbData.salesperson_id = selectedSalesperson.id;
        }
      }

      const { error } = await supabase
        .from('leads')
        .update(dbData)
        .eq('id', selectedLead.id);
      
      if (error) throw error;
      window.location.reload();
    } catch (err: any) {
      console.error('Error updating lead:', err.message || err);
      alert(`Erro ao atualizar lead: ${err.message || 'Verifique os dados e tente novamente.'}`);
    }
  };

  const openEditModal = (lead: any) => {
    setSelectedLead(lead);
    setFormData({
      "Nome": lead["Nome"] || lead["name"] || "",
      "Estágio": lead["Estágio"] || lead["stage"] || "Cadastrado",
      "Data de Envio (Proposta-Follow Up))": lead["Data de Envio (Proposta-Follow Up))"] || lead["proposal_sent_at"] || "",
      "Endereço": lead["Endereço"] || lead["address"] || "",
      "Vendedor": lead["salesperson_name"] || lead["Vendedor"] || lead["salesperson_name"] || "Jonathan",
      "Responsável da Empresa": lead["Responsável da Empresa"] || lead["company_responsible"] || "",
      "Como conheceu?": lead["Como conheceu?"] || lead["source_details"] || "",
      "Cidade": lead["Cidade"] || lead["city"] || "",
      "Telefone": lead["Telefone"] || lead["telefone"] || lead["Phone"] || lead["phone"] || "",
      "Tipo": lead["Tipo"] || lead["lead_type"] || "",
      "Produto": lead["Produto"] || lead["product"] || "Placas de Drywall",
      "Orçamento": lead["Orçamento"] || lead["budget"] || 0,
      "Ultimo contato (Lead)": lead["Ultimo contato (Lead)"] || lead["last_contact"] || new Date().toISOString(),
      "Observações": lead["Observações"] || lead["observations"] || ""
    });
    setIsEditModalOpen(true);
    setIsEditing(false); // Start in view mode
  };

  const detectDuplicates = () => {
    const groups: { [key: string]: any[] } = {};
    
    leads.forEach((lead: any) => {
      const name = (lead.company || "").toLowerCase().trim();
      const phone = (lead.phone || "").replace(/\D/g, "");
      
      if (name && phone) {
        const key = `${name}-${phone}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(lead);
      }
    });
    
    const duplicates = Object.values(groups).filter(group => group.length > 1);
    setDuplicatesFound(duplicates);
    setIsDuplicateModalOpen(true);
  };

  const deleteDuplicates = async (toDelete: string[]) => {
    if (!supabase) return;
    if (!confirm(`Tem certeza que deseja excluir ${toDelete.length} leads duplicados?`)) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', toDelete);
        
      if (error) throw error;
      
      alert(`${toDelete.length} leads excluídos com sucesso.`);
      window.location.reload();
    } catch (err: any) {
      console.error('Error deleting duplicates:', err);
      alert(`Erro ao excluir duplicados: ${err.message}`);
    }
  };

  // Chart Data
  const funnelData = STAGES.map(stage => ({
    name: stage,
    count: leads.filter(l => {
      const matchesStage = l.stage === stage;
      const matchesSalesperson = salespersonFilter === 'Todos os Vendedores' || l.salesperson === salespersonFilter;
      const matchesProduct = productFilter === 'Todos os Produtos' || l.product === productFilter;
      return matchesStage && matchesSalesperson && matchesProduct;
    }).length
  }));

  const evolutionData = React.useMemo(() => {
    // Group by month and product
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, i) => {
      const data: any = { month };
      PRODUCTS.forEach(product => {
        data[product] = leads
          .filter(l => {
            const date = new Date(l.updatedAt);
            return date.getMonth() === i && l.product === product && l.stage === 'Cliente';
          })
          .reduce((acc, curr) => acc + curr.budgetValue, 0);
      });
      return data;
    });
  }, [leads]);

  if (!mounted) return <div className="flex min-h-screen bg-slate-950" />;

  const filteredLeads = leads.filter(lead => {
    const matchesStage = stageFilter === 'Todos os Estágios' || lead.stage === stageFilter;
    const matchesSalesperson = salespersonFilter === 'Todos os Vendedores' || lead.salesperson === salespersonFilter;
    const matchesProduct = productFilter === 'Todos os Produtos' || lead.product === productFilter;
    const matchesCity = cityFilter === 'Todas as Cidades' || lead.city === cityFilter;
    const matchesSearch = (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (lead.phone && lead.phone.includes(searchTerm));
    
    return matchesStage && matchesSalesperson && matchesProduct && matchesCity && matchesSearch;
  });

  const displayedLeads = showAllLeads ? filteredLeads : filteredLeads.slice(0, 50);

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        <div className="p-8 space-y-8 overflow-y-auto bg-white">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Leads</h2>
              <p className="text-slate-500 text-sm mt-1">Gerencie seu pipeline de vendas e acompanhe o progresso dos seus negócios.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={detectDuplicates}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                <Copy size={20} />
                Detectar Duplicados
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Plus size={20} />
                Cadastrar Lead
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou telefone..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option>Todos os Estágios</option>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm"
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                >
                  <option>Todos os Produtos</option>
                  {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm"
                  value={salespersonFilter}
                  onChange={(e) => setSalespersonFilter(e.target.value)}
                >
                  <option>Todos os Vendedores</option>
                  {salespeople.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <select 
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer shadow-sm"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  {cities.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-5">Lead / Empresa</th>
                    <th className="px-4 py-5">Estágio</th>
                    <th className="px-4 py-5">Vendedor</th>
                    <th className="px-4 py-5">Produto</th>
                    <th className="px-4 py-5">Orçamento</th>
                    <th className="px-4 py-5">Prazo Entrega</th>
                    <th className="px-4 py-5">Follow-up</th>
                    <th className="px-4 py-5 text-center">Proposta</th>
                    <th className="px-6 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="size-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-slate-500 text-sm font-medium">Carregando seus leads...</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search size={40} className="text-slate-200 mb-2" />
                          <p className="text-slate-400 font-bold">Nenhum lead encontrado</p>
                          <p className="text-slate-500 text-sm">Tente ajustar seus filtros ou termo de busca.</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => openEditModal(lead)}
                      className="hover:bg-slate-50 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "size-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border border-slate-100",
                            lead.color === 'blue' && "bg-blue-50 text-blue-600",
                            lead.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                            lead.color === 'rose' && "bg-rose-50 text-rose-600",
                          )}>
                            {lead.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-slate-900 uppercase truncate">{lead.company}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin size={12} />
                                {lead.city || lead.address}
                              </p>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">
                                {lead.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          lead.stage === 'Cliente' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                          lead.stage === 'Perdido' && "bg-rose-50 text-rose-600 border border-rose-100",
                          lead.stage === 'Proposta Solicitada' && "bg-blue-50 text-blue-600 border border-blue-100",
                          !['Cliente', 'Perdido', 'Proposta Solicitada'].includes(lead.stage) && "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-black text-slate-600 border border-slate-200">
                            {lead.salespersonInitials}
                          </div>
                          <p className="text-xs font-bold text-slate-700">{lead.salesperson}</p>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{lead.product}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-black text-slate-900">{lead.budget}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-xs text-slate-500">{lead.deliveryDeadline}</p>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col gap-1.5">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            lead.followUp.includes('🚨') ? "text-rose-600" : "text-amber-600"
                          )}>
                            {lead.followUp}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Phone size={12} />
                            </div>
                            <p className="text-sm font-mono text-slate-900 font-black tracking-tight">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <button 
                          className={cn(
                            "p-2.5 rounded-xl transition-all",
                            lead.hasDocs ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-200 cursor-not-allowed"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            lead.proposalLink && window.open(lead.proposalLink, '_blank');
                          }}
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 group-hover:text-slate-600">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer / Load More */}
            {!showAllLeads && filteredLeads.length > 50 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center">
                <button 
                  onClick={() => setShowAllLeads(true)}
                  className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 border border-slate-200 shadow-sm"
                >
                  Ver todos os leads
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
            
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Mostrando {displayedLeads.length} de {filteredLeads.length} leads
              </p>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
            {/* Funnel Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Funil de Vendas</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={funnelData} margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                      width={120}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#2563eb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Evolution Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <LineChartIcon size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Evolução por Produto</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(v) => `R$${v/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                    />
                    <Line type="monotone" dataKey="Placas de Drywall" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Exaustores Eólicos" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Side Panel for Lead Details/Edit */}
      <AnimatePresence>
        {(isEditModalOpen || isCreateModalOpen) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setIsCreateModalOpen(false);
                setSelectedLead(null);
              }}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-slate-100",
                    selectedLead?.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                    selectedLead?.color === 'emerald' ? "bg-emerald-50 text-emerald-600" : 
                    selectedLead?.color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                  )}>
                    {selectedLead?.initials || "NL"}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      {isCreateModalOpen ? "Novo Lead" : selectedLead?.company}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Ativo</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isCreateModalOpen && !isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Edit3 size={14} />
                      Editar
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsCreateModalOpen(false);
                      setIsEditing(false);
                      setSelectedLead(null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {(!isEditing && !isCreateModalOpen) ? (
                  /* VIEW MODE */
                  <div className="p-8 space-y-10">
                    {/* Main Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estágio</p>
                        <p className="text-sm font-black text-slate-900">{selectedLead?.stage}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orçamento</p>
                        <p className="text-sm font-black text-blue-600">{selectedLead?.budget}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vendedor</p>
                        <p className="text-sm font-black text-slate-900">{selectedLead?.salesperson}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Informações de Contato</h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone Principal</p>
                            <p className="text-lg font-mono font-black text-slate-900">{selectedLead?.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                            <p className="text-sm font-bold text-slate-700">{selectedLead?.city || "Não informada"}</p>
                            <p className="text-xs text-slate-500">{selectedLead?.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product & Source */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Produto de Interesse</h4>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Package size={16} />
                          </div>
                          <p className="text-sm font-bold text-slate-700">{selectedLead?.product}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Origem do Lead</h4>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Search size={16} />
                          </div>
                          <p className="text-sm font-bold text-slate-700">{selectedLead?.source || "Direto"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Observations */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Observações</h4>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          {selectedLead?.["Observações"] || "Nenhuma observação registrada para este lead."}
                        </p>
                      </div>
                    </div>

                    {/* Timeline / System Info */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Histórico do Sistema</h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="size-2 bg-blue-600 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Lead criado no sistema</p>
                            <p className="text-[10px] text-slate-500">Há 3 dias • Automático</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="size-2 bg-slate-300 rounded-full mt-1.5"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-400">Última atualização de status</p>
                            <p className="text-[10px] text-slate-500">Ontem às 14:30 • {selectedLead?.salesperson}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EDIT/CREATE MODE */
                  <form onSubmit={isCreateModalOpen ? handleCreateLead : handleUpdateLead} className="p-8 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  {/* Mandatory Fields Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 border-b border-blue-100 pb-2">Informações Essenciais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome do Lead <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Nome"]}
                          onChange={(e) => setFormData({...formData, "Nome": e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telefone <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Telefone"]}
                          onChange={(e) => setFormData({...formData, "Telefone": e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Produto <span className="text-rose-500">*</span></label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer"
                        value={formData["Produto"]}
                        onChange={(e) => setFormData({...formData, "Produto": e.target.value})}
                      >
                        {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Status & Sales Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Status e Vendas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Estágio</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all cursor-pointer"
                          value={formData["Estágio"]}
                          onChange={(e) => setFormData({...formData, "Estágio": e.target.value})}
                        >
                          {STAGES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vendedor</label>
                        <select 
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all",
                            !isAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          )}
                          value={formData["Vendedor"]}
                          onChange={(e) => setFormData({...formData, "Vendedor": e.target.value})}
                          disabled={!isAdmin}
                        >
                          {salespeople.length > 0 
                            ? salespeople.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                            : <option value={formData["Vendedor"]}>{formData["Vendedor"]}</option>
                          }
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Orçamento</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                            value={formData["Orçamento"]}
                            onChange={(e) => setFormData({...formData, "Orçamento": Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Envio (Proposta)</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Data de Envio (Proposta-Follow Up))"]}
                          onChange={(e) => setFormData({...formData, "Data de Envio (Proposta-Follow Up))": e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location & Details Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Localização e Origem</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cidade</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Cidade"]}
                          onChange={(e) => setFormData({...formData, "Cidade": e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Como conheceu</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Como conheceu?"]}
                          onChange={(e) => setFormData({...formData, "Como conheceu?": e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Endereço Completo</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                        value={formData["Endereço"]}
                        onChange={(e) => setFormData({...formData, "Endereço": e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Observations Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Observações</h4>
                    <div className="space-y-2">
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none"
                        placeholder="Adicione observações importantes sobre este lead..."
                        value={formData["Observações"]}
                        onChange={(e) => setFormData({...formData, "Observações": e.target.value})}
                      />
                    </div>
                  </div>

                  {/* System Info (Read Only) */}
                  <div className="grid grid-cols-2 gap-4 pt-4 opacity-60">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prazo de Resposta</p>
                      <p className="text-xs font-bold text-slate-600">2 dias úteis</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Última Atividade</p>
                      <p className="text-xs font-bold text-slate-600">
                        {formData["Ultimo contato (Lead)"] ? new Date(formData["Ultimo contato (Lead)"]).toLocaleDateString() : "Sem registro"}
                      </p>
                    </div>
                  </div>
                </div>
                
                    <div className="pt-8 flex flex-col gap-3 sticky bottom-0 bg-white pb-4">
                      <button 
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                      >
                        {isCreateModalOpen ? "Criar Lead" : "Salvar Alterações"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Duplicate Detection Modal */}
      <AnimatePresence>
        {isDuplicateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDuplicateModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Copy size={20} className="text-blue-600" />
                    Leads Duplicados Detectados
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {duplicatesFound.length} grupos de duplicados encontrados
                  </p>
                </div>
                <button 
                  onClick={() => setIsDuplicateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {duplicatesFound.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Nenhum duplicado encontrado</h4>
                      <p className="text-sm text-slate-500">Sua base de dados está limpa!</p>
                    </div>
                  </div>
                ) : (
                  duplicatesFound.map((group: any[], idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                            {group[0].initials}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{group[0].company}</p>
                            <p className="text-xs font-mono text-slate-500">{group[0].phone}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            // Keep the first one (usually the oldest or newest depending on sort, but we'll keep the first in array)
                            // and delete the others
                            const idsToDelete = group.slice(1).map((l: any) => l.id);
                            deleteDuplicates(idsToDelete);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                        >
                          <Trash2 size={14} />
                          Limpar {group.length - 1} duplicados
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {group.map((lead: any, lIdx: number) => (
                          <div key={lead.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "size-2 rounded-full",
                                lIdx === 0 ? "bg-emerald-500" : "bg-slate-300"
                              )}></span>
                              <span className="font-bold text-slate-700">{lead.stage}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">{lead.salesperson}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              ID: {lead.id.substring(0, 8)}...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {duplicatesFound.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button 
                    onClick={() => {
                      const allIdsToDelete = duplicatesFound.flatMap(group => group.slice(1).map((l: any) => l.id));
                      deleteDuplicates(allIdsToDelete);
                    }}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Excluir TODOS os duplicados ({duplicatesFound.reduce((acc: number, g: any[]) => acc + g.length - 1, 0)})
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
