/**
 * 协议模型定义
 */

// OSI七层模型定义
const OSI_LAYERS = {
  7: {
    name: '应用层',
    englishName: 'Application Layer',
    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'DHCP', 'SSH', 'Telnet'],
    description: '为应用程序提供网络服务',
    functions: ['用户接口', '应用程序接口', '数据格式转换']
  },
  6: {
    name: '表示层',
    englishName: 'Presentation Layer',
    protocols: ['SSL/TLS', 'JPEG', 'GIF', 'MPEG', 'ASCII'],
    description: '数据的表示、加密和压缩',
    functions: ['数据加密/解密', '数据压缩/解压', '数据格式转换']
  },
  5: {
    name: '会话层',
    englishName: 'Session Layer',
    protocols: ['NetBIOS', 'RPC', 'SQL', 'NFS'],
    description: '建立、管理和终止会话',
    functions: ['会话建立', '会话管理', '会话终止', '检查点设置']
  },
  4: {
    name: '传输层',
    englishName: 'Transport Layer',
    protocols: ['TCP', 'UDP', 'SCTP'],
    description: '提供端到端的可靠数据传输',
    functions: ['端口寻址', '分段和重组', '连接控制', '流量控制', '错误控制']
  },
  3: {
    name: '网络层',
    englishName: 'Network Layer',
    protocols: ['IP', 'ICMP', 'IGMP', 'ARP', 'RARP', 'OSPF', 'BGP'],
    description: '路径选择和逻辑地址',
    functions: ['逻辑寻址', '路径选择', '路由', '分组转发']
  },
  2: {
    name: '数据链路层',
    englishName: 'Data Link Layer',
    protocols: ['Ethernet', 'PPP', 'Frame Relay', 'ATM'],
    description: '节点间的数据传输和错误检测',
    functions: ['物理寻址', '拓扑结构', '错误通知', '帧的有序传递', '流量控制']
  },
  1: {
    name: '物理层',
    englishName: 'Physical Layer',
    protocols: ['Ethernet', 'USB', 'Bluetooth', 'Wi-Fi'],
    description: '传输原始比特流',
    functions: ['比特传输', '物理拓扑', '传输介质', '信号编码']
  }
};

// TCP/IP四层模型定义
const TCPIP_LAYERS = {
  4: {
    name: '应用层',
    englishName: 'Application Layer',
    osiEquivalent: [7, 6, 5],
    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'DHCP', 'SSH'],
    description: '应用程序和网络服务'
  },
  3: {
    name: '传输层',
    englishName: 'Transport Layer',
    osiEquivalent: [4],
    protocols: ['TCP', 'UDP'],
    description: '端到端的数据传输'
  },
  2: {
    name: '网络层',
    englishName: 'Internet Layer',
    osiEquivalent: [3],
    protocols: ['IP', 'ICMP', 'IGMP', 'ARP'],
    description: '数据包路由和寻址'
  },
  1: {
    name: '网络接口层',
    englishName: 'Network Access Layer',
    osiEquivalent: [2, 1],
    protocols: ['Ethernet', 'Wi-Fi', 'PPP'],
    description: '物理网络访问'
  }
};

// 协议头部结构定义
const PROTOCOL_HEADERS = {
  HTTP: {
    fields: ['Method', 'URL', 'Version', 'Headers', 'Body'],
    example: {
      method: 'GET',
      url: '/api/data',
      version: 'HTTP/1.1',
      headers: {
        'Host': 'example.com',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    }
  },
  TCP: {
    fields: ['Source Port', 'Destination Port', 'Sequence Number', 'Acknowledgment Number', 'Flags', 'Window Size', 'Checksum'],
    size: 20, // 最小头部大小（字节）
    example: {
      sourcePort: 80,
      destPort: 12345,
      sequenceNumber: 1000,
      acknowledgmentNumber: 2000,
      flags: ['ACK'],
      windowSize: 65535,
      checksum: '0x1234'
    }
  },
  IP: {
    fields: ['Version', 'Header Length', 'Type of Service', 'Total Length', 'Identification', 'Flags', 'Fragment Offset', 'TTL', 'Protocol', 'Header Checksum', 'Source IP', 'Destination IP'],
    size: 20, // 最小头部大小（字节）
    example: {
      version: 4,
      headerLength: 20,
      typeOfService: 0,
      totalLength: 1500,
      identification: 12345,
      flags: ['DF'],
      fragmentOffset: 0,
      ttl: 64,
      protocol: 6, // TCP
      headerChecksum: '0xABCD',
      sourceIP: '192.168.1.100',
      destinationIP: '8.8.8.8'
    }
  },
  Ethernet: {
    fields: ['Destination MAC', 'Source MAC', 'EtherType'],
    size: 14, // 头部大小（字节）
    example: {
      destMAC: '00:11:22:33:44:55',
      sourceMAC: '66:77:88:99:AA:BB',
      etherType: '0x0800' // IPv4
    }
  }
};

// 应用场景定义
const APPLICATION_SCENARIOS = {
  'web-browsing': {
    name: 'Web浏览',
    description: '用户访问网页的完整过程',
    protocols: ['HTTP', 'TCP', 'IP', 'Ethernet'],
    data: {
      application: 'GET /index.html HTTP/1.1\r\nHost: example.com\r\n\r\n',
      size: 1024
    }
  },
  'email-send': {
    name: '发送邮件',
    description: '通过SMTP发送电子邮件',
    protocols: ['SMTP', 'TCP', 'IP', 'Ethernet'],
    data: {
      application: 'MAIL FROM: user@example.com\r\nRCPT TO: recipient@example.com\r\n',
      size: 2048
    }
  },
  'file-transfer': {
    name: '文件传输',
    description: '通过FTP传输文件',
    protocols: ['FTP', 'TCP', 'IP', 'Ethernet'],
    data: {
      application: 'STOR filename.txt\r\n',
      size: 4096
    }
  },
  'dns-query': {
    name: 'DNS查询',
    description: '域名解析查询',
    protocols: ['DNS', 'UDP', 'IP', 'Ethernet'],
    data: {
      application: 'Query: example.com A record',
      size: 512
    }
  }
};

module.exports = {
  OSI_LAYERS,
  TCPIP_LAYERS,
  PROTOCOL_HEADERS,
  APPLICATION_SCENARIOS
};
