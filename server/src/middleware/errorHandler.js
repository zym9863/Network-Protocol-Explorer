/**
 * 全局错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // 默认错误信息
  let error = {
    message: err.message || '服务器内部错误',
    status: err.status || 500
  };

  // Joi验证错误
  if (err.isJoi) {
    error.status = 400;
    error.message = '请求参数验证失败';
    error.details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }

  // Multer文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 400;
    error.message = '文件大小超出限制';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.status = 400;
    error.message = '文件数量超出限制';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.status = 400;
    error.message = '不支持的文件类型';
  }

  // PCAP解析错误
  if (err.name === 'PcapParseError') {
    error.status = 400;
    error.message = 'PCAP文件解析失败';
    error.details = err.details;
  }

  // 开发环境显示详细错误信息
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  });
};

module.exports = errorHandler;
