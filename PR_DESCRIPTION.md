# PR: Importação inicial do projeto ProjetoBetas

## Título

Inicial: importação do projeto (backend + frontend)

## Resumo

Este PR adiciona a versão inicial completa do projeto "ProjetoBetas", incluindo:

- Backend: API Node/Express com rotas, controllers, models e scripts de seed.
- Frontend: App Vue + Vite com autenticação, dashboard e formulários de produtos.

## Principais mudanças

- Diretórios adicionados: `backend/`, `frontend/`, `data/`, `patch_for_commit/`
- Implementação das rotas de autenticação e produtos, repositórios e services.
- Scripts para iniciar e popular dados de exemplo.

## Como rodar localmente

1. Backend

```bash
cd backend
npm install
npm run start # ou: node server.js
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

> Observação: Configure as variáveis de ambiente necessárias (ex.: credenciais Firebase) antes de rodar o frontend/backend. Verifique `frontend/src/firebase.js` e `backend` para pontos de configuração.

## Testes e verificação

- Revisar endpoints de API (ex.: `GET /products`, `POST /auth/login`).
- Acessar a interface do frontend e testar fluxos de cadastro/login e gerenciamento de produtos.

## Checklist

- [ ] Código revisado
- [ ] Build local funciona (backend + frontend)
- [ ] Variáveis de ambiente documentadas/saneadas
- [ ] Tests (se aplicável) passando

## Notas adicionais

- README.md principal contém instruções básicas; atualizar se necessário.
- Se quiser, posso abrir a PR no GitHub para você se fornecer o nome do repositório remoto e a branch base (ex.: `main`).
