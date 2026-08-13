# Backend - Projeto Betas

API Express para autenticação de usuários, com SQLite e JWT.

## Requisitos

- Node.js (v16+)
- npm

## Instalação

```bash
cd backend
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Produção

Defina as variáveis de ambiente em `backend/.env` antes de iniciar:

```env
PORT=3333
NODE_ENV=production
JWT_SECRET=uma_chave_secreta_segura
```

E então execute:

```bash
npm start
```

## Variáveis de ambiente de exemplo

Veja `backend/.env.example`.

## Observações

- O token JWT é obrigatório em produção.
- O usuário admin padrão é criado apenas em ambiente de desenvolvimento.
