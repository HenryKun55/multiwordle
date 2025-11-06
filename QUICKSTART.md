# Guia de Início Rápido

## Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 3. Testar o jogo

1. Abra duas abas do navegador
2. Em ambas, acesse `http://localhost:3000`
3. Use o mesmo ID de sala (ex: "teste")
4. Use nomes diferentes em cada aba
5. Jogue!

### 4. Testar com 1000 jogadores (opcional)

Em outro terminal:

```bash
npm run test:load
```

## Estrutura de uma Partida

1. **Entrar na sala**: Digite ID da sala e seu nome
2. **Jogar**: Digite palavras de 5 letras e pressione ENTER
3. **Ganhar**: Primeiro a acertar a palavra vence!
4. **Ranking**: Acompanhe o progresso de todos em tempo real

## Cores das Letras

- 🟩 **Verde**: Letra correta na posição correta
- 🟨 **Amarelo**: Letra existe mas na posição errada
- ⬛ **Cinza**: Letra não existe na palavra

## Deploy

### Railway (Recomendado)

1. Criar conta em railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Selecionar este repositório
4. Deploy automático!

URL será algo como: `https://multiwordle-production.up.railway.app`

### Render

1. Criar conta em render.com
2. "New Web Service" → Conectar repositório
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Deploy!

### Fly.io

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Criar e fazer deploy
fly launch
```

## Dicas

- Máximo de 1000 jogadores por sala
- Salas inativas são removidas após 1 hora
- Use IDs de sala curtos e fáceis de lembrar
- Para salas privadas, use IDs complexos

## Troubleshooting

### Socket não conecta

1. Verifique se o servidor está rodando
2. Limpe o cache do navegador
3. Tente usar outro navegador

### "Palavra não encontrada"

A palavra precisa estar no dicionário de palavras válidas em português.
São aceitas apenas palavras comuns de 5 letras.

### Lag/Lentidão

Com muitos jogadores, pode haver latência. Recomendado:
- Máximo 100-200 jogadores por sala para melhor experiência
- Use deployment em servidor dedicado (Railway/Render)

## Recursos Adicionais

- 📝 README completo: [README.md](README.md)
- 🧪 Testes de carga: `npm run test:load`
- 📊 Monitorar performance: Ver console do servidor
