const pcapService = require('../services/pcapService');
const Joi = require('joi');

/**
 * PCAP文件控制器
 */
class PcapController {

  /**
   * 上传PCAP文件
   */
  static async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '请选择要上传的文件'
        });
      }

      // 验证文件类型
      const allowedMimeTypes = [
        'application/octet-stream',
        'application/vnd.tcpdump.pcap',
        'application/x-pcapng'
      ];

      const allowedExtensions = ['.pcap', '.pcapng', '.cap'];
      const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          error: '不支持的文件格式，请上传 .pcap 或 .pcapng 文件'
        });
      }

      // 保存文件
      const fileInfo = await pcapService.saveUploadedFile(req.file);
      
      // 解析文件
      const session = await pcapService.parsePcapFile(fileInfo);

      res.json({
        success: true,
        message: '文件上传并解析成功',
        data: {
          fileId: fileInfo.id,
          fileName: fileInfo.originalName,
          fileSize: fileInfo.size,
          totalPackets: session.totalPackets,
          statistics: session.statistics,
          uploadTime: fileInfo.uploadTime
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取数据包列表
   */
  static async getPackets(req, res, next) {
    try {
      const { fileId } = req.params;
      
      // 验证查询参数
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        protocol: Joi.string().valid('TCP', 'UDP', 'ICMP', 'ARP').optional(),
        sourceIP: Joi.string().ip().optional(),
        destIP: Joi.string().ip().optional()
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '查询参数验证失败',
          details: error.details
        });
      }

      const result = pcapService.getPackets(fileId, value);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message.includes('未找到')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * 获取数据包详情
   */
  static async getPacketDetails(req, res, next) {
    try {
      const { fileId, packetId } = req.params;

      if (!packetId || isNaN(parseInt(packetId))) {
        return res.status(400).json({
          success: false,
          error: '无效的数据包ID'
        });
      }

      const packetDetails = pcapService.getPacketDetails(fileId, packetId);

      res.json({
        success: true,
        data: packetDetails
      });
    } catch (error) {
      if (error.message.includes('未找到')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * 获取文件信息和统计
   */
  static async getFileInfo(req, res, next) {
    try {
      const { fileId } = req.params;
      
      const fileInfo = pcapService.getFileInfo(fileId);

      res.json({
        success: true,
        data: fileInfo
      });
    } catch (error) {
      if (error.message.includes('未找到')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * 搜索数据包
   */
  static async searchPackets(req, res, next) {
    try {
      const { fileId } = req.params;
      
      const schema = Joi.object({
        query: Joi.string().required(),
        field: Joi.string().valid('sourceIP', 'destinationIP', 'protocol', 'info').default('info'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '搜索参数验证失败',
          details: error.details
        });
      }

      // 获取所有数据包进行搜索
      const allPackets = pcapService.getPackets(fileId, { limit: 10000 });
      
      // 执行搜索
      const searchResults = allPackets.packets.filter(packet => {
        const fieldValue = packet[value.field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(value.query.toLowerCase());
        }
        return false;
      });

      // 分页
      const startIndex = (value.page - 1) * value.limit;
      const endIndex = startIndex + value.limit;
      const paginatedResults = searchResults.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          packets: paginatedResults,
          pagination: {
            page: value.page,
            limit: value.limit,
            total: searchResults.length,
            totalPages: Math.ceil(searchResults.length / value.limit)
          },
          searchQuery: value.query,
          searchField: value.field
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除文件
   */
  static async deleteFile(req, res, next) {
    try {
      const { fileId } = req.params;
      
      const result = pcapService.deleteFile(fileId);

      res.json({
        success: true,
        message: '文件删除成功',
        data: result
      });
    } catch (error) {
      if (error.message.includes('未找到')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * 获取协议统计
   */
  static async getProtocolStats(req, res, next) {
    try {
      const { fileId } = req.params;
      
      const fileInfo = pcapService.getFileInfo(fileId);
      const statistics = fileInfo.statistics;

      // 计算协议百分比
      const protocolStats = Object.entries(statistics.protocolDistribution).map(([protocol, count]) => ({
        protocol,
        count,
        percentage: ((count / statistics.totalPackets) * 100).toFixed(2)
      })).sort((a, b) => b.count - a.count);

      res.json({
        success: true,
        data: {
          totalPackets: statistics.totalPackets,
          totalBytes: statistics.totalBytes,
          protocolDistribution: protocolStats,
          topIPs: statistics.topIPs,
          timeRange: statistics.timeRange
        }
      });
    } catch (error) {
      if (error.message.includes('未找到')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }
}

module.exports = PcapController;
