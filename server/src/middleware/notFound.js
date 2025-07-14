/**
 * 404 Not Found 中间件
 */
const notFound = (req, res, next) => {
  const error = new Error(`未找到路径: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = notFound;
