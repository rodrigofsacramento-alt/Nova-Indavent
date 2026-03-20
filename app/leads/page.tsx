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
  CheckCircle2,
  Loader2,
  FileUp,
  Fingerprint,
  Calculator
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
    product: 'Perfis de Drywall',
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
const PRODUCTS = ['Perfis de Drywall', 'Exaustor Eólico'];

const DRYWALL_PRICE_TABLE = [
  { id: 1, name: 'TAB20G70 - GUIA 70', price: 10.97 },
  { id: 2, name: 'TAB20M70 - MONTANTE 70', price: 13.25 },
  { id: 3, name: 'TAB20G48 - GUIA 48', price: 9.45 },
  { id: 4, name: 'TAB20M48 - MONTANTE 48', price: 11.80 },
  { id: 5, name: 'TAB20T - TABICA', price: 8.90 },
  { id: 6, name: 'TAB20C - CANALETA C', price: 10.20 },
  { id: 7, name: 'TAB20CN - CANTONEIRA 25x30', price: 7.50 },
];

const EXAUSTOR_PRICE_TABLE = [
  { id: 101, name: 'Exaustor Residencial Cliente - Montado', price: 300.00 },
  { id: 102, name: 'Exaustor Residencial Cliente - Desmontado', price: 280.00 },
  { id: 103, name: 'Exaustor Residencial Cliente - Desmontado/embalado', price: 350.00 },
  { id: 104, name: 'Exaustor Residencial Cliente Final - Montado', price: 350.00 },
  { id: 105, name: 'Exaustor Residencial Cliente Final - Desmontado', price: 330.00 },
  { id: 106, name: 'Exaustor Residencial Cliente Final - Desmontado/embalado', price: 400.00 },
  { id: 107, name: 'Exaustor Industrial Cliente - Montado', price: 280.00 },
  { id: 108, name: 'Exaustor Industrial Cliente - Desmontado', price: 265.00 },
  { id: 109, name: 'Exaustor Industrial Cliente - Desmontado/embalado', price: 300.00 },
  { id: 110, name: 'Exaustor Industrial Cliente Final - Montado', price: 330.00 },
  { id: 111, name: 'Exaustor Industrial Cliente Final - Desmontado', price: 310.00 },
  { id: 112, name: 'Exaustor Industrial Cliente Final - Desmontado/embalado', price: 350.00 },
];

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [leadToDelete, setLeadToDelete] = React.useState<string | null>(null);
  const [duplicatesFound, setDuplicatesFound] = React.useState<any[]>([]);
  const [selectedLead, setSelectedLead] = React.useState<any>(null);
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Budget Generator States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = React.useState(false);
  const [proposalItems, setProposalItems] = React.useState<any[]>([]);
  const [freightCost, setFreightCost] = React.useState(0);
  const [proposalNotes, setProposalNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('CHEQUE 30/60/90');
  const [deliveryDeadline, setDeliveryDeadline] = React.useState('15 dias');
  const [validityDate, setValidityDate] = React.useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [isFinalProposalOpen, setIsFinalProposalOpen] = React.useState(false);
  const [lastGeneratedProposal, setLastGeneratedProposal] = React.useState<any>(null);
  
  // Filter states
  const [stageFilter, setStageFilter] = React.useState('Todos os Estágios');
  const [salespersonFilter, setSalespersonFilter] = React.useState('Todos os Vendedores');
  const [productFilter, setProductFilter] = React.useState('Todos os Produtos');
  const [cityFilter, setCityFilter] = React.useState('Todas as Cidades');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  // Form states
  const [formData, setFormData] = React.useState<any>({
    "Nome": "",
    "Estágio": "Cadastrado",
    "Data de Envio (Proposta-Follow Up))": "",
    "Endereço": "",
    "Vendedor": "",
    "Responsável da Empresa": "",
    "Origem do Lead": "",
    "Cidade": "",
    "Telefone": "",
    "Tipo": "",
    "Produto": "Perfis de Drywall",
    "Orçamento": 0,
    "Ultimo contato (Lead)": new Date().toISOString(),
    "Observações": "",
    "Proposta": "",
    "proposals": []
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

  const [isSaving, setIsSaving] = React.useState(false);
  const [dbColumns, setDbColumns] = React.useState<string[]>([]);
  const [orcamentoColumns, setOrcamentoColumns] = React.useState<string[]>([]);
  const [propostaColumns, setPropostaColumns] = React.useState<string[]>([]);

  // Helper to map UI form data to DB columns
  const mapFormDataToDb = (data: any): any => {
    console.log('Mapping form data to DB. Current formData:', data);
    console.log('Detected DB columns:', dbColumns);

    // Comprehensive map of all possible column names we've seen or might use
    const fullMap: any = {
      "Nome": data["Nome"],
      "name": data["Nome"],
      "nome": data["Nome"],
      "Estágio": data["Estágio"],
      "stage": data["Estágio"],
      "estagio": data["Estágio"],
      "Data de Envio (Proposta-Follow Up))": data["Data de Envio (Proposta-Follow Up))"] || null,
      "proposal_sent_at": data["Data de Envio (Proposta-Follow Up))"] || null,
      "data_envio": data["Data de Envio (Proposta-Follow Up))"] || null,
      "Endereço": data["Endereço"],
      "address": data["Endereço"],
      "endereco": data["Endereço"],
      "Vendedor": data["Vendedor"] || data["salesperson_name"],
      "salesperson_name": data["Vendedor"] || data["salesperson_name"],
      "vendedor": data["Vendedor"] || data["salesperson_name"],
      "Vendedor.": data["Vendedor"] || data["salesperson_name"],
      "salesperson_id": data["salesperson_id"] || null,
      "Responsável da Empresa": data["Responsável da Empresa"],
      "company_responsible": data["Responsável da Empresa"],
      "Como conheceu?": data["Origem do Lead"],
      "source_details": data["Origem do Lead"],
      "source": data["Origem do Lead"],
      "origem": data["Origem do Lead"],
      "Cidade": data["Cidade"],
      "city": data["Cidade"],
      "cidade": data["Cidade"],
      "Telefone": data["Telefone"],
      "phone": data["Telefone"],
      "telefone": data["Telefone"],
      "Phone": data["Telefone"],
      "Tipo": data["Tipo"],
      "lead_type": data["Tipo"],
      "type": data["Tipo"],
      "tipo": data["Tipo"],
      "Produto": data["Produto"],
      "product": data["Produto"],
      "produto": data["Produto"],
      "Orçamento": Number(data["Orçamento"]) || 0,
      "budget": Number(data["Orçamento"]) || 0,
      "orcamento": Number(data["Orçamento"]) || 0,
      "Ultimo contato (Lead)": data["Ultimo contato (Lead)"] || null,
      "last_contact": data["Ultimo contato (Lead)"] || null,
      "ultimo_contato": data["Ultimo contato (Lead)"] || null,
      "Observações": data["Observações"],
      "observations": data["Observações"],
      "observacoes": data["Observações"],
      "Proposta": data["Proposta"],
      "proposal": data["Proposta"],
      "proposta": data["Proposta"],
      "proposals": data["proposals"] || [],
      "total_sold_value": (data["proposals"] || []).filter((p: any) => p.status === 'ganho').reduce((acc: number, curr: any) => acc + Number(curr.value), 0),
      "total_proposed_value": (data["proposals"] || []).filter((p: any) => p.status === 'pendente').reduce((acc: number, curr: any) => acc + Number(curr.value), 0),
      "CNPJ": data["CNPJ"],
      "cnpj": data["CNPJ"],
      "Email": data["Email"],
      "email": data["Email"],
      "CEP": data["CEP"],
      "cep": data["CEP"]
    };

    // If we have detected columns from the DB, only send those that exist
    if (dbColumns.length > 0) {
      const filtered: any = {};
      dbColumns.forEach(col => {
        if (fullMap[col] !== undefined) {
          filtered[col] = fullMap[col];
        }
      });
      
      // Ensure ID and system timestamps are never in the update/insert payload
      delete filtered.id;
      delete filtered.created_at;
      delete filtered.updated_at;
      delete filtered["Created time"];
      delete filtered["ultima atualização"];
      
      console.log('Filtered data to send to DB:', filtered);
      return filtered;
    }

    // Fallback: return a reasonably safe subset if columns aren't known yet
    return {
      "Nome": data["Nome"],
      "Estágio": data["Estágio"],
      "Telefone": data["Telefone"],
      "Produto": data["Produto"],
      "Vendedor": data["Vendedor"],
      "Orçamento": Number(data["Orçamento"]) || 0,
      "Observações": data["Observações"],
      "Como conheceu?": data["Origem do Lead"],
      "Cidade": data["Cidade"],
      "Endereço": data["Endereço"],
      "Data de Envio (Proposta-Follow Up))": data["Data de Envio (Proposta-Follow Up))"] || null,
      "Proposta": data["Proposta"]
    };
  };

  const cities = React.useMemo(() => {
    const allCities = leads.map(l => l.city).filter(Boolean);
    return ['Todas as Cidades', ...Array.from(new Set(allCities))];
  }, [leads]);

  const logActivity = async (leadId: string, type: string, description: string) => {
    if (!supabase || !user) return;
    try {
      await supabase.from('activities').insert({
        lead_id: leadId,
        user_id: user.id,
        type,
        description,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const fetchAttachments = async (leadId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('lead_attachments')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === '42P01') {
          console.warn('Tabela lead_attachments não encontrada. Certifique-se de executar o SQL de migração.');
          return;
        }
        throw error;
      }
      if (data) setAttachments(data);
    } catch (err: any) {
      console.error('Error fetching attachments:', err.message || err);
    }
  };

  const fetchLeads = React.useCallback(async () => {
    if (!supabase || !user) {
      // if (!authLoading && !user) router.push('/');
      console.warn('Supabase is not configured or user not logged in');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      // Fetch salespeople for the filter and form
      const { data: usersData } = await supabase
        .from('internal_users')
        .select('id, name, role');
      
      if (usersData) {
        setSalespeople(usersData);
      }

      let query = supabase.from('leads').select('*');
      
      if (!isAdmin && profile) {
        // Tenta filtrar por ID ou por nome (Vendedor), incluindo nomes legados
        const filter = [`salesperson_id.eq.${profile.id}`, `Vendedor.eq."${profile.name}"`];
        if (profile.name === 'Jonathan') filter.push('Vendedor.eq."Vendas"');
        if (profile.name === 'Isabele') filter.push('Vendedor.eq."Administrador principal Indavent Exaustores"');
        query = query.or(filter.join(','));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads from Supabase:', error);
        throw error;
      }

      if (data) {
        console.log(`Fetched ${data.length} leads from Supabase`);
        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          console.log('Detected DB columns:', keys);
          setDbColumns(keys);
        }
        
        const formattedLeads = data.map(item => {
          // Priority Formula
          let priorityStatus = '';
          const proposalSentAt = item["Data de Envio (Proposta-Follow Up))"] || item["proposal_sent_at"] || item["data_envio"];
          const currentStage = item["Estágio"] || item["stage"] || item["estagio"] || 'Cadastrado';
          const deadlineDays = item["Prazo de Resposta"] || item["prazo_resposta"] || 2;

          // Rule: If today is more than 2 days after the proposal date, show alarm
          if (proposalSentAt && !['Cliente', 'Perdido'].includes(currentStage)) {
            const proposalDate = new Date(proposalSentAt);
            const today = new Date();
            
            // Calculate difference in days
            const diffTime = Math.abs(today.getTime() - proposalDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 2) {
              priorityStatus = '🚨Entrar em contato';
            } else {
              priorityStatus = '⌛Aguardando Retorno';
            }
          }

          // Salesperson Mapping
          let mappedSalesperson = 'Jonathan';
          const salespersonName = item["salesperson_name"] || item["Vendedor"] || item["vendedor"] || item["Vendedor."];
          if (salespersonName === 'Administrador principal Indavent Exaustores') {
            mappedSalesperson = 'Isabele';
          } else if (salespersonName === 'Vendas') {
            mappedSalesperson = 'Jonathan';
          } else if (salespersonName) {
            mappedSalesperson = salespersonName;
          }
          
          if (mappedSalesperson === 'Jaquelina') mappedSalesperson = 'Jaqueline';

          const phoneValue = item["Telefone"] || item["telefone"] || item["Phone"] || item["phone"];

          return {
            ...item,
            id: item.id,
            company: item["Nome"] || item["name"] || item["nome"] || "Sem Nome",
            initials: (item["Nome"] || item["name"] || item["nome"] || "??").split(' ').map((n: string) => n[0]).join('').substring(0, 2),
            address: item["Endereço"] || item["address"] || item["endereco"] || 'Endereço não informado',
            city: item["Cidade"] || item["city"] || item["cidade"],
            tags: (item["Tipo"] || item["type"] || item["tipo"]) ? [item["Tipo"] || item["type"] || item["tipo"]] : [],
            source: item["Como conheceu?"] || item["source_details"] || item["source"] || item["origem"] || 'WhatsApp',
            stage: item["Estágio"] || item["stage"] || item["estagio"] || 'Cadastrado',
            salesperson: mappedSalesperson,
            salespersonInitials: mappedSalesperson[0],
            product: item["Produto"] || item["product"] || item["produto"] || 'Perfis de Drywall',
            budget: (item["Orçamento"] || item["budget"] || item["orcamento"]) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item["Orçamento"] || item["budget"] || item["orcamento"])) : 'R$ 0,00',
            budgetValue: Number(item["Orçamento"] || item["budget"] || item["orcamento"]) || 0,
            deliveryDeadline: item["Prazo de Entrega"] || item["delivery_deadline"] || item["prazo_entrega"] || 'N/A',
            proposalDate: proposalSentAt ? new Date(proposalSentAt).toLocaleDateString('pt-BR') : 'N/A',
            deadline: `${deadlineDays} dias`,
            followUp: priorityStatus,
            phone: phoneValue,
            cnpj: item["CNPJ"] || item["cnpj"] || "20.965.105/0001-92",
            email: item["Email"] || item["email"] || "",
            cep: item["CEP"] || item["cep"] || "",
            hasDocs: !!(item["Proposta"] || item["proposal"] || item["proposta"]),
            proposalLink: item["Proposta"] || item["proposal"] || item["proposta"],
            proposals: item["proposals"] || [],
            totalSoldValue: item["total_sold_value"] || 0,
            totalProposedValue: item["total_proposed_value"] || 0,
            "Observações": item["Observações"] || item["observations"] || item["observacoes"] || "",
            color: (item["Estágio"] || item["stage"] || item["estagio"]) === 'Cliente' ? 'emerald' : (item["Estágio"] || item["stage"] || item["estagio"]) === 'Perdido' ? 'rose' : 'blue',
            priorityValue: priorityStatus === '🚨Entrar em contato' ? 1 : 2,
            updatedAt: item.updated_at || item.created_at
          };
        });

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
  }, [user, profile, isAdmin, authLoading, router]);

  React.useEffect(() => {
    fetchLeads();
    setMounted(true);
  }, [fetchLeads]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || isSaving) return;
    setIsSaving(true);
    try {
      const currentFormData = { ...formData };
      
      // Auto-assign salesperson if not admin
      if (!isAdmin && profile) {
        // Only assign salesperson_id if the user exists in the salespeople list
        const isSalesperson = salespeople.some(s => s.id === user.id);
        if (isSalesperson) {
          currentFormData.salesperson_id = user.id;
        }
        currentFormData["Vendedor"] = profile.name || user.username;
      } else if (isAdmin && currentFormData["Vendedor"]) {
        // Find the ID of the selected salesperson for admins
        const selectedSalesperson = salespeople.find(s => s.name === currentFormData["Vendedor"]);
        if (selectedSalesperson) {
          currentFormData.salesperson_id = selectedSalesperson.id;
        }
      }
      
      const dbData = mapFormDataToDb(currentFormData);
      
      const { data, error } = await supabase
        .from('leads')
        .insert([dbData])
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      if (data && data[0]) {
        await logActivity(data[0].id, 'Update', `Novo lead cadastrado: ${currentFormData["Nome"]}`);
      }
      
      setIsCreateModalOpen(false);
      setFormData({
        "Nome": "",
        "Estágio": "Cadastrado",
        "Data de Envio (Proposta-Follow Up))": "",
        "Endereço": "",
        "Vendedor": profile?.name || "",
        "Responsável da Empresa": "",
        "Como conheceu?": "",
        "Cidade": "",
        "Telefone": "",
        "Tipo": "",
        "Produto": "Perfis de Drywall",
        "Orçamento": 0,
        "Ultimo contato (Lead)": new Date().toISOString(),
        "Observações": "",
        "CNPJ": "",
        "Email": "",
        "CEP": ""
      });
      
      setIsSaving(false); // Reset saving state before refetching
      await fetchLeads();
    } catch (err: any) {
      console.error('Error creating lead:', err.message || err);
      alert(`Erro ao criar lead: ${err.message || 'Verifique os dados e tente novamente.'}`);
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !selectedLead || isSaving) return;
    setIsSaving(true);
    try {
      // Check if we should trigger proposal generator
      const isDrywall = formData["Produto"] === "Perfis de Drywall";
      const isProposalRequested = formData["Estágio"] === "Proposta Solicitada";
      const wasNotProposalRequested = selectedLead.stage !== "Proposta Solicitada";

      const currentFormData = { ...formData };
      
      // If admin changed the salesperson, we should try to update salesperson_id too
      if (isAdmin && formData["Vendedor"]) {
        const selectedSalesperson = salespeople.find(s => s.name === formData["Vendedor"]);
        if (selectedSalesperson) {
          currentFormData.salesperson_id = selectedSalesperson.id;
        }
      } else if (!isAdmin && profile) {
        // Ensure current user is a valid salesperson before assigning ID
        const isSalesperson = salespeople.some(s => s.id === user.id);
        if (isSalesperson) {
          currentFormData.salesperson_id = user.id;
        }
      }

      const dbData = mapFormDataToDb(currentFormData);
      
      const { error } = await supabase
        .from('leads')
        .update(dbData)
        .eq('id', selectedLead.id);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Log activity
      if (selectedLead.stage !== formData["Estágio"]) {
        await logActivity(selectedLead.id, 'Update', `Estágio alterado para: ${formData["Estágio"]}`);
      } else {
        await logActivity(selectedLead.id, 'Update', `Dados do lead atualizados`);
      }

      // Trigger budget generator if conditions met
      const isExaustor = formData["Produto"] === "Exaustor Eólico";
      // Trigger if stage is "Proposta Solicitada", regardless of previous stage
      const shouldOpenBudget = (isDrywall || isExaustor) && isProposalRequested;
      
      if (shouldOpenBudget) {
        setIsBudgetModalOpen(true);
        // Initialize with default items if none exist or if it's a new request
        if (isDrywall) {
          setProposalItems([{ ...DRYWALL_PRICE_TABLE[0], quantity: 10 }]);
          setProposalNotes(`Proposta para fornecimento de perfis de drywall conforme solicitado por ${formData["Nome"]}.\n\n- ENTREGA A COMBINAR\n- EMITIR NOTA FISCAL: NÃO`);
        } else {
          setProposalItems([{ ...EXAUSTOR_PRICE_TABLE[0], quantity: 1 }]);
          setProposalNotes(`Proposta para fornecimento de exaustores eólicos conforme solicitado por ${formData["Nome"]}.\n\n- ENTREGA A COMBINAR\n- EMITIR NOTA FISCAL: NÃO`);
        }
        setFreightCost(0);
        setPaymentMethod('CHEQUE 30/60/90');
        setDeliveryDeadline('15 dias');
        setValidityDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      }
      
      // Update selectedLead state with the new data so saveGeneratedProposal has access to it
      if (selectedLead) {
        const updatedLead = {
          ...selectedLead,
          company: formData["Nome"],
          stage: formData["Estágio"],
          address: formData["Endereço"],
          phone: formData["Telefone"],
          product: formData["Produto"],
          budgetValue: Number(formData["Orçamento"]),
          cnpj: formData["CNPJ"],
          email: formData["Email"],
          cep: formData["CEP"],
          "Responsável da Empresa": formData["Responsável da Empresa"]
        };
        setSelectedLead(updatedLead);
      }

      setIsEditModalOpen(false);
      setIsEditing(false);
      
      // ONLY clear selectedLead if we are NOT opening the budget modal
      if (!shouldOpenBudget) {
        setSelectedLead(null);
      }
      
      setIsSaving(false); // Reset saving state before refetching to avoid UI hang
      
      await fetchLeads();
    } catch (err: any) {
      console.error('Error updating lead:', err.message || err);
      alert(`Erro ao atualizar lead: ${err.message || 'Verifique os dados e tente novamente.'}`);
      setIsSaving(false); // Ensure it's reset on error too
    } finally {
      // The finally block will catch anything else
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string = 'manual') => {
    const file = e.target.files?.[0];
    if (!file || !selectedLead || !supabase) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedLead.id}/${Date.now()}.${fileExt}`;
      const filePath = `proposals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('leads')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        if (uploadError.message?.toLowerCase().includes('bucket not found') || (uploadError as any).error === 'Bucket not found') {
          throw new Error('O bucket "leads" não foi encontrado no Supabase Storage. Por favor, crie um bucket PÚBLICO chamado "leads" no painel do Supabase.');
        }
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('leads')
        .getPublicUrl(filePath);

      // 3. Save to lead_attachments table
      const { error: dbError } = await supabase
        .from('lead_attachments')
        .insert({
          lead_id: selectedLead.id,
          name: file.name,
          file_url: publicUrl,
          file_type: type
        });

      if (dbError) throw dbError;

      // 4. Refresh attachments
      fetchAttachments(selectedLead.id);
      await logActivity(selectedLead.id, 'Update', `${type === 'orcamento' ? 'Orçamento' : 'Arquivo'} anexado: ${file.name}`);
      alert('Arquivo enviado com sucesso!');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      alert(`Erro ao fazer upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, fileName: string) => {
    if (!supabase || !confirm(`Tem certeza que deseja excluir o anexo "${fileName}"?`)) return;

    try {
      const { error } = await supabase
        .from('lead_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      await logActivity(selectedLead.id, 'Update', `Arquivo removido: ${fileName}`);
    } catch (err: any) {
      console.error('Error deleting attachment:', err);
      alert(`Erro ao excluir anexo: ${err.message}`);
    }
  };

  const handleDeleteLead = async (id: string) => {
    setLeadToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteLead = async () => {
    if (!supabase || !leadToDelete) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete);
      
      if (error) throw error;
      
      // Log activity for lead deletion
      await logActivity(leadToDelete, 'Delete', `Lead excluído`);
      
      setLeads(prev => prev.filter(l => l.id !== leadToDelete));
      setIsEditModalOpen(false);
      setSelectedLead(null);
      setIsDeleteConfirmOpen(false);
      setLeadToDelete(null);
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      alert(`Erro ao excluir lead: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (lead: any) => {
    setSelectedLead(lead);
    setAttachments([]); // Clear previous attachments
    fetchAttachments(lead.id);
    setFormData({
      "Nome": lead.company || "",
      "Estágio": lead.stage || "Cadastrado",
      "Data de Envio (Proposta-Follow Up))": lead["Data de Envio (Proposta-Follow Up))"] || lead["proposal_sent_at"] || lead["data_envio"] || "",
      "Endereço": lead.address || "",
      "Vendedor": lead.salesperson || "Jonathan",
      "Responsável da Empresa": lead["Responsável da Empresa"] || lead["company_responsible"] || "",
      "Origem do Lead": lead.source || "",
      "Cidade": lead.city || "",
      "Telefone": lead.phone || "",
      "Tipo": lead.tags?.[0] || "",
      "Produto": lead.product || "Perfis de Drywall",
      "Orçamento": lead.budgetValue || 0,
      "Ultimo contato (Lead)": lead["Ultimo contato (Lead)"] || lead["last_contact"] || lead["ultimo_contato"] || new Date().toISOString(),
      "Observações": lead["Observações"] || "",
      "Proposta": lead.proposalLink || "",
      "proposals": lead.proposals || [],
      "CNPJ": lead.cnpj || "",
      "Email": lead.email || "",
      "CEP": lead.cep || ""
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

  const proposalsData = React.useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, i) => {
      const filteredLeads = leads.filter(l => {
        const date = new Date(l.updatedAt || l.created_at);
        // Consider leads that are in "Proposta Solicitada" or beyond
        const hasRequestedProposal = ['Proposta Solicitada', 'Fechamento', 'Cliente'].includes(l.stage);
        return date.getMonth() === i && hasRequestedProposal;
      });

      return {
        month,
        count: filteredLeads.length,
        value: filteredLeads.reduce((acc, curr) => acc + (curr.budgetValue || 0), 0)
      };
    });
  }, [leads]);

  const generateProposalHtml = (data: any, lead: any) => {
    const totalItems = data.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const total = totalItems + Number(data.freight);

    const itemsHtml = data.items.map((item: any) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px;">${item.quantity}</td>
        <td style="padding: 8px; font-weight: bold; text-transform: uppercase;">${item.name}</td>
        <td style="padding: 8px; color: #64748b; font-style: italic;">${lead.product === 'Exaustor Eólico' ? 'Exaustor Eólico' : 'Material para Drywall'}</td>
        <td style="padding: 8px; text-align: right;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(item.price)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const freightHtml = data.freight > 0 ? `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px;">1</td>
        <td style="padding: 8px; font-weight: bold; text-transform: uppercase;">FRETE / ENTREGA</td>
        <td style="padding: 8px; color: #64748b; font-style: italic;">Serviço de entrega</td>
        <td style="padding: 8px; text-align: right;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(data.freight)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(data.freight)}</td>
      </tr>
    ` : '';

    return `
      <div style="font-family: sans-serif; color: black; max-width: 210mm; margin: auto; padding: 15mm; background: white;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 16px; margin-bottom: 24px;">
          <div style="display: flex; gap: 16px;">
            <div style="width: 120px; height: 80px; display: flex; align-items: center; justify-content: center;">
              <img src="/5p_.jpg" alt="Nova Indavent" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>
            <div style="font-size: 10px; line-height: 1.2;">
              <h1 style="font-size: 14px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">INDAVENT EXAUSTORES</h1>
              <p style="margin: 0;">Rua Doutor Jalma Jurado, 311 - Jardim</p>
              <p style="margin: 0;">Eldorado - Indaiatuba - SP</p>
              <p style="margin: 0;">- CEP: 13343-804</p>
              <p style="margin: 8px 0 0 0;">F. MARINS MAN E COM DE</p>
              <p style="margin: 0;">EXAUSTORES EÓLICOS LTDA</p>
              <p style="margin: 0;">CNPJ: 36.730.655/0001-62 IE: 353410888118</p>
            </div>
          </div>
          <div style="text-align: right; font-size: 10px; line-height: 1.2;">
            <p style="font-size: 14px; font-weight: bold; margin: 0;">(19) 3392-0937</p>
            <p style="margin: 4px 0 0 0;">vendas2@novaindavent.com.br</p>
          </div>
        </div>

        <div style="display: flex; gap: 16px; margin-bottom: 24px;">
          <div style="flex: 1; border: 1px solid black; padding: 12px; font-size: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <p style="font-weight: bold; text-transform: uppercase; margin: 0;">${lead.company || '{NOME_CLIENTE}'}</p>
                <p style="margin: 4px 0 0 0;">CNPJ: ${lead.cnpj || '{CNPJ}'}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-weight: bold; margin: 0;">${lead.phone || '{TELEFONE}'}</p>
                <p style="margin: 4px 0 0 0; text-transform: lowercase;">${lead.email || '{EMAIL}'}</p>
              </div>
            </div>
            <p style="margin: 8px 0 0 0; text-transform: uppercase;">${lead.address || '{ENDERECO}'} - ${lead.city || '{CIDADE}'} - SP - CEP: ${lead.cep || '{CEP}'}</p>
          </div>
          <div style="width: 120px; border: 1px solid black; padding: 12px; text-align: center;">
            <p style="font-size: 8px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Validade da proposta</p>
            <p style="font-size: 12px; font-weight: bold; margin: 0;">${new Date(data.validityDate).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-top: 1px solid black; border-bottom: 1px solid black;">
              <th style="padding: 4px 8px; text-align: left; width: 48px;">Qt.</th>
              <th style="padding: 4px 8px; text-align: left;">Produto/Serviço</th>
              <th style="padding: 4px 8px; text-align: left;">Detalhe do Item</th>
              <th style="padding: 4px 8px; text-align: right; width: 96px;">Valor unitário</th>
              <th style="padding: 4px 8px; text-align: right; width: 96px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            ${freightHtml}
          </tbody>
          <tfoot>
            <tr style="border-top: 1px solid black;">
              <td colspan="4" style="padding: 4px 8px; text-align: right; font-weight: bold; text-transform: uppercase;">Total</td>
              <td style="padding: 4px 8px; text-align: right; font-weight: bold; text-decoration: underline;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding: 4px 8px; text-align: right; font-weight: bold; text-transform: uppercase;">Valor líquido</td>
              <td style="padding: 4px 8px; text-align: right; font-weight: bold; text-decoration: underline;">${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="font-size: 10px;">
          <div style="margin-bottom: 12px;">
            <p style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid black; padding-bottom: 4px; margin: 0 0 8px 0;">Forma de pagamento:</p>
            <p style="margin: 0;">- ${data.paymentMethod}</p>
          </div>
          <div style="margin-bottom: 24px;">
            <p style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid black; padding-bottom: 4px; margin: 0 0 8px 0;">Prazo de entrega:</p>
            <p style="margin: 0;">- ${data.deliveryDeadline}</p>
          </div>
          <div>
            <p style="font-weight: bold; text-transform: uppercase; border-bottom: 1px solid black; padding-bottom: 4px; margin: 0 0 8px 0;">Observações:</p>
            <div style="white-space: pre-wrap; margin: 0;">${data.notes || "- ENTREGA A COMBINAR\\n- EMITIR NOTA FISCAL: NÃO"}</div>
          </div>
        </div>

        <div style="margin-top: 80px; display: flex; justify-content: center;">
          <div style="width: 256px; border-top: 1px solid black; padding-top: 8px; text-align: center; font-size: 8px; font-weight: bold; text-transform: uppercase;">Assinatura do Responsável</div>
        </div>
      </div>
    `;
  };

  const saveGeneratedProposal = async () => {
    if (!supabase) {
      alert('O Supabase não está configurado. Verifique as variáveis de ambiente.');
      return;
    }
    if (!selectedLead) {
      alert('Nenhum lead selecionado.');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Saving proposal for lead:', selectedLead.id);

      // Validation - Use formData if available as it's the most recent
      const cnpj = formData["CNPJ"] || selectedLead.cnpj;
      const address = formData["Endereço"] || selectedLead.address;
      const cep = formData["CEP"] || selectedLead.cep;
      const company = formData["Nome"] || selectedLead.company;
      const city = formData["Cidade"] || selectedLead.city;
      const phone = formData["Telefone"] || selectedLead.phone;
      const email = formData["Email"] || selectedLead.email;
      const responsible = formData["Responsável da Empresa"] || selectedLead["Responsável da Empresa"];

      if (!cnpj || cnpj.trim() === '') {
        alert('O CNPJ é obrigatório para gerar o orçamento.');
        setIsSaving(false);
        return;
      }
      if (!address || address.trim() === '' || address === 'Endereço não informado') {
        alert('O endereço completo é obrigatório para gerar o orçamento.');
        setIsSaving(false);
        return;
      }
      if (!cep || cep.trim() === '') {
        alert('O CEP é obrigatório para gerar o orçamento.');
        setIsSaving(false);
        return;
      }
      if (!paymentMethod) {
        alert('A forma de pagamento é obrigatória.');
        setIsSaving(false);
        return;
      }
      if (!deliveryDeadline) {
        alert('O prazo de entrega é obrigatório.');
        setIsSaving(false);
        return;
      }
      
      const totalItems = proposalItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const totalProposal = totalItems + Number(freightCost);
      
      if (isNaN(totalProposal)) {
        alert('O valor total do orçamento é inválido. Verifique os preços e o frete.');
        setIsSaving(false);
        return;
      }
      
      const proposalData = {
        items: proposalItems,
        freight: freightCost,
        notes: proposalNotes,
        paymentMethod,
        deliveryDeadline,
        validityDate,
        total: totalProposal,
        generatedAt: new Date().toISOString(),
        client: {
          name: company,
          address: address,
          city: city,
          phone: phone,
          responsible: responsible,
          cnpj: cnpj,
          cep: cep,
          email: email
        }
      };

      // 1. Save to orcamentos table
      console.log('Inserting into orcamentos table...');

      const orcamentoPayload: any = {
        lead_id: selectedLead.id,
        client_data: proposalData.client,
        items: proposalItems,
        freight_cost: freightCost,
        total_value: totalProposal,
        notes: proposalNotes,
        status: 'Gerado',
        payment_method: paymentMethod,
        delivery_deadline: deliveryDeadline,
        validity_date: validityDate
      };

      const { data: orcamento, error: orcamentoError } = await supabase
        .from('orcamentos')
        .insert(orcamentoPayload)
        .select()
        .single();

      if (orcamentoError) {
        console.error('Error in orcamentos table:', orcamentoError);
        throw new Error(`Erro ao salvar orçamento: ${orcamentoError.message}`);
      }

      console.log('Orcamento saved:', orcamento.id);

      // Log activity for budget generation
      await logActivity(selectedLead.id, 'Budget', `Orçamento gerado no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProposal)}`);

      // 2. Generate HTML
      const proposalHtml = generateProposalHtml(proposalData, selectedLead);

      // 3. Save to propostas table
      console.log('Inserting into propostas table...');
      const { data: proposta, error: propostaError } = await supabase
        .from('propostas')
        .insert({
          lead_id: selectedLead.id,
          orcamento_id: orcamento.id,
          html_content: proposalHtml,
          status: 'Enviada'
        })
        .select()
        .single();

      if (propostaError) {
        console.error('Error in propostas table:', propostaError);
        throw new Error(`Erro ao salvar proposta: ${propostaError.message}`);
      }

      // 4. Update leads table
      console.log('Updating leads table...');
      const proposalString = `${selectedLead.product === 'Exaustor Eólico' ? 'ORÇAMENTO EXAUSTOR' : 'ORÇAMENTO DRYWALL'} - Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProposal)}\n\n` +
        proposalItems.map(i => `- ${i.name}: ${i.quantity} un x ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.price)} = ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.price * i.quantity)}`).join('\n') +
        `\n\nFrete: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freightCost)}` +
        `\nPagamento: ${paymentMethod}` +
        `\nPrazo: ${deliveryDeadline}` +
        `\nValidade: ${new Date(validityDate).toLocaleDateString('pt-BR')}` +
        `\nObservações: ${proposalNotes}`;

      // Filter columns to only update what exists in the DB
      const updatePayload: any = {};
      if (dbColumns.includes('Proposta')) updatePayload["Proposta"] = proposalString;
      if (dbColumns.includes('Orçamento')) updatePayload["Orçamento"] = totalProposal;
      if (dbColumns.includes('proposal')) updatePayload["proposal"] = proposalString;
      if (dbColumns.includes('budget')) updatePayload["budget"] = totalProposal;
      if (dbColumns.includes('orcamento')) updatePayload["orcamento"] = totalProposal;
      if (dbColumns.includes('proposal_details')) updatePayload["proposal_details"] = proposalData;
      if (dbColumns.includes('orcamento_id')) updatePayload["orcamento_id"] = orcamento.id;
      if (dbColumns.includes('proposta_id')) updatePayload["proposta_id"] = proposta.id;
      
      // Update client data in lead table too
      if (dbColumns.includes('CNPJ')) updatePayload["CNPJ"] = cnpj;
      if (dbColumns.includes('cnpj')) updatePayload["cnpj"] = cnpj;
      if (dbColumns.includes('Endereço')) updatePayload["Endereço"] = address;
      if (dbColumns.includes('address')) updatePayload["address"] = address;
      if (dbColumns.includes('CEP')) updatePayload["CEP"] = cep;
      if (dbColumns.includes('cep')) updatePayload["cep"] = cep;

      const { error: leadUpdateError } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', selectedLead.id);

      if (leadUpdateError) {
        console.warn('Lead update warning (non-fatal):', leadUpdateError);
      }

      // Log activity for proposal generation
      await logActivity(selectedLead.id, 'Update', `Proposta gerada para o lead`);

      setLastGeneratedProposal(proposalData);
      
      // Also save to lead_attachments for the new multi-document feature
      if (supabase) {
        await supabase.from('lead_attachments').insert({
          lead_id: selectedLead.id,
          name: `Proposta_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.html`,
          file_url: '#', // For generated HTML we might need a different approach if we want to download it, 
                         // but for now we'll just record that it was generated.
                         // Actually, we could store the ID of the proposal record.
          file_type: 'proposta'
        });
      }

      await logActivity(selectedLead.id, 'Message', `Proposta gerada: R$ ${totalProposal.toLocaleString('pt-BR')}`);
      fetchAttachments(selectedLead.id);
      alert('Orçamento e Proposta salvos com sucesso no banco de dados!');
      setIsBudgetModalOpen(false);
      setIsFinalProposalOpen(true);
      fetchLeads();
    } catch (err: any) {
      console.error('Detailed error saving proposal:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      } else {
        console.error('Error object (stringified):', JSON.stringify(err, null, 2));
      }
      if (err.code) console.error('Error code:', err.code);
      if (err.details) console.error('Error details:', err.details);
      if (err.hint) console.error('Error hint:', err.hint);
      if (err.message) console.error('Error message (direct):', err.message);
      
      alert(`Erro ao salvar: ${err.message || 'Verifique se as tabelas orcamentos e propostas foram criadas no Supabase.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return <div className="flex min-h-screen bg-slate-950" />;

  const filteredLeads = leads.filter(lead => {
    const matchesStage = stageFilter === 'Todos os Estágios' || lead.stage === stageFilter;
    const matchesSalesperson = salespersonFilter === 'Todos os Vendedores' || lead.salesperson === salespersonFilter;
    const matchesProduct = productFilter === 'Todos os Produtos' || lead.product === productFilter;
    const matchesCity = cityFilter === 'Todas as Cidades' || lead.city === cityFilter;
    const matchesSearch = (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (lead.phone && lead.phone.includes(searchTerm));
    
    // Date filtering
    const leadDate = new Date(lead.created_at);
    const matchesStartDate = !startDate || leadDate >= new Date(startDate);
    const matchesEndDate = !endDate || leadDate <= new Date(endDate + 'T23:59:59');
    
    return matchesStage && matchesSalesperson && matchesProduct && matchesCity && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const displayedLeads = showAllLeads ? filteredLeads : filteredLeads.slice(0, 50);

  return (
    <div className="flex min-h-screen bg-white font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden lg:pl-64">
        <TopBar title="Leads" />
        
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto bg-white">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Leads</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Gerencie seu pipeline de vendas e acompanhe o progresso.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={detectDuplicates}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                <Copy size={18} />
                Duplicados
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Plus size={18} />
                Novo Lead
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Data Inicial</label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all shadow-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Data Final</label>
                <input 
                  type="date" 
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all shadow-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
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
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                            className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-slate-400 hover:text-rose-600"
                            title="Excluir Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 group-hover:text-slate-600">
                            <MoreVertical size={18} />
                          </button>
                        </div>
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
                    <Line type="monotone" dataKey="Perfis de Drywall" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Exaustor Eólico" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Proposals Evolution Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Evolução de Propostas</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-indigo-600"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor (R$)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantidade</span>
                  </div>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={proposalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      yAxisId="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickFormatter={(v) => `R$${v/1000}k`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'value') return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Valor Total'];
                        return [value, 'Qtd. Propostas'];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                  </BarChart>
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
                    <>
                      <button 
                        onClick={() => handleDeleteLead(selectedLead.id)}
                        className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-colors border border-transparent hover:border-rose-100"
                        title="Excluir Lead"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Edit3 size={14} />
                        Editar
                      </button>
                    </>
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

                    {/* Segmented Values Row */}
                    {selectedLead?.proposals?.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Vendido</p>
                          <p className="text-sm font-black text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.totalSoldValue)}
                          </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Ainda em Proposta</p>
                          <p className="text-sm font-black text-amber-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLead.totalProposedValue)}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedLead?.proposal_details && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => {
                            setLastGeneratedProposal(selectedLead.proposal_details);
                            setIsFinalProposalOpen(true);
                          }}
                          className="flex items-center justify-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all group"
                        >
                          <FileText size={20} className="group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest">Proposta Gerada</p>
                            <p className="text-sm font-black">Visualizar Proposta</p>
                          </div>
                          <ChevronRight size={16} className="ml-auto" />
                        </button>
                        
                        <button 
                          onClick={() => {
                            // Open budget modal with existing details
                            setProposalItems(selectedLead.proposal_details.items || []);
                            setFreightCost(selectedLead.proposal_details.freight || 0);
                            setProposalNotes(selectedLead.proposal_details.notes || "");
                            setPaymentMethod(selectedLead.proposal_details.paymentMethod || "");
                            setDeliveryDeadline(selectedLead.proposal_details.deliveryDeadline || "");
                            setValidityDate(selectedLead.proposal_details.validityDate || "");
                            setIsBudgetModalOpen(true);
                          }}
                          className="flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all group"
                        >
                          <Calculator size={20} className="group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest">Orçamento</p>
                            <p className="text-sm font-black">Editar Orçamento</p>
                          </div>
                          <ChevronRight size={16} className="ml-auto" />
                        </button>
                      </div>
                    )}

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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                              <Fingerprint size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</p>
                              <p className="text-sm font-bold text-slate-700">{selectedLead?.cnpj || "Não informado"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                              <Mail size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</p>
                              <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{selectedLead?.email || "Não informado"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</p>
                            <p className="text-sm font-bold text-slate-700">{selectedLead?.city || "Não informada"} - {selectedLead?.cep || "CEP não informado"}</p>
                            <p className="text-xs text-slate-500">{selectedLead?.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product & Source & Proposal */}
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

                    {/* Documentos e Propostas */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Documentos e Propostas</h4>
                      {attachments.length > 0 ? (
                        <div className="space-y-2">
                          {attachments.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-200 transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                  <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    {file.file_type === 'proposta' ? 'Proposta' : file.file_type === 'orcamento' ? 'Orçamento' : 'Arquivo'} • {new Date(file.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <a 
                                href={file.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <ChevronRight size={18} />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-slate-400 italic">
                          <FileText size={16} />
                          <p className="text-sm">Nenhuma proposta ou orçamento anexado</p>
                        </div>
                      )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CNPJ</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["CNPJ"] || ""}
                          onChange={(e) => setFormData({...formData, "CNPJ": e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</label>
                        <input 
                          type="email" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["Email"] || ""}
                          onChange={(e) => setFormData({...formData, "Email": e.target.value})}
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
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CEP</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={formData["CEP"] || ""}
                          onChange={(e) => setFormData({...formData, "CEP": e.target.value})}
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

                  {/* Multiple Proposals Section */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Orçamentos e Vendas Segmentadas</h4>
                      <button 
                        type="button"
                        onClick={() => {
                          // Open budget modal instead of just adding a row
                          const isExaustor = formData["Produto"] === "Exaustor Eólico";
                          const isDrywall = formData["Produto"] === "Perfis de Drywall";
                          
                          if (isDrywall) {
                            setProposalItems([{ ...DRYWALL_PRICE_TABLE[0], quantity: 10 }]);
                            setProposalNotes(`Proposta para fornecimento de perfis de drywall conforme solicitado por ${formData["Nome"]}.`);
                          } else if (isExaustor) {
                            setProposalItems([{ ...EXAUSTOR_PRICE_TABLE[0], quantity: 1 }]);
                            setProposalNotes(`Proposta para fornecimento de exaustores eólicos conforme solicitado por ${formData["Nome"]}.`);
                          } else {
                            setProposalItems([]);
                            setProposalNotes("");
                          }
                          
                          setFreightCost(0);
                          setPaymentMethod('CHEQUE 30/60/90');
                          setDeliveryDeadline('15 dias');
                          setValidityDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                          setIsBudgetModalOpen(true);
                        }}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                      >
                        <Plus size={14} />
                        Adicionar Orçamento
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.proposals.length > 0 ? (
                        formData.proposals.map((prop: any, index: number) => (
                          <div key={prop.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <input 
                                type="text"
                                className="bg-transparent border-none text-sm font-black text-slate-900 focus:ring-0 p-0 w-2/3"
                                value={prop.description}
                                onChange={(e) => {
                                  const newProps = [...formData.proposals];
                                  newProps[index].description = e.target.value;
                                  setFormData({ ...formData, proposals: newProps });
                                }}
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newProps = formData.proposals.filter((_: any, i: number) => i !== index);
                                  setFormData({ ...formData, proposals: newProps });
                                }}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
                                <input 
                                  type="number"
                                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                  value={prop.value}
                                  onChange={(e) => {
                                    const newProps = [...formData.proposals];
                                    newProps[index].value = Number(e.target.value);
                                    setFormData({ ...formData, proposals: newProps });
                                  }}
                                />
                              </div>
                              <select 
                                className={cn(
                                  "w-full border rounded-xl py-2 px-3 text-xs font-black uppercase tracking-widest outline-none transition-all",
                                  prop.status === 'ganho' ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                  prop.status === 'perdido' ? "bg-rose-50 border-rose-200 text-rose-600" :
                                  "bg-white border-slate-200 text-slate-600"
                                )}
                                value={prop.status}
                                onChange={(e) => {
                                  const newProps = [...formData.proposals];
                                  newProps[index].status = e.target.value;
                                  setFormData({ ...formData, proposals: newProps });
                                }}
                              >
                                <option value="pendente">Pendente</option>
                                <option value="ganho">Ganho</option>
                                <option value="perdido">Perdido</option>
                              </select>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                          <Calculator size={24} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum orçamento segmentado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observations & Proposal Section */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Observações e Proposta</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Observações</label>
                        <textarea 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all min-h-[120px] resize-none"
                          placeholder="Adicione observações importantes sobre este lead..."
                          value={formData["Observações"]}
                          onChange={(e) => setFormData({...formData, "Observações": e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentos e Propostas</label>
                          <div className="flex gap-2">
                            <label className={cn(
                              "cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                              isUploading && "opacity-50 cursor-not-allowed"
                            )}>
                              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                              <span>Proposta</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.docx,.jpg,.png"
                                disabled={isUploading}
                                onChange={(e) => handleFileUpload(e, 'proposta')}
                              />
                            </label>
                            <label className={cn(
                              "cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                              isUploading && "opacity-50 cursor-not-allowed"
                            )}>
                              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                              <span>Orçamento</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf,.docx,.jpg,.png"
                                disabled={isUploading}
                                onChange={(e) => handleFileUpload(e, 'orcamento')}
                              />
                            </label>
                          </div>
                        </div>

                        {attachments.length > 0 ? (
                          <div className="space-y-2">
                            {attachments.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                    <FileText size={16} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                      {file.file_type === 'proposta' ? 'Proposta' : file.file_type === 'orcamento' ? 'Orçamento' : 'Arquivo'} • {new Date(file.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <a 
                                    href={file.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Visualizar"
                                  >
                                    <ChevronRight size={18} />
                                  </a>
                                  <button 
                                    onClick={() => handleDeleteAttachment(file.id, file.name)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    title="Excluir"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                            <FileUp size={24} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum documento anexado</p>
                          </div>
                        )}
                      </div>
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
                        disabled={isSaving}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSaving && <Loader2 className="animate-spin" size={18} />}
                        {isSaving ? "Salvando..." : (isCreateModalOpen ? "Criar Lead" : "Salvar Alterações")}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsDeleteConfirmOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="size-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Confirmar Exclusão</h3>
                <p className="text-slate-500 mb-8">
                  Tem certeza que deseja excluir este lead permanentemente? Esta ação não pode ser desfeita.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDeleteLead}
                    disabled={isSaving}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                    {isSaving ? "Excluindo..." : "Sim, Excluir Lead"}
                  </button>
                  <button 
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Budget Generator Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-3xl shadow-2xl z-[90] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    Gerador de Orçamento - {selectedLead?.product === 'Exaustor Eólico' ? 'Exaustor Eólico' : 'Perfis Drywall'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    Cliente: {selectedLead?.company} • Vendedor: {selectedLead?.salesperson}
                  </p>
                </div>
                <button 
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Client Data Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-2">Dados do Cliente (Obrigatórios)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CNPJ <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="00.000.000/0001-00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                        value={selectedLead?.cnpj || ''}
                        onChange={(e) => setSelectedLead({...selectedLead, cnpj: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Endereço Completo <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                        value={selectedLead?.address || ''}
                        onChange={(e) => setSelectedLead({...selectedLead, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">CEP <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="00000-000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                        value={selectedLead?.cep || ''}
                        onChange={(e) => setSelectedLead({...selectedLead, cep: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telefone</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none cursor-not-allowed"
                        value={selectedLead?.phone || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</label>
                      <input 
                        type="text" 
                        readOnly
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-400 outline-none cursor-not-allowed"
                        value={selectedLead?.email || ''}
                      />
                    </div>
                  </div>
                </div>

                {/* Proposal Items Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Itens do Orçamento</h4>
                    <button 
                      onClick={() => {
                        const table = selectedLead?.product === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE;
                        setProposalItems([...proposalItems, { ...table[0], quantity: 1 }]);
                      }}
                      className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} />
                      Adicionar Item
                    </button>
                  </div>
                  
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Produto</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">Qtd</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32">Preço Un.</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest w-32 text-right">Total</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {proposalItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <select 
                                className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
                                value={item.id}
                                onChange={(e) => {
                                  const table = selectedLead?.product === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE;
                                  const selected = table.find(p => p.id === Number(e.target.value));
                                  if (selected) {
                                    const newItems = [...proposalItems];
                                    newItems[idx] = { ...newItems[idx], ...selected };
                                    setProposalItems(newItems);
                                  }
                                }}
                              >
                                {(selectedLead?.product === 'Exaustor Eólico' ? EXAUSTOR_PRICE_TABLE : DRYWALL_PRICE_TABLE).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                min="1"
                                className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none"
                                value={item.quantity}
                                onChange={(e) => {
                                  const newItems = [...proposalItems];
                                  newItems[idx].quantity = Number(e.target.value);
                                  setProposalItems(newItems);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                            </td>
                            <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => setProposalItems(proposalItems.filter((_, i) => i !== idx))}
                                className="text-rose-500 hover:text-rose-700 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Freight & Notes */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Forma de Pagamento <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="Ex: CHEQUE 30/60/90"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prazo de Entrega (Dias) <span className="text-rose-500">*</span></label>
                        <input 
                          type="text" 
                          placeholder="Ex: 15 dias"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={deliveryDeadline}
                          onChange={(e) => setDeliveryDeadline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custo do Frete (Manual)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                          <input 
                            type="number" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                            value={freightCost}
                            onChange={(e) => setFreightCost(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Validade da Proposta</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all"
                          value={validityDate}
                          onChange={(e) => setValidityDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Observações do Orçamento</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600 outline-none transition-all min-h-[100px] resize-none"
                        value={proposalNotes}
                        onChange={(e) => setProposalNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100 h-fit">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Resumo Financeiro</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Subtotal Itens:</span>
                        <span className="text-slate-900 font-black">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposalItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Frete:</span>
                        <span className="text-slate-900 font-black">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(freightCost)}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">Total Geral:</span>
                        <span className="text-xl font-black text-blue-600">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposalItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) + freightCost)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Aprovação Necessária</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsBudgetModalOpen(false)}
                    className="px-6 py-3 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={saveGeneratedProposal}
                    disabled={isSaving}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    Aprovar e Salvar Orçamento
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Final Proposal View Modal */}
      <AnimatePresence>
        {isFinalProposalOpen && lastGeneratedProposal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[210mm] bg-white shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10 no-print">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Visualização do Orçamento Final</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Imprimir / PDF
                  </button>
                  <button 
                    onClick={() => setIsFinalProposalOpen(false)}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-[15mm] bg-white text-black font-sans print:p-0">
                <div dangerouslySetInnerHTML={{ __html: generateProposalHtml(lastGeneratedProposal, leads.find(l => l.id === selectedLead?.id) || selectedLead) }} />
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
