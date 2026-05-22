# ⚔️ TooBurnt Union — Backend API (Raven 2)

API REST + WebSocket para a plataforma de gerenciamento da guild **tooburnnt** no jogo Raven 2.

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| Node.js + TypeScript | Runtime |
| Fastify 5 | Framework HTTP |
| Prisma | ORM |
| PostgreSQL | Banco de dados |
| @fastify/jwt | Autenticação JWT |
| @fastify/cookie | httpOnly cookies |
| @fastify/websocket | Real-time updates |
| @fastify/cors | CORS |
| @fastify/rate-limit | Rate limiting por usuário |
| Zod | Validação de input |
| Google Auth Library | OAuth 2.0 (produção) |

## 🚀 Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Gerar Prisma Client
npm run db:generate

# Rodar migrations
npm run db:migrate

# Seed limpo (apenas admin)
npm run db:seed

# Rodar em desenvolvimento
npm run dev
```

API disponível em `http://localhost:3333`

## 🔐 Segurança

- **JWT em httpOnly cookie** — Token não acessível via JavaScript (proteção XSS)
- **Token expira em 1h** — Com auto-refresh no frontend
- **roleGuard verifica no banco** — Não depende de claims estáticos do JWT
- **Dev bypass restrito** — Em NODE_ENV=development, só aceita emails que existem no banco
- **CORS validado** — Bloqueia `*` em produção
- **Rate limit por usuário** — 100 req/min por user ID autenticado
- **Validação Zod estrita** — rpgProfile com schema tipado, campos com max length
- **Proteção de saldo negativo** — Verifica GP suficiente antes de remover
- **Auto-delete protection** — Admin não pode deletar a si mesmo

## 📡 WebSocket

Endpoint: `GET /ws`

O servidor broadcast eventos para todos os clientes conectados quando dados mudam:

| Evento | Disparado quando |
|---|---|
| `auctions:updated` | Bid, criar auction |
| `events:updated` | CRUD de eventos, toggle RSVP |
| `members:updated` | Update profile/role, delete member, bid |
| `transactions:updated` | Adjust GP, bulk adjust, bid |
| `levelup:updated` | (disponível para uso futuro) |

## 📋 Endpoints

### Auth (público)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/google` | Login com Google token (ou email em dev) |
| POST | `/auth/refresh` | Refresh do JWT (autenticado) |
| GET | `/auth/me` | Dados do usuário logado |
| POST | `/auth/logout` | Limpa cookie de sessão |

### Members (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/members` | Listar membros |
| GET | `/members/:id` | Detalhe de um membro |
| PUT | `/members/:id/profile` | Atualizar perfil (próprio ou admin) |
| PUT | `/members/:id/role` | Atualizar role/rank (admin) |
| DELETE | `/members/:id` | Excluir membro permanentemente (admin) |

### Auctions (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/auctions` | Listar (paginado: `?limit=20&cursor=uuid`) |
| GET | `/auctions/:id` | Detalhe |
| POST | `/auctions` | Criar (admin) |
| POST | `/auctions/:id/bid` | Dar lance |

### Events (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/events` | Listar eventos |
| POST | `/events` | Criar (admin) |
| PUT | `/events/:id` | Editar (admin) |
| DELETE | `/events/:id` | Excluir (admin) |
| POST | `/events/:id/rsvp` | Toggle RSVP |

### Transactions (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/transactions` | Listar (paginado: `?limit=50&cursor=uuid`) |
| POST | `/transactions/adjust` | Ajustar GP individual (admin) |
| POST | `/transactions/bulk` | Ajustar GP em massa (admin) |

### Level Up (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/levelup/requests` | Listar requests |
| POST | `/levelup/requests` | Criar request |
| DELETE | `/levelup/requests/:id` | Deletar request |
| POST | `/levelup/requests/:id/join` | Entrar em slot |
| DELETE | `/levelup/requests/:id/leave` | Sair de slot |
| GET | `/levelup/helpers` | Listar helpers |
| POST | `/levelup/helpers` | Registrar helper |
| DELETE | `/levelup/helpers/:id` | Remover helper |

### Invites
| Método | Rota | Descrição |
|---|---|---|
| GET | `/invites/verify/:code` | Verificar código (público, rate limited) |
| GET | `/invites` | Listar (admin) |
| POST | `/invites` | Criar (admin) |
| DELETE | `/invites/:code` | Revogar (admin) |

### Infra
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/ws` | WebSocket connection |

## 📁 Estrutura

```
prisma/
├── schema.prisma            # Schema do banco
├── migrations/              # Migrations SQL
├── seed.ts                  # Seed com dados mock (para testes)
└── seed-prod.ts             # Seed limpo (apenas admin)
src/
├── @types/
│   └── fastify.d.ts         # Tipagem do JWT payload
├── config/
│   └── env.ts               # Validação de variáveis de ambiente (Zod)
├── middlewares/
│   ├── authGuard.ts         # Verifica JWT (cookie ou header)
│   └── roleGuard.ts         # Verifica role=admin no banco
├── modules/
│   ├── auth/                # Login Google, refresh, logout
│   ├── auctions/            # CRUD + bid com lock pessimista
│   ├── events/              # CRUD + RSVP toggle
│   ├── invites/             # Convites com código único
│   ├── levelup/             # Requests + helpers + slots
│   ├── members/             # CRUD + cascade delete
│   └── transactions/        # Ajuste GP com validação de saldo
├── utils/
│   ├── errors.ts            # Classes de erro (AppError, Forbidden, etc.)
│   └── prisma.ts            # Prisma client singleton
├── ws/
│   ├── hub.ts               # WebSocket broadcast hub
│   └── routes.ts            # Rota /ws
├── app.ts                   # Configuração Fastify (plugins, rotas, error handler)
└── server.ts                # Entry point
```

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server com hot reload (tsx watch) |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Rodar build compilado |
| `npm run db:migrate` | Criar/aplicar migrations |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:seed` | Seed limpo (apenas admin) |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Reset completo + seed |
| `npm run db:setup` | Deploy migrations + seed |
| `npm run db:setup:prod` | Deploy migrations + seed produção |

## ⚙️ Variáveis de Ambiente

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/guild_portal"
JWT_SECRET="min-32-chars-secret"
PORT=3333
GOOGLE_CLIENT_ID="your-google-client-id"
NODE_ENV="development"
ADMIN_EMAIL="your-email@gmail.com"
CORS_ORIGIN="http://localhost:3003"
```

## 📝 Licença

Projeto privado — © 2026 tooburnnt. Todos os direitos reservados.
