#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, join, normalize, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import {
  parseFrontmatter,
  convertWithMarked,
  convertWithWenyan,
  isWenyanAvailable,
  getWenyanThemes,
} from './convert.js';
import {
  getConfig,
  getAccessToken,
  uploadCoverImage,
  createDraft,
} from './wechat-api.js';
import { listThemes, getTheme } from './themes/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

function isPathSafe(inputPath, baseDir = PROJECT_ROOT) {
  if (!inputPath) return true;
  const normalized = normalize(inputPath);
  const resolved = resolve(baseDir, normalized);
  const projectResolved = resolve(baseDir);
  return resolved.startsWith(projectResolved + '/') ||
         resolved.startsWith(projectResolved + '\\') ||
         resolved === projectResolved;
}

function scanArticles(articlesDir) {
  if (!existsSync(articlesDir)) {
    return [];
  }

  return readdirSync(articlesDir)
    .filter(file => /\.(md|mdx)$/.test(file))
    .sort()
    .map(filename => {
      const filePath = join(articlesDir, filename);
      const content = readFileSync(filePath, 'utf-8');
      const { frontmatter } = parseFrontmatter(content);
      return { filename, filePath, frontmatter };
    });
}

function displayArticleList(articles) {
  console.log('\n📚 可用文章列表（共 %d 篇）：\n', articles.length);

  articles.forEach((article, index) => {
    const { frontmatter } = article;
    const title = frontmatter.title || article.filename;
    const date = frontmatter.pubDate ? new Date(frontmatter.pubDate).toLocaleDateString('zh-CN') : '未知日期';
    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : '无标签';

    console.log('  [%d] %s', index + 1, title);
    console.log('      📅 %s | 🏷️  %s', date, tags);
    console.log('');
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    filename: null,
    articlesDir: resolve(PROJECT_ROOT, 'articles'),
    theme: 'bobqiushao',
    preview: false,
    doctor: false,
    useWenyan: false,
    listThemes: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--dir' && args[i + 1]) {
      const inputDir = args[++i];
      if (!isPathSafe(inputDir)) {
        console.error('❌ 不安全的路径输入，已拒绝');
        process.exit(1);
      }
      options.articlesDir = resolve(inputDir);
    } else if (arg === '--theme' && args[i + 1]) {
      options.theme = args[++i];
    } else if (arg === '--preview') {
      options.preview = true;
    } else if (arg === '--doctor') {
      options.doctor = true;
    } else if (arg === '--wenyan' || arg === '-w') {
      options.useWenyan = true;
    } else if (arg === '--list-themes' || arg === '--lt') {
      options.listThemes = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!arg.startsWith('--') && !options.filename) {
      options.filename = arg;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
微信公众号自动发布工具

用法:
  article-release [选项] [文件名]

选项:
  --dir <目录>        指定文章目录 (默认: ./articles)
  --theme <主题>      指定主题 (默认: bobqiushao)
  --preview           仅预览 HTML，不发布
  --doctor            环境诊断模式
  --wenyan, -w        使用 @wenyan-md 引擎（需单独安装）
  --list-themes, --lt 列出所有可用主题
  --help, -h          显示此帮助信息

示例:
  article-release --doctor
  article-release --list-themes
  article-release example.mdx --preview
  article-release example.mdx --theme bobqiushao
  article-release --dir /path/to/my/articles my-article.md
`);
}

function showAllThemes() {
  const markedThemes = listThemes();
  const wenyanThemes = isWenyanAvailable() ? getWenyanThemes() : [];

  console.log('\n🎨 可用主题列表：\n');
  console.log('━'.repeat(50));

  console.log('\n[Marked 引擎]');
  markedThemes.forEach((t, i) => {
    console.log('\n  [%d] %s', i + 1, t.name);
    console.log('      %s', t.description);
  });

  if (wenyanThemes.length > 0) {
    console.log('\n[Wenyan 引擎] (使用 --wenyan 启用)');
    wenyanThemes.forEach((t, i) => {
      const meta = t.meta || t;
      console.log('\n  [%d] %s', i + 1, meta.name || meta.id);
      console.log('      %s', meta.description || '');
    });
  }

  console.log('\n━'.repeat(50));
  console.log('\n💡 使用 --theme <主题名> 指定主题');
}

async function runDoctor() {
  console.log('\n🔍 环境诊断报告');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('  [Node.js] %s %s', process.version, process.version >= 'v18' ? '✅' : '⚠️ ');

  console.log('  [marked] %s', '✅ 已安装');

  console.log('  [highlight.js] %s', '✅ 已安装');

  const wenyanAvailable = isWenyanAvailable();
  console.log('  [@wenyan-md/core] %s', wenyanAvailable ? '✅ 已安装' : '⚠️  未安装（可选）');

  const { appId, appSecret } = getConfig();
  console.log('  [WECHAT_APP_ID] %s', appId ? '✅ 已配置' : '⚠️  未配置');
  console.log('  [WECHAT_APP_SECRET] %s', appSecret ? '✅ 已配置' : '⚠️  未配置');

  const articles = scanArticles(resolve(PROJECT_ROOT, 'articles'));
  console.log('  [文章目录] ./articles/ (%d 篇)', articles.length);

  try {
    const { apiBaseUrl } = getConfig();
    await fetch(apiBaseUrl, { signal: AbortSignal.timeout(5000) });
    console.log('  [微信 API] ✅ 可访问');
  } catch (error) {
    console.log('  [微信 API] ❌ 无法访问 (%s)', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (!appId || !appSecret) {
    console.log('\n💡 提示：请先配置 .env 文件中的微信凭证');
  }
}

function createReadlineInterface() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function main() {
  const options = parseArgs();

  process.on('SIGINT', () => {
    console.log('\n\n👋 已取消操作');
    process.exit(0);
  });

  if (options.help) {
    showHelp();
    return;
  }

  if (options.listThemes) {
    showAllThemes();
    return;
  }

  if (options.doctor) {
    await runDoctor();
    return;
  }

  if (options.useWenyan && !isWenyanAvailable()) {
    console.error('❌ --wenyan 需要 @wenyan-md/core');
    console.error('   请运行: pnpm add @wenyan-md/core');
    process.exit(1);
  }

  let targetFile = null;
  let selectedArticle = null;

  if (options.filename) {
    const filePath = join(options.articlesDir, options.filename);
    if (!existsSync(filePath)) {
      console.error('\n❌ 文件不存在: %s', filePath);
      process.exit(1);
    }
    targetFile = filePath;
    const content = readFileSync(targetFile, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    selectedArticle = { filename: options.filename, filePath: targetFile, frontmatter };
  } else {
    const articles = scanArticles(options.articlesDir);
    if (articles.length === 0) {
      console.log('\n❌ 未找到任何文章，目录: %s', options.articlesDir);
      process.exit(1);
    }
    displayArticleList(articles);
    const rl = createReadlineInterface();
    try {
      const answer = await askQuestion(rl, '\n请输入文章编号 (或 q 退出): ');
      if (answer.toLowerCase() === 'q') {
        console.log('👋 已取消');
        return;
      }
      const index = parseInt(answer) - 1;
      if (isNaN(index) || index < 0 || index >= articles.length) {
        console.error('❌ 无效的选择');
        process.exit(1);
      }
      selectedArticle = articles[index];
      targetFile = selectedArticle.filePath;
    } finally {
      rl.close();
    }
  }

  console.log('\n📄 已选择: %s', selectedArticle.frontmatter.title || selectedArticle.filename);
  console.log('   引擎: %s', options.useWenyan ? '@wenyan-md' : 'marked');
  console.log('   主题: %s', options.theme);

  let convertResult;
  try {
    if (options.useWenyan) {
      convertResult = await convertWithWenyan(targetFile, options.theme);
    } else {
      convertResult = convertWithMarked(targetFile, options.theme);
    }
  } catch (error) {
    console.error('\n❌ 转换失败:', error.message);
    process.exit(1);
  }

  if (options.preview) {
    console.log('\n📋 预览模式 - HTML 内容：\n');
    console.log('─'.repeat(50));
    console.log(convertResult.html);
    console.log('─'.repeat(50));
    console.log('\n💡 移除 --preview 参数以实际发布到草稿箱');
    return;
  }

  try {
    const { apiBaseUrl } = getConfig();
    const defaultCover = resolve(PROJECT_ROOT, 'assets', 'default-cover.jpg');
    const token = await getAccessToken();
    const thumbMediaId = await uploadCoverImage(token, defaultCover, apiBaseUrl);
    await createDraft(selectedArticle.frontmatter, convertResult.html, thumbMediaId, apiBaseUrl);
  } catch (error) {
    console.error('\n❌ 发布失败:');
    console.error(error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 发生未预期的错误:', error.message);
  if (process.env.WECHAT_DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
