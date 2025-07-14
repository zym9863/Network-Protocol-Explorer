const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 导入路由
const protocolRoutes = require('./routes/protocolRoutes');
const pcapRoutes = require('./routes/pcapRoutes');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// 跨域配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://network-protocol-explorer.pages.dev',
      'https://*.pages.dev', // Cloudflare Pages 预览分支
    ];
    
    // 开发环境允许任何来源
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // 生产环境检查来源
    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('不允许的跨域请求来源'));
    }
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
  maxAge: 86400 // 24小时
};

app.use(cors(corsOptions));

// 请求日志
app.use(morgan('combined'));

// 压缩响应
app.use(compression());

// 请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// API路由
app.use('/api/protocol', protocolRoutes);
app.use('/api/pcap', pcapRoutes);

// 处理预检请求
app.options('*', cors(corsOptions));

// 健康检查端点
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    cors: {
      configured: true,
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? ['https://network-protocol-explorer.pages.dev'] 
        : ['http://localhost:5173', 'http://localhost:4173']
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  };
  
  res.json(healthCheck);
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '网络协议探险家 API 服务器',
    version: '1.0.0',
    endpoints: {
      protocol: '/api/protocol',
      pcap: '/api/pcap',
      health: '/health'
    }
  });
});

// 404处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API文档: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;
