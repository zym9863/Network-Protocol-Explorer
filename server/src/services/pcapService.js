const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * PCAP文件解析服务
 * 注意：这是一个简化的PCAP解析实现，用于演示目的
 * 实际生产环境建议使用专业的PCAP解析库
 */
class PcapService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.sessions = new Map(); // 存储解析会话
  }

  /**
   * 保存上传的PCAP文件
   */
  async saveUploadedFile(file) {
    const fileId = uuidv4();
    const fileName = `${fileId}_${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileName);

    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // 保存文件
    fs.writeFileSync(filePath, file.buffer);

    const fileInfo = {
      id: fileId,
      originalName: file.originalname,
      fileName: fileName,
      filePath: filePath,
      size: file.size,
      uploadTime: new Date().toISOString(),
      mimeType: file.mimetype
    };

    // 验证文件格式
    if (!this.isValidPcapFile(filePath)) {
      // 删除无效文件
      fs.unlinkSync(filePath);
      throw new Error('不是有效的PCAP文件格式');
    }

    return fileInfo;
  }

  /**
   * 验证PCAP文件格式
   */
  isValidPcapFile(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      
      // 检查PCAP文件魔数
      const pcapMagic = buffer.readUInt32LE(0);
      const pcapngMagic = buffer.readUInt32LE(0);
      
      // PCAP文件魔数: 0xA1B2C3D4 或 0xD4C3B2A1
      // PCAPNG文件魔数: 0x0A0D0D0A
      return pcapMagic === 0xA1B2C3D4 || 
             pcapMagic === 0xD4C3B2A1 || 
             pcapngMagic === 0x0A0D0D0A;
    } catch (error) {
      return false;
    }
  }

  /**
   * 解析PCAP文件
   */
  async parsePcapFile(fileInfo) {
    try {
      const buffer = fs.readFileSync(fileInfo.filePath);
      const packets = this.parsePackets(buffer);
      
      const session = {
        fileInfo,
        packets,
        totalPackets: packets.length,
        parseTime: new Date().toISOString(),
        statistics: this.generateStatistics(packets)
      };

      this.sessions.set(fileInfo.id, session);
      return session;
    } catch (error) {
      throw new Error(`PCAP文件解析失败: ${error.message}`);
    }
  }

  /**
   * 解析数据包（简化实现）
   */
  parsePackets(buffer) {
    const packets = [];
    
    // 读取PCAP文件头
    const magic = buffer.readUInt32LE(0);
    let offset = 24; // PCAP文件头大小
    let packetIndex = 0;

    // 模拟解析过程，生成示例数据包
    // 实际实现需要根据PCAP格式规范进行解析
    const packetCount = Math.min(100, Math.floor(buffer.length / 100)); // 限制数据包数量
    
    for (let i = 0; i < packetCount; i++) {
      const packet = this.generateSamplePacket(packetIndex++, offset);
      packets.push(packet);
      offset += packet.capturedLength + 16; // 数据包头 + 数据
    }

    return packets;
  }

  /**
   * 生成示例数据包（用于演示）
   */
  generateSamplePacket(index, offset) {
    const protocols = ['TCP', 'UDP', 'ICMP', 'ARP'];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    
    const sourceIPs = ['192.168.1.100', '10.0.0.1', '172.16.0.1', '8.8.8.8'];
    const destIPs = ['192.168.1.1', '10.0.0.254', '172.16.0.254', '1.1.1.1'];
    
    const sourceIP = sourceIPs[Math.floor(Math.random() * sourceIPs.length)];
    const destIP = destIPs[Math.floor(Math.random() * destIPs.length)];
    
    const capturedLength = Math.floor(Math.random() * 1500) + 64;
    const originalLength = capturedLength + Math.floor(Math.random() * 100);

    return {
      id: index,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      capturedLength,
      originalLength,
      protocol,
      sourceIP,
      destinationIP,
      sourcePort: protocol !== 'ICMP' ? Math.floor(Math.random() * 65535) + 1024 : null,
      destinationPort: protocol !== 'ICMP' ? Math.floor(Math.random() * 65535) + 1 : null,
      flags: this.generateProtocolFlags(protocol),
      info: this.generatePacketInfo(protocol, sourceIP, destIP),
      offset,
      layers: this.generateLayerInfo(protocol)
    };
  }

  /**
   * 生成协议标志
   */
  generateProtocolFlags(protocol) {
    switch (protocol) {
      case 'TCP':
        const tcpFlags = ['SYN', 'ACK', 'FIN', 'RST', 'PSH', 'URG'];
        return [tcpFlags[Math.floor(Math.random() * tcpFlags.length)]];
      case 'UDP':
        return [];
      case 'ICMP':
        return ['Echo Request', 'Echo Reply'][Math.floor(Math.random() * 2)];
      case 'ARP':
        return ['Request', 'Reply'][Math.floor(Math.random() * 2)];
      default:
        return [];
    }
  }

  /**
   * 生成数据包信息
   */
  generatePacketInfo(protocol, sourceIP, destIP) {
    switch (protocol) {
      case 'TCP':
        return `${sourceIP} → ${destIP} [TCP] HTTP`;
      case 'UDP':
        return `${sourceIP} → ${destIP} [UDP] DNS`;
      case 'ICMP':
        return `${sourceIP} → ${destIP} [ICMP] Ping`;
      case 'ARP':
        return `Who has ${destIP}? Tell ${sourceIP}`;
      default:
        return `${sourceIP} → ${destIP} [${protocol}]`;
    }
  }

  /**
   * 生成层级信息
   */
  generateLayerInfo(protocol) {
    const layers = [
      {
        name: 'Frame',
        protocol: 'Ethernet',
        fields: {
          'Destination': this.generateMACAddress(),
          'Source': this.generateMACAddress(),
          'Type': '0x0800 (IPv4)'
        }
      },
      {
        name: 'Internet Protocol',
        protocol: 'IPv4',
        fields: {
          'Version': '4',
          'Header Length': '20 bytes',
          'Type of Service': '0x00',
          'Total Length': Math.floor(Math.random() * 1500) + 64,
          'TTL': Math.floor(Math.random() * 64) + 32,
          'Protocol': protocol === 'TCP' ? '6 (TCP)' : protocol === 'UDP' ? '17 (UDP)' : '1 (ICMP)'
        }
      }
    ];

    if (protocol === 'TCP') {
      layers.push({
        name: 'Transmission Control Protocol',
        protocol: 'TCP',
        fields: {
          'Source Port': Math.floor(Math.random() * 65535) + 1024,
          'Destination Port': [80, 443, 22, 21][Math.floor(Math.random() * 4)],
          'Sequence Number': Math.floor(Math.random() * 4294967295),
          'Acknowledgment Number': Math.floor(Math.random() * 4294967295),
          'Window Size': 65535,
          'Flags': '0x018 (PSH, ACK)'
        }
      });
    } else if (protocol === 'UDP') {
      layers.push({
        name: 'User Datagram Protocol',
        protocol: 'UDP',
        fields: {
          'Source Port': Math.floor(Math.random() * 65535) + 1024,
          'Destination Port': 53,
          'Length': Math.floor(Math.random() * 512) + 8,
          'Checksum': '0x' + Math.floor(Math.random() * 65535).toString(16)
        }
      });
    }

    return layers;
  }

  /**
   * 生成MAC地址
   */
  generateMACAddress() {
    const mac = [];
    for (let i = 0; i < 6; i++) {
      mac.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    return mac.join(':');
  }

  /**
   * 生成统计信息
   */
  generateStatistics(packets) {
    const protocolCounts = {};
    const ipCounts = {};
    let totalBytes = 0;

    packets.forEach(packet => {
      // 协议统计
      protocolCounts[packet.protocol] = (protocolCounts[packet.protocol] || 0) + 1;
      
      // IP地址统计
      ipCounts[packet.sourceIP] = (ipCounts[packet.sourceIP] || 0) + 1;
      ipCounts[packet.destinationIP] = (ipCounts[packet.destinationIP] || 0) + 1;
      
      // 字节统计
      totalBytes += packet.capturedLength;
    });

    return {
      totalPackets: packets.length,
      totalBytes,
      protocolDistribution: protocolCounts,
      topIPs: Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      timeRange: packets.length > 0 ? {
        start: packets[0].timestamp,
        end: packets[packets.length - 1].timestamp
      } : null
    };
  }

  /**
   * 获取数据包列表
   */
  getPackets(fileId, options = {}) {
    const session = this.sessions.get(fileId);
    if (!session) {
      throw new Error('未找到指定的文件会话');
    }

    const { page = 1, limit = 50, protocol, sourceIP, destIP } = options;
    let packets = session.packets;

    // 过滤
    if (protocol) {
      packets = packets.filter(p => p.protocol.toLowerCase() === protocol.toLowerCase());
    }
    if (sourceIP) {
      packets = packets.filter(p => p.sourceIP === sourceIP);
    }
    if (destIP) {
      packets = packets.filter(p => p.destinationIP === destIP);
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPackets = packets.slice(startIndex, endIndex);

    return {
      packets: paginatedPackets,
      pagination: {
        page,
        limit,
        total: packets.length,
        totalPages: Math.ceil(packets.length / limit)
      },
      filters: { protocol, sourceIP, destIP }
    };
  }

  /**
   * 获取单个数据包详情
   */
  getPacketDetails(fileId, packetId) {
    const session = this.sessions.get(fileId);
    if (!session) {
      throw new Error('未找到指定的文件会话');
    }

    const packet = session.packets.find(p => p.id === parseInt(packetId));
    if (!packet) {
      throw new Error('未找到指定的数据包');
    }

    // 生成十六进制数据（模拟）
    const hexData = this.generateHexData(packet.capturedLength);

    return {
      ...packet,
      hexData,
      rawData: this.generateRawData(packet)
    };
  }

  /**
   * 生成十六进制数据（模拟）
   */
  generateHexData(length) {
    const hex = [];
    const ascii = [];
    
    for (let i = 0; i < length; i++) {
      const byte = Math.floor(Math.random() * 256);
      hex.push(byte.toString(16).padStart(2, '0'));
      ascii.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
    }

    // 格式化为16字节一行
    const lines = [];
    for (let i = 0; i < hex.length; i += 16) {
      const hexLine = hex.slice(i, i + 16).join(' ');
      const asciiLine = ascii.slice(i, i + 16).join('');
      const offset = i.toString(16).padStart(8, '0');
      lines.push({
        offset,
        hex: hexLine,
        ascii: asciiLine
      });
    }

    return lines;
  }

  /**
   * 生成原始数据信息
   */
  generateRawData(packet) {
    return {
      frameNumber: packet.id + 1,
      timestamp: packet.timestamp,
      capturedLength: packet.capturedLength,
      originalLength: packet.originalLength,
      protocols: packet.layers.map(layer => layer.protocol),
      summary: packet.info
    };
  }

  /**
   * 获取文件信息
   */
  getFileInfo(fileId) {
    const session = this.sessions.get(fileId);
    if (!session) {
      throw new Error('未找到指定的文件会话');
    }

    return {
      fileInfo: session.fileInfo,
      statistics: session.statistics,
      parseTime: session.parseTime
    };
  }

  /**
   * 删除文件和会话
   */
  deleteFile(fileId) {
    const session = this.sessions.get(fileId);
    if (!session) {
      throw new Error('未找到指定的文件会话');
    }

    // 删除物理文件
    if (fs.existsSync(session.fileInfo.filePath)) {
      fs.unlinkSync(session.fileInfo.filePath);
    }

    // 删除会话
    this.sessions.delete(fileId);

    return { success: true, message: '文件已删除' };
  }
}

module.exports = new PcapService();
