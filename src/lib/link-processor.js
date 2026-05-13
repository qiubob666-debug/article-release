/**
 * 链接处理器 - 处理多端超链接适配
 *
 * 功能：
 * 1. 检测Markdown/HTML中的超链接
 * 2. 根据目标平台转换链接
 * 3. 内部链接转完整URL（公众号）
 * 4. 外部链接添加target="_blank"
 */

import { DOWNGRADE_RULES } from './platform-config.js';

/**
 * 从HTML中提取所有链接
 */
export function extractLinks(html) {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      original: match[0],
      href: match[1],
      text: match[2].trim(),
    });
  }

  return links;
}

/**
 * 判断是否为内部链接
 */
export function isInternalLink(href) {
  return href.startsWith('/') ||
         href.startsWith('./') ||
         href.startsWith('../') ||
         (href.startsWith('http') && href.includes('bobqiushao.online'));
}

/**
 * 转换内部链接为完整URL
 */
export function convertInternalLink(href, baseUrl = 'https://bobqiushao.online') {
  if (href.startsWith('/')) {
    return `${baseUrl}${href}`;
  }

  // 处理相对路径
  if (href.startsWith('./') || href.startsWith('../')) {
    // 简单处理，实际可能需要更复杂的路径解析
    return `${baseUrl}/${href.replace(/^\.\//, '').replace(/\.\.\//g, '')}`;
  }

  return href;
}

/**
 * 处理单个链接
 */
export function processLink(link, targetPlatform) {
  const { href, text } = link;

  if (targetPlatform === 'wechat') {
    return DOWNGRADE_RULES.link.wechat(href, text);
  } else {
    return DOWNGRADE_RULES.link.web(href, text);
  }
}

/**
 * 链接处理管道
 * 根据目标平台处理所有链接
 */
export function processLinks(html, targetPlatform, options = {}) {
  const { baseUrl = 'https://bobqiushao.online' } = options;
  const links = extractLinks(html);

  console.log(`🔗 发现 ${links.length} 个链接`);

  let result = html;

  for (const link of links) {
    try {
      const processedLink = processLink(link, targetPlatform);
      
      // 替换原始链接
      result = result.replace(link.original, processedLink);
      
      console.log(`   ✅ ${link.href.substring(0, 50)}...`);
    } catch (error) {
      console.error(`   ❌ 链接处理失败: ${link.href}`, error.message);
    }
  }

  return result;
}

/**
 * Markdown链接处理
 * 将Markdown格式的链接转换为平台适配的HTML
 */
export function processMarkdownLinks(markdown, targetPlatform) {
  // 匹配 [text](url) 格式
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  return markdown.replace(mdLinkRegex, (match, text, url) => {
    if (targetPlatform === 'wechat') {
      return DOWNGRADE_RULES.link.wechat(url, text);
    }
    return DOWNGRADE_RULES.link.web(url, text);
  });
}

export default {
  extractLinks,
  isInternalLink,
  convertInternalLink,
  processLink,
  processLinks,
  processMarkdownLinks,
};
