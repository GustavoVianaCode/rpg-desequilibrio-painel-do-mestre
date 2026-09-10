-- seed.sql
-- Academia Aequilibrium: Dados Iniciais (Opcional)

-- 1. Famíliares Padrão (Os do mock)
INSERT INTO public.familiars (id, name, image_url) VALUES
('none', 'Nenhum', '/familiars/none.jpg'),
('f1', 'Coruja Sábia', '/familiars/owl.jpg'),
('f2', 'Gato Sombrio', '/familiars/cat.jpg')
ON CONFLICT (id) DO NOTHING;

-- 2. Matérias
INSERT INTO public.subjects (id, name, color, icon) VALUES
('Pocao', 'Poções', 'black', 'flask'),
('Herbologia', 'Herbologia', 'black', 'leaf'),
('Feiticos', 'Feitiços', 'black', 'wand'),
('Voar', 'Voo', 'black', 'broom'),
('Historia', 'História da Magia', 'black', 'book')
ON CONFLICT (id) DO NOTHING;

-- 3. Dormitórios (A/B/C/D — 20 vagas cada)
INSERT INTO public.dormitories (name, total_slots, occupied_slots) VALUES
('A', 20, 0),
('B', 20, 0),
('C', 20, 0),
('D', 20, 0)
ON CONFLICT (name) DO NOTHING;

-- Nota: Para usuários e personagens, é recomendado criar via aplicação ou registrar o GM manualmente:
-- INSERT INTO public.users (id, name, email, password_hash, role) VALUES ('<uuid-aqui>', 'Mestre', 'admin@rpg.com', '<hash-bcrypt-aqui>', 'GM');
