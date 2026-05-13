/**
 * 组件渲染器 - 将 Astro 组件降级为静态 HTML/CSS 可视化
 *
 * 功能：
 * 1. 识别常见的 Astro 组件类型
 * 2. 根据组件语义生成对应的静态 HTML
 * 3. 保持视觉一致性（与官网风格匹配）
 */

export function renderComponentAsStatic(componentName, props = {}) {
  console.log(`   🎨 渲染组件为静态HTML: ${componentName}`);

  const componentRenderers = {
    // 文章图表组件
    'Article1Diagram': () => createInfoCard(
      'AI 能力对比图',
      `该图表展示了 AI 在不同能力维度上的表现对比。
       <br/><br/>
       <strong>核心观点：</strong><br/>
       • AI 在语言任务上表现最强<br/>
       • 推理和创造能力仍在发展中<br/>
       • 身体感知和情感理解是当前瓶颈<br/><br/>
       <em style="color:#8C8C8C;">完整交互式图表请访问官网查看</em>`
    ),
    
    'Article2Diagram': () => createInfoCard(
      '工作替代风险矩阵',
      `该图表展示了不同工作类型的 AI 替代风险等级。<br/><br/>
       <strong>高风险区域：</strong><br/>
       • 数据录入、基础翻译<br/>
       • 简单代码编写、文案生成<br/><br/>
       <strong>低风险区域：</strong><br/>
       • 创意设计、战略决策<br/>
       • 复杂人际沟通、身体技能`
    ),
    
    'Article3Diagram': () => createInfoCard(
      'AI 使用者影响模型',
      `该图表展示了 AI 工具如何塑造其使用者。<br/><br/>
       <strong>正面影响：</strong><br/>
       • 效率提升、能力扩展<br/>
       • 新的创意可能性<br/><br/>
       <strong>潜在风险：</strong><br/>
       • 思维依赖性增强<br/>
       • 批判能力退化`
    ),
    
    // 默认处理
    'default': (name) => createInfoCard(
      name,
      `这是一个交互式可视化组件。<br/><br/>
       由于微信公众号不支持 JavaScript，<br/>
       此处显示静态版本。<br/><br/>
       <em style="color:#8C8C8C;">完整版本请访问 <a href="https://bobqiushao.online" style="color:#6B4423;text-decoration:underline;">bobqiushao.online</a></em>`
    ),
  };

  // 查找对应的渲染器
  const renderer = componentRenderers[componentName] || componentRenderers['default'];
  
  return renderer(componentName);
}

/**
 * 创建信息卡片样式的组件替代品
 */
function createInfoCard(title, content) {
  return `
<div style="
  margin: 40px 0;
  padding: 24px;
  background: linear-gradient(135deg, #F9F7F4 0%, #F2F0EA 100%);
  border-left: 4px solid #6B4423;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
">
  <div style="
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #1A1A1A;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  ">
    <span style="
      display: inline-block;
      width: 32px;
      height: 32px;
      background: #6B4423;
      color: white;
      border-radius: 6px;
      text-align: center;
      line-height: 32px;
      margin-right: 12px;
      font-size: 16px;
    ">📊</span>
    ${title}
  </div>
  <div style="
    font-family: "STKaiti", "华文楷体", serif;
    font-size: 15px;
    line-height: 1.8;
    color: #4A4A4A;
  ">
    ${content}
  </div>
</div>`;
}

/**
 * 创建简单的数据表格（用于替代复杂的表格组件）
 */
function createSimpleTable(headers, rows, caption = '') {
  let tableHtml = `
<table style="
  width: 100%;
  border-collapse: collapse;
  margin: 32px 0;
  font-size: 14px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
">`;

  if (caption) {
    tableHtml += `<caption style="
      padding: 12px;
      font-weight: 600;
      color: #1A1A1A;
      text-align: left;
      background: #F2F0EA;
    ">${caption}</caption>`;
  }

  // 表头
  tableHtml += `<thead><tr style="background: #F2F0EA;">`;
  headers.forEach(header => {
    tableHtml += `<th style="
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #4A4A4A;
      border-bottom: 2px solid #E5E2D9;
    ">${header}</th>`;
  });
  tableHtml += `</tr></thead>`;

  // 表体
  tableHtml += `<tbody>`;
  rows.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#FAFAF8' : 'white';
    tableHtml += `<tr style="background: ${bgColor};">`;
    row.forEach(cell => {
      tableHtml += `<td style="
        padding: 12px 16px;
        border-bottom: 1px solid #E5E2D9;
        color: #1A1A1A;
        line-height: 1.6;
      ">${cell}</td>`;
    });
    tableHtml += `</tr>`;
  });
  tableHtml += `</tbody></table>`;

  return tableHtml;
}

/**
 * 创建流程图（用于替代 UserJourneyMap 等）
 */
function createFlowChart(steps) {
  let chartHtml = `
<div style="
  margin: 40px 0;
  padding: 24px;
  background: #F9F7F4;
  border-radius: 8px;
">
  <div style="display: flex; flex-direction: column; gap: 16px;">
`;

  steps.forEach((step, index) => {
    const isLast = index === steps.length - 1;
    
    chartHtml += `
    <div style="
      display: flex;
      align-items: flex-start;
      position: relative;
    ">
      <div style="
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        background: ${isLast ? '#6B4423' : '#E5E2D9'};
        color: ${isLast ? 'white' : '#666'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        margin-right: 16px;
      ">${index + 1}</div>
      <div style="
        flex: 1;
        padding-bottom: ${isLast ? '0' : '16px'};
        border-${isLast ? 'none' : 'left'}: 2px solid #E5E2D9;
        margin-left: -20px;
        padding-left: 28px;
      ">
        <div style="
          font-weight: 500;
          color: #1A1A1A;
          margin-bottom: 4px;
        ">${step.title}</div>
        <div style="
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        ">${step.description}</div>
      </div>
    </div>`;
  });

  chartHtml += `</div></div>`;
  return chartHtml;
}

export default {
  renderComponentAsStatic,
  createInfoCard,
  createSimpleTable,
  createFlowChart,
};
