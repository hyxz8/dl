const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 硬编码目标 API 地址（请替换为实际地址）
const TARGET_API = 'https://generativelanguage.googleapis.com'; 

// 需要过滤的隐私请求头字段（大小写不敏感）
const blockedHeaders = [
  'x-forwarded-for',
  'via',
  'accept-language',
  'origin',
  'referer',
  'user-agent',
  'x-real-ip',
  'x-client-ip',
  'cf-connecting-ip',
  'dnt' // Do Not Track 标头
];

const app = express();

// 反向代理中间件配置
app.use(
  '/**', // 代理所有路径（按需替换为特定路径前缀）
  createProxyMiddleware({
    target: TARGET_API,
    changeOrigin: true, // 修改请求头中的 Host 字段为目标 API 地址
    headers: (proxyReqHeaders, req) => {
      // 过滤敏感请求头
      const filteredHeaders = { ...proxyReqHeaders };
      blockedHeaders.forEach(hdr => {
        // 遍历检测所有与被禁用头部对应的键（不论大小写）
        Object.entries(filteredHeaders).forEach(([key, _]) => {
          if (key.toLowerCase() === hdr.toLowerCase()) {
            delete filteredHeaders[key];
          }
        });
      });
      
      // 强制设置固定 User-Agent（伪装浏览器类型）
      filteredHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0';
      
      return filteredHeaders;
    },
    // 配置错误处理
    onProxyRes: (proxyRes, req, res) => {
      // 可选：过滤 API 的响应头（如移除 X-Powered-By 等信息）
      blockedHeaders.forEach(hdr => {
        delete proxyRes.headers[hdr];
      });
    },
    onError: (err, req, res) => {
      res.status(500).send(`Proxy Error: ${err.message}`);
    }
  })
);

// 启动监听
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server started on http://localhost:${PORT}`);
});
