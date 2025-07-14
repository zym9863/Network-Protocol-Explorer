# 部署指南

本项目采用前后端分离架构，支持跨域资源共享(CORS)。

## 🌐 部署架构

- **前端**: Cloudflare Pages (https://network-protocol-explorer.pages.dev/)
- **后端**: Render (https://network-protocol-explorer.onrender.com/)

## 🚀 部署步骤

### 1. 后端部署 (Render)

1. 将代码推送到 GitHub 仓库
2. 在 Render 控制台连接 GitHub 仓库
3. 配置部署设置：
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `PORT=10000`

4. 部署完成后，后端 API 将在 `https://network-protocol-explorer.onrender.com` 可用

### 2. 前端部署 (Cloudflare Pages)

1. 在 Cloudflare Pages 控制台连接 GitHub 仓库
2. 配置构建设置：
   - **Build Command**: `cd client && npm install && npm run build`
   - **Build Output Directory**: `client/dist`
   - **Environment Variables**:
     - `NODE_VERSION=18`
     - `VITE_API_BASE_URL=https://network-protocol-explorer.onrender.com/api`
     - `VITE_APP_ENV=production`

3. 部署完成后，前端应用将在 `https://network-protocol-explorer.pages.dev` 可用

## 🔧 本地开发

### 环境变量配置

前端环境变量 (`client/.env`):
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

生产环境变量 (`client/.env.production`):
```bash
VITE_API_BASE_URL=https://network-protocol-explorer.onrender.com/api
VITE_APP_ENV=production
```

### 启动开发服务器

```bash
# 安装所有依赖
pnpm run install:all

# 启动开发服务器（前后端同时启动）
pnpm run dev

# 单独启动前端
pnpm run client:dev

# 单独启动后端
pnpm run server:dev
```

## 🛡️ CORS 配置

### 后端 CORS 设置

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://network-protocol-explorer.pages.dev',
      'https://*.pages.dev',
    ];
    
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // 生产环境检查来源...
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Disposition'],
  maxAge: 86400
};
```

### 前端请求配置

```typescript
// 自动根据环境变量设置 API 基础 URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true, // 支持跨域携带 cookie
  headers: {
    'Content-Type': 'application/json',
  },
})
```

## 🧪 测试部署

### 1. 本地构建测试

```bash
# 构建前端
pnpm run build:frontend

# 验证后端配置
pnpm run verify:backend

# 准备部署（运行所有检查）
pnpm run deploy:prepare
```

### 2. CORS 跨域测试

打开 `test/cors-test.html` 文件在浏览器中进行 CORS 测试：

1. 在浏览器中打开 `test/cors-test.html`
2. 输入后端 API 地址
3. 选择请求方法和端点
4. 点击"测试 CORS"按钮
5. 检查是否能成功跨域请求

### 3. 健康检查

部署完成后访问以下端点验证服务状态：

- 后端健康检查: `https://network-protocol-explorer.onrender.com/health`
- 前端访问: `https://network-protocol-explorer.pages.dev/`

## 📁 重要文件说明

### 前端配置文件

- `client/.env` - 开发环境变量
- `client/.env.production` - 生产环境变量
- `client/public/_headers` - Cloudflare Pages 响应头配置
- `client/public/_redirects` - Cloudflare Pages 重定向配置
- `client/vite.config.ts` - Vite 构建配置

### 后端配置文件

- `server/src/app.js` - Express 应用主文件（包含 CORS 配置）
- `render.yaml` - Render 部署配置

### 部署脚本

- `scripts/build-frontend.sh` - 前端构建脚本
- `scripts/verify-backend.sh` - 后端验证脚本

## 🔍 故障排除

### 常见问题

1. **CORS 错误**: 检查后端 CORS 配置是否包含前端域名
2. **API 请求失败**: 确认环境变量 `VITE_API_BASE_URL` 设置正确
3. **构建失败**: 检查 Node.js 版本是否为 18+
4. **静态文件 404**: 确认 Cloudflare Pages 构建输出目录设置为 `client/dist`

### 调试步骤

1. 检查浏览器开发者工具的网络面板
2. 查看控制台错误信息
3. 使用 CORS 测试工具验证跨域配置
4. 检查服务器日志
5. 确认环境变量设置

## 📞 技术支持

如遇到部署问题，请检查：

1. GitHub 仓库是否正确配置
2. 环境变量是否设置正确
3. 构建命令是否执行成功
4. CORS 配置是否包含正确的域名
5. 网络连接是否正常

---

**注意**: 首次部署可能需要几分钟时间，请耐心等待部署完成。
