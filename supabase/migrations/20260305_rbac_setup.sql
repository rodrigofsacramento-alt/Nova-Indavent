-- 1. Criar a tabela de usuários interna (simplificada para v1)
CREATE TABLE IF NOT EXISTS public.internal_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Inserir usuários iniciais
INSERT INTO public.internal_users (username, password, name, role)
VALUES 
  ('admin', 'admin123', 'Administrador Sistema', 'admin'),
  ('jonathan.indavent', 'jon123', 'Jonathan', 'vendedor'),
  ('isabele.indavent', 'isa123', 'Isabele', 'vendedor'),
  ('jaqueline.indavent', 'jaq123', 'Jaqueline', 'vendedor')
ON CONFLICT (username) DO NOTHING;

-- 3. Garantir que a tabela leads tenha a coluna salesperson_id vinculada à internal_users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='salesperson_id') THEN
    ALTER TABLE public.leads ADD COLUMN salesperson_id UUID REFERENCES public.internal_users(id);
  END IF;
END $$;

-- 4. Habilitar RLS na tabela leads (opcional para v1 com internal_users, mas recomendado)
-- Nota: RLS com tabelas customizadas exige configuração de claims, 
-- para v1 faremos a filtragem no código do aplicativo como já implementado.
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
