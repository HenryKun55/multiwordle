# Teste Ao Vivo - Sala com Múltiplos Jogadores

## 🎯 O que faz

Este script simula **50 bots jogando ativamente** na mesma sala que você, permitindo observar em tempo real:
- Performance da UI
- Ranking com múltiplos jogadores
- Dropdown funcionando
- Scroll e responsividade
- Atualizações em tempo real

## 🚀 Como usar

### **Passo 1: Abra o jogo no navegador**

Local:
```
http://localhost:3000
```

Produção:
```
https://multiwordle.onrender.com
```

### **Passo 2: Entre na sala "salajogo"**

1. Digite o ID da sala: `salajogo`
2. Digite seu nome: `SeuNome`
3. Clique "Entrar na Sala"

### **Passo 3: Rode o script em outro terminal**

**Teste Local:**
```bash
npm run test:live
```

**Teste em Produção:**
```bash
npm run test:live:prod
```

### **Passo 4: Observe!**

Você vai ver no navegador:
- 50 bots entrando na sala (Bot1, Bot2, ..., Bot50)
- Ranking atualizando em tempo real
- Bots digitando palavras (aparece "Digitando: TESTE")
- Bots enviando tentativas
- Ranking ordenando automaticamente
- Dropdown com "Mostrar todos (+40)"

## 📊 O que o script faz

### **Comportamento dos Bots:**

1. **Conectam gradualmente** (100ms entre cada)
2. **Entram na sala "salajogo"**
3. **Começam a jogar:**
   - Escolhem palavra aleatória
   - Digitam letra por letra (200ms cada)
   - Enviam tentativa
   - Aguardam 2-5 segundos
   - 70% de chance de jogar novamente

4. **Palavras usadas:**
   - TESTE, CARRO, TERMO, JOGO, LIVRE
   - TEMPO, CASA, MESA, PORTA, JANELA
   - BARBA, MORTE, BEIJO, VERDE, BRAVO
   - E mais 10 palavras...

### **Status no Terminal:**

```
╔════════════════════════════════════════╗
║         STATUS DA SIMULAÇÃO            ║
╠════════════════════════════════════════╣
║ Conectados:   50 / 50                  ║
║ Jogando:      50 / 50                  ║
║ Tentativas:  143                       ║
║ Erros:         0                       ║
╚════════════════════════════════════════╝
```

Atualiza a cada 5 segundos.

## 🎮 Customização

### **Mudar número de jogadores:**

```bash
# 30 jogadores
ROOM_ID=salajogo NUM_PLAYERS=30 node tests/live-room-test.js

# 80 jogadores
ROOM_ID=salajogo NUM_PLAYERS=80 node tests/live-room-test.js
```

### **Mudar nome da sala:**

```bash
# Sala diferente
ROOM_ID=minha-sala NUM_PLAYERS=50 node tests/live-room-test.js
```

### **Testar em produção:**

```bash
SERVER_URL=https://multiwordle.onrender.com ROOM_ID=salajogo NUM_PLAYERS=50 node tests/live-room-test.js
```

### **Delay entre conexões:**

```bash
# Mais rápido (50ms)
DELAY=50 npm run test:live

# Mais lento (200ms)
DELAY=200 npm run test:live
```

## 🛑 Parar o teste

Pressione `Ctrl+C` no terminal.

O script vai:
1. Desconectar todos os bots
2. Mostrar estatísticas finais
3. Encerrar graciosamente

## 🔍 O que observar no navegador

### ✅ **Checklist de Performance:**

- [ ] Ranking carrega rapidamente
- [ ] Mostra "50 jogadores" no header
- [ ] Sua posição aparece (#X)
- [ ] Top 10 visíveis inicialmente
- [ ] Botão "Mostrar todos (+40)" aparece
- [ ] Clicar expande a lista
- [ ] Scroll funciona suavemente
- [ ] "Digitando: XXXXX" aparece em tempo real
- [ ] Tentativas atualizam instantaneamente
- [ ] Ranking reordena quando alguém acerta
- [ ] UI não trava ou congela
- [ ] Sem scroll horizontal
- [ ] Grid do jogo continua funcionando

### 🎨 **Layout esperado:**

```
┌──────────────────────────────────────┐
│ MultiWordle        Sala: salajogo    │
│                    Jogador: SeuNome  │
├─────────────────┬────────────────────┤
│                 │ Ranking (50) #23   │
│  Grid do Jogo   ├────────────────────┤
│                 │ 1  Bot12  ✓ Acertou│
│  [Teclado]      │ 2  Bot45  ⏱ Jogando│
│                 │ ...                │
│                 │ 10 Bot8   ⏱ Jogando│
│                 │ [Mostrar todos +40]│
└─────────────────┴────────────────────┘
```

## 🐛 Troubleshooting

### **Erro "Sala cheia"**
- Limite é 100 jogadores total
- Reduza NUM_PLAYERS ou use sala diferente

### **Rate limiting**
- Aumentar DELAY entre conexões
- Usar DELAY=200 ou mais

### **Servidor não responde**
- Verificar se npm run dev está rodando (local)
- Verificar se Render está online (produção)

### **Bots não aparecem no ranking**
- Aguardar alguns segundos
- Verificar console do navegador (F12)
- Verificar logs no terminal do servidor

## 📈 Métricas esperadas

### **Bom desempenho:**
- Conexão de 50 bots: < 10 segundos
- Renderização do ranking: < 1 segundo
- Scroll suave (60 FPS)
- Sem travamentos

### **Performance aceitável:**
- Até 100 jogadores: UI responsiva
- Atualizações em tempo real
- Ranking ordena corretamente

## 💡 Dicas

1. **Abra DevTools (F12)** para ver Network e Performance
2. **Grave tela** para análise posterior
3. **Teste em diferentes navegadores**
4. **Teste em mobile** (emulação ou device real)
5. **Monitore CPU/memória** no Task Manager

## 🎥 Cenários de teste

### **Cenário 1: Stress básico**
```bash
npm run test:live
```
Observe: UI estável com 50 jogadores

### **Cenário 2: Capacidade máxima**
```bash
ROOM_ID=salajogo NUM_PLAYERS=80 node tests/live-room-test.js
```
Observe: Comportamento próximo ao limite (100)

### **Cenário 3: Entrada gradual**
```bash
DELAY=500 NUM_PLAYERS=50 node tests/live-room-test.js
```
Observe: Como UI lida com entradas espaçadas

## 📝 Relatório de teste

Após o teste, anote:
- ✅ UI manteve estável
- ✅ Ranking funcionou corretamente
- ✅ Dropdown expandiu/colapsou
- ✅ Scroll suave
- ✅ Sem travamentos
- ⚠️ Pequeno lag ao expandir (aceitável)
- ❌ Quebrou após X jogadores (bug!)

## 🚀 Próximos passos

Se tudo funcionar bem com 50 jogadores:
1. Testar com 80
2. Testar com 100 (limite)
3. Deploy em produção
4. Teste com usuários reais
