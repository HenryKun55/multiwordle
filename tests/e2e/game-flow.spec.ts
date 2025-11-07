import { test, expect } from '@playwright/test';

test.describe('MultiWordle - Fluxo do Jogo', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');

    // Verificar título
    await expect(page.locator('h1')).toContainText('MultiWordle');

    // Verificar descrição
    await expect(page.locator('text=Termo multiplayer em tempo real')).toBeVisible();

    // Verificar campos de entrada
    await expect(page.locator('input[placeholder*="rapido-jogo"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Digite seu nome"]')).toBeVisible();

    // Verificar botão criar sala
    await expect(page.locator('button:has-text("Criar Sala Nova")')).toBeVisible();

    // Verificar botão entrar
    await expect(page.locator('button:has-text("Entrar na Sala")')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/');

    // Botão deve estar desabilitado sem preencher campos
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Preencher apenas nome
    await page.locator('input[placeholder*="Digite seu nome"]').fill('TestPlayer');
    await expect(submitButton).toBeDisabled();

    // Preencher ID da sala também
    await page.locator('input[placeholder*="rapido-jogo"]').fill('test-room-123');
    await expect(submitButton).toBeEnabled();
  });

  test('deve criar um ID de sala aleatório', async ({ page }) => {
    await page.goto('/');

    const roomInput = page.locator('input[placeholder*="rapido-jogo"]');

    // Campo deve estar vazio inicialmente
    await expect(roomInput).toHaveValue('');

    // Clicar em "Criar Sala Nova"
    await page.locator('button:has-text("Criar Sala Nova")').click();

    // Campo deve ser preenchido automaticamente
    const roomValue = await roomInput.inputValue();
    expect(roomValue).toBeTruthy();
    expect(roomValue.length).toBeGreaterThan(5);
    expect(roomValue).toMatch(/^[a-z]+-[a-z]+-\d+$/);
  });

  test('deve validar tamanho do nome', async ({ page }) => {
    await page.goto('/');

    const nameInput = page.locator('input[placeholder*="Digite seu nome"]');

    // Nome deve ter no mínimo 2 caracteres (HTML5 validation)
    await nameInput.fill('A');
    await expect(nameInput).toHaveAttribute('minlength', '2');

    // Nome deve ter no máximo 20 caracteres
    await expect(nameInput).toHaveAttribute('maxlength', '20');
  });

  test('deve mostrar status de conexão', async ({ page }) => {
    await page.goto('/');

    // Deve mostrar status de conexão
    await expect(page.locator('text=/Status:.*Conectado|Desconectado/')).toBeVisible();
  });

  test('deve entrar em uma sala (integração)', async ({ page }) => {
    await page.goto('/');

    // Preencher formulário
    await page.locator('input[placeholder*="rapido-jogo"]').fill('test-e2e-room');
    await page.locator('input[placeholder*="Digite seu nome"]').fill('E2E Player');

    // Aguardar conexão
    await page.waitForSelector('text=/Status:.*Conectado/', { timeout: 10000 });

    // Clicar para entrar
    await page.locator('button:has-text("Entrar na Sala")').click();

    // Aguardar entrar na sala (tela deve mudar)
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible({ timeout: 10000 });

    // Verificar que saiu da tela de entrada e entrou no jogo
    // Deve ter o ranking visível
    await expect(page.locator('text=Ranking')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('MultiWordle - Interface do Jogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Entrar em uma sala para testar interface
    await page.locator('input[placeholder*="rapido-jogo"]').fill('test-ui-room');
    await page.locator('input[placeholder*="Digite seu nome"]').fill('UI Tester');
    await page.waitForSelector('text=/Status:.*Conectado/', { timeout: 10000 });
    await page.locator('button:has-text("Entrar na Sala")').click();

    // Aguardar carregar interface do jogo
    await expect(page.locator('text=Ranking')).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar header com informações da sala', async ({ page }) => {
    // Verificar título
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible();

    // Verificar info da sala
    await expect(page.locator('text=/Sala:.*test-ui-room/')).toBeVisible();

    // Verificar info do jogador
    await expect(page.locator('text=Jogador')).toBeVisible();
    await expect(page.locator('text=UI Tester')).toBeVisible();
  });

  test('deve mostrar grid do jogo', async ({ page }) => {
    // Deve ter um grid de tentativas
    const gameGrid = page.locator('[class*="grid"]').first();
    await expect(gameGrid).toBeVisible();
  });

  test('deve mostrar teclado virtual', async ({ page }) => {
    // Verificar que o teclado tem letras
    await expect(page.locator('button:has-text("A")')).toBeVisible();
    await expect(page.locator('button:has-text("Z")')).toBeVisible();

    // Verificar botões especiais
    await expect(page.locator('button:has-text("ENTER")')).toBeVisible();
    await expect(page.locator('button:has-text("⌫")')).toBeVisible();
  });

  test('deve mostrar ranking com jogador atual', async ({ page }) => {
    // Verificar título do ranking
    await expect(page.locator('h2:has-text("Ranking")')).toBeVisible();

    // Deve mostrar pelo menos 1 jogador (nós mesmos)
    await expect(page.locator('text=/\\d+ jogador/')).toBeVisible();

    // Deve mostrar o nome do jogador no ranking
    await expect(page.locator('text=UI Tester')).toBeVisible();

    // Deve indicar que é "você"
    await expect(page.locator('text=(você)')).toBeVisible();
  });
});

test.describe('MultiWordle - Ranking com Dropdown', () => {
  test('deve mostrar botão de expandir quando há mais de 10 jogadores', async ({ page }) => {
    // Este teste seria executado em uma sala com muitos jogadores
    // Por enquanto, é um teste conceitual para documentação

    test.skip(true, 'Requer sala com 10+ jogadores');

    await page.goto('/');
    // ... entrar na sala com 15 jogadores

    // Deve mostrar botão "Mostrar todos"
    await expect(page.locator('button:has-text("Mostrar todos")')).toBeVisible();

    // Deve indicar quantos estão ocultos
    await expect(page.locator('text=/\\+\\d+/')).toBeVisible();

    // Clicar para expandir
    await page.locator('button:has-text("Mostrar todos")').click();

    // Botão deve mudar para "Mostrar menos"
    await expect(page.locator('button:has-text("Mostrar menos")')).toBeVisible();
  });
});

test.describe('MultiWordle - Responsividade', () => {
  test('deve funcionar em mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Verificar que elementos principais estão visíveis
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible();
    await expect(page.locator('input[placeholder*="rapido-jogo"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Digite seu nome"]')).toBeVisible();
  });

  test('deve funcionar em tablet', async ({ page }) => {
    // Configurar viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Verificar que elementos principais estão visíveis
    await expect(page.locator('h1:has-text("MultiWordle")')).toBeVisible();
    await expect(page.locator('button:has-text("Criar Sala Nova")')).toBeVisible();
  });
});
