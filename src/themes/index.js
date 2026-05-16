import { bobqiushao } from './bobqiushao.js';

const themes = { bobqiushao };

export function getTheme(name) {
  return themes[name] || themes.bobqiushao;
}

export function listThemes() {
  return Object.values(themes).map(t => ({ name: t.name, description: t.description }));
}

/**
 * 将主题样式以内联 style 属性注入 HTML 各标签
 * 1. 先保存 <pre> 块（防止其内 <code> 被行内 code 样式污染）
 * 2. 对余下 HTML 的各标签注入 style
 * 3. 还原 <pre> 块并分别应用 pre / preCode 样式
 */
export function applyInlineStyles(html, theme) {
  let result = html;

  // Step 1: 保存 <pre> 块
  const preBlocks = [];
  result = result.replace(/<pre(\s[^>]*)?>[\s\S]*?<\/pre>/gi, (match) => {
    const idx = preBlocks.length;
    preBlocks.push(match);
    return '<!--__PRE_BLOCK_' + idx + '__-->';
  });

  // Step 2: 各标签注入规则 [tag, style, isSelfClosing]
  const tagRules = [
    ['h1',         theme.h1         ],
    ['h2',         theme.h2         ],
    ['h3',         theme.h3         ],
    ['h4',         theme.h4         ],
    ['p',          theme.p          ],
    ['blockquote', theme.blockquote ],
    ['ul',         theme.ul         ],
    ['ol',         theme.ol         ],
    ['li',         theme.li         ],
    ['table',      theme.table      ],
    ['th',         theme.th         ],
    ['td',         theme.td         ],
    ['a',          theme.a          ],
    ['strong',     theme.strong     ],
    ['em',         theme.em         ],
    ['code',       theme.code       ],
    ['hr',         theme.hr,   true ],
    ['img',        theme.img,  true ],
  ];

  for (const [tag, style, selfClosing] of tagRules) {
    if (!style) continue;
    const cleanStyle = style.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (selfClosing) {
      const re = new RegExp('<' + tag + '((?:\\s[^>]*)?)\\s*/?>', 'gi');
      result = result.replace(re, (match, attrs) => injectStyle(tag, attrs || '', cleanStyle, true));
    } else {
      const re = new RegExp('<' + tag + '((?:\\s[^>]*)?)>', 'gi');
      result = result.replace(re, (match, attrs) => injectStyle(tag, attrs || '', cleanStyle, false));
    }
  }

  // Step 3: 还原 <pre> 块
  for (let i = 0; i < preBlocks.length; i++) {
    let preHtml = preBlocks[i];
    if (theme.pre) {
      const cleanPreStyle = theme.pre.replace(/\s*\n\s*/g, ' ').trim();
      preHtml = preHtml.replace(/<pre((?:\s[^>]*)?)>/i, (m, attrs) => injectStyle('pre', attrs || '', cleanPreStyle, false));
    }
    if (theme.preCode) {
      const cleanPreCodeStyle = theme.preCode.replace(/\s*\n\s*/g, ' ').trim();
      preHtml = preHtml.replace(/<code((?:\s[^>]*)?)>/i, (m, attrs) => injectStyle('code', attrs || '', cleanPreCodeStyle, false));
    }
    result = result.replace('<!--__PRE_BLOCK_' + i + '__-->', preHtml);
  }

  return result;
}

function injectStyle(tag, attrs, themeStyle, selfClosing) {
  const existingMatch = attrs.match(/\bstyle="([^"]*)"/i);
  if (existingMatch) {
    const existing = existingMatch[1].trim();
    const merged = existing ? themeStyle + ';' + existing : themeStyle;
    const newAttrs = attrs.replace(/\bstyle="[^"]*"/i, 'style="' + merged + '"');
    return '<' + tag + newAttrs + '>';
  }
  return '<' + tag + attrs + ' style="' + themeStyle + '">';
}
