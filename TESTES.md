# Guia de Testes de Carga - MultiWordle

## 🚀 Como Testar

### Teste Local (antes do deploy)

1. **Iniciar o servidor em um terminal:**
```bash
npm run dev
```

2. **Em outro terminal, rodar o teste:**

```bash
# Teste rápido com 10 jogadores (30s)
npm run test:load:10

# Teste médio com 50 jogadores (45s)
npm run test:load:50

# Teste moderado com 80 jogadores (60s) - RECOMENDADO
npm run test:load:80

# Teste COMPLETO com 100 jogadores (60s) - CAPACIDADE MÁXIMA
npm run test:load:100
```

### Teste em Produção (após deploy)

```bash
# Teste COMPLETO com 100 jogadores no servidor de produção
npm run test:load:prod

# OU customize a URL
SERVER_URL=https://multiwordle.onrender.com NUM_PLAYERS=100 DELAY=100 node tests/load-test.js
```

**Configurações do teste em produção:**
- **100 jogadores simultâneos** (100% da capacidade máxima)
- **100ms de delay** entre conexões (evita rate limiting)
- **90 segundos de duração** (tempo suficiente para testar estabilidade)
- Testa capacidade MÁXIMA do servidor free tier

**⚠️ LIMITE DO SERVIDOR: 100 conexões simultâneas**
- Protege o servidor free tier do Render
- Previne quedas por sobrecarga
- Todos os 100 jogadores devem conectar com sucesso
- Jogador 101 receberá mensagem "Servidor cheio"

---

## 📊 Interpretando os Resultados

### ✅ EXCELENTE
```
Taxa de sucesso: 99%+
Latência média: < 100ms
Throughput: > 100 msg/s
```
**Significa:** Sistema aguenta FÁCIL essa carga!

### ✅ BOM
```
Taxa de sucesso: 95-99%
Latência média: 100-500ms
Throughput: 50-100 msg/s
```
**Significa:** Sistema suporta essa carga bem.

### ⚠️ ACEITÁVEL
```
Taxa de sucesso: 90-95%
Latência média: 500-1000ms
Throughput: 20-50 msg/s
```
**Significa:** Sistema no LIMITE. Considere otimizar.

### ❌ CRÍTICO
```
Taxa de sucesso: < 90%
Latência média: > 1000ms
Throughput: < 20 msg/s
```
**Significa:** Sistema NÃO suporta essa carga.

---

## 🎯 Métricas Importantes

### Conexões
- **Conectados**: Quantos conseguiram se conectar ao WebSocket
- **Entraram na sala**: Quantos entraram na sala com sucesso
- **Taxa de sucesso**: % de jogadores que entraram (deve ser > 95%)

### Latência
- **Tempo de conexão**: Quanto demora para conectar no WebSocket
  - Excelente: < 100ms
  - Bom: 100-500ms
  - Ruim: > 500ms

- **Tempo para entrar**: Quanto demora para entrar na sala após conectar
  - Excelente: < 200ms
  - Bom: 200-800ms
  - Ruim: > 800ms

### Performance
- **Mensagens/segundo**: Quantas mensagens enviadas por segundo
- **Throughput**: Total de mensagens (enviadas + recebidas) por segundo
- **Pico de memória**: Memória máxima usada pelo teste
  - Normal: < 200MB para 1000 jogadores
  - Alto: 200-500MB
  - Crítico: > 500MB

---

## 🔧 Testes Customizados

Você pode customizar os testes com variáveis de ambiente:

```bash
# Testar com 2000 jogadores por 2 minutos
NUM_PLAYERS=2000 DURATION=120000 node tests/load-test.js

# Testar em sala específica
ROOM_ID=minha-sala NUM_PLAYERS=500 node tests/load-test.js

# Teste mais lento (menos carga no servidor)
DELAY=50 NUM_PLAYERS=1000 node tests/load-test.js

# Teste super rápido (mais carga)
DELAY=1 NUM_PLAYERS=500 DURATION=30000 node tests/load-test.js
```

### Variáveis Disponíveis

- `SERVER_URL`: URL do servidor (padrão: http://localhost:3000)
- `ROOM_ID`: ID da sala de teste (padrão: teste-carga)
- `NUM_PLAYERS`: Número de jogadores (padrão: 1000)
- `DELAY`: Delay entre conexões em ms (padrão: 10)
- `DURATION`: Duração do teste em ms (padrão: 60000 = 60s)

---

## 🎮 Exemplo de Saída

```
===================================
TESTE DE CARGA - MultiWordle
===================================
Servidor: http://localhost:3000
Sala: teste-carga
Jogadores: 1000
Delay: 10ms
Duração: 60s
===================================

[100/1000] Player99 conectado (45ms)
[200/1000] Player199 conectado (52ms)
...
✓ Player99 entrou na sala (100/1000) - 128ms
...

[10s] Conectados: 1000 | Na sala: 998 | Tentativas: 245 | Mem: 156.23MB
[15s] Conectados: 1000 | Na sala: 1000 | Tentativas: 512 | Mem: 178.45MB
...

===================================
RESULTADOS DO TESTE DE CARGA
===================================

📊 CONEXÕES
- Tentativas: 1000
- Conectados: 1000 (100.00%)
- Entraram na sala: 998 (99.80%)
- Erros: 0
- Desconexões: 2

⏱️  LATÊNCIA
- Tempo médio de conexão: 87.23ms
- Tempo máximo de conexão: 234.56ms
- Tempo médio para entrar: 156.78ms
- Tempo máximo para entrar: 456.89ms

🎮 GAMEPLAY
- Tentativas enviadas: 2456
- Média por jogador: 2.46
- Total de mensagens enviadas: 18234
- Total de mensagens recebidas: 45678

⚡ PERFORMANCE
- Mensagens/segundo: 304.56
- Throughput total: 1066.87 msg/s
- Pico de memória: 189.45MB
- Tempo total: 65.23s

===================================

📈 AVALIAÇÃO:
✅ EXCELENTE - Sistema suporta esta carga perfeitamente!
✅ Latência de conexão excelente

💡 RECOMENDAÇÃO:
   Sistema suporta 1000 jogadores com facilidade!
   Você pode tentar aumentar para 2000 jogadores.
```

---

## 🚨 Troubleshooting

### "ECONNREFUSED" ou "connect_error"
**Problema:** Servidor não está rodando
**Solução:** Execute `npm run dev` em outro terminal

### Taxa de sucesso muito baixa (< 80%)
**Problema:** Servidor sobrecarregado
**Solução:**
- Aumente o `DELAY` entre conexões (ex: `DELAY=50`)
- Reduza o número de jogadores
- Verifique recursos da máquina

### Memória muito alta (> 500MB)
**Problema:** Possível memory leak
**Solução:**
- Verifique se está desconectando sockets corretamente
- Reduza duração do teste
- Rode `npm run build` antes para modo produção

### Latência muito alta (> 1000ms)
**Problema:** Rede lenta ou servidor distante
**Solução:**
- Para testes locais: verifique outros processos consumindo CPU
- Para produção: escolha servidor próximo dos usuários

---

## 📈 Metas de Performance

Para um jogo competitivo online, busque:

| Métrica | Meta | Excelente |
|---------|------|-----------|
| Taxa de sucesso | > 95% | > 99% |
| Latência conexão | < 200ms | < 100ms |
| Latência jogo | < 300ms | < 150ms |
| Throughput | > 50 msg/s | > 100 msg/s |
| Memória (1000) | < 300MB | < 200MB |

---

## 💡 Dicas

1. **Sempre teste localmente primeiro** antes de fazer deploy
2. **Comece pequeno** (10 → 100 → 500 → 1000 jogadores)
3. **Monitore a memória** durante testes longos
4. **Compare** resultados local vs produção
5. **Documente** suas métricas para referência futura

---

## 🎯 Próximos Passos

Depois de testar com sucesso 1000 jogadores:

1. ✅ Fazer deploy no Railway/Render
2. ✅ Testar em produção com `npm run test:load:prod`
3. ✅ Compartilhar com amigos para teste real
4. 🚀 Escalar conforme necessário!
