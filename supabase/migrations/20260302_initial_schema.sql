-- Initial Schema for Indavent CRM

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "Nome" TEXT NOT NULL,
  "Cidade" TEXT,
  "Como conheceu?" TEXT,
  "Created time" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Data de Envio (Proposta-Follow Up))" DATE,
  "Endereço" TEXT,
  "Estágio" TEXT NOT NULL DEFAULT 'Cadastrado',
  "Follow Up Prioritários" TEXT,
  "Orçamento" DECIMAL(12, 2) DEFAULT 0.00,
  "Prazo de Entrega" TEXT,
  "Prazo de Resposta" INTEGER DEFAULT 2,
  "Produto" TEXT,
  "Proposta" TEXT,
  "Responsável da Empresa" TEXT,
  "Telefone" TEXT,
  "Tipo" TEXT,
  "Total Transações" INTEGER DEFAULT 0,
  "Transações" TEXT,
  "Ultimo contato (Lead)" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Vendedor" TEXT,
  "Vendedor." TEXT,
  "ultima atualização" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "Observações" TEXT,
  salesperson_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- Call, Message, Meeting, Email, Note
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Public leads are viewable by everyone" ON leads FOR SELECT USING (true);
CREATE POLICY "Public activities are viewable by everyone" ON activities FOR SELECT USING (true);
CREATE POLICY "Public leads are insertable by everyone" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE USING (true);

-- Sample Data with exact column names
INSERT INTO leads ("Nome", "Cidade", "Como conheceu?", "Estágio", "Produto", "Telefone", "Vendedor", "Data de Envio (Proposta-Follow Up))", "Prazo de Resposta") VALUES 
('Gesso Sousa', 'Não Inserido Planilha', 'Disparo Automatizado', 'Follow Up', 'Placas de Drywall', '551143363271', 'Vendas', NULL, 2),
('Gesso Barão', 'Não Inserido Planilha', 'Disparo Automatizado', 'Follow Up', 'Placas de Drywall', '5511973076832', 'Vendas', '2026-02-27', 2),
('Casa do Gesso Paulista', 'Não Inserido Planilha', 'Disparo Automatizado', 'Proposta Solicitada', 'Placas de Drywall', '5511963647977', 'Vendas', '2026-02-25', 2),
('Gesso Casa Nobre LTDA', 'Não Inserido Planilha', 'Disparo Automatizado', 'Proposta Solicitada', 'Placas de Drywall', '5511996852899', 'Vendas', '2026-02-28', 2),
('Gesso Silva', 'Não Inserido Planilha', 'Disparo Automatizado', 'Follow Up', 'Placas de Drywall', '5511957258120', 'Vendas', NULL, 2),
('Persi Construtora', 'Jundiai', 'Disparo Automatizado', 'Follow Up', 'Placas de Drywall', '5511996340689', 'Administrador principal Indavent Exaustores', NULL, 2),
('BRASVALI GESSOS', 'valinhos', 'Google', 'Proposta Solicitada', 'Placas de Drywall', '5519997955448', 'Vendas', '2026-03-02', 2),
('GM Gesso Itupeva', 'Não Inserido Planilha', 'Disparo Automatizado', '1° Contato', 'Placas de Drywall', '551140130924', 'Vendas', NULL, 2),
('LIMA GESSO', 'Não Inserido Planilha', 'Disparo Automatizado', 'Cliente', 'Placas de Drywall', '5511968617005', 'Vendas', '2026-02-26', 2),
('Prolgesso Forro', 'Não Inserido Planilha', 'Disparo Automatizado', 'Perdido', 'Placas de Drywall', '5511993134740', 'Vendas', NULL, 2);
