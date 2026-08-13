# Organização do Mercado Certo

## Objetivo

Manter o projeto separado por domínio, com regras claras para usuários, vendedores, planos e administração. O frontend usa componentes Vue; o backend segue Routes -> Controllers -> Services -> Repositories/Models.

## Estrutura principal

```text
frontend/src/
├── components/
│   ├── admin/       # Painéis e relatórios administrativos
│   ├── listings/    # Anúncios, detalhes e links externos
│   ├── plans/       # Cards e seleção de planos
│   ├── shared/      # Autenticação e formulários reutilizáveis
│   └── user/        # Perfil, vendedor, cobrança e chat
├── composables/     # Estado reutilizável, como autenticação
├── utils/           # Cliente HTTP e utilitários
└── main.js          # Rotas do frontend

backend/src/
├── controllers/     # Entrada HTTP e validação de requisições
├── database/        # SQLite, migrações locais e schema
├── middleware/      # Autenticação e autorização por papel
├── models/          # Entidades e operações específicas de domínio
├── repositories/    # Acesso persistente aos dados
├── routes/          # Registro dos endpoints
├── services/        # Regras de negócio
└── utils/           # Validadores
```

## Rotas do frontend

- `/dashboard`: catálogo público e autenticação.
- `/plans`: cards de planos Comprar, Vendedor e Negócio.
- `/seller`: painel do vendedor.
- `/billing`: cobranças e histórico.
- `/create-listing`: criação de anúncio.
- `/listing/:id`: detalhe de anúncio.
- `/settings`: perfil do usuário.
- `/admin`: painel administrativo protegido por `is_admin`.

## Regras de acesso

### Usuário comprador

Pode navegar pelo catálogo, entrar em contato com vendedores e manter sua sessão pelo Firebase Authentication.

### Vendedor

Pode publicar anúncios e utilizar o chat. Cada anúncio ativo custa **R$ 100,00 por mês**, sem comissão sobre vendas. Após o período de graça de 30 dias sem pagamento, o anúncio pode ser pausado pela rotina de cobrança.

### Administrador

As rotas `/api/admin/*` exigem:

1. Token JWT válido.
2. Usuário ativo.
3. Campo `is_admin` igual a `true`.

O administrador padrão de desenvolvimento é criado com `is_admin = 1`. Em produção, configure o papel administrativo por um processo seguro de operação, nunca por dados enviados pelo cliente.

## Planos exibidos

Os cards em `frontend/src/components/plans/PricingPlans.vue` são uma camada de apresentação. A cobrança efetiva deve continuar sendo confirmada pelo backend e por um gateway de pagamento antes de liberar recursos pagos.

## Arquivos removidos

Foram removidos somente arquivos sem uso no build atual:

- Cópias antigas em `patch_for_commit/`.
- `frontend/src/components/app.js`, exemplo de CORS não utilizado.
- `frontend/src/components/deploy-render.md`, documentação de deploy que estava dentro de `components`.

As configurações Firebase, Render, regras Firestore/Storage e documentação principal da raiz foram preservadas.

## Regra para novas funcionalidades

1. Defina o domínio: `admin`, `user`, `listings`, `plans` ou `shared`.
2. Crie o componente na pasta correspondente.
3. Registre a rota em `frontend/src/main.js` quando for uma tela.
4. Para backend, mantenha controller, service e repository/model separados.
5. Adicione autorização no middleware para operações administrativas.
6. Valide com `npm run build:frontend` e um teste HTTP local antes de publicar.
