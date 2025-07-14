const path = require('path');
const fs = require('fs');

// 引入项目的PCAP服务
const pcapService = require('../src/services/pcapService');

/**
 * 测试PCAP解析服务的脚本
 */

async function testPcapService() {
  console.log('测试PCAP解析服务');
  console.log('================');
  
  const uploadsDir = path.join(__dirname, '../uploads');
  
  const testFiles = [
    'test-http.pcap',
    'test-dns.pcap', 
    'test-icmp.pcap',
    'test-mixed-protocols.pcap'
  ];
  
  for (const fileName of testFiles) {
    const filePath = path.join(uploadsDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 文件不存在: ${fileName}`);
      continue;
    }
    
    console.log(`\n测试文件: ${fileName}`);
    console.log('-'.repeat(40));
    
    try {
      // 模拟文件上传对象
      const mockFile = {
        originalname: fileName,
        buffer: fs.readFileSync(filePath),
        size: fs.statSync(filePath).size,
        mimetype: 'application/octet-stream'
      };
      
      // 测试文件保存
      console.log('1. 测试文件保存...');
      const fileInfo = await pcapService.saveUploadedFile(mockFile);
      console.log(`✅ 文件保存成功: ${fileInfo.id}`);
      console.log(`   原始名称: ${fileInfo.originalName}`);
      console.log(`   文件大小: ${fileInfo.size} bytes`);
      
      // 测试文件解析
      console.log('2. 测试文件解析...');
      const analysisResult = await pcapService.analyzePcapFile(fileInfo.id);
      console.log(`✅ 解析成功`);
      console.log(`   数据包数量: ${analysisResult.summary.totalPackets}`);
      console.log(`   文件大小: ${analysisResult.summary.fileSize} bytes`);
      console.log(`   协议分布: ${JSON.stringify(analysisResult.summary.protocolDistribution)}`);
      
      // 显示前几个数据包的详情
      if (analysisResult.packets && analysisResult.packets.length > 0) {
        console.log('3. 数据包详情预览:');
        analysisResult.packets.slice(0, 2).forEach((packet, index) => {
          console.log(`   数据包 ${index + 1}:`);
          console.log(`     时间戳: ${packet.timestamp}`);
          console.log(`     长度: ${packet.length} bytes`);
          console.log(`     协议: ${packet.protocols.join(' → ')}`);
          if (packet.source && packet.destination) {
            console.log(`     源地址: ${packet.source}`);
            console.log(`     目标地址: ${packet.destination}`);
          }
        });
      }
      
      // 清理测试文件
      await pcapService.deletePcapFile(fileInfo.id);
      console.log('✅ 清理完成');
      
    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      console.log(`   错误堆栈: ${error.stack}`);
    }
  }
  
  console.log('\n测试完成');
}

// 运行测试
if (require.main === module) {
  testPcapService().catch(console.error);
}

module.exports = { testPcapService };
