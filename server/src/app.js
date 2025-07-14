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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:5173', 'http://localhost:4173'] 
    : true,
  credentials: true
}));

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

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
