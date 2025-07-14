# PCAP 文件测试指南

## 🎯 目标
为Network Protocol Explorer项目提供有效的PCAP测试文件，验证PCAP文件分析工具的功能。

## 📁 生成的测试文件

在 `server/uploads/` 目录下已经为您生成了以下测试文件：

### 1. `test-http.pcap` - HTTP 请求示例
- **协议栈**: Ethernet → IPv4 → TCP → HTTP
- **内容**: HTTP GET请求到 www.example.com
- **源地址**: 192.168.1.100:12345
- **目标地址**: 93.184.216.34:80 (example.com)
- **用途**: 测试TCP协议解析和HTTP应用层识别

### 2. `test-dns.pcap` - DNS 查询示例
- **协议栈**: Ethernet → IPv4 → UDP → DNS
- **内容**: DNS查询 www.example.com
- **源地址**: 192.168.1.100:54321
- **目标地址**: 8.8.8.8:53 (Google DNS)
- **用途**: 测试UDP协议解析和DNS应用层识别

### 3. `test-icmp.pcap` - ICMP Ping 示例
- **协议栈**: Ethernet → IPv4 → ICMP
- **内容**: ICMP Echo Request (Ping)
- **源地址**: 192.168.1.100
- **目标地址**: 8.8.8.8
- **用途**: 测试ICMP协议解析和网络诊断工具

### 4. `test-mixed-protocols.pcap` - 混合协议示例
- **协议栈**: 包含上述所有协议
- **数据包数量**: 3个（HTTP + DNS + ICMP）
- **用途**: 测试多协议混合解析和统计功能

## 🚀 使用方法

### 方法1: 通过Web界面测试
1. 启动应用程序
   ```bash
   # 启动后端服务
   cd server
   npm start
   
   # 启动前端（新终端）
   cd client
   npm run dev
   ```

2. 访问 http://localhost:5173 
3. 进入PCAP分析页面
4. 上传任一测试文件（从 `server/uploads/` 目录）
5. 查看解析结果

### 方法2: 通过API测试
```bash
# 测试HTTP数据包文件
curl -X POST -F "file=@server/uploads/test-http.pcap" http://localhost:3000/api/pcap/upload

# 测试DNS数据包文件
curl -X POST -F "file=@server/uploads/test-dns.pcap" http://localhost:3000/api/pcap/upload

# 测试ICMP数据包文件
curl -X POST -F "file=@server/uploads/test-icmp.pcap" http://localhost:3000/api/pcap/upload

# 测试混合协议文件
curl -X POST -F "file=@server/uploads/test-mixed-protocols.pcap" http://localhost:3000/api/pcap/upload
```

### 方法3: 使用测试脚本
```bash
cd server

# 验证PCAP文件格式
node scripts/validate-pcaps.js

# 测试解析服务
node scripts/test-pcap-service.js

# 重新生成测试文件（如需要）
node scripts/generate-test-pcaps.js
```

## 📊 预期测试结果

### HTTP 文件解析结果
```json
{
  "summary": {
    "totalPackets": 1,
    "fileSize": 203,
    "protocolDistribution": {"TCP": 1}
  },
  "packets": [{
    "protocols": ["Ethernet", "IPv4", "TCP", "HTTP"],
    "sourceIP": "192.168.1.100",
    "destinationIP": "93.184.216.34",
    "sourcePort": 12345,
    "destinationPort": 80,
    "info": "192.168.1.100:12345 → 93.184.216.34:80 [TCP] HTTP"
  }]
}
```

### DNS 文件解析结果
```json
{
  "summary": {
    "totalPackets": 1,
    "fileSize": 115,
    "protocolDistribution": {"UDP": 1}
  },
  "packets": [{
    "protocols": ["Ethernet", "IPv4", "UDP", "DNS"],
    "sourceIP": "192.168.1.100",
    "destinationIP": "8.8.8.8",
    "sourcePort": 54321,
    "destinationPort": 53,
    "info": "192.168.1.100:54321 → 8.8.8.8:53 [UDP] DNS"
  }]
}
```

### ICMP 文件解析结果
```json
{
  "summary": {
    "totalPackets": 1,
    "fileSize": 94,
    "protocolDistribution": {"ICMP": 1}
  },
  "packets": [{
    "protocols": ["Ethernet", "IPv4", "ICMP"],
    "sourceIP": "192.168.1.100",
    "destinationIP": "8.8.8.8",
    "info": "192.168.1.100 → 8.8.8.8 [ICMP] Echo Request"
  }]
}
```

### 混合协议文件解析结果
```json
{
  "summary": {
    "totalPackets": 3,
    "fileSize": 364,
    "protocolDistribution": {"TCP": 1, "UDP": 1, "ICMP": 1}
  },
  "packets": [
    "HTTP数据包",
    "DNS数据包", 
    "ICMP数据包"
  ]
}
```

## 🔧 功能验证清单

使用这些测试文件验证以下功能：

- [x] PCAP文件格式验证
- [x] 以太网帧解析
- [x] IPv4头部解析
- [x] TCP协议解析
- [x] UDP协议解析  
- [x] ICMP协议解析
- [x] HTTP应用层识别
- [x] DNS应用层识别
- [x] 协议统计分析
- [x] 数据包列表显示
- [x] 时间戳解析
- [x] 地址和端口解析
- [x] 文件上传和管理
- [x] 错误处理

## 🎨 界面验证要点

1. **文件上传区域**
   - 拖拽上传是否正常
   - 文件类型验证
   - 上传进度显示

2. **数据包列表**
   - 协议标识准确性
   - 时间戳格式
   - 源/目标地址显示
   - 包大小信息

3. **协议统计**
   - 饼图/柱状图显示
   - 数据准确性
   - 交互功能

4. **详细信息面板**
   - 层级结构展示
   - 字段值正确性
   - 十六进制数据显示

## 🐛 常见问题排查

1. **文件上传失败**
   - 检查文件大小限制
   - 验证PCAP格式
   - 查看服务器错误日志

2. **解析结果异常**
   - 使用validation脚本检查文件
   - 对比预期结果
   - 检查协议解析逻辑

3. **性能问题**
   - 测试大文件处理
   - 监控内存使用
   - 优化解析算法

## 📝 扩展测试

如需更多测试场景，可以修改 `scripts/generate-test-pcaps.js` 添加：

- HTTPS/TLS数据包
- FTP、SMTP等协议
- IPv6数据包
- VLAN标记数据包
- 错误/损坏的数据包
- 大文件测试（1000+数据包）

## 🔗 相关工具

- **Wireshark**: 专业网络分析工具，用于对比验证
- **tcpdump**: 命令行抓包工具
- **tshark**: Wireshark的命令行版本
- **hex编辑器**: 查看原始二进制数据

---

🎉 现在您已经有了完整的PCAP测试文件集，可以全面验证Network Protocol Explorer的功能了！
