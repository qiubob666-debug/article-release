/**
 * 增强版转换器 - 支持多端内容适配
 *
 * 功能：
 * 1. 解析平台标记（@platform:xxx-only）
 * 2. 处理Astro组件降级
 * 3. 自动处理图片和链接
 * 4. 根据目标平台生成优化后的HTML
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { getTheme, applyInlineStyles } from '../themes/index.js';
import { parsePlatformMarkers, DOWNGRADE_RULES } from './platform-config.js';
import { processImages } from './image-processor.js';
import { processLinks } from './link-processor.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

/**
 * 解析MDX中的Astro组件并降级处理
 */
function parseAndDowngradeComponents(content, targetPlatform) {
  // 匹配 Astro 组件导入: import X from '...'
  let processedContent = content.replace(/^import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, '');

  // 匹配组件使用: <ComponentName />
  const componentRegex = /<([A-Z][a-zA-Z0-9]*)(\s[^>]*)?\/>/g;

  processedContent = processedContent.replace(componentRegex, (match, componentName, props) => {
    console.log(`   📦 发现组件: ${componentName}`);

    if (targetPlatform === 'wechat' || targetPlatform === 'wechat-preview') {
      // 降级为替代内容
      const downgradeFn = DOWNGRADE_RULES.component.wechat;
      return downgradeFn(componentName);
    }

    // 其他平台保持原样或根据规则处理
    return match;
  });

  // 匹配带内容的组件: <ComponentName>content</ComponentName>
  const componentWithContentRegex = /<([A-Z][a-zA-Z0-9]*)(\s[^>]*)?>([\s\S]*?)<\/\1>/g;

  processedContent = processedContent.replace(componentWithContentRegex, (match, componentName, props, innerContent) => {
    console.log(`   📦 发现组件(带内容): ${componentName}`);

    if (targetPlatform === 'wechat' || targetPlatform === 'wechat-preview') {
      const downgradeFn = DOWNGRADE_RULES.component.wechat;
      return downgradeFn(componentName);
    }

    return match;
  });

  return processedContent;
}

/**
 * 增强版的Markdown转换器
 */
export async function convertEnhanced(filePath, themeName, options = {}) {
  const {
    targetPlatform = 'wechat',  // 目标平台：web | wechat | wechat-preview
    uploadImageFn = null,       // 图片上传函数（公众号用）
    baseUrl = 'https://bobqiushao.online',  // 网站基础URL
  } = options;

  console.log('\n🚀 增强转换模式启动');
  console.log(`📄 文件: ${filePath}`);
  console.log(`🎨 主题: ${themeName}`);
  console.log(`🖥️  目标平台: ${targetPlatform}`);

  // 1. 读取文件
  const content = readFileSync(filePath, 'utf-8');

  // 2. 解析frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error('无法解析 frontmatter');
  }
  
  const frontmatterStr = frontmatterMatch[1];
  let body = frontmatterMatch[2];

  // 3. 解析frontmatter数据
  const frontmatter = {};
  frontmatterStr.split('\n').forEach(line => {
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

  // 4. 处理Astro组件（降级）
  console.log('\n📦 处理组件...');
  body = parseAndDowngradeComponents(body, targetPlatform);

  // 5. 解析平台标记
  console.log('🏷️  解析平台标记...');
  body = parsePlatformMarkers(body, targetPlatform);

  // 6. Markdown转HTML
  console.log('🔄 Markdown → HTML...');
  marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch (e) {}
      }
      return hljs.highlightAuto(code).value;
    },
  });

  let htmlBody = marked(body);

  // 7. 应用主题样式
  console.log('🎨 应用主题样式...');
  const theme = getTheme(themeName);
  htmlBody = applyInlineStyles(htmlBody, theme);

  // 8. 处理图片
  console.log('\n🖼️  处理图片...');
  const imageResult = await processImages(htmlBody, targetPlatform, {
    uploadFn: uploadImageFn,
    baseDir: resolve(PROJECT_ROOT, 'src', 'content', 'articles'),
  });
  htmlBody = imageResult.html;
  console.log(`✅ 图片处理完成 (${imageResult.processedCount}张)`);

  // 9. 处理链接
  console.log('🔗 处理链接...');
  htmlBody = processLinks(htmlBody, targetPlatform, { baseUrl });
  console.log('✅ 链接处理完成');

  // 10. 组装最终HTML
  const fullHtml = `<!-- 标题请在微信公众号编辑器中单独填写 -->
<!-- 生成时间: ${new Date().toISOString()} -->
<!-- 目标平台: ${targetPlatform} -->
<section style="${theme.container}">
${htmlBody}
</section>`;

  console.log('\n✅ 转换完成！');
  console.log(`📊 统计:`);
  console.log(`   - 图片: ${imageResult.processedCount} 张`);
  console.log(`   - 平台: ${targetPlatform}`);

  return {
    html: fullHtml,
    title: frontmatter.title,
    description: frontmatter.description,
    metadata: {
      platform: targetPlatform,
      theme: themeName,
      imageCount: imageResult.processedCount,
      generatedAt: new Date().toISOString(),
    },
  };
}

export default {
  convertEnhanced,
};
