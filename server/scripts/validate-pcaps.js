const fs = require('fs');
const path = require('path');

/**
 * PCAP文件验证脚本
 * 验证生成的PCAP文件是否符合标准格式
 */

function validatePcapFile(filePath) {
  console.log(`\n验证文件: ${path.basename(filePath)}`);
  console.log('='.repeat(50));
  
  try {
    const buffer = fs.readFileSync(filePath);
    
    // 检查文件大小
    if (buffer.length < 24) {
      console.log('❌ 文件太小，不是有效的PCAP文件');
      return false;
    }
    
    // 检查魔数
    const magic = buffer.readUInt32LE(0);
    if (magic !== 0xa1b2c3d4) {
      console.log(`❌ 魔数不正确: 0x${magic.toString(16)}, 期望: 0xa1b2c3d4`);
      return false;
    }
    console.log('✅ 魔数正确');
    
    // 检查版本
    const majorVersion = buffer.readUInt16LE(4);
    const minorVersion = buffer.readUInt16LE(6);
    console.log(`✅ 版本: ${majorVersion}.${minorVersion}`);
    
    // 检查链路层类型
    const linkType = buffer.readUInt32LE(20);
    if (linkType === 1) {
      console.log('✅ 链路层类型: Ethernet');
    } else {
      console.log(`⚠️  链路层类型: ${linkType} (非Ethernet)`);
    }
    
    // 解析数据包
    let offset = 24; // 跳过全局头
    let packetCount = 0;
    
    while (offset + 16 <= buffer.length) {
      packetCount++;
      
      // 读取数据包头
      const tsSeconds = buffer.readUInt32LE(offset);
      const tsMicros = buffer.readUInt32LE(offset + 4);
      const capturedLength = buffer.readUInt32LE(offset + 8);
      const originalLength = buffer.readUInt32LE(offset + 12);
      
      console.log(`  数据包 ${packetCount}:`);
      console.log(`    时间戳: ${tsSeconds}.${tsMicros.toString().padStart(6, '0')}`);
      console.log(`    捕获长度: ${capturedLength} bytes`);
      console.log(`    原始长度: ${originalLength} bytes`);
      
      // 检查长度合理性
      if (capturedLength > 65535 || originalLength > 65535) {
        console.log(`    ⚠️  长度可能不合理`);
      }
      
      if (capturedLength > originalLength) {
        console.log(`    ❌ 捕获长度大于原始长度`);
      }
      
      // 跳到下一个数据包
      offset += 16 + capturedLength;
      
      // 检查是否还有足够的数据
      if (offset > buffer.length) {
        console.log(`    ❌ 数据包数据超出文件边界`);
        break;
      }
      
      // 如果有数据包数据，解析以太网头
      if (capturedLength >= 14) {
        const packetOffset = offset - capturedLength;
        
        // 目标MAC
        const destMac = [];
        for (let i = 0; i < 6; i++) {
          destMac.push(buffer.readUInt8(packetOffset + i).toString(16).padStart(2, '0'));
        }
        
        // 源MAC
        const srcMac = [];
        for (let i = 6; i < 12; i++) {
          srcMac.push(buffer.readUInt8(packetOffset + i).toString(16).padStart(2, '0'));
        }
        
        // EtherType
        const etherType = buffer.readUInt16BE(packetOffset + 12);
        
        console.log(`    以太网头:`);
        console.log(`      目标MAC: ${destMac.join(':')}`);
        console.log(`      源MAC: ${srcMac.join(':')}`);
        console.log(`      类型: 0x${etherType.toString(16)} ${getEtherTypeDescription(etherType)}`);
        
        // 如果是IPv4，解析IP头
        if (etherType === 0x0800 && capturedLength >= 34) {
          const ipOffset = packetOffset + 14;
          const version = (buffer.readUInt8(ipOffset) >> 4) & 0xF;
          const headerLength = (buffer.readUInt8(ipOffset) & 0xF) * 4;
          const protocol = buffer.readUInt8(ipOffset + 9);
          
          const srcIP = [];
          const destIP = [];
          for (let i = 0; i < 4; i++) {
            srcIP.push(buffer.readUInt8(ipOffset + 12 + i));
            destIP.push(buffer.readUInt8(ipOffset + 16 + i));
          }
          
          console.log(`    IPv${version}头:`);
          console.log(`      头部长度: ${headerLength} bytes`);
          console.log(`      协议: ${protocol} (${getProtocolDescription(protocol)})`);
          console.log(`      源IP: ${srcIP.join('.')}`);
          console.log(`      目标IP: ${destIP.join('.')}`);
          
          // 如果是TCP/UDP，解析传输层头
          if ((protocol === 6 || protocol === 17) && capturedLength >= ipOffset + headerLength + 8) {
            const transportOffset = ipOffset + headerLength;
            const srcPort = buffer.readUInt16BE(transportOffset);
            const destPort = buffer.readUInt16BE(transportOffset + 2);
            
            console.log(`    ${protocol === 6 ? 'TCP' : 'UDP'}头:`);
            console.log(`      源端口: ${srcPort}`);
            console.log(`      目标端口: ${destPort} (${getPortDescription(destPort)})`);
          }
        }
      }
    }
    
    console.log(`✅ 总共包含 ${packetCount} 个数据包`);
    console.log(`✅ 文件验证通过`);
    return true;
    
  } catch (error) {
    console.log(`❌ 验证失败: ${error.message}`);
    return false;
  }
}

function getEtherTypeDescription(etherType) {
  switch (etherType) {
    case 0x0800: return '(IPv4)';
    case 0x0806: return '(ARP)';
    case 0x86DD: return '(IPv6)';
    default: return '(Unknown)';
  }
}

function getProtocolDescription(protocol) {
  switch (protocol) {
    case 1: return 'ICMP';
    case 6: return 'TCP';
    case 17: return 'UDP';
    default: return 'Unknown';
  }
}

function getPortDescription(port) {
  switch (port) {
    case 53: return 'DNS';
    case 80: return 'HTTP';
    case 443: return 'HTTPS';
    case 21: return 'FTP';
    case 22: return 'SSH';
    case 25: return 'SMTP';
    default: return 'Unknown';
  }
}

// 主函数
function main() {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  console.log('PCAP文件验证工具');
  console.log('==================');
  console.log(`扫描目录: ${uploadsDir}`);
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const pcapFiles = files.filter(file => file.endsWith('.pcap'));
    
    if (pcapFiles.length === 0) {
      console.log('未找到PCAP文件');
      return;
    }
    
    console.log(`找到 ${pcapFiles.length} 个PCAP文件\n`);
    
    let validFiles = 0;
    for (const file of pcapFiles) {
      const filePath = path.join(uploadsDir, file);
      if (validatePcapFile(filePath)) {
        validFiles++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`验证完成: ${validFiles}/${pcapFiles.length} 文件有效`);
    
  } catch (error) {
    console.error('扫描目录失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { validatePcapFile };
