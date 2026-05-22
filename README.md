# Guild Portal - Backend API

Backend da plataforma de gerenciamento da guild **tooburnnt** (Raven 2).

## Stack
- Node.js + TypeScript + Fastify
- Prisma + PostgreSQL
- JWT + Google OAuth 2.0
- Zod validation

## Setup

```bash
# Instalar dependências
npm install

# Configurar .env (copiar de .env.example)
cp .env.example .env

# Gerar Prisma Client
npm run db:generate

# Rodar migrations
npm run db:migrate

# Seed do banco
npm run db:seed

# Rodar em dev
npm run dev
```

## API rodando em `http://localhost:3333`
