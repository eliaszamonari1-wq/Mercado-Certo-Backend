# 🚀 Projeto Betas — Frontend

<!-- cSpell:disable -->

App Vue 3 com autenticação via API e gerenciamento de sessão local.

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- NPM ou Yarn

## 🛠️ Tecnologias

- Vue.js 3
- Vue Router 4
- Vite
- Axios

## 🚀 Instalação e Execução

```bash
cd frontend
npm install
npm run dev
```

## Estrutura de rotas

- `/` — página pública de login/registro
- `/dashboard` — painel protegido após login
- `/settings` — configurações de conta protegidas

## Variáveis de ambiente

Use o arquivo `frontend/.env.example` como base.

```env
VITE_API_URL=http://localhost:3333/api
```

## Observações

- A autenticação usa token JWT armazenado em `localStorage`.
- Se estiver autenticado, o frontend redireciona automaticamente para `/dashboard`.
- Ao sair, o app remove o token e retorna à página de login.
