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
   * 解析数据包（实际实现）
   */
  parsePackets(buffer) {
    const packets = [];
    
    // 读取PCAP文件头
    const magic = buffer.readUInt32LE(0);
    let offset = 24; // PCAP文件头大小
    let packetIndex = 0;

    // 实际解析PCAP数据包
    while (offset + 16 <= buffer.length) {
      try {
        // 读取数据包头
        const tsSeconds = buffer.readUInt32LE(offset);
        const tsMicros = buffer.readUInt32LE(offset + 4);
        const capturedLength = buffer.readUInt32LE(offset + 8);
        const originalLength = buffer.readUInt32LE(offset + 12);
        
        // 检查数据包长度是否合理
        if (capturedLength > 65535 || offset + 16 + capturedLength > buffer.length) {
          break;
        }
        
        // 解析数据包内容
        const packetData = buffer.slice(offset + 16, offset + 16 + capturedLength);
        const packet = this.parsePacketData(packetIndex++, tsSeconds, tsMicros, capturedLength, originalLength, packetData);
        
        packets.push(packet);
        offset += 16 + capturedLength;
        
      } catch (error) {
        console.warn(`解析数据包 ${packetIndex} 时出错:`, error.message);
        break;
      }
    }

    return packets;
  }

  /**
   * 解析单个数据包的内容
   */
  parsePacketData(index, tsSeconds, tsMicros, capturedLength, originalLength, data) {
    const packet = {
      id: index,
      timestamp: new Date(tsSeconds * 1000 + Math.floor(tsMicros / 1000)).toISOString(),
      timestampMicros: `${tsSeconds}.${tsMicros.toString().padStart(6, '0')}`,
      capturedLength,
      originalLength,
      length: capturedLength,  // 添加这个字段
      protocols: [],
      layers: [],
      protocol: 'Unknown'  // 默认协议
    };

    let offset = 0;

    // 解析以太网头 (14字节)
    if (data.length >= 14) {
      const ethernet = this.parseEthernetHeader(data, offset);
      packet.layers.push(ethernet);
      packet.protocols.push('Ethernet');
      offset += 14;

      // 根据EtherType解析上层协议
      if (ethernet.etherType === 0x0800 && data.length >= offset + 20) {
        // IPv4
        const ipv4 = this.parseIPv4Header(data, offset);
        packet.layers.push(ipv4);
        packet.protocols.push('IPv4');
        packet.sourceIP = ipv4.sourceIP;
        packet.destinationIP = ipv4.destinationIP;
        offset += ipv4.headerLength;

        // 根据协议类型解析传输层
        switch (ipv4.protocol) {
          case 6: // TCP
            packet.protocol = 'TCP';  // 设置主要协议
            if (data.length >= offset + 20) {
              const tcp = this.parseTCPHeader(data, offset);
              packet.layers.push(tcp);
              packet.protocols.push('TCP');
              packet.sourcePort = tcp.sourcePort;
              packet.destinationPort = tcp.destinationPort;
              packet.info = `${packet.sourceIP}:${tcp.sourcePort} → ${packet.destinationIP}:${tcp.destinationPort} [TCP]`;
              
              // 检查是否是HTTP
              if (tcp.destinationPort === 80 || tcp.sourcePort === 80) {
                packet.protocols.push('HTTP');
                packet.info += ' HTTP';
              }
            }
            break;
            
          case 17: // UDP
            packet.protocol = 'UDP';  // 设置主要协议
            if (data.length >= offset + 8) {
              const udp = this.parseUDPHeader(data, offset);
              packet.layers.push(udp);
              packet.protocols.push('UDP');
              packet.sourcePort = udp.sourcePort;
              packet.destinationPort = udp.destinationPort;
              packet.info = `${packet.sourceIP}:${udp.sourcePort} → ${packet.destinationIP}:${udp.destinationPort} [UDP]`;
              
              // 检查是否是DNS
              if (udp.destinationPort === 53 || udp.sourcePort === 53) {
                packet.protocols.push('DNS');
                packet.info += ' DNS';
              }
            }
            break;
            
          case 1: // ICMP
            packet.protocol = 'ICMP';  // 设置主要协议
            if (data.length >= offset + 8) {
              const icmp = this.parseICMPHeader(data, offset);
              packet.layers.push(icmp);
              packet.protocols.push('ICMP');
              packet.info = `${packet.sourceIP} → ${packet.destinationIP} [ICMP] ${icmp.type === 8 ? 'Echo Request' : 'Echo Reply'}`;
            }
            break;
        }
      }
    }

    return packet;
  }

  /**
   * 解析以太网头
   */
  parseEthernetHeader(data, offset) {
    const destMac = [];
    const srcMac = [];
    
    for (let i = 0; i < 6; i++) {
      destMac.push(data.readUInt8(offset + i).toString(16).padStart(2, '0'));
      srcMac.push(data.readUInt8(offset + 6 + i).toString(16).padStart(2, '0'));
    }
    
    const etherType = data.readUInt16BE(offset + 12);
    
    return {
      name: 'Ethernet',
      destination: destMac.join(':'),
      source: srcMac.join(':'),
      etherType,
      etherTypeStr: this.getEtherTypeString(etherType)
    };
  }

  /**
   * 解析IPv4头
   */
  parseIPv4Header(data, offset) {
    const versionHeaderLength = data.readUInt8(offset);
    const version = (versionHeaderLength >> 4) & 0xF;
    const headerLength = (versionHeaderLength & 0xF) * 4;
    const totalLength = data.readUInt16BE(offset + 2);
    const protocol = data.readUInt8(offset + 9);
    
    const srcIP = [];
    const destIP = [];
    for (let i = 0; i < 4; i++) {
      srcIP.push(data.readUInt8(offset + 12 + i));
      destIP.push(data.readUInt8(offset + 16 + i));
    }
    
    return {
      name: 'IPv4',
      version,
      headerLength,
      totalLength,
      protocol,
      protocolStr: this.getProtocolString(protocol),
      sourceIP: srcIP.join('.'),
      destinationIP: destIP.join('.')
    };
  }

  /**
   * 解析TCP头
   */
  parseTCPHeader(data, offset) {
    const sourcePort = data.readUInt16BE(offset);
    const destinationPort = data.readUInt16BE(offset + 2);
    const sequenceNumber = data.readUInt32BE(offset + 4);
    const acknowledgmentNumber = data.readUInt32BE(offset + 8);
    const flags = data.readUInt16BE(offset + 12);
    
    return {
      name: 'TCP',
      sourcePort,
      destinationPort,
      sequenceNumber,
      acknowledgmentNumber,
      flags: this.parseTCPFlags(flags & 0x1FF)
    };
  }

  /**
   * 解析UDP头
   */
  parseUDPHeader(data, offset) {
    const sourcePort = data.readUInt16BE(offset);
    const destinationPort = data.readUInt16BE(offset + 2);
    const length = data.readUInt16BE(offset + 4);
    
    return {
      name: 'UDP',
      sourcePort,
      destinationPort,
      length
    };
  }

  /**
   * 解析ICMP头
   */
  parseICMPHeader(data, offset) {
    const type = data.readUInt8(offset);
    const code = data.readUInt8(offset + 1);
    
    return {
      name: 'ICMP',
      type,
      code,
      typeStr: this.getICMPTypeString(type)
    };
  }

  /**
   * 获取EtherType字符串
   */
  getEtherTypeString(etherType) {
    switch (etherType) {
      case 0x0800: return 'IPv4';
      case 0x0806: return 'ARP';
      case 0x86DD: return 'IPv6';
      default: return `Unknown (0x${etherType.toString(16)})`;
    }
  }

  /**
   * 获取协议字符串
   */
  getProtocolString(protocol) {
    switch (protocol) {
      case 1: return 'ICMP';
      case 6: return 'TCP';
      case 17: return 'UDP';
      default: return `Unknown (${protocol})`;
    }
  }

  /**
   * 解析TCP标志
   */
  parseTCPFlags(flags) {
    const flagNames = [];
    if (flags & 0x01) flagNames.push('FIN');
    if (flags & 0x02) flagNames.push('SYN');
    if (flags & 0x04) flagNames.push('RST');
    if (flags & 0x08) flagNames.push('PSH');
    if (flags & 0x10) flagNames.push('ACK');
    if (flags & 0x20) flagNames.push('URG');
    return flagNames;
  }

  /**
   * 获取ICMP类型字符串
   */
  getICMPTypeString(type) {
    switch (type) {
      case 0: return 'Echo Reply';
      case 8: return 'Echo Request';
      case 3: return 'Destination Unreachable';
      case 11: return 'Time Exceeded';
      default: return `Type ${type}`;
    }
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

    // 计算持续时间和平均数据包大小
    const startTime = new Date(packets[0].timestamp).getTime();
    const endTime = new Date(packets[packets.length - 1].timestamp).getTime();
    const duration = (endTime - startTime) / 1000; // 秒
    const averagePacketSize = totalBytes / packets.length;

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
      } : null,
      duration,
      averagePacketSize
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

  /**
   * 分析PCAP文件并返回分析结果
   */
  async analyzePcapFile(fileId) {
    const session = this.sessions.get(fileId);
    if (!session) {
      // 如果会话不存在，尝试查找文件并解析
      const files = fs.readdirSync(this.uploadDir);
      const targetFile = files.find(file => file.startsWith(fileId));
      
      if (!targetFile) {
        throw new Error('未找到指定的文件');
      }
      
      const fileInfo = {
        id: fileId,
        originalName: targetFile.split('_').slice(1).join('_'),
        fileName: targetFile,
        filePath: path.join(this.uploadDir, targetFile),
        size: fs.statSync(path.join(this.uploadDir, targetFile)).size,
        uploadTime: new Date().toISOString(),
        mimeType: 'application/octet-stream'
      };
      
      // 解析文件
      const parsedSession = await this.parsePcapFile(fileInfo);
      return {
        fileInfo: parsedSession.fileInfo,
        summary: {
          totalPackets: parsedSession.totalPackets,
          fileSize: parsedSession.fileInfo.size,
          protocolDistribution: parsedSession.statistics.protocolDistribution,
          duration: parsedSession.statistics.duration,
          averagePacketSize: parsedSession.statistics.averagePacketSize
        },
        packets: parsedSession.packets,
        statistics: parsedSession.statistics
      };
    }

    return {
      fileInfo: session.fileInfo,
      summary: {
        totalPackets: session.totalPackets,
        fileSize: session.fileInfo.size,
        protocolDistribution: session.statistics.protocolDistribution,
        duration: session.statistics.duration,
        averagePacketSize: session.statistics.averagePacketSize
      },
      packets: session.packets,
      statistics: session.statistics
    };
  }

  /**
   * 删除PCAP文件
   */
  async deletePcapFile(fileId) {
    return this.deleteFile(fileId);
  }
}

module.exports = new PcapService();
