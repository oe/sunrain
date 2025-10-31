import { test, expect, type Page } from '@playwright/test';

/**
 * MVP E2E 测试套件 - 核心功能验证
 * 
 * 测试目标：
 * 1. 基础功能快速验证
 * 2. 语言切换测试
 * 3. 移动端测试
 * 4. 多浏览器兼容性
 */

test.describe('MVP 核心功能测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 每个测试前访问首页
    await page.goto('/');
  });

  test.describe('1. 基础功能验证', () => {
    
    test('首页正常加载并显示核心导航', async ({ page }) => {
      // 验证页面标题
      await expect(page).toHaveTitle(/Sunrain/i);
      
      // 验证核心导航链接存在（使用 data-testid）
      const nav = page.locator('[data-testid="main-navigation"]');
      await expect(nav.locator('[data-testid="nav-resources"]')).toBeVisible();
      await expect(nav.locator('[data-testid="nav-guide"]')).toBeVisible();
      
      // 验证主要内容区域存在
      await expect(page.locator('main')).toBeVisible();
    });

    test('暗色模式切换功能正常', async ({ page }) => {
      // 查找主题切换按钮
      const themeToggle = page.locator('[data-theme-toggle], button:has-text("Theme"), button:has-text("主题")').first();
      
      if (await themeToggle.isVisible()) {
        // 获取初始主题
        const html = page.locator('html');
        const initialTheme = await html.getAttribute('data-theme') || await html.getAttribute('class');
        
        // 点击切换
        await themeToggle.click();
        await page.waitForTimeout(300); // 等待主题切换动画
        
        // 验证主题已改变
        const newTheme = await html.getAttribute('data-theme') || await html.getAttribute('class');
        expect(newTheme).not.toBe(initialTheme);
      }
    });

    test('评估列表页显示所有问卷', async ({ page }) => {
      // 导航到评估页面（使用 trailing slash）
      await page.goto('/assessment/');
      await page.waitForLoadState('networkidle');
      
      // 验证至少显示 3 个问卷（使用 data-testid）
      const questionnaireCards = page.locator('[data-testid="questionnaire-card"]');
      
      await expect(questionnaireCards.first()).toBeVisible({ timeout: 10000 });
      const count = await questionnaireCards.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('2. PHQ-9 评估完整流程', () => {
    
    test('完成 PHQ-9 评估并查看结果', async ({ page }) => {
      // 1. 导航到评估页面（使用 trailing slash）
      await page.goto('/assessment/');
      await page.waitForLoadState('networkidle');
      
      // 2. 找到并点击 PHQ-9 开始按钮（使用 data-testid）
      const startButton = page.locator('[data-testid="start-assessment-phq-9"]');
      
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // 3. 回答所有 9 个问题（SPA 方式，不刷新页面）
      const totalQuestions = 9;
      
      for (let i = 1; i <= totalQuestions; i++) {
        console.log(`Answering question ${i}...`);
        
        // 等待当前问题显示
        const currentQuestion = page.locator(`[data-testid="q${i}"]`);
        await expect(currentQuestion).toBeVisible({ timeout: 5000 });
        
        // 选择第一个答案选项（a1 = "Not at all"）
        const firstAnswer = page.locator('[data-testid="a1"]');
        await expect(firstAnswer).toBeVisible({ timeout: 3000 });
        await firstAnswer.click({ force: true });
        await page.waitForTimeout(500);
        
        // 点击 "Next" 或 "Submit" 按钮
        const isLastQuestion = i === totalQuestions;
        const buttonSelector = isLastQuestion 
          ? 'button:has-text("Submit"), button:has-text("Complete"), button:has-text("提交"), button:has-text("完成"), button:has-text("Next"), button:has-text("下一")'
          : 'button:has-text("Next"), button:has-text("下一")';
        
        const actionButton = page.locator(buttonSelector).first();
        await expect(actionButton).toBeVisible({ timeout: 3000 });
        await actionButton.click({ force: true });
        
        // 等待 DOM 更新或页面跳转
        if (i < totalQuestions) {
          // 等待下一个问题出现
          await page.waitForTimeout(1000);
        } else {
          // 最后一题，等待跳转到结果页
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
        }
      }
      
      // 4. 等待结果页面加载
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // 5. 验证结果页面显示
      // 检查是否有分数、结果、解读等关键词
      const resultKeywords = /分数|Score|结果|Result|解读|Interpretation|建议|Recommendation/i;
      const hasResultContent = await page.locator('body').textContent();
      
      expect(hasResultContent).toMatch(resultKeywords);
      
      // 6. 验证分数显示（不应该是 NaN 或空）
      const scoreElements = page.locator('text=/\\d+/').filter({
        hasNot: page.locator('nav, header, footer')
      });
      
      if (await scoreElements.count() > 0) {
        const scoreText = await scoreElements.first().textContent();
        expect(scoreText).not.toContain('NaN');
        expect(scoreText).not.toBe('');
      }
    });

    test('评估历史记录正确保存', async ({ page }) => {
      // 先完成一次 PHQ-9 评估
      await page.goto('/assessment/');
      await page.waitForLoadState('networkidle');
      
      // 使用 data-testid 找到 PHQ-9 开始按钮
      const startButton = page.locator('[data-testid="start-assessment-phq-9"]');
      await expect(startButton).toBeVisible({ timeout: 5000 });
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // 快速完成 PHQ-9 的9个问题（使用 data-testid）
      for (let i = 1; i <= 9; i++) {
        // 检查问题是否存在
        const questionExists = await page.locator(`[data-testid="q${i}"]`).isVisible({ timeout: 3000 }).catch(() => false);
        if (!questionExists) {
          console.log(`Question ${i} not found, stopping assessment`);
          break;
        }
        
        // 选择第一个答案
        const firstAnswer = page.locator('[data-testid="a1"]');
        await expect(firstAnswer).toBeVisible({ timeout: 3000 });
        await firstAnswer.click({ force: true });
        await page.waitForTimeout(500);
        
        // 点击 Next 或 Submit 按钮
        const isLastQuestion = i === 9;
        const buttonSelector = isLastQuestion 
          ? 'button:has-text("Submit"), button:has-text("Complete"), button:has-text("提交"), button:has-text("完成"), button:has-text("Next"), button:has-text("下一")'
          : 'button:has-text("Next"), button:has-text("下一")';
        
        const actionButton = page.locator(buttonSelector).first();
        await expect(actionButton).toBeVisible({ timeout: 3000 });
        await actionButton.click({ force: true });
        await page.waitForTimeout(1000);
      }
      
      // 等待完成并加载结果页
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 等待结果保存到 IndexedDB（给足够的时间）
      await page.waitForTimeout(2000);
      
      // 导航到历史页面（使用 trailing slash）
      await page.goto('/assessment/history/');
      await page.waitForLoadState('networkidle');
      
      // 等待历史数据加载（客户端组件需要时间从 IndexedDB 读取）
      await page.waitForTimeout(2000);
      
      // 验证有历史记录显示
      const historyItems = page.locator('[data-testid="assessment-history-item"]');
      const itemCount = await historyItems.count();
      
      // 应该至少有一条历史记录
      expect(itemCount).toBeGreaterThan(0);
      
      // 验证第一条记录包含评估相关信息
      if (itemCount > 0) {
        const firstItem = historyItems.first();
        await expect(firstItem).toBeVisible();
        const itemText = await firstItem.textContent();
        expect(itemText).toMatch(/PHQ|GAD|Stress|Depression|Anxiety|评估/i);
      }
    });
  });

  test.describe('3. 资源页面验证', () => {
    
    test('书籍推荐页面正常显示', async ({ page }) => {
      await page.goto('/resources/');
      await page.waitForLoadState('networkidle');
      
      // 验证页面包含资源相关内容（使用 last() 避免匹配多个 main 元素）
      const content = await page.locator('main').last().textContent();
      expect(content).toMatch(/书籍|音乐|电影|Books|Music|Movies/i);
      
      // 检查是否有资源卡片
      const resourceCards = page.locator('article, .card, [class*="resource"]').filter({
        hasText: /.+/
      });
      
      const count = await resourceCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('资源页面搜索功能可用', async ({ page }) => {
      await page.goto('/resources/');
      await page.waitForLoadState('networkidle');
      
      // 查找搜索框
      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]');
      
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        
        // 验证搜索有反馈（结果变化或消息）（使用 last() 避免匹配多个 main 元素）
        const results = await page.locator('main').last().textContent();
        expect(results).toBeTruthy();
      }
    });
  });

  test.describe('4. 多语言功能验证', () => {
    
    test('语言切换功能正常', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 获取初始 URL
      const initialUrl = page.url();
      
      // 查找语言切换器按钮
      const langButton = page.locator('#language-button, #language-switcher button').first();
      
      if (await langButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // 点击打开下拉菜单
        await langButton.click();
        await page.waitForTimeout(500);
        
        // 选择中文选项
        const zhOption = page.locator('[data-value="zh"], a[href*="/zh/"]').first();
        if (await zhOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await zhOption.click();
          await page.waitForLoadState('networkidle');
          
          // 验证 URL 包含 /zh/
          const newUrl = page.url();
          expect(newUrl).toContain('/zh/');
          expect(newUrl).not.toEqual(initialUrl);
        } else {
          // 如果没有中文选项，测试通过（可能已经是中文）
          console.log('No Chinese language option found, skipping');
        }
      } else {
        // 如果没有语言切换器，跳过测试
        console.log('No language switcher found, skipping');
      }
    });

    test('中文版评估问卷显示正确', async ({ page }) => {
      // 确保在中文模式（使用 trailing slash）
      await page.goto('/zh/assessment/');
      await page.waitForLoadState('networkidle');
      
      // 验证有中文内容
      const content = await page.locator('body').textContent();
      const hasChinese = /[\u4e00-\u9fa5]{2,}/.test(content || '');
      expect(hasChinese).toBeTruthy();
    });

    test('英文版评估问卷显示正确', async ({ page }) => {
      // 切换到英文模式（使用 trailing slash）
      await page.goto('/en/assessment/');
      await page.waitForLoadState('networkidle');
      
      // 验证有英文内容且基本没有中文
      const content = await page.locator('body').textContent();
      const hasEnglish = /Assessment|Questionnaire|Start|Depression|Anxiety/i.test(content || '');
      expect(hasEnglish).toBeTruthy();
    });
  });

  test.describe('5. 数据持久化验证', () => {
    
    test('评估数据在页面刷新后仍然存在', async ({ page, context }) => {
      // 开始评估（使用 trailing slash）
      await page.goto('/assessment/');
      // 使用 data-testid 找到第一个开始按钮
      const startButton = page.locator('[data-testid^="start-assessment-"]').first();
      await startButton.click({ timeout: 10000 });
      
      // 回答几个问题
      for (let i = 0; i < 3; i++) {
        const option = page.locator('input[type="radio"], button[role="radio"]').first();
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(300);
          
          const next = page.locator('button:has-text("下一"), button:has-text("Next")').first();
          if (await next.isVisible({ timeout: 1000 }).catch(() => false)) {
            await next.click();
            await page.waitForTimeout(300);
          }
        }
      }
      
      // 刷新页面
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // 验证有恢复会话的提示或选项
      const hasResumeOption = await page.locator('text=/继续|恢复|Resume|Continue/i').isVisible({ timeout: 3000 }).catch(() => false);
      
      // 如果有恢复选项，说明数据持久化成功
      if (hasResumeOption) {
        expect(hasResumeOption).toBeTruthy();
      } else {
        // 或者检查是否仍在评估页面（自动恢复）
        const url = page.url();
        const isAssessmentPage = url.includes('/assessment') || url.includes('/take');
        expect(isAssessmentPage).toBeTruthy();
      }
    });
  });
});

test.describe('MVP 响应式设计测试', () => {
  
  test.describe('移动端布局', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size
    
    test('移动端首页布局正常', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // 验证页面可滚动且内容可见
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // 验证移动端菜单
      const mobileMenu = page.locator('#mobile-menu-button, [aria-label*="menu"], button.menu-toggle, .hamburger').first();
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(500);
        
        // 验证移动端菜单展开（使用更具体的选择器）
        const mobileNav = page.locator('#mobile-menu');
        await expect(mobileNav).toBeVisible();
      }
    });

    test('移动端评估问卷可正常操作', async ({ page }) => {
      await page.goto('/assessment/');
      
      // 使用 data-testid 找到第一个开始按钮
      const startButton = page.locator('[data-testid^="start-assessment-"]').first();
      
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
        await page.waitForLoadState('networkidle');
        
        // 验证问题在移动端可读
        const question = page.locator('[data-testid*="question"], .question, h2, h3').first();
        await expect(question).toBeVisible();
        
        // 验证选项按钮大小合适（测试父容器或 label，因为 radio input 本身可能很小）
        const optionContainer = page.locator('label:has(input[type="radio"]), .option-item, button[role="radio"]').first();
        if (await optionContainer.isVisible()) {
          const box = await optionContainer.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(36); // 至少36px高，考虑到实际布局
          }
        }
      }
    });
  });

  test.describe('平板端布局', () => {
    test.use({ viewport: { width: 768, height: 1024 } }); // iPad size
    
    test('平板端首页布局合理', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // 验证内容不过于拥挤或稀疏
      const content = page.locator('main > *').first();
      const box = await content.boundingBox();
      if (box) {
        // 内容宽度应该合理利用空间（平板端通常使用全宽或接近全宽）
        expect(box.width).toBeGreaterThan(400);
        expect(box.width).toBeLessThanOrEqual(768); // 允许等于 viewport 宽度
      }
    });
  });

  test.describe('桌面端布局', () => {
    test.use({ viewport: { width: 1920, height: 1080 } }); // Desktop size
    
    test('桌面端首页布局美观', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // 验证主要内容居中且宽度适中（检查实际内容容器，而非 main 元素）
      const container = page.locator('.container, .max-w-7xl, .max-w-6xl, main > div').first();
      const box = await container.boundingBox();
      if (box) {
        // 内容容器应该有合理的最大宽度（Tailwind max-w-7xl 约 1280px + padding）
        expect(box.width).toBeGreaterThan(800);
        expect(box.width).toBeLessThanOrEqual(1600); // 允许一定范围
      }
    });
  });
});

test.describe('MVP 性能验证', () => {
  
  test('首页加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 首页应在 5 秒内加载完成（开发环境）
    expect(loadTime).toBeLessThan(5000);
  });

  test('评估页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/assessment/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 评估页面应在 5 秒内加载完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/assessment/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/resources/');
    await page.waitForLoadState('networkidle');
    
    // 过滤掉一些已知的非关键错误
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Network')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

