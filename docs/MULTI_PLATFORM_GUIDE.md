# 多端内容一致性解决方案 - 使用指南

## 📋 核心概念

### 单一数据源原则
- **所有文章以 Markdown/MDX 格式存储**（唯一真相来源）
- 官网和公众号都从这个源文件转换
- 保证内容一致性，避免维护两份内容

### 平台适配层
根据目标平台自动调整内容：
- **官网（Astro）**: 完整功能，支持组件、交互、内部路由
- **公众号（微信）**: 降级处理，图片上传、链接适配

---

## 🚀 快速开始

### 1. 编写MDX文章（带平台标记）

```markdown
---
title: 文章标题
description: 文章描述
---

这是所有平台都会显示的内容。

<!-- @platform:web-only -->
<ArticleDiagram />
<!-- @end-platform -->

这段文字在两个平台都会显示。

<!-- @platform:wechat-only -->
> 💡 **提示**: 想看完整版？访问 [我的官网](https://bobqiushao.online)
<!-- @end-platform -->

[点击阅读更多](/reading/article-1)
```

### 2. 转换为公众号版本

```bash
# 基础转换
node src/cli.js article-1.mdx --preview

# 增强模式（自动处理图片和链接）
node src/cli.js article-1.mdx --enhanced

# 直接发布
node src/cli.js article-1.mdx
```

---

## 🎯 支持的功能

### 1. Astro 组件降级

| 组件 | 公众号降级方案 |
|------|--------------|
| `<ArticleDiagram />` | `[图表 - 请在官网查看完整版]` |
| `<PhotoGallery />` | `[图片集 - 请在官网查看]` |
| `<UserJourneyMap />` | `[用户旅程图 - 请在官网查看]` |
| `<XRef title="xxx" />` | `参见：《xxx》` |
| 其他组件 | `[此内容仅在官网完整显示]` |

### 2. 图片自动处理

- ✅ 本地图片 → 自动上传到微信服务器
- ✅ 外部链接图片 → 保持原样
- ✅ Base64图片 → 保持原样
- ⚠️ 大小检查（>2MB会警告）
- ⚠️ 格式验证（仅支持jpg/png/gif/bmp）

### 3. 链接智能适配

**内部链接**:
```
[/reading/article-1](第一篇)
↓ 转换为
<a href="https://bobqiushao.online/reading/article-1" target="_blank">第一篇 ↗</a>
```

**外部链接**:
```
[GitHub](https://github.com)
↓ 转换为
<a href="https://github.com" target="_blank">GitHub ↗</a>
```

---

## 📝 最佳实践

### 1. 文章结构建议

```
articles/
├── preface.mdx              # 序言
├── article-1.mdx            # 第一篇文章
├── article-2.mdx            # 第二篇...
├── assets/
│   ├── diagram-1.png        # 图表图片（备用）
│   └── cover.jpg            # 封面图
└── images/
    ├── photo-1.jpg          # 文章配图
    └── photo-2.jpg
```

### 2. 使用平台标记的场景

#### 场景1：官网有交互图表，公众号用静态图
```markdown
<!-- @platform:web-only -->
<Article1Diagram />
<!-- @end-platform -->

<!-- @platform:wechat-only -->
![AI能力对比图](./assets/diagram-1.png)
*数据来源：秋少整理*
<!-- @end-platform -->
```

#### 场景2：公众号添加引流链接
```markdown
<!-- @platform:wechat-only -->
<div style="background:#FFF9E6;padding:16px;border-left:4px solid #FFB800;margin:24px 0;">
  🌐 <strong>完整体验</strong>: 访问 <a href="https://bobqiushao.online">我的官网</a> 查看交互式图表和完整案例
</div>
<!-- @end-platform -->
```

#### 场景3：不同平台的CTA
```markdown
<!-- @platform:web-only -->
<Button variant="primary">订阅更新 →</Button>
<!-- @end-platform -->

<!-- @platform:wechat-only -->
<p style="text-align:center;margin:32px 0;">
  <strong>关注「邱少是个正经人」获取最新文章</strong><br/>
  <span style="color:#8C8C8C;font-size:14px;">每周二、周日更新</span>
</p>
<!-- @end-platform -->
```

### 3. 图片优化建议

**推荐设置**：
- 格式：JPEG（照片）或 PNG（图表）
- 尺寸：宽度 ≤ 900px（公众号最佳显示）
- 大小：≤ 500KB（加载快，节省流量）
- 压缩工具：
  - [TinyPNG](https://tinypng.com/) （在线压缩）
  - [ImageOptim](https://imageoptim.com/) （Mac客户端）
  - [Squoosh](https://squoosh.app/) （Google在线工具）

---

## 🔧 高级配置

### 自定义组件降级规则

编辑 `src/lib/platform-config.js`:

```javascript
export const DOWNGRADE_RULES = {
  component: {
    wechat: (componentName, props) => {
      // 添加自定义组件的降级逻辑
      if (componentName === 'MyCustomComponent') {
        return `<div style="...">${props.title}</div>`;
      }
      // ...
    },
  },
};
```

### 自定义网站URL

在 `.env` 文件中：

```env
# 网站基础URL（用于内部链接转换）
BASE_URL=https://bobqiushao.online
```

---

## 🧪 测试与调试

### 预览模式对比

```bash
# 生成预览（浏览器打开）
node src/preview.js preface.mdx

# 对比官网原文
# 打开 https://bobqiushao.online/reading/preface
```

### 检查转换日志

运行时会输出详细日志：

```
🚀 增强转换模式启动
📄 文件: articles/article-1.mdx
🎨 主题: bobqiushao
🖥️  目标平台: wechat

📦 处理组件...
   📦 发现组件: ArticleDiagram
🏷️  解析平台标记...
🔄 Markdown → HTML...
🎨 应用主题样式...

🖼️  处理图片...
   处理本地图片: ./assets/diagram-1.png
   ✅ 已上传到微信服务器
✅ 图片处理完成 (1张)

🔗 处理链接...
   ✅ /reading/article-1 → https://bobqiushao.online/reading/article-1
✅ 链接处理完成

✅ 转换完成！
```

---

## ❓ 常见问题

### Q1: 为什么公众号看不到我的Astro组件？

**A**: 微信不支持JavaScript和自定义组件。系统会自动将组件降级为提示文本或替代内容。你可以：
- 使用 `@platform:wechat-only` 标记提供替代内容
- 准备静态图片版本
- 在降级文本中引导用户访问官网

### Q2: 图片上传失败怎么办？

**A**: 检查以下几点：
1. 图片格式是否支持（jpg/png/gif/bmp）
2. 图片大小是否超过2MB
3. IP白名单是否配置正确
4. 网络连接是否正常

### Q3: 如何保持官网和公众号内容同步？

**A**: 
1. 只维护MDX源文件（单一数据源）
2. 使用 `--preview` 模式预览公众号效果
3. 定期运行 `node src/cli.js *.mdx` 批量发布
4. 使用Git管理文章版本

### Q4: 数学公式怎么处理？

**A**: 
- 当前版本：转为文本描述 `[公式: xxx]`
- 推荐方案：将公式渲染为图片后插入
- 未来计划：集成MathJax-to-image服务

---

## 📊 工作流示例

### 日常发布流程

```bash
# 1. 编辑文章（VS Code）
code articles/new-article.mdx

# 2. 本地预览（浏览器）
node src/preview.js new-article.mdx

# 3. 发布到公众号草稿箱
node src/cli.js new-article.mdx

# 4. 登录微信公众平台预览并发布
# https://mp.weixin.qq.com
```

### 批量发布流程

```bash
# 创建批量脚本
for file in articles/*.mdx; do
  echo "处理: $file"
  node src/cli.js "$file" || echo "❌ $file 失败"
done
```

---

## 🎉 下一步

- [ ] 将现有文章迁移到新的增强转换器
- [ ] 为每篇文章准备公众号专用的图片资源
- [ ] 配置自动化发布流程（CI/CD）
- [ ] 集成图床服务（如SM.MS、Imgur）

---

**需要帮助？** 查看 [项目README](../README.md) 或提交 Issue！
