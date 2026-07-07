# ⚔️ Academia Aequilibrium — Painel do Mestre

> Painel de controle em tempo real para mestre de RPG de mesa — **DESEQUILÍBRIO**.
> Desenvolvido com React, TypeScript e Vite. Design: Dark Mode estrito com glassmorphism.

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 🎲 Sobre o Projeto

A **Academia Aequilibrium** é um painel web criado para a **Mestre** gerenciar uma sessão de RPG. Centraliza o controle de personagens (jogadores e NPCs), pontuação, marcas de falha, familiares e a matriz de relacionamentos entre todos os envolvidos.

---

## ✨ Recursos

### 👥 Gerenciamento de Jogadores
- Suporte para até **8 slots de jogadores** simultâneos.
- Controle de **pontos em tempo real**, permitindo ao mestre incrementar ou decrementar valores com rapidez durante a sessão.

### 💀 Sistema de Punição
- **Valores negativos são permitidos**, refletindo penalidades severas para os personagens.
- Adição automática de **Marcas de Falha (strikes)** quando os pontos de um jogador atingem zero, mantendo o registro de consequências ao longo da campanha.

### 🖼️ Upload de Imagens
- Áreas de **drag-and-drop** dedicadas para o upload de:
  - Avatares dos personagens jogadores.
  - Avatares dos NPCs e familiares vinculados.
- Interface intuitiva que mantém a imersão visual da sessão.

### 🤝 Matriz de Amizades
- Rastreamento visual de **relacionamentos entre NPCs e Jogadores**.
- Escala de **-4 a +4 níveis de intensidade** (de profundo ódio a grande amigo), permitindo ao mestre monitorar alianças, rivalidades e laços de forma rápida e intuitiva.

---

## 🔐 Autenticação e Fluxo de Acesso

O sistema possui tela de **login obrigatório** antes do acesso ao painel.

### Contas de Desenvolvimento (mockadas no Front-end)

| Usuário      | Senha     | Papel  |
|--------------|-----------|--------|
| MestreMaria  | Colapso   | GM     |
| Duda         | rpg123    | PLAYER |
| Pablo        | rpg123    | PLAYER |
| Luis         | rpg123    | PLAYER |
| JP           | rpg123    | PLAYER |
| Gusta        | rpg123    | PLAYER |
| Gabriel      | rpg123    | PLAYER |

> **Regra de login por papel:**
> - **GM (MestreMaria)**: acessa o painel completo imediatamente após autenticar.
> - **PLAYER**: após autenticar com sua conta, o sistema verifica se existe um `PlayerCharacter` com `playerId` igual ao `id` do usuário logado. Enquanto não houver vínculo, o jogador vê a tela de espera. O painel só é liberado quando a GM criar e vincular o personagem ao seu usuário via modal de criação.

### Estrutura do `User`

```typescript
interface User {
  id: string;          
  name: string;        
  email: string;       
  password: string;    
  role: "GM" | "PLAYER";
}
```

---

## 🎭 Permissões por Papel (Role-Based Access)

| Ação                                    | GM  | PLAYER               |
|-----------------------------------------|-----|----------------------|
| Ver todos os PlayerCards                | ✅  | ✅                   |
| Editar pontos dos jogadores             | ✅  | ❌ (somente leitura) |
| Adicionar / Excluir jogadores           | ✅  | ❌                   |
| Ver todos os NPCs                       | ✅  | ✅                   |
| Adicionar / Excluir NPCs               | ✅  | ❌                   |
| Ver **toda** a Matriz de Amizade        | ✅  | ❌ (só a própria linha) |
| Editar amizades de qualquer jogador     | ✅  | ❌                   |
| Editar **própria** amizade com NPCs     | ✅  | ✅                   |
| Acessar Painel Administrativo           | ✅  | ❌                   |

---

## 📁 Estrutura do Projeto

```
src/
├── data/
│   ├── types.ts            # Contratos de dados (interfaces TypeScript)
│   └── initialData.ts      # Contas mockadas, matérias estáticas e estados iniciais
├── app/
│   ├── context/
│   │   └── AuthContext.tsx  # Provider de autenticação + activeCharacterId
│   ├── components/
│   │   ├── auth/           # LoginScreen
│   │   ├── layout/         # Header
│   │   ├── player/         # PlayerCard
│   │   ├── npc/            # NpcCard + FriendshipMatrix
│   │   └── shared/         # AddCharacterModal, AdminModal, AvatarDropzone, YinYang
│   └── App.tsx             # Componente raiz: state global + roteamento de seções
├── utils/
│   └── subjectUtils.ts     # Lógica de fusão de cores (Yin-Yang) das matérias
└── main.tsx
```

---

## 🎨 Design System

| Papel              | Cor                                  |
|--------------------|--------------------------------------|
| Fundo Principal    | `#0a0a0a` — Preto profundo           |
| Superfície (card)  | `#111111` / `#1a1a1a` — Cinza escuro |
| Texto & Bordas     | `#ffffff` / `#a1a1aa` — Branco e Cinza |
| Destaque & Alerta  | `#c8102e` — Vermelho                 |

---

## 📜 Contrato de API — Guia para o Back-end

> Esta seção descreve com precisão as interfaces de dados que o front-end usa internamente
> e que os endpoints da API deverão respeitar.

> **Decisão de Imagens (Upload & Drag & Drop):** As propriedades `imageUrl` enviadas pelo componente de *Drag & Drop* da UI (para avatares de personagens e de familiares) são tratadas pelo front-end. Como padrão de integração com o back-end, sugere-se que o backend aceite o upload em formato `multipart/form-data` ou receba o arquivo encodado em string `Base64` no payload de criação/edição.

---

### ⚠️ Estado de Integração

> **AVISO IMPORTANTE:** Os dados dinâmicos iniciais foram completamente removidos do front-end.
> As constantes `INITIAL_PLAYERS`, `INITIAL_NPCS`, `INITIAL_FAMILIARS` e `INITIAL_RELATIONSHIPS`
> são agora **arrays vazios `[]`**. O painel inicia completamente em branco e depende
> integralmente das chamadas de API reais para popular as listas de personagens, familiares
> e relacionamentos. Apenas as contas de usuário (`mockUsers`) e as matérias (`mockSubjects`)
> permanecem mockadas até a integração da autenticação e do seed de matérias.

---

### 1. 📚 Matérias (`SubjectProps`) — Dados Estáticos

As matérias são o **catálogo fixo de disciplinas do sistema**, definidas como seed no back-end.
O front-end **não cria nem edita** matérias em runtime — apenas as consome.

```typescript
interface SubjectProps {
  id: string;          // ex: "subj-05"
  name: string;        // ex: "Sonho"
  color: "black" | "white" | "gray" | "darkGray" | "lightGray";
  icon?: string;       
}
```

**Endpoint sugerido:** `GET /subjects` → retorna `SubjectProps[]`

> **Nota:** O campo `color` é um token semântico (não uma cor CSS arbitrária). O front-end usa
> esse valor para calcular a cor do avatar Yin-Yang via `getBlendedColor()` em `subjectUtils.ts`.
> O back-end deve respeitar os valores do enum exatamente como definidos.

---

### 2. 🧙 PlayerCharacter (Personagem do Jogador)

> **MUDANÇA CRÍTICA — Sem "Classe/Arquétipo":**
> O campo `role: string` (que representava classe como "Ranger", "Mago" etc.) **não existe mais**.
> A propriedade `role` é agora um **array de objetos `SubjectProps[]`**, representando as matérias
> cursadas pelo personagem (mínimo 1, máximo 2). A "classe" do personagem é derivada das matérias
> escolhidas, não de um campo textual livre.

```typescript
interface PlayerCharacter {
  id: string;
  name: string;
  initials: string;        
  points: number;          
  strikes: number;         
  dormitory: string;       
  imageUrl?: string;       
  role: SubjectProps[];    
  playerId: string;        
  familiarId: string;      
}
```

**Exemplo de payload JSON (resposta da API):**

```json
{
  "id": "char-abc123",
  "name": "Sylvara Nightwhisper",
  "initials": "SN",
  "points": 25,
  "strikes": 0,
  "dormitory": "Torre Norte",
  "imageUrl": null,
  "role": [
    {
      "id": "subj-05",
      "name": "Sonho",
      "color": "white"
    },
    {
      "id": "subj-09",
      "name": "Magia (Luz)",
      "color": "white"
    }
  ],
  "playerId": "user-duda",
  "familiarId": "fam-xyz789"
}
```

**Regras de negócio:**
- Máximo de **8 jogadores** ativos (`MAX_PLAYERS = 8`).
- Quando `points` cruza de positivo para `<= 0`, o front-end **automaticamente adiciona 1 strike**. O back-end deve persistir esse valor atualizado.
- `strikes` é limitado a `MAX_STRIKES = 4`.
- O campo `playerId` é obrigatório e deve referenciar um `User` com `role: "PLAYER"`. Constraint `UNIQUE` necessária: um `User` pode ter no máximo **um** `PlayerCharacter` ativo.

**Payload de criação (POST):**

```json
{
  "name": "Sylvara Nightwhisper",
  "initials": "SN",
  "dormitory": "Torre Norte",
  "playerId": "user-duda",
  "familiarId": "fam-xyz789",
  "role": ["subj-05", "subj-09"]
}
```

> No payload de criação, `role` pode ser enviado como `string[]` de IDs. O back-end popula os objetos completos na resposta.

---

### 3. 👻 NPC (Personagem Não Jogável)

Estrutura idêntica ao `PlayerCharacter`, exceto:
- **Sem `playerId`** (NPCs não pertencem a um usuário).
- Possui campo `type?: string` para categorização (ex: "Professor", "Guardião").
- O `role` também é `SubjectProps[]` — nunca uma string.

```typescript
interface NPC {
  id: string;
  name: string;
  initials: string;
  points: number;
  strikes: number;
  dormitory: string;
  imageUrl?: string;       
  role: SubjectProps[];    // Array de 1 ou 2 matérias (nunca string)
  familiarId: string;
  type?: string;
}
```

---

### 4. 🦊 Familiar

```typescript
interface Familiar {
  id: string;
  name: string;
}
```

> Familiares são criados pelo GM via painel Admin e vinculados a personagens pelo campo `familiarId`.
> O front-end usa o ID `"none"` como sentinela quando nenhum familiar está associado.

---

### 5. 🤝 Matriz de Amizade (Relationship)

A matriz de amizade é uma **tabela associativa** (relação muitos-para-muitos) que mapeia a relação de cada NPC com cada PlayerCharacter.

```typescript
interface Relationship {
  id: string;
  player: string;   
  npc: string;      
  level: number;    
}
```

**Exemplo de JSON de Relacionamento (Relationship):**

```json
{
  "id": "rel-001",
  "player": "char-abc123",
  "npc": "npc-def456",
  "level": 3
}
```

#### Escala de Níveis de Amizade

| Valor | Rótulo                |
|-------|-----------------------|
| `-4`  | 💀 Profundo ódio      |
| `-3`  | 😠 Inimigo            |
| `-2`  | 😒 Não gosta          |
| `-1`  | 😑 Não vai com a cara |
| ` 0`  | 😐 Neutro             |
| `+1`  | 🙂 Colega             |
| `+2`  | 😊 Parceiro           |
| `+3`  | 😄 Amigo              |
| `+4`  | 🌟 Grande Amigo       |

#### Permissões de Visão da Matriz

**O GM** visualiza e edita a matriz completa de **todos** os jogadores versus todos os NPCs.

**O PLAYER** visualiza **apenas a própria linha de amizade** (o relacionamento do *seu* personagem com cada NPC). O front-end filtra por `activeCharacterId` — o ID do `PlayerCharacter` vinculado ao `User` logado via `playerId`. O PLAYER possui permissão para **editar os próprios pontos** (botões `+` e `−` ativos somente na própria linha).

#### Regras de negócio da Matriz:

- **Cruzamento Total (N x M):** A matriz de amizades é gerada pelo cruzamento completo de **todos os NPCs** com **todos os PlayerCharacters**. Ou seja, para cada NPC e cada PlayerCharacter registrado, deve existir uma entrada correspondente na tabela associativa de relacionamentos (se houver N players e M NPCs no banco, haverá exatamente N x M registros de relacionamento).
- **Criação de NPC:** Ao criar um **novo NPC**, o back-end deve gerar automaticamente um relacionamento com nível `0` (Neutro) para **cada `PlayerCharacter` ativo**.
- **Criação de PlayerCharacter:** Ao criar um **novo PlayerCharacter**, o back-end deve gerar automaticamente um relacionamento com nível `0` (Neutro) para **cada `NPC` ativo**.
- **Exclusão em Cascata:** Ao **excluir um PlayerCharacter**, todas as entradas de amizade desse personagem devem ser removidas em cascata do banco. Da mesma forma, excluir um NPC deve apagar todos os relacionamentos a ele associados.
- **Validação de Limites:** O `level` é sempre **inteiro** e **clampado entre -4 e +4** (tanto no front-end quanto com validação obrigatória no back-end).

---

### 6. 🎨 Fusão Dinâmica de Cores (Yin-Yang) — Lógica de UI

Quando um personagem possui **duas matérias**, o front-end calcula automaticamente uma cor resultant mesclando as propriedades `color` das duas matérias para renderizar o avatar Yin-Yang bicolor.

Esta lógica é **100% de responsabilidade do cliente** e está implementada em `src/utils/subjectUtils.ts`. **O back-end apenas retorna o array `role` com as matérias; nenhuma lógica de fusão visual deve ser persistida no banco.**

---

### 7. 🗂️ Rotas de API Sugeridas

| Ação                             | Método   | Rota                        | Autenticação |
|----------------------------------|----------|-----------------------------|--------------|
| Login                            | `POST`   | `/auth/login`               | Pública      |
| Listar matérias (seed)           | `GET`    | `/subjects`                 | Autenticada  |
| Listar contas de jogadores       | `GET`    | `/admin/users`              | GM           |
| Cadastrar conta de jogador       | `POST`   | `/admin/users`              | GM           |
| Listar familiares                | `GET`    | `/admin/familiars`          | GM           |
| Cadastrar familiar               | `POST`   | `/admin/familiars`          | GM           |
| Listar personagens jogadores     | `GET`    | `/characters/players`       | Autenticada  |
| Criar personagem jogador         | `POST`   | `/characters/players`       | GM           |
| Atualizar pontos / strikes       | `PATCH`  | `/characters/players/:id`   | GM / PLAYER* |
| Excluir personagem jogador       | `DELETE` | `/characters/players/:id`   | GM           |
| Listar NPCs                      | `GET`    | `/characters/npcs`          | Autenticada  |
| Criar NPC                        | `POST`   | `/characters/npcs`          | GM           |
| Excluir NPC                      | `DELETE` | `/characters/npcs/:id`      | GM           |
| Listar relacionamentos           | `GET`    | `/relationships`            | Autenticada  |
| Atualizar nível de amizade       | `PATCH`  | `/relationships/:id`        | GM / PLAYER* |

> *PLAYER pode fazer `PATCH` somente nos recursos que pertencem ao seu `activeCharacterId`.

---

### 8. 📦 Resumo das Entidades e Origens

| Entidade            | Criada por                        | Rota de criação                |
|---------------------|-----------------------------------|--------------------------------|
| `User (GM)`         | Seed / configuração inicial       | —                              |
| `User (PLAYER)`     | GM via Painel Administrativo      | `POST /admin/users`            |
| `Familiar`          | GM via Painel Administrativo      | `POST /admin/familiars`        |
| `PlayerCharacter`   | GM via painel principal           | `POST /characters/players`     |
| `NPC`               | GM via painel principal           | `POST /characters/npcs`        |
| `Subject`           | Seed estático (regras do sistema) | —                              |
| `Relationship`      | Gerado automaticamente            | Criado pelo back-end ao criar NPC/Player |

---

### 9. 📦 Exemplo de Payload Completo (GET /session)

Abaixo está um exemplo de payload completo para recuperar o estado ativo de uma sessão de jogo. Note que ele já reflete as novas regras, como os campos `role` mapeados como arrays de objetos `SubjectProps`, o vínculo via `playerId`/`familiarId` e a lista flat de relacionamentos.

```json
{
  "players": [
    {
      "id": "char-abc123",
      "name": "Sylvara Nightwhisper",
      "initials": "SN",
      "points": 25,
      "strikes": 0,
      "dormitory": "Torre Norte",
      "imageUrl": "https://example.com/avatar-sylvara.png",
      "role": [
        {
          "id": "subj-05",
          "name": "Sonho",
          "color": "white"
        },
        {
          "id": "subj-09",
          "name": "Magia (Luz)",
          "color": "white"
        }
      ],
      "playerId": "user-duda",
      "familiarId": "fam-xyz789"
    }
  ],
  "npcs": [
    {
      "id": "npc-def456",
      "name": "Lady Seraphine",
      "initials": "LS",
      "points": 100,
      "strikes": 0,
      "dormitory": "Torre Sul",
      "imageUrl": "https://example.com/avatar-seraphine.png",
      "role": [
        {
          "id": "subj-03",
          "name": "Tempo",
          "color": "gray"
        }
      ],
      "familiarId": "fam-lm123",
      "type": "Professor"
    }
  ],
  "relationships": [
    {
      "id": "rel-001",
      "player": "char-abc123",
      "npc": "npc-def456",
      "level": 3
    }
  ]
}

---

## 📜 Licença

Desenvolvido para uso interno de uma mesa de RPG.
Todos os direitos reservados — **RPG DESEQUILÍBRIO — Maria Rita Fernandes**.
