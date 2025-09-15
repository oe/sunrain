// 测试问卷系统是否正常工作
const testQuestionnaireSystem = async () => {
  try {
    console.log('🧪 开始测试问卷系统...');
    
    // 测试问卷数据是否可以从 public 目录加载
    const response = await fetch('/content/questionnaires/index.json');
    if (!response.ok) {
      throw new Error(`无法加载问卷索引: ${response.statusText}`);
    }
    
    const index = await response.json();
    console.log('✅ 问卷索引加载成功:', index);
    
    // 测试 phq-9 问卷数据
    const phq9Response = await fetch('/content/questionnaires/phq-9/metadata.json');
    if (!phq9Response.ok) {
      throw new Error(`无法加载 PHQ-9 元数据: ${phq9Response.statusText}`);
    }
    
    const phq9Metadata = await phq9Response.json();
    console.log('✅ PHQ-9 元数据加载成功:', phq9Metadata);
    
    // 测试问题数据
    const questionsResponse = await fetch('/content/questionnaires/phq-9/questions.json');
    if (!questionsResponse.ok) {
      throw new Error(`无法加载 PHQ-9 问题数据: ${questionsResponse.statusText}`);
    }
    
    const questionsData = await questionsResponse.json();
    console.log('✅ PHQ-9 问题数据加载成功:', questionsData);
    
    console.log('🎉 问卷系统测试通过！');
    
  } catch (error) {
    console.error('❌ 问卷系统测试失败:', error);
  }
};

// 在页面加载完成后运行测试
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testQuestionnaireSystem);
  } else {
    testQuestionnaireSystem();
  }
}
