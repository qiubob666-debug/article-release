/**
 * 图片处理器 - 处理多端图片适配
 *
 * 功能：
 * 1. 检测Markdown中的图片语法
 * 2. 根据目标平台转换图片
 * 3. 自动上传到微信服务器（公众号）
 * 4. 压缩和优化图片
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');

/**
 * 从HTML中提取所有图片
 */
export function extractImages(html) {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const images = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    images.push({
      original: match[0],
      src: match[1],
    });
  }

  return images;
}

/**
 * 判断图片是否为本地路径
 */
export function isLocalImage(src) {
  return !src.startsWith('http://') &&
         !src.startsWith('https://') &&
         !src.startsWith('data:');
}

/**
 * 获取本地图片的绝对路径
 */
export function resolveLocalImagePath(src, baseDir) {
  // 处理相对路径
  if (src.startsWith('./') || src.startsWith('../')) {
    return resolve(baseDir, src);
  }
  
  // 尝试在项目目录中查找
  const possiblePaths = [
    resolve(PROJECT_ROOT, src),
    resolve(PROJECT_ROOT, 'public', src),
    resolve(PROJECT_ROOT, 'src', 'content', 'articles', src),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

/**
 * 读取本地图片文件
 */
export function readLocalImage(imagePath) {
  if (!existsSync(imagePath)) {
    throw new Error(`图片文件不存在: ${imagePath}`);
  }

  const stats = readFileSync(imagePath);
  const ext = extname(imagePath).toLowerCase();

  // 检查文件大小（微信限制2MB）
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (stats.length > maxSize) {
    console.warn(`⚠️ 图片过大 (${(stats.length / 1024 / 1024).toFixed(2)}MB > 2MB): ${imagePath}`);
    console.warn('   建议：压缩图片或使用图床');
  }

  // 检查格式
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  if (!supportedFormats.includes(ext.slice(1))) {
    console.warn(`⚠️ 不支持的图片格式 (.${ext}): ${imagePath}`);
  }

  return {
    buffer: stats,
    filename: basename(imagePath),
    mimetype: getMimeType(ext),
  };
}

/**
 * 获取MIME类型
 */
function getMimeType(ext) {
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * 替换HTML中的图片URL
 */
export function replaceImageUrls(html, imageMap) {
  let result = html;

  for (const [originalSrc, newUrl] of Object.entries(imageMap)) {
    result = result.replace(new RegExp(originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
  }

  return result;
}

/**
 * 图片处理管道
 * 根据目标平台处理所有图片
 */
export async function processImages(html, targetPlatform, options = {}) {
  const { uploadFn, baseDir } = options;
  const images = extractImages(html);
  const imageMap = {};

  console.log(`🖼️ 发现 ${images.length} 张图片`);

  for (const img of images) {
    try {
      if (isLocalImage(img.src)) {
        console.log(`   处理本地图片: ${img.src}`);

        // 解析本地路径
        const localPath = resolveLocalImagePath(img.src, baseDir || PROJECT_ROOT);

        if (!localPath || !existsSync(localPath)) {
          console.warn(`   ⚠️ 本地图片不存在，跳过: ${img.src}`);
          continue;
        }

        if (targetPlatform === 'wechat' && uploadFn) {
          // 上传到微信服务器
          const imageData = readLocalImage(localPath);
          const uploadedUrl = await uploadFn(imageData);
          imageMap[img.src] = uploadedUrl;
          console.log(`   ✅ 已上传到微信服务器`);
        } else {
          // 官网环境，转换为相对路径或base64
          // 这里可以根据需要处理
          imageMap[img.src] = img.src;
        }
      } else {
        // 外部图片或base64，保持原样
        imageMap[img.src] = img.src;
      }
    } catch (error) {
      console.error(`   ❌ 图片处理失败: ${img.src}`, error.message);
    }
  }

  // 替换HTML中的图片URL
  const processedHtml = replaceImageUrls(html, imageMap);

  return {
    html: processedHtml,
    imageMap,
    processedCount: Object.keys(imageMap).length,
  };
}

export default {
  extractImages,
  isLocalImage,
  resolveLocalImagePath,
  readLocalImage,
  replaceImageUrls,
  processImages,
};
