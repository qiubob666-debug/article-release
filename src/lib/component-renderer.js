/**
 * 组件渲染器 - 极简官网风格
 *
 * 设计原则：
 * 1. 克制 - 不使用渐变、阴影等装饰性元素
 * 2. 一致 - 完全使用官网的配色系统
 * 3. 信息优先 - 内容为主，样式为辅
 */

export function renderComponentAsStatic(componentName) {
  console.log(`   🎨 渲染组件: ${componentName}`);

  const componentRenderers = {
    'Article1Diagram': () => createMinimalCard(
      'AI 能力对比',
      ['语言任务：当前最强', '推理创造：发展中', '身体感知：瓶颈领域']
    ),
    
    'Article2Diagram': () => createMinimalCard(
      '替代风险矩阵',
      ['高风险：数据录入、基础翻译', '低风险：创意设计、战略决策']
    ),
    
    'Article3Diagram': () => createMinimalCard(
      '使用者影响模型',
      ['正面：效率提升、能力扩展', '风险：思维依赖、批判退化']
    ),
    
    'Article4Diagram': () => createMinimalCard(
      '不可替代价值地图',
      ['缄默知识、身体技能', '情感连接、复杂判断']
    ),
    
    'Article5Diagram': () => createMinimalCard(
      '重构速度不对称图',
      ['旧工作消失：快速', '新工作出现：缓慢']
    ),
    
    'Article6Diagram': () => createMinimalCard(
      '教育能力差距分析',
      ['现有体系：知识记忆型', '未来需求：创造判断型']
    ),
    
    'Article7Diagram': () => createMinimalCard(
      '个人行动框架',
      ['识别 → 选择 → 行动 → 迭代']
    ),
    
    'Article8Diagram': () => createMinimalCard(
      '自由度评估模型',
      ['技能自由 · 时间自由 · 认知自由']
    ),
    
    'Article9Diagram': () => createMinimalCard(
      '协作失误案例',
      ['AI幻觉实例 · 修复路径']
    ),
    
    'PrefaceDiagram': () => createMinimalCard(
      '八篇文章结构图',
      ['变量分析 → 价值重构 → 人机位置 → 行动方案']
    ),

    'PhotoGallery': () => createImagePlaceholder('图片集'),
    'UserJourneyMap': () => createMinimalCard('用户旅程图', ['阶段一 → 阶段二 → 阶段三']),
    'VariableGrid': () => createMinimalCard('变量网格', ['维度A × 维度B']),
    
    'default': (name) => createMinimalCard(name),
  };

  const renderer = componentRenderers[componentName] || componentRenderers['default'];
  return renderer(componentName);
}

/**
 * 极简信息卡片 - 匹配官网风格
 */
function createMinimalCard(title, items = []) {
  const itemsHtml = items.length > 0 
    ? `<ul style="margin:12px 0 0;padding-left:20px;list-style-type:disc;">${items.map(item => 
        `<li style="font-family:'STKaiti','华文楷体',serif;font-size:14px;line-height:1.8;color:#4A4A4A;margin-bottom:6px;">${item}</li>`
      ).join('')}</ul>`
    : '';

  return `
<div style="
  margin:48px 0;
  padding:0;
  border-top:1px solid #E5E2D9;
  border-bottom:1px solid #E5E2D9;
  padding:24px 0;
">
  <div style="
    font-family:"PingFang SC","Microsoft YaHei",sans-serif;
    font-size:13px;
    font-weight:600;
    color:#8C8C8C;
    letter-spacing:0.08em;
    text-transform:uppercase;
    margin-bottom:16px;
  ">${title}</div>
  ${itemsHtml}
</div>`;
}

/**
 * 图片占位符
 */
function createImagePlaceholder(description = '') {
  return `
<div style="
  margin:40px 0;
  padding:32px;
  background:#FAF9F6;
  border:1px dashed #D5D2C9;
  text-align:center;
">
  <div style="
    font-family:"STKaiti","华文楷体",serif;
    font-size:14px;
    color:#B8B5AE;
    font-style:italic;
  ">${description || '可视化内容'}</div>
</div>`;
}

export default {
  renderComponentAsStatic,
  createMinimalCard,
  createImagePlaceholder,
};
