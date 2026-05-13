# README

# article-release

微信公众号文章自动发布工具 - MDX/MD 转 HTML 一键推送到草稿箱。

## 功能特点

- 🎯 **一键转换**：Markdown/MDX → 微信公众号 HTML
- 🎨 **精美主题**：内置秋少官网统一风格
- 🚀 **一键发布**：API 直接推送到草稿箱
- 🔒 **安全可靠**：.env 加密存储凭证
- 📦 **开箱即用**：clone 后 `pnpm install` 即可使用

## 快速开始

### 1. 安装

```bash
git clone https://github.com/qiubob666-debug/article-release.git
cd article-release
pnpm install
```

### 2. 配置

```bash
cp .env.example .env
# 编辑 .env，填入微信公众号 AppID 和 AppSecret
```

### 3. 使用

```bash
# 环境诊断
node src/cli.js --doctor

# 预览文章
node src/cli.js example.mdx --preview

# 发布到草稿箱
node src/cli.js example.mdx
```

### 4. 帮助

```bash
node src/cli.js --help
```

## 项目结构

```
article-release/
├── src/
│   ├── cli.js           # CLI 主入口
│   ├── convert.js       # Markdown 转换模块
│   ├── wechat-api.js    # 微信 API 模块
│   └── themes/          # 主题定义
├── articles/            # 文章目录（默认）
├── assets/              # 资源目录
├── .env.example         # 环境变量模板
└── package.json
```

## License

MIT
