# 🛡️ Backend — Painel do Mestre (RPG Desequilíbrio)

API Fastify com autenticação JWT e integração com Supabase.

## 📡 Endpoints

| Método | Endpoint | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login (email + senha) | — |
| GET | `/auth/me` | Dados do usuário logado | ✅ Token |
| GET | `/session/` | Sessão do usuário | ✅ Token |
| GET | `/admin/users` | Listar usuários | ✅ GM |
| POST | `/admin/users` | Criar usuário | ✅ GM |
| POST | `/admin/familiars` | Criar familiar | ✅ GM |
| POST | `/characters/` | Criar personagem | ✅ GM |
| GET | `/characters/` | Listar personagens | — |
| POST | `/relationships/` | Gerenciar amizades | ✅ |
| POST | `/upload/avatar` | Upload de avatar | ✅ GM |

## ⚙️ Configuração (.env)
- `PORT=3333`
- `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`

## 🚀 Rodar
```bash
npm install
npm run dev
```

## 🔗 Integração com Front
- Front: `VITE_API_URL=http://localhost:3333`
- CORS aberto (`origin: "*"`) para testes locais

---
Diretório reservado para a implementação da API / servidor de backend da aplicação.
- Inicializar o projeto backend (ex.: Node.js, Express, Fastify, NestJS, Python/FastAPI, etc.)
- Configurar rotas de API, autenticação e persistência de dados
- Configurar deploy independente para o domínio do backend (ex.: Railway, Render, Fly.io)
