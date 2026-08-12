# Deploy Instructions

Este arquivo descreve passos para commitar as correções (CORS/debug), publicar no Render e implantar o frontend no Firebase, além de testes para validar CORS.

## 1) Preparar branch, commitar e push (local)

Execute no terminal do repositório local:

```bash
git checkout -b fix/cors-debug
git add backend/server.js backend/src/routes/authRoutes.js
git commit -m "fix: enable CORS preflight and add auth debug endpoints"
git push -u origin fix/cors-debug
```

Observações:

- Se você usar outra branch ou nome, adapte os comandos.
- O push acionará o auto-deploy do Render (conforme `render.yaml`) se integrado ao repositório.

## 2) Monitorar deploy no Render

- Acesse o painel do Render: https://dashboard.render.com
- Abra o serviço `betas-backend` e acompanhe os logs do deploy.
- Aguarde o deploy terminar e verifique se a nova release está ativa.

## 3) Testes rápidos pós-deploy (Pré-flight CORS + debug endpoints)

Use PowerShell ou curl.exe. Exemplos para PowerShell (recomendado):

```powershell
# Preflight OPTIONS remoto (substitua o host se necessário)
Invoke-WebRequest -Uri "https://betas-backend.onrender.com/api/auth/login" -Method Options -Headers @{
  Origin = 'https://betastore-18b12.web.app'
  'Access-Control-Request-Method' = 'POST'
  'Access-Control-Request-Headers' = 'Content-Type, Authorization'
} -Verbose

# GET debug remoto
Invoke-RestMethod -Uri "https://betas-backend.onrender.com/api/auth/debug" -Method Get -Headers @{ Origin = 'https://betastore-18b12.web.app' } -Verbose
```

Se preferir `curl.exe` (Windows PowerShell precisa de `--%` para passar args raw):

```powershell
curl.exe --% -i -X OPTIONS "https://betas-backend.onrender.com/api/auth/login" -H "Origin: https://betastore-18b12.web.app" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type, Authorization"

curl.exe --% -i -X GET "https://betas-backend.onrender.com/api/auth/debug" -H "Origin: https://betastore-18b12.web.app"
```

## 4) Teste local (se você quiser validar antes de push)

No seu ambiente local, execute (no projeto root):

```powershell
# Inicie backend (caso não esteja rodando)
node backend/server.js

# Em outro terminal, inicie frontend dev
cd frontend
npm run dev
```

Em PowerShell local, execute:

```powershell
# Preflight OPTIONS local
Invoke-WebRequest -Uri "http://localhost:3333/api/auth/login" -Method Options -Headers @{
  Origin = 'http://localhost:5173'
  'Access-Control-Request-Method' = 'POST'
  'Access-Control-Request-Headers' = 'Content-Type, Authorization'
} -Verbose

# GET debug local
Invoke-RestMethod -Uri "http://localhost:3333/api/auth/debug" -Method Get -Headers @{ Origin = 'http://localhost:5173' } -Verbose

# POST debug local (JSON válido)
$body = @{ username = 'admin'; password = 'secret' } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3333/api/auth/debug" -Method Post -Headers @{ Origin = 'http://localhost:5173' } -Body $body -ContentType 'application/json' -Verbose
```

Verifique as respostas:

- Preflight deve retornar `Access-Control-Allow-Origin` com o domínio de origem e `Access-Control-Allow-Methods` incluindo `OPTIONS`.
- GET debug deve retornar JSON com `origin` e `headers`.
- POST debug deve ecoar o `body` (se o JSON for válido).

## 5) Deploy do frontend no Firebase (opcional)

Se precisar redeploy do frontend ao Firebase Hosting:

```bash
cd frontend
npm run build
npx firebase-tools deploy --only hosting --project betastore-18b12
```

> Observação: o `firebase-tools` pode pedir login interativo se não houver `FIREBASE_TOKEN`.

## 6) Segurança

- Não commit os arquivos de segredo (`frontend/.env.local`, `backend/google_client_secret.json`). Já foram adicionados ao `.gitignore`.

## 7) Verificação no navegador

- Abra DevTools → Network → filtre por `/api/auth/login`.
- Verifique a requisição `OPTIONS` (preflight) e a `POST` subsequente:
  - Se o preflight não retornar `Access-Control-Allow-Origin`, o navegador bloqueará a requisição.
  - Cheque o `Request Payload` para garantir JSON válido e `Content-Type: application/json`.

---

Se quiser, posso também criar um PR com as mudanças e o `DEPLOY_INSTRUCTIONS.md` pronto. Quer que eu abra o PR automaticamente (preciso do acesso Git configurado localmente para push)?
