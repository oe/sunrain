# Phase 1: Practice功能详细技术实施方案

## 概述

将现有的Practice系统后端代码转换为完整可用的前端功能，包括页面路由、UI组件、多语言支持和内容扩展。

## 技术架构

### 现有资源分析

**后端系统** (已完成)
- `src/lib/practice/` - 完整的Practice管理系统
- `src/types/practice.ts` - 完整的类型定义
- `public/content/practices/` - 练习数据文件

**缺失部分**
- 页面路由和UI组件
- 多语言翻译
- 音频文件
- 前端集成

### 实施策略

1. **页面优先**: 先创建基础页面结构
2. **组件渐进**: 逐步开发UI组件
3. **功能集成**: 集成现有后端系统
4. **多语言**: 添加翻译支持
5. **内容扩展**: 增加更多练习

## 详细实施步骤

### Step 1: 页面路由结构

#### 1.1 创建页面文件
```
src/pages/practice/
├── index.astro              # 练习列表页
├── [id].astro              # 单个练习详情和执行页
└── history.astro           # 练习历史记录页
```

#### 1.2 路由设计
- `/practice/` - 练习列表，支持筛选和搜索
- `/practice/[id]` - 练习详情和执行
- `/practice/history` - 个人练习历史

### Step 2: 核心UI组件

#### 2.1 组件架构
```
src/components/practice/
├── PracticeCard.tsx         # 练习卡片
├── PracticePlayer.tsx       # 主播放器
├── BreathingCircle.tsx      # 呼吸可视化
├── PracticeTimer.tsx        # 计时器
├── AudioControls.tsx        # 音频控制
├── PracticeSettings.tsx     # 设置面板
├── MoodSelector.tsx         # 心情选择器
├── PracticeHistory.tsx     # 历史记录
├── StepIndicator.tsx       # 步骤指示器
└── PracticeFilters.tsx     # 筛选组件
```

#### 2.2 组件职责
- **PracticeCard**: 展示练习基本信息，支持点击进入
- **PracticePlayer**: 主播放器，管理练习执行流程
- **BreathingCircle**: 呼吸练习的可视化引导
- **PracticeTimer**: 练习计时和进度显示
- **AudioControls**: 音频播放控制
- **PracticeSettings**: 练习设置(时长、背景音乐等)
- **MoodSelector**: 练习前后心情记录
- **PracticeHistory**: 历史记录展示和统计

### Step 3: 功能实现

#### 3.1 练习执行流程
1. 选择练习 → 2. 设置参数 → 3. 开始练习 → 4. 步骤引导 → 5. 完成反馈

#### 3.2 数据流设计
```
PracticeSystem (后端) ←→ PracticePlayer (前端)
     ↓
localStorage/IndexedDB (持久化)
     ↓
PracticeHistory (历史记录)
```

#### 3.3 状态管理
遵循 `state-management-guidelines.md`:
- 使用 `useState` 管理组件内部状态
- 避免全局状态管理
- 状态就近原则

### Step 4: 多语言支持

#### 4.1 翻译文件结构
```
src/locales/practice/
├── index.ts
├── types.ts
├── en.ts
├── zh.ts
├── es.ts
├── ar.ts
├── hi.ts
├── ja.ts
└── ko.ts
```

#### 4.2 翻译内容
- 练习名称和描述
- 步骤指导文本
- UI界面文本
- 错误消息
- 帮助文本

### Step 5: 内容扩展

#### 5.1 新增练习类型
- 渐进式肌肉放松
- 正念行走
- 身体扫描(高级版)
- 慈悲冥想(扩展版)
- 专注力训练
- 情绪调节练习
- 睡眠引导
- 焦虑缓解
- 压力释放
- 自我关怀

#### 5.2 音频资源
- 录制或获取音频引导
- 背景音乐
- 自然声音
- 钟声/铃声

## 技术实现细节

### 1. 页面实现

#### Practice列表页 (`/practice/index.astro`)
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { getLocale } from 'astro-i18n-aut';
import { createSSGTranslations } from '@/i18n/utils';
import PracticeFilters from '@/components/practice/PracticeFilters.tsx';
import PracticeCard from '@/components/practice/PracticeCard.tsx';

const lang = getLocale(Astro.url);
const t = createSSGTranslations(lang, 'practice');
---

<BaseLayout title={t('title')} description={t('description')} lang={lang}>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{t('title')}</h1>
    
    <PracticeFilters client:load />
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Practice cards will be rendered here -->
    </div>
  </div>
</BaseLayout>
```

#### Practice详情页 (`/practice/[id].astro`)
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { getLocale } from 'astro-i18n-aut';
import { createSSGTranslations } from '@/i18n/utils';
import PracticePlayer from '@/components/practice/PracticePlayer.tsx';

const lang = getLocale(Astro.url);
const t = createSSGTranslations(lang, 'practice');
const { id } = Astro.params;
---

<BaseLayout title={t('practiceTitle', { name: 'Practice Name' })} lang={lang}>
  <div class="container mx-auto px-4 py-8">
    <PracticePlayer practiceId={id} client:load />
  </div>
</BaseLayout>
```

### 2. 组件实现

#### PracticeCard组件
```tsx
interface PracticeCardProps {
  practice: PracticeType;
  onSelect: (id: string) => void;
}

export default function PracticeCard({ practice, onSelect }: PracticeCardProps) {
  return (
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">{practice.name}</h2>
        <p>{practice.description}</p>
        <div class="card-actions justify-end">
          <button 
            class="btn btn-primary"
            onClick={() => onSelect(practice.id)}
          >
            {t('startPractice')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### PracticePlayer组件
```tsx
interface PracticePlayerProps {
  practiceId: string;
}

export default function PracticePlayer({ practiceId }: PracticePlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [session, setSession] = useState<PracticeSession | null>(null);
  
  // 集成现有的PracticeSystem
  const practiceSystem = useMemo(() => practiceSystem.getInstance(), []);
  
  useEffect(() => {
    // 加载练习数据
    loadPractice();
  }, [practiceId]);
  
  const loadPractice = async () => {
    try {
      const practice = await practiceSystem.content.getPractice(practiceId);
      // 初始化会话
      const newSession = await practiceSystem.session.startSession(practiceId);
      setSession(newSession);
    } catch (error) {
      console.error('Failed to load practice:', error);
    }
  };
  
  return (
    <div class="practice-player">
      {/* 练习播放器UI */}
    </div>
  );
}
```

### 3. 数据集成

#### 与现有PracticeSystem集成
```tsx
// 在组件中使用现有的PracticeSystem
import { practiceSystem } from '@/lib/practice';

const usePractice = (practiceId: string) => {
  const [practice, setPractice] = useState<PracticeType | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  
  useEffect(() => {
    const loadPractice = async () => {
      try {
        const practiceData = await practiceSystem.content.getPractice(practiceId);
        setPractice(practiceData);
      } catch (error) {
        console.error('Failed to load practice:', error);
      }
    };
    
    loadPractice();
  }, [practiceId]);
  
  return { practice, session };
};
```

### 4. 多语言实现

#### 翻译文件结构
```typescript
// src/locales/practice/types.ts
export interface IPracticeTranslations {
  title: string;
  description: string;
  startPractice: string;
  pausePractice: string;
  resumePractice: string;
  completePractice: string;
  // ... 更多翻译键
}
```

#### 英文翻译
```typescript
// src/locales/practice/en.ts
export const practiceEn: IPracticeTranslations = {
  title: 'Mindfulness Practices',
  description: 'Guided mindfulness exercises for mental well-being',
  startPractice: 'Start Practice',
  pausePractice: 'Pause',
  resumePractice: 'Resume',
  completePractice: 'Complete',
  // ...
};
```

## 测试策略

### 1. 单元测试
- PracticeCard组件测试
- PracticePlayer组件测试
- BreathingCircle组件测试
- 数据管理测试

### 2. 集成测试
- 练习执行流程测试
- 数据持久化测试
- 多语言切换测试

### 3. E2E测试
- 完整练习流程测试
- 历史记录功能测试
- 错误处理测试

## 部署和发布

### 1. 功能验证
- [ ] 所有页面正常加载
- [ ] 练习执行流程完整
- [ ] 多语言切换正常
- [ ] 数据持久化正常
- [ ] 移动端适配良好

### 2. 性能优化
- [ ] 组件懒加载
- [ ] 图片优化
- [ ] 音频预加载
- [ ] 缓存策略

### 3. 用户体验
- [ ] 加载状态显示
- [ ] 错误处理友好
- [ ] 可访问性支持
- [ ] 键盘导航支持

## 成功标准

1. **功能完整性**: 所有练习可以正常执行
2. **用户体验**: 界面直观，操作流畅
3. **多语言**: 7种语言完整支持
4. **性能**: 页面加载时间 < 2秒
5. **可访问性**: 支持键盘导航和屏幕阅读器
6. **移动端**: 在移动设备上体验良好

## 后续优化

1. **音频优化**: 添加更多音频资源
2. **个性化**: 基于用户历史推荐练习
3. **社交功能**: 分享练习成果
4. **离线支持**: PWA功能
5. **分析功能**: 练习效果分析
