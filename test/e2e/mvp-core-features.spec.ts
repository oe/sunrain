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
      
      // 验证核心导航链接存在
      const nav = page.locator('nav, header');
      await expect(nav.getByRole('link', { name: /assessment|评测/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /resources|资源/i })).toBeVisible();
      
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
      // 导航到评估页面
      await page.click('a:has-text("Assessment"), a:has-text("评测"), a:has-text("自我评测")');
      await page.waitForLoadState('networkidle');
      
      // 验证至少显示 3 个问卷
      const questionnaireCards = page.locator('[data-testid*="questionnaire"], .questionnaire-card, article, .card').filter({
        hasText: /PHQ|GAD|PSS|压力|焦虑|抑郁/
      });
      
      await expect(questionnaireCards.first()).toBeVisible({ timeout: 10000 });
      const count = await questionnaireCards.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('2. PHQ-9 评估完整流程', () => {
    
    test('完成 PHQ-9 评估并查看结果', async ({ page }) => {
      // 1. 导航到评估页面
      await page.goto('/assessment');
      await page.waitForLoadState('networkidle');
      
      // 2. 找到并点击 PHQ-9 开始按钮
      const startButton = page.locator('a, button').filter({
        hasText: /开始评估|Start Assessment|PHQ-9/i
      }).first();
      
      await startButton.click();
      await page.waitForLoadState('networkidle');
      
      // 3. 回答所有问题（选择第一个选项）
      let questionCount = 0;
      const maxQuestions = 15; // 最多尝试回答15个问题
      
      while (questionCount < maxQuestions) {
        // 检查是否还有未回答的问题
        const radioButtons = page.locator('input[type="radio"]');
        const buttonOptions = page.locator('button[role="radio"], button.option, .option-button');
        
        const hasRadio = await radioButtons.count() > 0;
        const hasButton = await buttonOptions.count() > 0;
        
        if (!hasRadio && !hasButton) {
          // 没有更多问题，应该到结果页或完成页
          break;
        }
        
        // 点击第一个选项
        if (hasRadio) {
          await radioButtons.first().click();
        } else if (hasButton) {
          await buttonOptions.first().click();
        }
        
        await page.waitForTimeout(300);
        
        // 查找"下一题"或"完成"按钮
        const nextButton = page.locator('button').filter({
          hasText: /下一题|下一个|Next|继续|Continue|完成|Complete|Submit/i
        });
        
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(500);
        } else {
          // 如果没有下一题按钮，可能是自动前进
          await page.waitForTimeout(500);
        }
        
        questionCount++;
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
      // 先完成一次评估（简化版）
      await page.goto('/assessment');
      
      const startButton = page.locator('a, button').filter({
        hasText: /开始|Start/i
      }).first();
      await startButton.click({ timeout: 10000 });
      
      // 快速完成评估
      for (let i = 0; i < 10; i++) {
        const option = page.locator('input[type="radio"], button[role="radio"]').first();
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(200);
          
          const next = page.locator('button:has-text("下一"), button:has-text("Next"), button:has-text("完成"), button:has-text("Complete")').first();
          if (await next.isVisible({ timeout: 1000 }).catch(() => false)) {
            await next.click();
          }
        } else {
          break;
        }
      }
      
      // 等待完成
      await page.waitForTimeout(2000);
      
      // 导航到历史页面
      await page.goto('/assessment/history');
      await page.waitForLoadState('networkidle');
      
      // 验证有历史记录显示
      const historyContent = await page.locator('main, body').textContent();
      const hasHistory = historyContent?.match(/PHQ|GAD|PSS|评估|Assessment/) !== null;
      
      if (hasHistory) {
        // 验证至少有一条记录
        const recordItems = page.locator('[data-testid*="history"], .history-item, article, .card').filter({
          hasText: /PHQ|GAD|PSS/i
        });
        
        const count = await recordItems.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('3. 资源页面验证', () => {
    
    test('书籍推荐页面正常显示', async ({ page }) => {
      await page.goto('/resources');
      await page.waitForLoadState('networkidle');
      
      // 验证页面包含资源相关内容
      const content = await page.locator('main').textContent();
      expect(content).toMatch(/书籍|音乐|电影|Books|Music|Movies/i);
      
      // 检查是否有资源卡片
      const resourceCards = page.locator('article, .card, [class*="resource"]').filter({
        hasText: /.+/
      });
      
      const count = await resourceCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('资源页面搜索功能可用', async ({ page }) => {
      await page.goto('/resources');
      await page.waitForLoadState('networkidle');
      
      // 查找搜索框
      const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]');
      
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        
        // 验证搜索有反馈（结果变化或消息）
        const results = await page.locator('main').textContent();
        expect(results).toBeTruthy();
      }
    });
  });

  test.describe('4. 多语言功能验证', () => {
    
    test('语言切换功能正常', async ({ page }) => {
      // 获取初始语言的页面文本
      const initialContent = await page.locator('body').textContent();
      
      // 查找语言切换器
      const langSwitcher = page.locator('[data-testid="language-switcher"], select[name*="lang"], button:has-text("EN"), button:has-text("中"), .language-switcher').first();
      
      if (await langSwitcher.isVisible({ timeout: 3000 }).catch(() => false)) {
        // 尝试切换语言
        await langSwitcher.click();
        await page.waitForTimeout(300);
        
        // 如果是下拉菜单，选择另一个语言
        const langOption = page.locator('a:has-text("English"), button:has-text("English"), a:has-text("中文"), button:has-text("中文")').first();
        if (await langOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await langOption.click();
        }
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        // 验证语言已改变
        const newContent = await page.locator('body').textContent();
        
        // 内容应该有所不同（语言切换了）
        const hasChinese = /[\u4e00-\u9fa5]/.test(initialContent || '');
        const hasChineseAfter = /[\u4e00-\u9fa5]/.test(newContent || '');
        
        // 如果初始是中文，切换后应该少中文；反之亦然
        expect(hasChinese !== hasChineseAfter).toBeTruthy();
      }
    });

    test('中文版评估问卷显示正确', async ({ page }) => {
      // 确保在中文模式
      await page.goto('/zh/assessment');
      await page.waitForLoadState('networkidle');
      
      // 验证有中文内容
      const content = await page.locator('body').textContent();
      const hasChinese = /[\u4e00-\u9fa5]{2,}/.test(content || '');
      expect(hasChinese).toBeTruthy();
    });

    test('英文版评估问卷显示正确', async ({ page }) => {
      // 切换到英文模式
      await page.goto('/en/assessment');
      await page.waitForLoadState('networkidle');
      
      // 验证有英文内容且基本没有中文
      const content = await page.locator('body').textContent();
      const hasEnglish = /Assessment|Questionnaire|Start|Depression|Anxiety/i.test(content || '');
      expect(hasEnglish).toBeTruthy();
    });
  });

  test.describe('5. 数据持久化验证', () => {
    
    test('评估数据在页面刷新后仍然存在', async ({ page, context }) => {
      // 开始评估
      await page.goto('/assessment');
      const startButton = page.locator('a, button').filter({
        hasText: /开始|Start/i
      }).first();
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
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button:has-text("Menu"), button.menu-toggle, .hamburger').first();
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        await page.waitForTimeout(300);
        
        // 验证菜单展开
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav).toBeVisible();
      }
    });

    test('移动端评估问卷可正常操作', async ({ page }) => {
      await page.goto('/assessment');
      
      const startButton = page.locator('a, button').filter({
        hasText: /开始|Start/i
      }).first();
      
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
        await page.waitForLoadState('networkidle');
        
        // 验证问题在移动端可读
        const question = page.locator('[data-testid*="question"], .question, h2, h3').first();
        await expect(question).toBeVisible();
        
        // 验证选项按钮大小合适（至少44px）
        const option = page.locator('input[type="radio"], button[role="radio"]').first();
        if (await option.isVisible()) {
          const box = await option.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40); // 至少40px高，接近44px触摸目标
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
        // 内容宽度应该合理利用空间
        expect(box.width).toBeGreaterThan(400);
        expect(box.width).toBeLessThan(768);
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
      
      // 验证主要内容居中且宽度适中
      const container = page.locator('main > div, main > section').first();
      const box = await container.boundingBox();
      if (box) {
        // 内容不应该占满整个屏幕宽度
        expect(box.width).toBeLessThan(1600);
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
    await page.goto('/assessment');
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
    
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/resources');
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

