/**
 * 平台配置 - 定义不同平台的转换规则
 *
 * 使用方法：
 * 1. 在 MDX 文件中使用注释标记平台特定内容
 * 2. 转换器根据目标平台自动应用规则
 *
 * 示例：
 * <!-- @platform:web-only -->
 * <ArticleDiagram />
 * <!-- @end-platform -->
 *
 * <!-- @platform:wechat-only -->
 * [点击阅读完整版](https://bobqiushao.online/reading/preface)
 * <!-- @end-platform -->
 */

export const PLATFORMS = {
  web: {
    name: '官网',
    description: 'Astro 完整功能',
    features: {
      components: true,      // 支持 Astro 组件
      interactive: true,    // 支持交互元素
      internalLinks: true,  // 支持内部路由
      externalLinks: true,  // 支持外部链接
      images: 'local',      // 使用本地图片
      codeHighlight: true,  // 代码高亮
      math: true,           // 数学公式
    },
  },
  wechat: {
    name: '微信公众号',
    description: '微信HTML限制版',
    features: {
      components: false,     // 不支持组件，需降级
      interactive: false,    // 不支持交互
      internalLinks: false,  // 内部链接转为外部URL
      externalLinks: true,   // 外部链接保留
      images: 'uploaded',    // 图片必须上传到微信服务器
      codeHighlight: true,   // 代码高亮（内联样式）
      math: false,           // 不支持数学公式（转图片）
    },
    // 微信特殊配置
    constraints: {
      maxImageSize: 2 * 1024 * 1024,  // 2MB
      supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
      maxHtmlLength: 200000,          // 20万字符
      noExternalCSS: true,            // 不能使用外部样式表
      noJavaScript: true,             // 不能使用JavaScript
      inlineStylesOnly: true,         // 只能使用内联样式
    },
  },
};

/**
 * 内容降级规则
 * 当某个平台不支持某类内容时，如何降级处理
 */
export const DOWNGRADE_RULES = {
  // Astro 组件 -> 替代方案
  component: {
    web: (componentName) => `<${componentName} />`,
    wechat: (componentName, props) => {
      // 根据组件类型返回不同的降级方案
      const componentMap = {
        'ArticleDiagram': () => '<p style="text-align:center;color:#8C8C8C;font-size:14px;">[图表 - 请在官网查看完整版]</p>',
        'PhotoGallery': () => '<p style="text-align:center;color:#8C8C8C;font-size:14px;">[图片集 - 请在官网查看]</p>',
        'UserJourneyMap': () => '<p style="text-align:center;color:#8C8C8C;font-size:14px;">[用户旅程图 - 请在官网查看]</p>',
        'VariableGrid': () => '<p style="text-align:center;color:#8C8C8C;font-size:14px;">[变量网格 - 请在官网查看]</p>',
        'XRef': (props) => `参见：《${props.title || '相关文章'}》`,
        'default': () => '<p style="color:#8C8C8C;font-style:italic;">[此内容仅在官网完整显示]</p>',
      };

      return (componentMap[componentName] || componentMap['default'])();
    },
  },

  // 图片处理
  image: {
    web: (src, alt) => `<img src="${src}" alt="${alt}" />`,
    wechat: async (src, alt, uploadFn) => {
      try {
        // 上传图片到微信服务器并返回media_id或URL
        const uploadedUrl = await uploadFn(src);
        return `<img src="${uploadedUrl}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:40px auto;" />`;
      } catch (error) {
        console.warn(`⚠️ 图片上传失败: ${src}`, error.message);
        return `<p style="text-align:center;color:#FF6B6B;background:#FFF5F5;padding:12px;border-radius:4px;">[图片加载失败: ${alt}]</p>`;
      }
    },
  },

  // 链接处理
  link: {
    web: (href, text) => `<a href="${href}">${text}</a>`,
    wechat: (href, text) => {
      // 内部链接转为完整URL
      if (href.startsWith('/')) {
        const fullUrl = `https://bobqiushao.online${href}`;
        return `<a href="${fullUrl}" style="color:#6B4423;text-decoration:underline;" target="_blank">${text} ↗</a>`;
      }
      // 外部链接添加target="_blank"
      return `<a href="${href}" style="color:#6B4423;text-decoration:underline;" target="_blank">${text} ↗</a>`;
    },
  },

  // 数学公式
  math: {
    web: (latex) => `$${latex}$`,  // 使用KaTeX/MathJax
    wechat: (latex) => {
      // 微信不支持LaTeX，转为文本描述或提示
      return `<span style="background:#F2F0EA;padding:2px 6px;border-radius:3px;font-family:monospace;font-size:14px;">[公式: ${latex}]</span>`;
    },
  },
};

/**
 * 平台标记解析器
 * 解析MDX中的平台特定内容标记
 *
 * 支持的标记格式：
 * <!-- @platform:web-only -->
 * 仅在官网显示的内容
 * <!-- @end-platform -->
 *
 * <!-- @platform:wechat-only -->
 * 仅在公众号显示的内容
 * <!-- @end-platform -->
 */
export function parsePlatformMarkers(content, targetPlatform) {
  const platformRegex = /<!--\s*@platform:(\w+)-only\s*-->([\s\S]*?)<!--\s*@end-platform\s*-->/g;

  let result = content;

  result = result.replace(platformRegex, (match, platform, markedContent) => {
    if (platform === targetPlatform) {
      return markedContent;
    }
    // 不是目标平台的内容，移除
    return '';
  });

  return result;
}

export default PLATFORMS;
