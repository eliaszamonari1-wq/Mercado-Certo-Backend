# Projeto Betas Monorepo

Este repositório contém o frontend e o backend do projeto.

## Estrutura

- `frontend/` — App Vue 3 com Vite.
- `backend/` — API Express com SQLite.

## Scripts

No root:

```bash
npm run dev:frontend
npm run dev:backend
npm run dev
npm run build:frontend
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Variáveis de ambiente

- `backend/.env.example`
- `frontend/.env.example`

Copie para `.env` e ajuste conforme necessário.

## Recomendações

- Use `JWT_SECRET` forte em produção.
- Em produção, não deixe o admin padrão ativado.
- Verifique se `VITE_API_URL` está apontando para o backend.
