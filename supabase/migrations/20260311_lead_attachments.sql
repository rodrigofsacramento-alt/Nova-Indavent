-- Create lead_attachments table to support multiple documents per lead
CREATE TABLE IF NOT EXISTS public.lead_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'proposta', 'orcamento', 'manual', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS for now to match other tables
ALTER TABLE public.lead_attachments DISABLE ROW LEVEL SECURITY;
