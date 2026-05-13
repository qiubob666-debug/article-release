import { readFileSync } from 'fs';
import { resolve } from 'path';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { getTheme, applyInlineStyles } from './themes/index.js';

let wenyanRender = null;
let getAllGzhThemes = null;

try {
  const wenyanWrapper = await import('@wenyan-md/core/wrapper.js');
  const wenyanCore = await import('@wenyan-md/core');
  wenyanRender = wenyanWrapper.renderStyledContent;
  getAllGzhThemes = wenyanCore.getAllGzhThemes;
} catch (e) {
  console.log('⚠️  @wenyan-md/core 未安装，将仅使用 marked 引擎');
}

export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];

  const frontmatter = {};
  yamlStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(item =>
        item.trim().replace(/^["']|["']$/g, '')
      );
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      value = Number(value);
    }

    frontmatter[key] = value;
  });

  return { frontmatter, body };
}

export function convertWithMarked(filePath, themeName) {
  const content = readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  const theme = getTheme(themeName);
  console.log(`🔄 [marked] 正在转换: ${filePath}`);
  console.log(`   主题: ${theme.name}`);

  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch (e) {}
      }
      return hljs.highlightAuto(code).value;
    },
  });

  let htmlBody = marked(body);
  htmlBody = applyInlineStyles(htmlBody, theme);

  const fullHtml = `<!-- 标题请在微信公众号编辑器中单独填写 -->
<section style="${theme.container}">
${htmlBody}
</section>`;

  return { html: fullHtml, title: frontmatter.title, description: frontmatter.description };
}

export async function convertWithWenyan(filePath, themeId) {
  if (!wenyanRender) {
    throw new Error('@wenyan-md/core 未安装，请运行 "pnpm add @wenyan-md/core"');
  }

  console.log(`🔄 [wenyan] 正在转换: ${filePath}`);
  console.log(`   主题: ${themeId}`);

  const content = readFileSync(filePath, 'utf-8');
  const { frontmatter } = parseFrontmatter(content);

  const result = await wenyanRender(content, {
    themeId,
    isMacStyle: true,
    isAddFootnote: true,
  });

  let html, title, description;
  if (typeof result === 'string') {
    html = result;
    title = frontmatter.title;
    description = frontmatter.description;
  } else {
    html = result.content;
    title = result.title || frontmatter.title;
    description = result.description || frontmatter.description;
  }

  return { html, title, description };
}

export function isWenyanAvailable() {
  return !!wenyanRender;
}

export function getWenyanThemes() {
  if (!getAllGzhThemes) return [];
  return getAllGzhThemes();
}
