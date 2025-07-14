const express = require('express');
const PcapController = require('../controllers/pcapController');
const upload = require('../utils/multerConfig');

const router = express.Router();

/**
 * PCAP文件分析相关路由
 */

// 上传PCAP文件
// POST /api/pcap/upload
router.post('/upload', upload.single('pcapFile'), PcapController.uploadFile);

// 获取文件信息和统计
// GET /api/pcap/files/:fileId
router.get('/files/:fileId', PcapController.getFileInfo);

// 获取数据包列表
// GET /api/pcap/packets/:fileId?page=1&limit=50&protocol=TCP&sourceIP=192.168.1.1
router.get('/packets/:fileId', PcapController.getPackets);

// 获取数据包详情
// GET /api/pcap/packet/:fileId/:packetId
router.get('/packet/:fileId/:packetId', PcapController.getPacketDetails);

// 搜索数据包
// POST /api/pcap/search/:fileId
// Body: { query: string, field?: string, page?: number, limit?: number }
router.post('/search/:fileId', PcapController.searchPackets);

// 获取协议统计
// GET /api/pcap/stats/:fileId
router.get('/stats/:fileId', PcapController.getProtocolStats);

// 删除文件
// DELETE /api/pcap/files/:fileId
router.delete('/files/:fileId', PcapController.deleteFile);

// API文档路由
router.get('/', (req, res) => {
  res.json({
    message: 'PCAP文件分析 API',
    version: '1.0.0',
    endpoints: {
      'POST /upload': '上传PCAP文件',
      'GET /files/:fileId': '获取文件信息和统计',
      'GET /packets/:fileId': '获取数据包列表',
      'GET /packet/:fileId/:packetId': '获取数据包详情',
      'POST /search/:fileId': '搜索数据包',
      'GET /stats/:fileId': '获取协议统计',
      'DELETE /files/:fileId': '删除文件'
    },
    uploadLimits: {
      maxFileSize: '100MB',
      allowedFormats: ['.pcap', '.pcapng', '.cap'],
      maxFiles: 1
    },
    examples: {
      upload: {
        url: '/api/pcap/upload',
        method: 'POST',
        contentType: 'multipart/form-data',
        formData: {
          pcapFile: 'file'
        }
      },
      getPackets: {
        url: '/api/pcap/packets/{fileId}?page=1&limit=50&protocol=TCP',
        method: 'GET'
      },
      search: {
        url: '/api/pcap/search/{fileId}',
        method: 'POST',
        body: {
          query: '192.168.1.1',
          field: 'sourceIP',
          page: 1,
          limit: 50
        }
      }
    }
  });
});

module.exports = router;
