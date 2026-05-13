import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let accessTokenCache = {
  token: null,
  expiresAt: 0,
};

export function getConfig() {
  let appId = process.env.WECHAT_APP_ID || '';
  let appSecret = process.env.WECHAT_APP_SECRET || '';
  const apiBaseUrl = process.env.WECHAT_API_BASE_URL || 'https://api.weixin.qq.com';

  const dotenvPath = resolve(__dirname, '..', '.env');
  if (existsSync(dotenvPath)) {
    const envContent = readFileSync(dotenvPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const [key, value] = line.split('=').map(s => s.trim());
      if (key === 'WECHAT_APP_ID' && !appId) appId = value;
      if (key === 'WECHAT_APP_SECRET' && !appSecret) appSecret = value;
    });
  }

  return { appId, appSecret, apiBaseUrl };
}

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  const delays = [1000, 2000, 3000];
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      });
      return response;
    } catch (error) {
      if (i < maxRetries - 1) {
        const delay = delays[i] || 3000;
        console.log(`⚠️  请求失败，${delay / 1000}秒后重试 (${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
}

export async function getAccessToken() {
  const { appId, appSecret, apiBaseUrl } = getConfig();
  const now = Date.now();

  if (accessTokenCache.token && now < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  if (!appId || !appSecret) {
    throw new Error(
      '未配置微信凭证\n\n' +
      '请按以下步骤配置：\n' +
      '1. 复制 .env.example 为 .env\n' +
      '2. 登录微信公众平台: https://mp.weixin.qq.com\n' +
      '3. 进入「设置与开发」→「基本配置」\n' +
      '4. 复制 AppID 和 AppSecret 填入 .env'
    );
  }

  console.log('🔑 正在获取 access_token...');

  const url = `${apiBaseUrl}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (data.errcode) {
      if (data.errcode === 40164) {
        const ipMatch = data.errmsg.match(/(\d+\.\d+\.\d+\.\d+)/);
        const currentIp = ipMatch ? ipMatch[1] : '未知';
        throw new Error(
          `IP 白名单错误 (errcode: 40164)\n\n` +
          `当前 IP: ${currentIp}\n\n` +
          `解决方案：\n` +
          `1. 访问 https://ipinfo.io/ip 查看公网 IP\n` +
          `2. 登录微信公众平台 → 设置与开发 → 基本配置\n` +
          `3. 在「IP白名单」中添加: ${currentIp}\n` +
          `4. 白名单生效可能需要几分钟`
        );
      }
      throw new Error(`获取 token 失败: ${data.errcode} - ${data.errmsg}`);
    }

    accessTokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in - 300) * 1000,
    };

    console.log('✅ access_token 获取成功');
    return data.access_token;
  } catch (error) {
    if (error.message.includes('未配置微信凭证')) throw error;
    throw new Error(`网络请求失败: ${error.message}`);
  }
}

export async function uploadCoverImage(token, imagePath, apiBaseUrl) {
  if (!imagePath || !existsSync(imagePath)) {
    console.log('⚠️  未找到封面图，将使用默认封面');
    return '';
  }

  console.log(`🖼️  正在上传封面图: ${imagePath}`);

  const url = `${apiBaseUrl}/cgi-bin/material/add_material?access_token=${token}&type=image`;

  try {
    const imageBuffer = readFileSync(imagePath);
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('media', blob, 'cover.jpg');

    const response = await fetchWithRetry(url, { method: 'POST', body: formData });
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`上传封面失败: ${data.errcode} - ${data.errmsg}`);
    }

    console.log('✅ 封面图上传成功');
    return data.media_id;
  } catch (error) {
    console.log('⚠️  封面图上传失败，将使用默认封面:', error.message);
    return '';
  }
}

export async function createDraft(articleData, htmlContent, thumbMediaId, apiBaseUrl) {
  const token = await getAccessToken();

  console.log('📝 正在创建草稿...');

  let digest = articleData.description || '';
  if (digest.length > 120) digest = digest.slice(0, 117) + '...';

  const draftData = {
    articles: [{
      title: articleData.title,
      author: '秋少',
      digest: digest,
      content: htmlContent,
      content_source_url: '',
      thumb_media_id: thumbMediaId,
      need_open_comment: 1,
      only_fans_can_comment: 0,
    }],
  };

  const url = `${apiBaseUrl}/cgi-bin/draft/add?access_token=${token}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftData),
    });

    const data = await response.json();

    if (data.errcode) {
      throw new Error(`创建草稿失败: ${data.errcode} - ${data.errmsg}`);
    }

    console.log('\n✨ 草稿创建成功！');
    console.log(`📋 媒体 ID: ${data.media_id}`);
    console.log('\n💡 下一步操作：');
    console.log('   1. 登录微信公众平台: https://mp.weixin.qq.com');
    console.log('   2. 进入「内容管理」→「草稿箱」');
    console.log('   3. 找到该草稿，预览或发布');
  } catch (error) {
    throw error;
  }
}
