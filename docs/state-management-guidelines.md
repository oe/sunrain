# React 状态管理最佳实践指南

## 核心原则

### 1. 状态就近原则
- **状态应该保持在最接近使用位置的组件中**
- 避免不必要的状态提升
- 只有真正需要跨组件共享的数据才考虑提升

### 2. 避免过度全局化
- **禁止使用中心化状态管理**（如 Redux、Zustand），除非有明确的全局共享需求
- 优先使用 React 内置状态管理：`useState`、`useReducer`、`useContext`
- 全局状态应该仅限于：用户认证、主题设置、语言设置等真正全局的数据

### 3. 状态分离原则
- 将不相关的状态分离到不同的 `useState` 调用中
- 避免创建大型的状态对象
- 按功能职责分组相关状态

## 实践示例

### ✅ 好的做法

```typescript
// 分离不相关的状态
const [sessionData, setSessionData] = useState<SessionData>({
  session: null,
  currentQuestion: null,
  answers: []
});

const [uiState, setUIState] = useState<UIState>({
  isLoading: false,
  error: null
});

const [modalState, setModalState] = useState<ModalState>({
  showModal: false,
  modalType: null
});
```

### ❌ 避免的做法

```typescript
// 避免：将所有状态混合在一个大对象中
const [state, setState] = useState({
  session: null,
  currentQuestion: null,
  answers: [],
  isLoading: false,
  error: null,
  showModal: false,
  modalType: null,
  timeSpent: 0,
  // ... 更多不相关的状态
});
```

## 状态管理策略

### 1. 组件内部状态
适用于：
- 表单输入值
- UI 交互状态（展开/折叠、选中状态等）
- 临时计算结果

```typescript
function QuestionCard({ question, onAnswerChange }) {
  const [answer, setAnswer] = useState(null);
  const [validationError, setValidationError] = useState(null);
  
  // 状态仅在此组件内使用
}
```

### 2. 父子组件状态传递
适用于：
- 父组件需要控制子组件状态
- 兄弟组件间的简单数据共享

```typescript
function AssessmentTaker() {
  const [currentAnswer, setCurrentAnswer] = useState(null);
  
  return (
    <QuestionCard 
      answer={currentAnswer}
      onAnswerChange={setCurrentAnswer}
    />
  );
}
```

### 3. Context 状态（谨慎使用）
仅适用于：
- 深层组件树的数据传递
- 真正的全局配置（主题、语言等）

```typescript
// 仅用于真正的全局状态
const ThemeContext = createContext();
const LanguageContext = createContext();
```

## 性能优化指南

### 1. 避免不必要的重渲染
- 使用 `React.memo` 包装纯组件
- 使用 `useCallback` 和 `useMemo` 优化依赖
- 避免在渲染过程中创建新对象

### 2. 状态更新优化
- 使用函数式更新避免闭包陷阱
- 批量相关的状态更新
- 避免频繁的状态更新

```typescript
// ✅ 函数式更新
setSessionState(prev => ({
  ...prev,
  currentQuestionIndex: prev.currentQuestionIndex + 1
}));

// ❌ 直接更新可能导致闭包问题
setSessionState({
  ...sessionState,
  currentQuestionIndex: sessionState.currentQuestionIndex + 1
});
```

## 禁止的模式

### 1. 过度的全局状态管理
```typescript
// ❌ 禁止：为简单的组件状态使用全局管理
const globalStore = createStore({
  currentAnswer: null,
  validationError: null,
  // 这些应该是组件内部状态
});
```

### 2. 复杂的状态同步机制
```typescript
// ❌ 禁止：复杂的批量更新机制
const [state, batchUpdate, flushUpdates] = useBatchedUpdates(initialState);
// React 18 的自动批处理已经足够
```

### 3. 过度的性能优化
```typescript
// ❌ 禁止：过度复杂的性能监控
const { renderCount, averageRenderTime } = useRenderPerformance('Component');
// 除非有明确的性能问题，否则不需要
```

## 代码审查检查清单

- [ ] 状态是否保持在最接近使用位置的组件中？
- [ ] 是否避免了不必要的状态提升？
- [ ] 是否将不相关的状态分离？
- [ ] 是否避免了过度的全局状态管理？
- [ ] 是否使用了 React 内置的状态管理工具？
- [ ] 状态更新是否使用了函数式更新？
- [ ] 是否避免了过度复杂的性能优化？

## 重构指导

当发现违反上述原则的代码时：

1. **识别状态的实际使用范围**
2. **将状态降级到合适的组件层级**
3. **分离不相关的状态**
4. **移除不必要的全局状态管理**
5. **简化复杂的状态同步机制**

遵循这些指南将使代码更加简洁、可维护，并减少潜在的状态同步问题。
