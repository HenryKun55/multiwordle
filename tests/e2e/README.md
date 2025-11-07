# Testes E2E com Playwright

## 🎭 O que testamos

### 1. **Fluxo do Jogo**
- ✅ Carregamento da página inicial
- ✅ Validação de campos obrigatórios
- ✅ Criação de ID de sala aleatório
- ✅ Validação de tamanho do nome
- ✅ Status de conexão
- ✅ Entrada em uma sala

### 2. **Interface do Jogo**
- ✅ Header com informações da sala
- ✅ Grid de tentativas
- ✅ Teclado virtual
- ✅ Ranking com jogador atual

### 3. **Ranking com Dropdown**
- ✅ Botão "Mostrar todos" com 10+ jogadores
- ✅ Contador de jogadores ocultos
- ✅ Expansão/colapso da lista

### 4. **Responsividade**
- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)
- ✅ Desktop (1280x720)

## 🚀 Como rodar os testes

### Modo Headless (CI/CD)
```bash
npm run test:e2e
```

### Modo com Interface Gráfica (Recomendado)
```bash
npm run test:e2e:ui
```
- Interface interativa do Playwright
- Veja os testes rodando em tempo real
- Timeline visual de cada ação
- Screenshots automáticos

### Modo com Navegador Visível
```bash
npm run test:e2e:headed
```
- Abre o navegador Chrome
- Veja a interface real do jogo
- Útil para debugging visual

### Modo Debug
```bash
npm run test:e2e:debug
```
- Pausa execução em cada passo
- Inspeciona elementos
- Console de debugging

## 📊 Relatório de Testes

Após rodar os testes, um relatório HTML é gerado automaticamente:

```bash
npx playwright show-report
```

## 🎯 Estrutura dos Testes

```
tests/e2e/
├── game-flow.spec.ts       # Testes do fluxo principal
└── README.md               # Este arquivo
```

## 🔧 Configuração

O arquivo `playwright.config.ts` na raiz do projeto configura:
- **Base URL**: http://localhost:3000
- **Navegador**: Chrome
- **Screenshots**: Apenas em falhas
- **Trace**: Na primeira tentativa de retry
- **Web Server**: Inicia automaticamente com `npm run dev`

## 📝 Escrevendo Novos Testes

Exemplo:

```typescript
import { test, expect } from '@playwright/test';

test('meu novo teste', async ({ page }) => {
  await page.goto('/');

  // Interagir com elementos
  await page.click('button:has-text("Criar Sala")');

  // Verificar resultados
  await expect(page.locator('h1')).toContainText('MultiWordle');
});
```

## 🐛 Troubleshooting

### Testes falhando localmente?
1. Certifique-se que o servidor está rodando: `npm run dev`
2. Limpe o cache: `npx playwright clean`
3. Reinstale browsers: `npx playwright install`

### Timeout errors?
- Aumentar timeout no `playwright.config.ts`
- Verificar se WebSocket conectou corretamente
- Verificar logs do servidor

## 🎨 Testando Visualmente

Use o modo UI para:
- Ver exatamente o que o teste está fazendo
- Pausar e inspecionar elementos
- Ver screenshots de cada passo
- Debugar falhas interativamente

```bash
npm run test:e2e:ui
```

## 📸 Screenshots Automáticos

Em caso de falha, screenshots são salvos em:
```
test-results/
├── game-flow-spec-ts-deve-carregar-a-pagina-inicial-chromium/
│   └── test-failed-1.png
```

## 🔄 CI/CD

Para rodar em CI/CD (GitHub Actions, etc):

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## 📚 Documentação

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
