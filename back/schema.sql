-- schema.sql
-- Academia Aequilibrium: RPG Desequilíbrio - Mestre Dashboard

-- Habilitar a extensão pgcrypto se necessário (embora gen_random_uuid já exista no postgres 13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. users (Contas do Sistema)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('GM', 'PLAYER')) DEFAULT 'PLAYER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. subjects (Catálogo Fixo de Matérias)
CREATE TABLE public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL CHECK (color IN ('black', 'white', 'gray', 'darkGray', 'lightGray')),
    icon TEXT
);

-- 3. familiars (Catálogo de Familiares)
CREATE TABLE public.familiars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. characters (Jogadores e NPCs)
CREATE TABLE public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_type TEXT NOT NULL CHECK (character_type IN ('PLAYER', 'NPC')),
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    strikes INTEGER NOT NULL DEFAULT 0 CHECK (strikes BETWEEN 0 AND 4),
    dormitory TEXT NOT NULL DEFAULT '—',
    image_url TEXT,
    has_earned_mark BOOLEAN NOT NULL DEFAULT FALSE,
    player_id UUID UNIQUE REFERENCES public.users(id) ON DELETE SET NULL,
    familiar_id TEXT NOT NULL REFERENCES public.familiars(id) ON DELETE SET DEFAULT 'none',
    npc_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. character_subjects (Matérias Cursadas)
CREATE TABLE public.character_subjects (
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (character_id, subject_id)
);

-- 6. relationships (Matriz de Amizades NxM)
CREATE TABLE public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    npc_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN -4 AND 4),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (player_id, npc_id)
);

-- Função de Trigger para Auto-Atualização de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_relationships_updated_at
BEFORE UPDATE ON public.relationships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
