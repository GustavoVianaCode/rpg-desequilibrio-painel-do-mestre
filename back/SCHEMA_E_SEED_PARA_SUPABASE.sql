-- ============================================
-- SCHEMA + SEED PRONTO PARA COLAR NO SUPABASE
-- ============================================
-- Copie TODO este conteúdo e cole no SQL Editor do Supabase
-- (https://frlhfipzyqujhivpxofq.supabase.co/project/editor/sql/new)

-- ========== SCHEMA ==========
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('GM', 'PLAYER')) DEFAULT 'PLAYER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL CHECK (color IN ('black', 'white', 'gray', 'darkGray', 'lightGray')),
    icon TEXT
);

CREATE TABLE IF NOT EXISTS public.familiars (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.characters (
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
    familiar_id TEXT NOT NULL DEFAULT 'none' REFERENCES public.familiars(id) ON DELETE SET NULL,
    npc_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.character_subjects (
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (character_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    npc_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN -4 AND 4),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (player_id, npc_id)
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_relationships_updated_at ON public.relationships;
CREATE TRIGGER trg_relationships_updated_at
BEFORE UPDATE ON public.relationships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========== SEED ==========
INSERT INTO public.familiars (id, name, image_url) VALUES
('none', 'Nenhum', '/familiars/none.jpg'),
('f1', 'Coruja Sábia', '/familiars/owl.jpg'),
('f2', 'Gato Sombrio', '/familiars/cat.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subjects (id, name, color, icon) VALUES
('Pocao', 'Poções', 'black', 'flask'),
('Herbologia', 'Herbologia', 'black', 'leaf'),
('Feiticos', 'Feitiços', 'black', 'wand'),
('Voar', 'Voo', 'black', 'broom'),
('Historia', 'História da Magia', 'black', 'book')
ON CONFLICT (id) DO NOTHING;
-- INSERT ADMIN (GM) --
INSERT INTO public.users (id, name, email, password_hash, role) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mestre', 'admin@rpg.com', '$2b$10$I6I/0cBpdpDmsPFH.l3Jkuf06HcMtYOFU2k4BMz0Fv4VHuej0BBF2', 'GM') ON CONFLICT (email) DO NOTHING;

-- Dormitórios com vagas (tabela para o painel)
CREATE TABLE IF NOT EXISTS dormitories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_slots INTEGER NOT NULL DEFAULT 4,
  occupied_slots INTEGER NOT NULL DEFAULT 0 CHECK (occupied_slots >= 0 AND occupied_slots <= total_slots)
);

INSERT INTO dormitories (name, total_slots, occupied_slots) VALUES
('A', 20, 0),
('B', 20, 0),
('C', 20, 0),
('D', 20, 0)
ON CONFLICT (name) DO NOTHING;
