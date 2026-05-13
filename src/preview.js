import { convertWithMarked } from './convert.js';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

async function generatePreview() {
  const filePath = resolve(PROJECT_ROOT, 'articles', 'preface.mdx');
  
  console.log('🔄 正在生成预览（100%匹配官网样式）...');
  const result = await convertWithMarked(filePath, 'bobqiushao');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>序言 · 一份关于我们处境的整理 - 秋少官网风格预览</title>
    <style>
        /* ===== 完全匹配官网 global.css + reading/[...slug].astro ===== */
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            background-color: #FAF9F6;
            color: #1A1A1A;
            font-family: "STKaiti", "华文楷体", serif;
            font-size: 16px;
            line-height: 1.75;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        body {
            min-height: 100vh;
            background-color: #FAF9F6;
        }
        
        /* 完全匹配官网 .article-container */
        .article-container {
            max-width: 750px;
            margin: 0 auto;
            padding: 5rem 2rem;  /* 桌面端：上下80px，左右32px */
        }
        
        /* 文章头部 - 匹配官网布局 */
        .article-header {
            margin-bottom: 3rem;
            text-align: center;
        }
        
        .article-title {
            font-family: "PingFang SC", "Microsoft YaHei", "微软雅黑", sans-serif;
            font-size: 26px;
            font-weight: 500;
            color: #1A1A1A;
            line-height: 1.3;
            margin-bottom: 12px;
            letter-spacing: -0.01em;
        }
        
        .article-meta {
            font-size: 14px;
            color: #8C8C8C;
            font-family: "JetBrains Mono", monospace;
        }
        
        /* 提示框 */
        .notice {
            background: #FFF9E6;
            border-left: 4px solid #FFB800;
            padding: 16px 20px;
            margin-bottom: 28px;
            font-size: 14px;
            color: #856404;
            border-radius: 0 4px 4px 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        
        /* 完全匹配官网 .article-body */
        .article-body {
            font-size: 16.8px;           /* 1.05rem */
            line-height: 1.9;
            color: #1A1A1A;
            margin-bottom: 4rem;          /* 64px */
            font-family: "STKaiti", "华文楷体", serif;
        }
        
        /* 响应式 - 匹配官网移动端适配 */
        @media (max-width: 767px) {
            .article-container {
                padding: 3rem 1.2rem 2rem;   /* 上下48px/左右19.2px，下32px */
            }
            
            .article-title {
                font-size: 22px;             /* 1.6rem */
                line-height: 1.35;
            }
            
            .article-meta {
                margin-bottom: 2rem;
                font-size: 11px;
            }
            
            .article-body {
                font-size: 16px;              /* 1rem */
                line-height: 1.85;
            }
        }
    </style>
</head>
<body>
    <div class="article-container">
        <header class="article-header">
            <h1 class="article-title">序言 · 一份关于我们处境的整理</h1>
            <div class="article-meta">秋少 | 文章预览 | bobqiushao.online</div>
        </header>
        
        <div class="notice">
            ⚠️ 这是微信公众号文章预览（100%匹配官网样式），实际效果以公众号编辑器为准
        </div>
        
        <main class="article-body">
            ${result.html}
        </main>
    </div>
</body>
</html>`;
  
  const previewPath = resolve(PROJECT_ROOT, 'preview.html');
  writeFileSync(previewPath, htmlContent);
  console.log('✅ 预览文件已生成:', previewPath);
  console.log('💡 样式来源：基于 https://bobqiushao.online/reading/preface 实际测量');
}

generatePreview().catch(error => {
  console.error('❌ 生成失败:', error.message);
  process.exit(1);
});
