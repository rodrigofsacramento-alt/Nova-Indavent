-- Create orcamentos table
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  client_data JSONB NOT NULL,
  items JSONB NOT NULL,
  freight_cost DECIMAL(12, 2) DEFAULT 0.00,
  total_value DECIMAL(12, 2) NOT NULL,
  payment_method TEXT,
  delivery_deadline TEXT,
  validity_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'Gerado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create propostas table
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  html_content TEXT NOT NULL,
  status TEXT DEFAULT 'Enviada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to leads table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='CNPJ') THEN
    ALTER TABLE public.leads ADD COLUMN "CNPJ" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='CEP') THEN
    ALTER TABLE public.leads ADD COLUMN "CEP" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='Email') THEN
    ALTER TABLE public.leads ADD COLUMN "Email" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='proposal_details') THEN
    ALTER TABLE public.leads ADD COLUMN proposal_details JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='orcamento_id') THEN
    ALTER TABLE public.leads ADD COLUMN orcamento_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='proposta_id') THEN
    ALTER TABLE public.leads ADD COLUMN proposta_id UUID;
  END IF;
END $$;

-- Disable RLS for these tables for now to match leads table
ALTER TABLE public.orcamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas DISABLE ROW LEVEL SECURITY;
