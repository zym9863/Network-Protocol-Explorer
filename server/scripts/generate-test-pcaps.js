const fs = require('fs');
const path = require('path');

/**
 * 生成测试用的PCAP文件
 * 这个脚本会创建包含不同网络协议的有效PCAP文件用于测试
 */

// PCAP文件头结构 (Global Header)
function createPcapGlobalHeader() {
  const buffer = Buffer.alloc(24);
  
  // Magic number (0xa1b2c3d4 for microsecond precision)
  buffer.writeUInt32LE(0xa1b2c3d4, 0);
  
  // Version major (2)
  buffer.writeUInt16LE(2, 4);
  
  // Version minor (4)
  buffer.writeUInt16LE(4, 6);
  
  // Timezone offset (0)
  buffer.writeInt32LE(0, 8);
  
  // Timestamp accuracy (0)
  buffer.writeUInt32LE(0, 12);
  
  // Max length of captured packets (65535)
  buffer.writeUInt32LE(65535, 16);
  
  // Link layer header type (1 = Ethernet)
  buffer.writeUInt32LE(1, 20);
  
  return buffer;
}

// 数据包记录头结构
function createPacketHeader(timestamp, packetLength, originalLength) {
  const buffer = Buffer.alloc(16);
  
  // Timestamp seconds
  buffer.writeUInt32LE(Math.floor(timestamp), 0);
  
  // Timestamp microseconds
  buffer.writeUInt32LE((timestamp % 1) * 1000000, 4);
  
  // Captured packet length
  buffer.writeUInt32LE(packetLength, 8);
  
  // Original packet length
  buffer.writeUInt32LE(originalLength, 12);
  
  return buffer;
}

// 创建以太网帧头
function createEthernetHeader(destMac, srcMac, etherType) {
  const buffer = Buffer.alloc(14);
  
  // 目标MAC地址
  Buffer.from(destMac.replace(/:/g, ''), 'hex').copy(buffer, 0);
  
  // 源MAC地址
  Buffer.from(srcMac.replace(/:/g, ''), 'hex').copy(buffer, 6);
  
  // EtherType
  buffer.writeUInt16BE(etherType, 12);
  
  return buffer;
}

// 创建IPv4头
function createIPv4Header(srcIP, destIP, protocol, dataLength) {
  const buffer = Buffer.alloc(20);
  
  // Version (4) + Header Length (5 * 4 = 20 bytes)
  buffer.writeUInt8(0x45, 0);
  
  // Type of Service
  buffer.writeUInt8(0, 1);
  
  // Total Length
  buffer.writeUInt16BE(20 + dataLength, 2);
  
  // Identification
  buffer.writeUInt16BE(0x1234, 4);
  
  // Flags + Fragment Offset
  buffer.writeUInt16BE(0x4000, 6); // Don't Fragment
  
  // TTL
  buffer.writeUInt8(64, 8);
  
  // Protocol
  buffer.writeUInt8(protocol, 9);
  
  // Header Checksum (先设为0，后面计算)
  buffer.writeUInt16BE(0, 10);
  
  // Source IP
  const srcParts = srcIP.split('.').map(x => parseInt(x));
  srcParts.forEach((part, i) => buffer.writeUInt8(part, 12 + i));
  
  // Destination IP
  const destParts = destIP.split('.').map(x => parseInt(x));
  destParts.forEach((part, i) => buffer.writeUInt8(part, 16 + i));
  
  // 计算校验和
  let checksum = 0;
  for (let i = 0; i < 20; i += 2) {
    checksum += buffer.readUInt16BE(i);
  }
  checksum = (~((checksum & 0xFFFF) + (checksum >> 16))) & 0xFFFF;
  buffer.writeUInt16BE(checksum, 10);
  
  return buffer;
}

// 创建TCP头
function createTCPHeader(srcPort, destPort, seq, ack, flags, dataLength) {
  const buffer = Buffer.alloc(20);
  
  // Source Port
  buffer.writeUInt16BE(srcPort, 0);
  
  // Destination Port
  buffer.writeUInt16BE(destPort, 2);
  
  // Sequence Number
  buffer.writeUInt32BE(seq, 4);
  
  // Acknowledgment Number
  buffer.writeUInt32BE(ack, 8);
  
  // Data Offset (5 * 4 = 20 bytes) + Reserved + Flags
  buffer.writeUInt16BE((5 << 12) | flags, 12);
  
  // Window Size
  buffer.writeUInt16BE(8192, 14);
  
  // Checksum (暂时设为0)
  buffer.writeUInt16BE(0, 16);
  
  // Urgent Pointer
  buffer.writeUInt16BE(0, 18);
  
  return buffer;
}

// 创建UDP头
function createUDPHeader(srcPort, destPort, dataLength) {
  const buffer = Buffer.alloc(8);
  
  // Source Port
  buffer.writeUInt16BE(srcPort, 0);
  
  // Destination Port
  buffer.writeUInt16BE(destPort, 2);
  
  // Length (UDP头 + 数据)
  buffer.writeUInt16BE(8 + dataLength, 4);
  
  // Checksum (暂时设为0)
  buffer.writeUInt16BE(0, 6);
  
  return buffer;
}

// 创建ICMP头
function createICMPHeader(type, code, data) {
  const buffer = Buffer.alloc(8 + data.length);
  
  // Type
  buffer.writeUInt8(type, 0);
  
  // Code
  buffer.writeUInt8(code, 1);
  
  // Checksum (先设为0)
  buffer.writeUInt16BE(0, 2);
  
  // Rest of Header (4 bytes)
  buffer.writeUInt32BE(0, 4);
  
  // Data
  data.copy(buffer, 8);
  
  // 计算校验和
  let checksum = 0;
  for (let i = 0; i < buffer.length; i += 2) {
    if (i + 1 < buffer.length) {
      checksum += buffer.readUInt16BE(i);
    } else {
      checksum += buffer.readUInt8(i) << 8;
    }
  }
  checksum = (~((checksum & 0xFFFF) + (checksum >> 16))) & 0xFFFF;
  buffer.writeUInt16BE(checksum, 2);
  
  return buffer;
}

// 生成HTTP请求PCAP文件
function generateHTTPPcap() {
  const packets = [];
  const baseTime = Date.now() / 1000;
  
  // HTTP GET请求数据
  const httpData = Buffer.from(
    'GET / HTTP/1.1\r\n' +
    'Host: www.example.com\r\n' +
    'User-Agent: Mozilla/5.0\r\n' +
    'Accept: text/html\r\n' +
    'Connection: keep-alive\r\n' +
    '\r\n'
  );
  
  // 构建数据包
  const ethHeader = createEthernetHeader(
    '00:11:22:33:44:55',
    'aa:bb:cc:dd:ee:ff',
    0x0800 // IPv4
  );
  
  const ipHeader = createIPv4Header(
    '192.168.1.100',
    '93.184.216.34', // example.com
    6, // TCP
    20 + httpData.length
  );
  
  const tcpHeader = createTCPHeader(
    12345, // 源端口
    80,    // HTTP端口
    1000,  // 序列号
    0,     // 确认号
    0x18,  // PSH + ACK
    httpData.length
  );
  
  const packet = Buffer.concat([ethHeader, ipHeader, tcpHeader, httpData]);
  
  packets.push({
    header: createPacketHeader(baseTime, packet.length, packet.length),
    data: packet
  });
  
  return packets;
}

// 生成DNS查询PCAP文件
function generateDNSPcap() {
  const packets = [];
  const baseTime = Date.now() / 1000;
  
  // DNS查询数据 (简化版)
  const dnsData = Buffer.from([
    0x12, 0x34, // Transaction ID
    0x01, 0x00, // Flags (Standard query)
    0x00, 0x01, // Questions: 1
    0x00, 0x00, // Answer RRs: 0
    0x00, 0x00, // Authority RRs: 0
    0x00, 0x00, // Additional RRs: 0
    // Query: www.example.com
    0x03, 0x77, 0x77, 0x77, // www
    0x07, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, // example
    0x03, 0x63, 0x6f, 0x6d, // com
    0x00, // End of name
    0x00, 0x01, // Type: A
    0x00, 0x01  // Class: IN
  ]);
  
  const ethHeader = createEthernetHeader(
    '00:11:22:33:44:55',
    'aa:bb:cc:dd:ee:ff',
    0x0800 // IPv4
  );
  
  const ipHeader = createIPv4Header(
    '192.168.1.100',
    '8.8.8.8', // Google DNS
    17, // UDP
    8 + dnsData.length
  );
  
  const udpHeader = createUDPHeader(
    54321, // 源端口
    53,    // DNS端口
    dnsData.length
  );
  
  const packet = Buffer.concat([ethHeader, ipHeader, udpHeader, dnsData]);
  
  packets.push({
    header: createPacketHeader(baseTime, packet.length, packet.length),
    data: packet
  });
  
  return packets;
}

// 生成ICMP Ping PCAP文件
function generateICMPPcap() {
  const packets = [];
  const baseTime = Date.now() / 1000;
  
  // ICMP数据
  const icmpData = Buffer.from('Hello, ICMP!');
  const icmpHeader = createICMPHeader(8, 0, icmpData); // Echo Request
  
  const ethHeader = createEthernetHeader(
    '00:11:22:33:44:55',
    'aa:bb:cc:dd:ee:ff',
    0x0800 // IPv4
  );
  
  const ipHeader = createIPv4Header(
    '192.168.1.100',
    '8.8.8.8', // Google DNS
    1, // ICMP
    icmpHeader.length
  );
  
  const packet = Buffer.concat([ethHeader, ipHeader, icmpHeader]);
  
  packets.push({
    header: createPacketHeader(baseTime, packet.length, packet.length),
    data: packet
  });
  
  return packets;
}

// 生成包含多种协议的综合测试PCAP文件
function generateMixedProtocolPcap() {
  const packets = [];
  const baseTime = Date.now() / 1000;
  
  // 添加HTTP数据包
  packets.push(...generateHTTPPcap());
  
  // 添加DNS数据包
  packets.push(...generateDNSPcap().map(p => ({
    header: createPacketHeader(baseTime + 0.1, p.data.length, p.data.length),
    data: p.data
  })));
  
  // 添加ICMP数据包
  packets.push(...generateICMPPcap().map(p => ({
    header: createPacketHeader(baseTime + 0.2, p.data.length, p.data.length),
    data: p.data
  })));
  
  return packets;
}

// 写入PCAP文件
function writePcapFile(filename, packets) {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  // 确保uploads目录存在
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filepath = path.join(uploadsDir, filename);
  const globalHeader = createPcapGlobalHeader();
  
  const buffers = [globalHeader];
  
  packets.forEach(packet => {
    buffers.push(packet.header);
    buffers.push(packet.data);
  });
  
  const finalBuffer = Buffer.concat(buffers);
  fs.writeFileSync(filepath, finalBuffer);
  
  console.log(`生成测试PCAP文件: ${filepath} (${finalBuffer.length} bytes)`);
  return filepath;
}

// 主函数
function generateTestPcaps() {
  console.log('开始生成测试PCAP文件...');
  
  try {
    // 生成HTTP测试文件
    const httpPackets = generateHTTPPcap();
    writePcapFile('test-http.pcap', httpPackets);
    
    // 生成DNS测试文件
    const dnsPackets = generateDNSPcap();
    writePcapFile('test-dns.pcap', dnsPackets);
    
    // 生成ICMP测试文件
    const icmpPackets = generateICMPPcap();
    writePcapFile('test-icmp.pcap', icmpPackets);
    
    // 生成综合测试文件
    const mixedPackets = generateMixedProtocolPcap();
    writePcapFile('test-mixed-protocols.pcap', mixedPackets);
    
    console.log('所有测试PCAP文件生成完成！');
    
    // 输出文件信息
    console.log('\n生成的测试文件:');
    console.log('1. test-http.pcap - HTTP GET请求示例');
    console.log('2. test-dns.pcap - DNS查询示例');
    console.log('3. test-icmp.pcap - ICMP Ping示例');
    console.log('4. test-mixed-protocols.pcap - 混合协议示例');
    
  } catch (error) {
    console.error('生成PCAP文件时出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  generateTestPcaps();
}

module.exports = {
  generateTestPcaps,
  writePcapFile,
  generateHTTPPcap,
  generateDNSPcap,
  generateICMPPcap,
  generateMixedProtocolPcap
};
