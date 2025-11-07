import { test, expect } from '@playwright/test';

test.describe('MultiWordle - Teste de Stress do Ranking', () => {
  test('deve manter UI estável com 50+ jogadores no ranking', async ({ page }) => {
    // Ir para a página
    await page.goto('/');

    // Entrar em uma sala de teste
    await page.locator('input[placeholder*="rapido-jogo"]').fill('stress-test-50');
    await page.locator('input[placeholder*="Digite seu nome"]').fill('Stress Tester');
    await page.waitForSelector('text=/Status:.*Conectado/', { timeout: 10000 });
    await page.locator('button:has-text("Entrar na Sala")').click();

    // Aguardar entrar na sala
    await expect(page.locator('text=Ranking')).toBeVisible({ timeout: 10000 });

    // Simular 50 jogadores através do socket (mock)
    // Vamos injetar dados mock de 50 jogadores
    await page.evaluate(() => {
      // Acessar o store do Zustand e adicionar jogadores mock
      const mockPlayers = [];
      for (let i = 1; i <= 50; i++) {
        mockPlayers.push({
          id: `player-${i}`,
          name: `Player ${i}`,
          guesses: [],
          currentGuess: '',
          gameStatus: 'playing',
          attempts: Math.floor(Math.random() * 6),
          lastUpdate: Date.now(),
        });
      }

      // Tentar atualizar o store (isso pode variar dependendo da implementação)
      // Como é Zustand, vamos tentar acessar diretamente
      const store = (window as any).__ZUSTAND_STORE__;
      if (store) {
        store.setState({ players: mockPlayers });
      }
    });

    // Aguardar um pouco para renderizar
    await page.waitForTimeout(1000);

    // TESTES DE LAYOUT E INTEGRIDADE DA UI

    // 1. Verificar que o ranking container existe e está visível
    const rankingContainer = page.locator('.bg-gray-100.dark\\:bg-gray-800.rounded-lg').first();
    await expect(rankingContainer).toBeVisible();

    // 2. Verificar que mostra "50 jogadores"
    await expect(page.locator('text=/50 jogador/')).toBeVisible();

    // 3. Verificar que mostra apenas 10 jogadores inicialmente
    const playerCards = page.locator('[class*="border-2"][class*="rounded-lg"]');
    const visibleCount = await playerCards.count();
    expect(visibleCount).toBeLessThanOrEqual(11); // 10 jogadores + possível jogador atual destacado

    // 4. Verificar que o botão "Mostrar todos" está visível
    const showAllButton = page.locator('button:has-text("Mostrar todos")');
    await expect(showAllButton).toBeVisible();

    // 5. Verificar texto do botão indica 40 jogadores ocultos
    await expect(showAllButton).toContainText('+40');

    // 6. Verificar altura do container do ranking
    const rankingBox = await rankingContainer.boundingBox();
    expect(rankingBox).toBeTruthy();

    if (rankingBox) {
      // Altura deve ser razoável (não quebrada)
      expect(rankingBox.height).toBeGreaterThan(200);
      expect(rankingBox.height).toBeLessThan(1000);
    }

    // 7. Verificar que NÃO há scroll horizontal
    const hasHorizontalScroll = await page.evaluate(() => {
      const container = document.querySelector('.bg-gray-100') as HTMLElement;
      return container ? container.scrollWidth > container.clientWidth : false;
    });
    expect(hasHorizontalScroll).toBe(false);

    // 8. Clicar para expandir lista completa
    await showAllButton.click();
    await page.waitForTimeout(500);

    // 9. Verificar que agora mostra mais jogadores
    const expandedCount = await playerCards.count();
    expect(expandedCount).toBeGreaterThan(40);

    // 10. Verificar que botão mudou para "Mostrar menos"
    const showLessButton = page.locator('button:has-text("Mostrar menos")');
    await expect(showLessButton).toBeVisible();

    // 11. Verificar que a área de scroll funciona
    const scrollContainer = page.locator('.flex-1.overflow-y-auto');
    await expect(scrollContainer).toBeVisible();

    // 12. Verificar que pode fazer scroll
    const canScroll = await scrollContainer.evaluate((el) => {
      return el.scrollHeight > el.clientHeight;
    });
    expect(canScroll).toBe(true);

    // 13. Fazer scroll até o final
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(300);

    // 14. Verificar que último jogador está visível após scroll
    await expect(page.locator('text=Player 50')).toBeVisible();

    // 15. Verificar altura após expansão - deve manter container estável
    const expandedBox = await rankingContainer.boundingBox();
    if (expandedBox) {
      // Altura deve ser similar (container tem altura fixa com scroll interno)
      expect(Math.abs((rankingBox?.height || 0) - expandedBox.height)).toBeLessThan(100);
    }

    // 16. Clicar para recolher lista
    await showLessButton.click();
    await page.waitForTimeout(500);

    // 17. Verificar que voltou a mostrar apenas 10
    const collapsedCount = await playerCards.count();
    expect(collapsedCount).toBeLessThanOrEqual(11);

    // 18. Verificar que botão voltou para "Mostrar todos"
    await expect(page.locator('button:has-text("Mostrar todos")')).toBeVisible();

    // TESTES DE NÃO QUEBRA DE LAYOUT

    // 19. Verificar que o grid principal do jogo ainda está visível
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible();

    // 20. Verificar que o header não foi afetado
    await expect(page.locator('text=/Sala:/')).toBeVisible();

    // 21. Screenshot para validação visual
    await page.screenshot({ path: 'test-results/ranking-with-50-players.png', fullPage: true });
  });

  test('deve manter performance com 100 jogadores no ranking', async ({ page }) => {
    await page.goto('/');

    // Entrar em uma sala de teste
    await page.locator('input[placeholder*="rapido-jogo"]').fill('stress-test-100');
    await page.locator('input[placeholder*="Digite seu nome"]').fill('Perf Tester');
    await page.waitForSelector('text=/Status:.*Conectado/', { timeout: 10000 });
    await page.locator('button:has-text("Entrar na Sala")').click();
    await expect(page.locator('text=Ranking')).toBeVisible({ timeout: 10000 });

    // Medir tempo de renderização com 100 jogadores
    const startTime = Date.now();

    await page.evaluate(() => {
      const mockPlayers = [];
      for (let i = 1; i <= 100; i++) {
        mockPlayers.push({
          id: `player-${i}`,
          name: `Player ${i}`,
          guesses: [],
          currentGuess: '',
          gameStatus: i <= 10 ? 'won' : i <= 20 ? 'lost' : 'playing',
          attempts: Math.floor(Math.random() * 6),
          lastUpdate: Date.now(),
        });
      }

      const store = (window as any).__ZUSTAND_STORE__;
      if (store) {
        store.setState({ players: mockPlayers });
      }
    });

    await page.waitForTimeout(1000);
    const renderTime = Date.now() - startTime;

    // Renderização deve ser rápida (< 3 segundos)
    expect(renderTime).toBeLessThan(3000);

    // Verificar que UI responde
    await expect(page.locator('text=/100 jogador/')).toBeVisible();
    await expect(page.locator('button:has-text("Mostrar todos")')).toBeVisible();

    // Expandir e verificar performance do scroll
    await page.locator('button:has-text("Mostrar todos")').click();
    await page.waitForTimeout(500);

    // Fazer scroll múltiplas vezes para testar performance
    const scrollContainer = page.locator('.flex-1.overflow-y-auto');

    for (let i = 0; i < 5; i++) {
      await scrollContainer.evaluate((el) => {
        el.scrollTop = (el.scrollHeight / 5) * i;
      });
      await page.waitForTimeout(100);
    }

    // UI deve permanecer responsiva
    await expect(page.locator('button:has-text("Mostrar menos")')).toBeVisible();

    // Screenshot final
    await page.screenshot({ path: 'test-results/ranking-with-100-players.png', fullPage: true });
  });

  test('deve manter elementos visíveis mesmo com ranking expandido', async ({ page }) => {
    await page.goto('/');

    await page.locator('input[placeholder*="rapido-jogo"]').fill('layout-test');
    await page.locator('input[placeholder*="Digite seu nome"]').fill('Layout Tester');
    await page.waitForSelector('text=/Status:.*Conectado/', { timeout: 10000 });
    await page.locator('button:has-text("Entrar na Sala")').click();
    await expect(page.locator('text=Ranking')).toBeVisible({ timeout: 10000 });

    // Adicionar 30 jogadores
    await page.evaluate(() => {
      const mockPlayers = [];
      for (let i = 1; i <= 30; i++) {
        mockPlayers.push({
          id: `player-${i}`,
          name: `Player ${i}`,
          guesses: [
            {
              word: 'TESTE',
              letters: [
                { char: 'T', status: 'correct' },
                { char: 'E', status: 'present' },
                { char: 'S', status: 'absent' },
                { char: 'T', status: 'correct' },
                { char: 'E', status: 'present' },
              ],
            },
          ],
          currentGuess: '',
          gameStatus: 'playing',
          attempts: 1,
          lastUpdate: Date.now(),
        });
      }

      const store = (window as any).__ZUSTAND_STORE__;
      if (store) {
        store.setState({ players: mockPlayers });
      }
    });

    await page.waitForTimeout(1000);

    // Expandir ranking
    await page.locator('button:has-text("Mostrar todos")').click();
    await page.waitForTimeout(500);

    // VERIFICAR QUE ELEMENTOS PRINCIPAIS PERMANECEM VISÍVEIS

    // 1. Header
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible();

    // 2. Grid do jogo (área à esquerda)
    const gameGrid = page.locator('[class*="lg\\:col-span-2"]').first();
    await expect(gameGrid).toBeVisible();

    // 3. Teclado
    await expect(page.locator('button:has-text("ENTER")')).toBeVisible();

    // 4. Ranking (área à direita)
    const rankingArea = page.locator('[class*="lg\\:col-span-1"]').first();
    await expect(rankingArea).toBeVisible();

    // 5. Verificar que não há overflow visível quebrando layout
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > body.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // 6. Verificar proporções do grid (2/3 vs 1/3)
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
      const gameGridBox = await gameGrid.boundingBox();
      const rankingBox = await rankingArea.boundingBox();

      if (gameGridBox && rankingBox) {
        // Grid do jogo deve ocupar ~66% da largura
        // Ranking deve ocupar ~33% da largura
        const gameRatio = gameGridBox.width / viewport.width;
        const rankingRatio = rankingBox.width / viewport.width;

        expect(gameRatio).toBeGreaterThan(0.5);
        expect(gameRatio).toBeLessThan(0.75);
        expect(rankingRatio).toBeGreaterThan(0.2);
        expect(rankingRatio).toBeLessThan(0.4);
      }
    }

    // Screenshot para análise visual
    await page.screenshot({
      path: 'test-results/layout-with-expanded-ranking.png',
      fullPage: true
    });
  });
});
