# ⚔️ Academia Equilibrium — Painel do Mestre

> Painel de controle em tempo real para mestre de RPG de mesa, desenvolvido com React, TypeScript e Vite.

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
</p>

---

## 🎲 Sobre o Projeto

A **Academia Equilibrium** é um painel de controle web criado especificamente para o **Mestre de DESEQUILÍBRIUM** para gerenciar uma mesa de RPG. O objetivo é centralizar e facilitar o gerenciamento da sessão em tempo real.

O design usa uma paleta de cores composta por **Preto, Branco, Cinza e Vermelho**.

---

## ✨ Recursos

### 👥 Gerenciamento de Jogadores
- Suporte para até **8 slots de jogadores** simultâneos.
- Controle de **pontos em tempo real**, permitindo ao mestre incrementar ou decrementar valores com rapidez durante a sessão.

### 💀 Sistema de Punição
- **Valores negativos são permitidos**, refletindo penalidades severas para os personagens.
- Adição automática de **Marcas de Falha (strikes)** quando os pontos de um jogador atingem zero, mantendo o registro de consequências ao longo da campanha.

### 🕸️ Matriz de Amizades
- Rastreamento visual de **relacionamentos entre NPCs, Familiares e Jogadores**.
- Escala **bidirecional de -4 a +4**, os níveis sendo (💀 Profundo ódio, 😠 Inimigo, 😒 Não gosta, 😑 Não vai com a cara, 😐 Neutro, 🙂 Colega, 😊 Parceiro, 😄 Amigo, 🌟 Grande Amigo). Permitindo ao mestre monitorar desde inimizades declaradas até laços de grande amizade de forma rápida e intuitiva.

### 🗑️ Exclusão Segura de Personagens
- **Exclusão de NPCs e Jogadores** com modal de confirmação (AlertDialog) para evitar remoções acidentais.
- **Limpeza automática de vínculos**: ao excluir um Jogador, todas as entradas correspondentes nos arrays `friendships` de todos os NPCs são removidas automaticamente.

### 🖼️ Upload de Imagens
- Áreas de **drag-and-drop** dedicadas para o upload de:
  - **Avatares dos personagens** jogadores.
  - **Avatares dos familiares** vinculados a cada personagem.
- Interface intuitiva que mantém a imersão visual da sessão.

---

## 🛠️ Tech Stack

| Tecnologia | Propósito |
|---|---|
| **React 18+** | Biblioteca principal para construção da UI reativa |
| **TypeScript** | Tipagem estática para maior segurança e manutenibilidade |
| **Vite** | Build tool e servidor de desenvolvimento ultrarrápido |
| **Tailwind CSS** | Estilização utilitária com suporte nativo a Dark Mode |
| **shadcn/ui** | Componentes de UI acessíveis e customizáveis |

---

## 🚀 Como Rodar Localmente

Siga os passos abaixo para executar o projeto em sua máquina:

### Pré-requisitos

Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (incluído com o Node.js)

### Passo a Passo

**1. Instale as dependências:**
```bash
npm install
```

**2. Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

**3. Acesse no navegador:**
```
http://localhost:XXXX
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   ├── player/         # Componentes de card e gerenciamento de jogadores
│   │   └── ...             # Demais componentes do painel
│   └── App.tsx             # Componente raiz da aplicação
├── main.tsx                # Ponto de entrada do React
└── index.css               # Estilos globais e configuração do Tailwind
```

---

## 🎨 Design System

O projeto adota um **Dark Mode estrito** com a seguinte paleta:

| Papel | Cor |
|---|---|
| 🟫 Fundo Principal | `#0a0a0a` — Preto profundo |
| ⬛ Superfície | `#111111` / `#1a1a1a` — Cinza escuro |
| ⬜ Texto & Bordas | `#ffffff` / `#a1a1aa` — Branco e Cinza |
| 🔴 Destaque & Alerta | `#dc2626` — Vermelho |

---

## 📜 Licença

Este projeto foi desenvolvido para uso interno de uma mesa de RPG. Todos os direitos reservados "RPG DESEQUILÍBRIO - Maria Rita Fernandes".

---

## Estrutura de Dados / Contrato de API (Para o Back-end)

Esta seção descreve o formato JSON que o front-end espera para cada entidade do sistema. Ao integrar um back-end, os endpoints devem retornar dados neste formato exato.

---

### 🧙 Player (Jogador)

Representa um personagem controlado por um jogador na sessão.

```json
{
  "id": 1,
  "name": "Sylvara Nightwhisper",
  "role": "Ranger",
  "initials": "SN",
  "points": 120,
  "familiarName": "Presa",
  "familiarInitials": "PR",
  "dormitory": "A13",
  "strikes": 0,
  "imageUrl": "https://example.com/avatar.png"
}
```

| Campo             | Tipo               | Obrigatório | Descrição                                                                 |
|-------------------|--------------------|-------------|---------------------------------------------------------------------------|
| `id`              | `number` (inteiro) | ✅ Sim      | Identificador único do jogador.                                           |
| `name`            | `string`           | ✅ Sim      | Nome completo do personagem.                                              |
| `role`            | `string`           | ✅ Sim      | Classe ou papel do personagem (ex: "Ranger", "Mago", "Paladino").        |
| `initials`        | `string`           | ✅ Sim      | Iniciais usadas no avatar (ex: `"SN"` para Sylvara Nightwhisper).        |
| `points`          | `number` (inteiro) | ✅ Sim      | Pontuação atual. Pode ser **negativa** (penalidades são permitidas).      |
| `familiarName`    | `string`           | ✅ Sim      | Nome do familiar do personagem.                                           |
| `familiarInitials`| `string`           | ✅ Sim      | Iniciais do familiar, usadas no avatar menor.                             |
| `dormitory`       | `string`           | ✅ Sim      | Dormitório ou local de origem do jogador.                                 |
| `strikes`         | `number` (0–4)     | ✅ Sim      | Número de Marcas de Falha acumuladas. Deve estar entre `0` e `4`.        |
| `imageUrl`        | `string` (URL)     | ❌ Opcional | URL de imagem de avatar. Se ausente, o sistema exibe as iniciais.        |

> **Regras de negócio:**
> - O sistema suporta no máximo **8 jogadores** simultâneos (`MAX_PLAYERS = 8`).
> - Quando `points` cruza de positivo para zero ou negativo, o front-end **automaticamente adiciona 1 strike**. O back-end deve respeitar e persistir esse valor.
> - `strikes` é limitado a `MAX_STRIKES = 4`.

---

### 👻 NPC (Personagem Não Jogável)

Representa um NPC ou Familiar que interage com os jogadores na sessão.

```json
{
  "id": 1,
  "name": "Lady Seraphine",
  "initials": "LS",
  "familiarName": "Luminar",
  "familiarInitials": "LM",
  "dormitory": "B02",
  "subject": "Conjuração Arcana",
  "friendships": [
    { "playerId": 1, "level": 3 },
    { "playerId": 2, "level": -2 },
    { "playerId": 3, "level": 4 }
  ]
}
```

| Campo             | Tipo               | Obrigatório | Descrição                                                                 |
|-------------------|--------------------|-------------|---------------------------------------------------------------------------|
| `id`              | `number` (inteiro) | ✅ Sim      | Identificador único do NPC.                                               |
| `name`            | `string`           | ✅ Sim      | Nome completo do NPC.                                                     |
| `initials`        | `string`           | ✅ Sim      | Iniciais usadas no avatar principal (ex: `"LS"` para Lady Seraphine).    |
| `familiarName`    | `string`           | ✅ Sim      | Nome do familiar associado ao NPC.                                        |
| `familiarInitials`| `string`           | ✅ Sim      | Iniciais do familiar do NPC.                                              |
| `dormitory`       | `string`           | ✅ Sim      | Dormitório ou local de origem do NPC.                                     |
| `subject`         | `string`           | ✅ Sim      | Matéria que o NPC estuda ou ensina.                                       |
| `friendships`     | `Friendship[]`     | ✅ Sim      | Array com o nível de amizade do NPC em relação a cada jogador (ver abaixo).|

---

### 🤝 Matriz de Amizades (Friendship)

Cada NPC possui um array `friendships` que mapeia sua relação com **cada jogador registrado** na sessão.

```json
{
  "playerId": 3,
  "level": 4
}
```

| Campo      | Tipo              | Obrigatório | Descrição                                                                              |
|------------|-------------------|-------------|----------------------------------------------------------------------------------------|
| `playerId` | `number`          | ✅ Sim      | ID do jogador com quem o NPC possui essa relação. Deve referenciar um `Player.id` válido. |
| `level`    | `number` (-4 a 4) | ✅ Sim      | Nível de relação. Escala bidirecional de inimizade a grande amizade (ver tabela abaixo). |

#### Escala de Níveis de Amizade

| Valor | Descrição          |
|-------|--------------------|
| `-4`  | 💀 Profundo ódio   |
| `-3`  | 😠 Inimigo         |
| `-2`  | 😒 Não gosta       |
| `-1`  | 😑 Não vai com a cara    |
| ` 0`  | 😐 Neutro          |
| `+1`  | 🙂 Colega          |
| `+2`  | 😊 Parceiro        |
| `+3`  | 😄 Amigo           |
| `+4`  | 🌟 Grande Amigo    |

> **Regras de negócio:**
> - O array `friendships` deve conter **uma entrada para cada jogador ativo** na sessão. NPCs criados após jogadores já existentes recebem `level: 0` para cada um deles automaticamente.
> - Quando um novo jogador é adicionado, **todos os NPCs existentes** devem receber uma nova entrada `{ playerId: <novoId>, level: 0 }` em seus arrays de `friendships`.
> - Quando um jogador é **excluído**, sua entrada deve ser **removida do array `friendships` de todos os NPCs**.
> - O nível de amizade é **sempre inteiro** e **clampado entre -4 e +4** pelo front-end.

---

### 📦 Exemplo de Payload Completo (GET /session)

Estrutura sugerida para um endpoint que retorna o estado completo de uma sessão:

```json
{
  "players": [
    {
      "id": 1,
      "name": "Sylvara Nightwhisper",
      "role": "Destino e Magia de Luz",
      "initials": "SN",
      "points": 25,
      "familiarName": "Presa",
      "familiarInitials": "PR",
      "dormitory": "A20",
      "strikes": 0
    }
  ],
  "npcs": [
    {
      "id": 1,
      "name": "Lady Seraphine",
      "initials": "LS",
      "familiarName": "Luminar",
      "familiarInitials": "LM",
      "dormitory": "A17",
      "subject": "Tempo",
      "friendships": [
        { "playerId": 1, "level": -1 }
      ]
    }
  ]
}
```
