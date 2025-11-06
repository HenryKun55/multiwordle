# Guia de Deploy - MultiWordle

## Opções de Deploy Gratuito (5000+ usuários simultâneos)

### 1. Railway.app (RECOMENDADO) ⭐

**Melhor para:** WebSocket, escalabilidade, facilidade

**Recursos grátis:**
- 500 horas/mês
- Suporte nativo a WebSocket
- SSL automático
- Deploy contínuo do GitHub

**Passos:**

1. Criar conta em https://railway.app
2. Clicar em "New Project"
3. Selecionar "Deploy from GitHub repo"
4. Conectar este repositório
5. Railway detecta automaticamente Next.js
6. Deploy automático!

**Configurações:**
- Build Command: `npm install && npm run build` (detectado automaticamente)
- Start Command: `npm start` (detectado automaticamente)
- Variáveis de ambiente: Nenhuma necessária!

**URL gerada:**
`https://multiwordle-production.up.railway.app` (exemplo)

---

### 2. Render.com

**Melhor para:** Deploy gratuito permanente

**Recursos grátis:**
- 750 horas/mês
- Suporte a WebSocket
- SSL automático
- Spin down após inatividade (mas reinicia ao acessar)

**Passos:**

1. Criar conta em https://render.com
2. Clicar em "New +" → "Web Service"
3. Conectar repositório do GitHub
4. Configurar:
   - Name: `multiwordle`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Selecionar plano FREE
6. Clicar em "Create Web Service"

**Observação:** Serviço hiberna após 15 min de inatividade (primeiro acesso pode demorar 30s)

---

### 3. Fly.io

**Melhor para:** Performance, edge computing

**Recursos grátis:**
- 3 VMs shared-cpu-1x
- 160GB de tráfego/mês
- Suporte completo a WebSocket

**Passos:**

```bash
# 1. Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Criar app (na pasta do projeto)
fly launch

# Responder às perguntas:
# - App name: multiwordle (ou o que preferir)
# - Region: escolher a mais próxima (ex: gru para São Paulo)
# - PostgreSQL: No
# - Redis: No

# 4. Deploy
fly deploy

# 5. Ver status
fly status

# 6. Ver logs
fly logs
```

**URL gerada:**
`https://multiwordle.fly.dev` (exemplo)

---

### 4. Vercel + Backend Separado (AVANÇADO)

**Para:** Separar frontend e backend

**Frontend (Vercel):**
1. Deploy Next.js estático na Vercel
2. Desabilitar API routes

**Backend (Railway/Render):**
1. Criar repositório separado com apenas:
   - `server/`
   - `lib/`
   - `types/`
   - `package.json` (só dependências do backend)
2. Deploy no Railway ou Render

**Configuração:**
- Frontend: Variável `NEXT_PUBLIC_SOCKET_URL=wss://seu-backend.railway.app`

---

## Comparação das Opções

| Plataforma | Grátis | WebSocket | Performance | Facilidade | Limite |
|-----------|--------|-----------|-------------|------------|--------|
| Railway   | 500h/mês | ✅ Nativo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 5000+ |
| Render    | 750h/mês | ✅ Nativo | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 3000+ |
| Fly.io    | 3 VMs | ✅ Nativo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 5000+ |
| Vercel+   | Sim | ⚠️ Complexo | ⭐⭐⭐⭐⭐ | ⭐⭐ | 10000+ |

---

## Pós-Deploy

### Testar a aplicação

1. Acessar URL gerada
2. Criar sala de teste
3. Abrir em múltiplas abas
4. Jogar!

### Monitorar logs

**Railway:**
```bash
# Instalar CLI
npm i -g @railway/cli

# Ver logs
railway logs
```

**Render:**
- Ver logs no dashboard web

**Fly.io:**
```bash
fly logs
```

### Escalar (se necessário)

**Railway/Render:**
- Upgrade para plano pago (~$5/mês)
- Suporta 10.000+ conexões simultâneas

**Fly.io:**
```bash
# Adicionar mais VMs
fly scale count 3

# Aumentar memória
fly scale memory 512
```

---

## Testes de Carga no Deploy

Após fazer deploy, testar com:

```bash
# Editar tests/load-test.js
# Trocar SERVER_URL para sua URL de produção

SERVER_URL=https://sua-url.railway.app npm run test:load
```

---

## Troubleshooting

### WebSocket não conecta

1. Verificar se porta 3000 está aberta
2. Verificar CORS no servidor
3. Testar com `wss://` (não `ws://`)

### "Application error" / "Service unavailable"

1. Ver logs da plataforma
2. Verificar se build completou com sucesso
3. Verificar se `npm start` funciona localmente

### Timeout / Lentidão

1. Escolher região mais próxima dos usuários
2. Aumentar recursos da máquina (se em plano pago)
3. Implementar Redis para sessões (otimização futura)

---

## Domínio Customizado (Opcional)

### Railway
1. Settings → Domains → Add Domain
2. Adicionar CNAME no seu provedor de DNS

### Render
1. Settings → Custom Domain
2. Adicionar CNAME no seu provedor de DNS

### Fly.io
```bash
fly certs add seu-dominio.com
```

---

## Próximos Passos (Otimizações)

1. **Adicionar Redis** para persistência de salas
2. **Implementar PostgreSQL** para estatísticas
3. **CDN** para assets estáticos
4. **Load Balancer** para múltiplas instâncias
5. **Monitoring** com Sentry ou similar

---

## Custos Estimados

### Grátis (até 5000 usuários)
- Railway (500h/mês) ou Render (750h/mês) ou Fly.io
- **Custo: $0/mês**

### Escala Média (5000-50000 usuários)
- Railway/Render Pro: $5-20/mês
- Fly.io com 3-5 VMs: $10-30/mês
- **Custo: $5-30/mês**

### Escala Grande (50000+ usuários)
- Múltiplas instâncias + Load Balancer
- Redis cluster
- PostgreSQL
- **Custo: $50-200/mês**

---

## Suporte

Para problemas específicos de cada plataforma:
- Railway: https://railway.app/help
- Render: https://render.com/docs
- Fly.io: https://fly.io/docs
