const multer = require('multer');
const path = require('path');

/**
 * Multer配置 - 文件上传中间件
 */

// 内存存储配置
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件扩展名
  const allowedExtensions = ['.pcap', '.pcapng', '.cap'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件格式，请上传 .pcap 或 .pcapng 文件'), false);
  }
};

// Multer配置
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1 // 一次只能上传一个文件
  }
});

module.exports = upload;
