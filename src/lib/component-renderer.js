/**
 * 组件渲染器 — 1:1 还原 bobqiushao.online 各篇图表
 * 数据和布局直接从官网 Astro 组件源码提取
 * 研究板块：UserJourneyMap / MethodPrinciples / PhotoGallery
 */

// 设计令牌（与 bobqiushao.js 主题保持一致）
const T = {
  textPrimary:   '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted:     '#8C8C8C',
  border:        '#E5E2D9',
  bgSubtle:      '#F2F0EA',
  link:          '#6B4423',
  fontTitle:     "'PingFang SC','Microsoft YaHei','微软雅黑',Helvetica,Arial,sans-serif",
  fontBody:      "'Noto Serif SC','STKaiti','华文楷体','楷体','Georgia',serif",
  fontMono:      "'JetBrains Mono','Courier New',Courier,monospace",
};

// ─── 样式常量 ────────────────────────────────────────────────────────────────
const S = {
  wrap:    'margin:3rem 0;',
  caption: 'font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';letter-spacing:0.08em;text-transform:uppercase;margin:0 0 2rem;display:block;',
  note:    'font-family:' + T.fontTitle + ';font-size:12px;color:' + T.textMuted + ';margin-top:1.6rem;padding-top:1.2rem;border-top:1px solid ' + T.border + ';line-height:1.7;',
  hdrRow:  'display:flex;gap:0;padding-bottom:0.4rem;border-bottom:1px solid ' + T.border + ';',
  row:     'display:flex;gap:0;padding:0.55rem 0;border-top:1px solid ' + T.border + ';',
  lastRow: 'display:flex;gap:0;padding:0.55rem 0;border-top:1px solid ' + T.border + ';border-bottom:1px solid ' + T.border + ';',
  hdrCell: 'font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';',
  numCell: 'font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';flex:0 0 1.8rem;',
  priCell: 'font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textPrimary + ';font-weight:500;line-height:1.5;',
  secCell: 'font-family:' + T.fontTitle + ';font-size:12px;color:' + T.textSecondary + ';line-height:1.6;',
  mutCell: 'font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';',
};

function cap(text) { return '<span style="' + S.caption + '">' + text + '</span>'; }
function note(text) { return '<p style="' + S.note + '">' + text + '</p>'; }
function wrap(content) { return '<div style="' + S.wrap + '">' + content + '</div>'; }

// ═══════════════════════════════════════════════════════════════════════════════
// AI 与思考板块（Article1-9Diagram + PrefaceDiagram）
// ═══════════════════════════════════════════════════════════════════════════════

function renderPrefaceDiagram() {
  const groups = [
    { label: '先看 AI 本身', rows: [
      { num: '一', text: 'AI 目前还学不太好的，是什么', tag: '能力边界' },
      { num: '三', text: 'AI 是怎么塑造它的使用者的', tag: '产品差异' },
    ]},
    { label: '再看价值重构', rows: [
      { num: '二', text: '哪些工作会被替代，哪些不会', tag: '替代边界' },
      { num: '五', text: '新工作出现得有多慢，旧工作消失得有多快', tag: '速度不对称' },
    ]},
    { label: '然后看人的位置', rows: [
      { num: '四', text: '人的不可替代价值，目前还在哪里', tag: '四个方向' },
      { num: '六', text: '我们的教育训练了什么样的人', tag: '能力对照' },
    ]},
    { label: '最后看怎么做', rows: [
      { num: '七', text: '一个具体的人，可以怎么做', tag: '四个层次' },
      { num: '八', text: '做自由的人：AI 不会让不自由的人变自由', tag: '工具与人' },
    ]},
  ];
  const groupHtml = groups.map(function(g, gi) {
    const isLastGroup = gi === groups.length - 1;
    const rowsHtml = g.rows.map(function(r, ri) {
      const isLastOverall = isLastGroup && ri === g.rows.length - 1;
      const rowStyle = isLastOverall ? S.lastRow : S.row;
      return '<div style="' + rowStyle + '">'
        + '<span style="' + S.numCell + '">' + r.num + '</span>'
        + '<span style="flex:1;' + S.priCell + '">' + r.text + '</span>'
        + '<span style="flex:0 0 5rem;text-align:right;' + S.mutCell + '">' + r.tag + '</span>'
        + '</div>';
    }).join('');
    const gap = gi < groups.length - 1 ? '<div style="height:1.5rem;"></div>' : '';
    return '<div>'
      + '<span style="display:block;font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';margin-bottom:0.4rem;letter-spacing:0.04em;">' + g.label + '</span>'
      + rowsHtml + '</div>' + gap;
  }).join('');
  return wrap(cap('八篇的结构') + groupHtml);
}

function renderArticle1Diagram() {
  function col(head, sub, items) {
    const itemsHtml = items.map(function(item, i) {
      const b = i < items.length - 1
        ? 'border-top:1px solid ' + T.border + ';padding:0.5rem 0;'
        : 'border-top:1px solid ' + T.border + ';border-bottom:1px solid ' + T.border + ';padding:0.5rem 0;';
      return '<div style="' + b + '">'
        + '<div style="font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textPrimary + ';font-weight:500;">' + item.name + '</div>'
        + '<div style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';margin-top:0.15rem;line-height:1.5;">' + item.note + '</div>'
        + '</div>';
    }).join('');
    return '<div style="flex:1;">'
      + '<p style="font-family:' + T.fontTitle + ';font-size:12px;font-weight:600;color:' + T.textPrimary + ';margin:0 0 0.2rem;">' + head + '</p>'
      + '<p style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';margin:0 0 1rem;padding-bottom:0.8rem;border-bottom:1px solid ' + T.border + ';">' + sub + '</p>'
      + itemsHtml + '</div>';
  }
  const left  = [{name:'显性知识',note:'书本、文档、数据库'},{name:'规则化推理',note:'按已有规则处理标准问题'},{name:'模式识别',note:'在大量数据中找规律'}];
  const right = [{name:'缄默知识',note:'身体里的、只能靠时间换来的经验'},{name:'情境知识',note:'饭桌上、走廊里、在场才能感知的信息'},{name:'关系知识',note:'打了三年交道才能感觉到的细微差别'}];
  const colsHtml = '<div style="display:flex;gap:2rem;">'
    + col('AI 能做', '答案存在于公开文本中', left)
    + '<div style="width:1px;background:' + T.border + ';flex-shrink:0;"></div>'
    + col('AI 做不到', '答案不在公开文本中', right)
    + '</div>';
  return wrap(cap('AI 能做到什么，做不到什么') + colsHtml
    + note('检验方法：这件事的答案在哪里？在书里 / 数据里，AI 能做。在身体里 / 饭桌上 / 多年经验里，AI 做不了。'));
}

function renderArticle2Diagram() {
  const rows = [
    {type:'信息密集型', feature:'处理、整理、传递已有信息', risk:'高'},
    {type:'规则执行型', feature:'按固定流程完成标准任务', risk:'高'},
    {type:'判断密集型', feature:'需要在模糊情境中做决策', risk:'低'},
    {type:'关系密集型', feature:'价值来自人与人之间的信任', risk:'低'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 6rem;' + S.hdrCell + '">工作类型</span>'
    + '<span style="flex:1;' + S.hdrCell + '">核心特征</span>'
    + '<span style="flex:0 0 3rem;text-align:right;' + S.hdrCell + '">替代风险</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 6rem;' + S.priCell + '">' + r.type + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.feature + '</span>'
      + '<span style="flex:0 0 3rem;text-align:right;' + S.mutCell + '">' + r.risk + '</span></div>';
  }).join('');
  return wrap(cap('哪些工作会被替代') + hdr + rowsHtml
    + note('不是"有没有 AI 能做的部分"，而是"这个工作的核心价值在哪里"。同一个职位，不同的人做，替代风险可以差很远。'));
}

function renderArticle3Diagram() {
  const specHtml = '<div style="margin-bottom:1.8rem;">'
    + '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.4rem;">'
    + '<span style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';white-space:nowrap;">工具型</span>'
    + '<div style="flex:1;height:1px;background:' + T.border + ';position:relative;">'
    + '<div style="position:absolute;top:50%;transform:translateY(-50%);left:15%;width:5px;height:5px;border-radius:50%;background:' + T.textMuted + ';margin-left:-2.5px;"></div>'
    + '<div style="position:absolute;top:50%;transform:translateY(-50%);left:50%;width:5px;height:5px;border-radius:50%;background:' + T.textMuted + ';margin-left:-2.5px;"></div>'
    + '<div style="position:absolute;top:50%;transform:translateY(-50%);right:15%;width:5px;height:5px;border-radius:50%;background:' + T.textMuted + ';margin-right:-2.5px;"></div>'
    + '</div>'
    + '<span style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';white-space:nowrap;">平台型</span></div>'
    + '<div style="display:flex;justify-content:space-between;font-family:' + T.fontTitle + ';font-size:10px;color:' + T.textMuted + ';">'
    + '<span>你主导</span><span>混合</span><span>它主导</span></div></div>';
  const tableRows = [
    {dim:'使用方式', tool:'你定义问题，AI 执行', plat:'AI 定义框架，你填空'},
    {dim:'能力走向', tool:'放大原有判断力', plat:'逐渐替代判断'},
    {dim:'长期影响', tool:'越用越有自己的东西', plat:'越用越像 AI 的输出'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 3.5rem;' + S.hdrCell + '">维度</span>'
    + '<span style="flex:1;' + S.hdrCell + '">工具型（如 API）</span>'
    + '<span style="flex:1;' + S.hdrCell + '">平台型（如 ChatGPT）</span></div>';
  const rowsHtml = tableRows.map(function(r, i) {
    const s = i === tableRows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 3.5rem;' + S.mutCell + '">' + r.dim + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.tool + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.plat + '</span></div>';
  }).join('');
  return wrap(cap('AI 产品如何塑造使用者') + specHtml + hdr + rowsHtml
    + note('同一个人，用不同的 AI 产品，三年后会成为两种不同的人。这不是产品好坏的问题，是使用方式的问题。'));
}

function renderArticle4Diagram() {
  const rows = [
    {num:'一', dir:'缄默知识的持有者', why:'这类知识不在文本里，无法被训练'},
    {num:'二', dir:'情境判断的执行者', why:'模糊情境下的决策需要承担后果的人'},
    {num:'三', dir:'意义框架的建构者', why:'AI 能生成答案，但不能决定什么值得问'},
    {num:'四', dir:'真实人类接触的提供者', why:'人本身就是价值，不可被模拟'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 1.8rem;' + S.hdrCell + '">#</span>'
    + '<span style="flex:0 0 8rem;' + S.hdrCell + '">方向</span>'
    + '<span style="flex:1;' + S.hdrCell + '">为什么 AI 做不到</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 1.8rem;' + S.numCell + '">' + r.num + '</span>'
      + '<span style="flex:0 0 8rem;' + S.priCell + '">' + r.dir + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.why + '</span></div>';
  }).join('');
  return wrap(cap('人目前还不可替代的四个方向') + hdr + rowsHtml
    + note('这四个方向不是职业建议，是能力建设的方向。同一个人可以同时向多个方向发展。'));
}

function renderArticle5Diagram() {
  const bars = [
    {label:'旧工作消失', width:'88%', speed:'快，以年计'},
    {label:'新工作出现', width:'32%', speed:'慢，以代计'},
    {label:'人的再培训', width:'14%', speed:'最慢，以十年计'},
  ];
  const barsHtml = '<div style="display:flex;flex-direction:column;gap:1rem;">'
    + bars.map(function(b) {
      return '<div style="display:flex;align-items:center;gap:1rem;">'
        + '<span style="flex:0 0 5.5rem;font-family:' + T.fontTitle + ';font-size:12px;color:' + T.textPrimary + ';">' + b.label + '</span>'
        + '<div style="flex:1;height:1px;background:' + T.border + ';position:relative;">'
        + '<div style="position:absolute;left:0;top:0;height:1px;width:' + b.width + ';background:' + T.textPrimary + ';"></div></div>'
        + '<span style="flex:0 0 7rem;font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';">' + b.speed + '</span></div>';
    }).join('') + '</div>';
  return wrap(cap('速度的不对称') + barsHtml
    + note('三条速度不一致，中间的错配期由人承担。这是 AI 时代真正的就业问题，不是"有没有新工作"，而是"谁来承担中间的代价"。'));
}

function renderArticle6Diagram() {
  const rows = [
    {edu:'标准答案输出', ai:'文本生成'},
    {edu:'在框架内做题', ai:'模式化推理'},
    {edu:'服从指令完成任务', ai:'指令跟随'},
    {edu:'猜考官想要什么', ai:'用户期待对齐'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:1;' + S.hdrCell + '">教育训练了</span>'
    + '<span style="flex:0 0 1.5rem;text-align:center;' + S.hdrCell + '"></span>'
    + '<span style="flex:1;' + S.hdrCell + '">AI 免费提供了</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:1;font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textPrimary + ';line-height:1.6;">' + r.edu + '</span>'
      + '<span style="flex:0 0 1.5rem;text-align:center;' + S.mutCell + '">↔</span>'
      + '<span style="flex:1;' + S.mutCell + ';font-size:12px;">' + r.ai + '</span></div>';
  }).join('');
  return wrap(cap('教育训练的能力，和 AI 提供的能力') + hdr + rowsHtml
    + note('这不是某个人的过错。我们用整整一代人的时间，把人训练成了 AI 即将免费提供的东西。'));
}

function renderArticle7Diagram() {
  const rows = [
    {num:'一', layer:'工具层', action:'学会用 AI，但不被 AI 定义'},
    {num:'二', layer:'能力层', action:'把 AI 省出来的时间，用来建设 AI 做不了的东西'},
    {num:'三', layer:'判断层', action:'训练自己在模糊情境下做决策的能力'},
    {num:'四', layer:'意义层', action:'知道自己在做什么，为什么做，做给谁'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 1.8rem;' + S.hdrCell + '">#</span>'
    + '<span style="flex:0 0 4.5rem;' + S.hdrCell + '">层次</span>'
    + '<span style="flex:1;' + S.hdrCell + '">核心问题</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 1.8rem;' + S.numCell + '">' + r.num + '</span>'
      + '<span style="flex:0 0 4.5rem;' + S.priCell + '">' + r.layer + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.action + '</span></div>';
  }).join('');
  return wrap(cap('四个层次的行动框架') + hdr + rowsHtml
    + note('这四层不是阶梯，是同时存在的。但大多数人只停在第一层，以为学会工具就够了。'));
}

function renderArticle8Diagram() {
  const rows = [
    {tool:'锤子',   ext:'手的力量',       dec:'打哪里',               hi:false},
    {tool:'汽车',   ext:'腿的速度',       dec:'去哪里',               hi:false},
    {tool:'计算器', ext:'脑的运算',       dec:'算什么',               hi:false},
    {tool:'AI',     ext:'脑的生成与推理', dec:'问什么、信什么、做什么', hi:true},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 4rem;' + S.hdrCell + '">工具</span>'
    + '<span style="flex:1;' + S.hdrCell + '">延伸了</span>'
    + '<span style="flex:1;' + S.hdrCell + '">决定权仍在</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    const ts = r.hi
      ? 'flex:0 0 4rem;font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textPrimary + ';font-weight:500;'
      : 'flex:0 0 4rem;' + S.mutCell;
    return '<div style="' + s + '">'
      + '<span style="' + ts + '">' + r.tool + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.ext + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.dec + '</span></div>';
  }).join('');
  return wrap(cap('工具延伸了什么，决定权在哪里') + hdr + rowsHtml
    + note('AI 延伸的是认知本身。这是历史上第一次，工具延伸到了"判断"这个层面。决定权还在人这里，但这一次，放弃决定权的代价比以往任何时候都大。'));
}

function renderArticle9Diagram() {
  const rows = [
    {num:'一', name:'事实捏造', desc:'生成了不存在的信息，但语气和格式与真实信息无法区分'},
    {num:'二', name:'自我误判', desc:'把虚构的内容当作真实素材，做了进一步分析，越分析越确信'},
    {num:'三', name:'情绪误导', desc:'用高度肯定的语气包装前两层，让虚构内容披上"专业认可"的外衣'},
    {num:'四', name:'替代决策', desc:'给出具有行动指向的建议，但 AI 不对后果负责'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 1.8rem;' + S.hdrCell + '">#</span>'
    + '<span style="flex:0 0 5rem;' + S.hdrCell + '">层次</span>'
    + '<span style="flex:1;' + S.hdrCell + '">发生了什么</span></div>';
  const rowsHtml = rows.map(function(r, i) {
    const s = i === rows.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 1.8rem;' + S.numCell + '">' + r.num + '</span>'
      + '<span style="flex:0 0 5rem;' + S.priCell + '">' + r.name + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.desc + '</span></div>';
  }).join('');
  return wrap(cap('AI 失误的四个层次') + hdr + rowsHtml
    + note('每一层都强化前一层。AI 不只会犯错，被追问时还会用更精致的语言把错误的性质再降一档。'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 研究板块（UserJourneyMap / MethodPrinciples / PhotoGallery）
// ═══════════════════════════════════════════════════════════════════════════════

function renderUserJourneyMap() {
  const stages = [
    {num:'01', phase:'售前', label:'好奇',     plat:'社媒/内容平台',   desc:'初步接触产品类别，形成模糊兴趣'},
    {num:'02', phase:'售前', label:'求解',     plat:'论坛/社区',       desc:'主动搜索信息，识别真实痛点与需求'},
    {num:'03', phase:'售中', label:'搜索对比', plat:'测评/视频',       desc:'对比多品牌，收集用户对营销的真实反应'},
    {num:'04', phase:'售中', label:'购买决策', plat:'电商评论/问答',   desc:'参考已购用户体验，评估产品缺陷与优势'},
    {num:'05', phase:'售中', label:'使用体验', plat:'真实反馈渠道',   desc:'形成真实产品评价，关注实际使用场景'},
    {num:'06', phase:'售中', label:'分享传播', plat:'社交媒体',       desc:'主动传播体验，情绪化表达，传播态势形成'},
    {num:'07', phase:'售后', label:'深度参与', plat:'专业论坛/群组', desc:'深度讨论，意见领袖出现，行业认知形成'},
    {num:'08', phase:'售后', label:'口碑形成', plat:'极端评价/推荐', desc:'完成信任闭环，极端评价驱动复购与推荐'},
  ];
  const hdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 2.2rem;' + S.hdrCell + '">#</span>'
    + '<span style="flex:0 0 3rem;' + S.hdrCell + '">阶段</span>'
    + '<span style="flex:0 0 5rem;' + S.hdrCell + '">状态</span>'
    + '<span style="flex:0 0 7rem;' + S.hdrCell + '">主要平台</span>'
    + '<span style="flex:1;' + S.hdrCell + '">信息特征</span></div>';
  const rowsHtml = stages.map(function(r, i) {
    const s = i === stages.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 2.2rem;' + S.numCell + '">' + r.num + '</span>'
      + '<span style="flex:0 0 3rem;' + S.mutCell + '">' + r.phase + '</span>'
      + '<span style="flex:0 0 5rem;' + S.priCell + '">' + r.label + '</span>'
      + '<span style="flex:0 0 7rem;' + S.secCell + '">' + r.plat + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + r.desc + '</span></div>';
  }).join('');
  return wrap(cap('用户旅程图 × 数据源定位') + hdr + rowsHtml
    + note('从售前到售后，用户在不同平台留下不同性质的痕迹。拆开一个或许有价值，但似乎以偏概全——跨平台对照才能逼近真实。'));
}

function renderMethodPrinciples() {
  // 六看三定框架
  const lookItems = ['看市场','看行业','看竞品','看自己','看用户','看文化★'];
  const defineItems = ['定方向','定目标','定策略'];
  const frameworkHtml = '<div style="margin-bottom:1.5rem;">'
    + '<div style="font-family:' + T.fontTitle + ';font-size:12px;font-weight:600;color:' + T.textPrimary + ';margin-bottom:0.8rem;">六看三定模型</div>'
    + '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.8rem;">'
    + '<div style="flex:1;min-width:180px;padding:12px;border:0.5px solid ' + T.border + ';background:' + T.bgSubtle + ';">'
    + '<div style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';margin-bottom:8px;">战略洞察（六看）</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
    + lookItems.map(function(t) {
        const isH = t.includes('★');
        const label = t.replace('★','');
        return '<span style="font-family:' + T.fontTitle + ';font-size:12px;padding:4px 10px;background:white;'
          + (isH ? 'border:1px solid #7F77DD;color:#7F77DD;font-weight:600;' : 'border:0.5px solid ' + T.border + ';color:' + T.textPrimary + ';')
          + '">' + label + '</span>';
      }).join('')
    + '</div></div>'
    + '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;">'
    + '<span style="font-size:18px;color:' + T.textMuted + ';">→</span>'
    + '<span style="font-family:' + T.fontTitle + ';font-size:12px;font-weight:600;color:#1D9E75;border:1px solid #1D9E75;padding:6px 10px;text-align:center;">识别<br/>机会</span>'
    + '<span style="font-size:18px;color:#1D9E75;">→</span></div>'
    + '<div style="flex:1;min-width:150px;padding:12px;border:0.5px solid ' + T.border + ';background:' + T.bgSubtle + ';">'
    + '<div style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';margin-bottom:8px;">战略制定（三定）</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px;">'
    + defineItems.map(function(t) {
        return '<span style="font-family:' + T.fontTitle + ';font-size:12px;padding:4px 10px;border:0.5px solid ' + T.border + ';color:' + T.textPrimary + ';background:white;">' + t + '</span>';
      }).join('')
    + '</div></div></div>'
    + '<div style="font-family:' + T.fontTitle + ';font-size:11px;color:' + T.textMuted + ';font-style:italic;">'
    + '工具链：PEST · 5F分析 · 价值链 · SWOT · 用户旅程 · 文化编码</div></div>';

  // 四阶段分析管线
  const phases = [
    {num:'I',   color:'#534AB7', name:'数据构建', desc:'多平台爬取 → 去重/去噪/语言检测 → 时序标注（区分产品迭代前后语义漂移）→ 情感极性预标注 → 结构化语料库'},
    {num:'II',  color:'#0F6E56', name:'算法发现', desc:'嵌入向量聚类 → LDA 主题模型（核心）→ 层级解析引擎（自研）→ 主题—文档映射表。每个结论可追溯至原始引文片段，解决传统 LDA 黑箱问题'},
    {num:'III', color:'#BA7517', name:'精确取样', desc:'基于主题分布与情感强度分层抽样：高频高情感主题优先深挖；矛盾信号（正负并存）重点取样；长尾低频但高信息量评论补充覆盖'},
    {num:'IV',  color:'#993C1D', name:'质性验证', desc:'半结构化访谈 / 用户测试观察 / 竞品横向对比。质性与量化结论不一致时回到 Phase I 重构假设'},
  ];
  const phaseHdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 2.5rem;' + S.hdrCell + '">Phase</span>'
    + '<span style="flex:0 0 5rem;' + S.hdrCell + '">名称</span>'
    + '<span style="flex:1;' + S.hdrCell + '">核心内容</span></div>';
  const phaseRows = phases.map(function(p, i) {
    const s = i === phases.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 2.5rem;font-family:' + T.fontMono + ';font-size:11px;font-weight:600;color:' + p.color + ';">' + p.num + '</span>'
      + '<span style="flex:0 0 5rem;font-family:' + T.fontTitle + ';font-size:13px;font-weight:500;color:' + T.textPrimary + ';">' + p.name + '</span>'
      + '<span style="flex:1;font-family:' + T.fontTitle + ';font-size:12px;color:' + T.textSecondary + ';line-height:1.6;">' + p.desc + '</span></div>';
  }).join('');
  const pipelineHtml = '<div style="margin-bottom:1.5rem;">'
    + '<div style="font-family:' + T.fontTitle + ';font-size:12px;font-weight:600;color:' + T.textPrimary + ';margin-bottom:0.8rem;">四阶段分析管线</div>'
    + phaseHdr + phaseRows + '</div>';

  // 三重验证
  const verifs = [
    {label:'可追溯性', desc:'每个结论 → 主题簇 → 子主题 → 原始引文片段，全程有据可查'},
    {label:'可复现性', desc:'数据处理参数、模型超参、取样策略全部文档化，支持独立复现'},
    {label:'交叉稳健性', desc:'量化结论经质性三角互证；跨平台对照消除单一平台偏见'},
  ];
  const verifHdr = '<div style="' + S.hdrRow + '">'
    + '<span style="flex:0 0 6rem;' + S.hdrCell + '">验证维度</span>'
    + '<span style="flex:1;' + S.hdrCell + '">说明</span></div>';
  const verifRows = verifs.map(function(v, i) {
    const s = i === verifs.length - 1 ? S.lastRow : S.row;
    return '<div style="' + s + '">'
      + '<span style="flex:0 0 6rem;' + S.priCell + '">' + v.label + '</span>'
      + '<span style="flex:1;' + S.secCell + '">' + v.desc + '</span></div>';
  }).join('');
  const verifHtml = '<div>'
    + '<div style="font-family:' + T.fontTitle + ';font-size:12px;font-weight:600;color:' + T.textPrimary + ';margin-bottom:0.8rem;">三重验证机制</div>'
    + verifHdr + verifRows + '</div>';

  return wrap(cap('研究方法论（六看三定 · 四阶段管线）')
    + frameworkHtml + pipelineHtml + verifHtml
    + note('有效不是「看起来有道理」。是可复现、可追溯、可证伪。机器筛选方向，人做最终判断。方法论论文已投稿 JMMR，审核通过后将在 GitHub 开源完整实现。'));
}

function renderPhotoGallery() {
  return '<div style="margin:2.5rem 0;padding:28px 32px;background:' + T.bgSubtle + ';border:1px dashed ' + T.border + ';text-align:center;">'
    + '<div style="font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textMuted + ';font-style:italic;line-height:1.7;">图片集 · 完整版请访问官网</div></div>';
}

// ═══════════════════════════════════════════════════════════════════════════════
// 主入口
// ═══════════════════════════════════════════════════════════════════════════════

export function renderComponentAsStatic(componentName) {
  const renderers = {
    // AI 与思考板块
    'PrefaceDiagram':  renderPrefaceDiagram,
    'Article1Diagram': renderArticle1Diagram,
    'Article2Diagram': renderArticle2Diagram,
    'Article3Diagram': renderArticle3Diagram,
    'Article4Diagram': renderArticle4Diagram,
    'Article5Diagram': renderArticle5Diagram,
    'Article6Diagram': renderArticle6Diagram,
    'Article7Diagram': renderArticle7Diagram,
    'Article8Diagram': renderArticle8Diagram,
    'Article9Diagram': renderArticle9Diagram,
    // 研究板块
    'UserJourneyMap':   renderUserJourneyMap,
    'MethodPrinciples': renderMethodPrinciples,
    'PhotoGallery':     renderPhotoGallery,
  };
  const fn = renderers[componentName];
  if (fn) {
    console.log('   🎨 渲染组件: ' + componentName);
    return fn();
  }
  // 未知组件：渲染带名称的占位符，不静默丢失内容
  console.log('   ⚠️  未知组件: ' + componentName);
  return '<div style="margin:2rem 0;padding:12px 16px;border:1px dashed ' + T.border
    + ';font-family:' + T.fontTitle + ';font-size:13px;color:' + T.textMuted + ';">[' + componentName + ']</div>';
}

export default { renderComponentAsStatic };
