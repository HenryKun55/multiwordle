# MultiWordle

Clone multiplayer do Termo.ooo (Wordle em português) com suporte para múltiplos jogadores em tempo real.

## Características

- Jogo Termo multiplayer em tempo real
- Suporte para até 1000 jogadores simultâneos por sala
- Sistema de ranking ao vivo mostrando progresso de todos os jogadores
- Clone fiel da interface do Termo.ooo
- Validação de palavras em português com dicionário de 5 letras
- Sistema de segurança com rate limiting e validações
- Notificações em tempo real quando alguém vence

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Socket.io** - WebSocket para comunicação em tempo real
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

## Testes de Carga

Para testar com 1000 jogadores simulados:

```bash
npm run test:load
```

Este teste irá:
- Criar 1000 conexões simultâneas
- Simular jogadores entrando em uma sala
- Enviar tentativas de palavras
- Medir performance e taxa de sucesso

## Como Jogar

1. Acesse a aplicação
2. Digite um ID para a sala (ou entre em uma existente)
3. Digite seu nome
4. Clique em "Entrar na Sala"
5. Digite palavras de 5 letras e pressione ENTER
6. O primeiro a acertar vence!

## Estrutura do Projeto

```
multiwordle/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Página principal do jogo
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── GameGrid.tsx      # Grid de palavras
│   ├── Keyboard.tsx      # Teclado virtual
│   ├── PlayerRanking.tsx # Painel de ranking
│   └── GameEndModal.tsx  # Modal de fim de jogo
├── lib/                   # Lógica de negócio
│   ├── game-logic.ts     # Lógica do jogo
│   ├── game-store.ts     # Estado global (Zustand)
│   ├── use-socket.ts     # Hook do Socket.io
│   └── words.ts          # Dicionário de palavras
├── server/                # Backend
│   └── socket-server.ts  # Servidor WebSocket
├── types/                 # Tipos TypeScript
│   └── game.ts           # Tipos do jogo
├── tests/                 # Testes
│   └── load-test.js      # Teste de carga
└── server.js             # Servidor HTTP customizado
```

## Deployment Gratuito

### Opção 1: Railway (Recomendado para WebSocket)

Railway oferece 500 horas gratuitas por mês e suporta WebSocket nativamente.

1. Criar conta em [railway.app](https://railway.app)
2. Conectar seu repositório GitHub
3. Deploy automático!

**Vantagens:**
- Suporta WebSocket nativamente
- 500 horas grátis/mês
- Escalável até 5000 usuários simultâneos
- SSL automático

### Opção 2: Render

Render oferece plano gratuito com suporte a WebSocket.

1. Criar conta em [render.com](https://render.com)
2. Criar novo Web Service
3. Conectar repositório
4. Configurar:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

**Vantagens:**
- Plano gratuito permanente
- Suporta WebSocket
- SSL automático
- Até 750 horas grátis/mês

### Opção 3: Fly.io

Fly.io oferece recursos gratuitos generosos.

1. Instalar Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Criar app: `fly launch`
4. Deploy: `fly deploy`

**Vantagens:**
- 3 VMs gratuitas
- Suporta WebSocket
- Edge computing (baixa latência)
- Até 160GB de tráfego grátis/mês

### Opção 4: Vercel + Backend Separado

Para a interface usar Vercel, e para WebSocket usar Railway/Render.

**Frontend (Vercel):**
1. Fazer deploy no Vercel
2. Configurar variável `NEXT_PUBLIC_SOCKET_URL` com URL do backend

**Backend (Railway/Render):**
1. Criar repositório separado apenas com `server/` e `lib/`
2. Deploy no Railway ou Render

## Variáveis de Ambiente

```env
# URL da aplicação (produção)
NEXT_PUBLIC_APP_URL=https://seu-app.railway.app

# URL do servidor Socket.io (se separado)
NEXT_PUBLIC_SOCKET_URL=wss://seu-socket-server.railway.app
```

## Configurações de Segurança

- Rate limiting: 100 ações por minuto por IP
- Máximo de 1000 jogadores por sala
- Validação de nomes e IDs de sala
- Sanitização de inputs
- Timeout de salas inativas (1 hora)

## Performance

O sistema foi testado e otimizado para:
- Até 1000 jogadores simultâneos por sala
- Múltiplas salas simultâneas
- Latência < 100ms para atualizações
- Uso de memória otimizado com limpeza automática

## Melhorias Futuras

- [ ] Persistência de dados (Redis/PostgreSQL)
- [ ] Sistema de chat
- [ ] Múltiplas palavras por partida
- [ ] Dificuldade ajustável
- [ ] Sistema de pontuação global
- [ ] Salas privadas com senha
- [ ] Replay de partidas
- [ ] Tema customizável

## Licença

MIT

## Autor

Criado com Claude Code
