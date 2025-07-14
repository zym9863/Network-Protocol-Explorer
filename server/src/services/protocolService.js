const { OSI_LAYERS, TCPIP_LAYERS, PROTOCOL_HEADERS, APPLICATION_SCENARIOS } = require('../models/protocolModels');
const { v4: uuidv4 } = require('uuid');

/**
 * 协议服务类
 */
class ProtocolService {
  
  /**
   * 获取所有协议层信息
   */
  static getLayerInfo(model = 'osi') {
    const layers = model.toLowerCase() === 'tcpip' ? TCPIP_LAYERS : OSI_LAYERS;
    return {
      model: model.toUpperCase(),
      layers: Object.keys(layers).map(key => ({
        level: parseInt(key),
        ...layers[key]
      })).sort((a, b) => b.level - a.level) // 从高层到低层排序
    };
  }

  /**
   * 获取应用场景列表
   */
  static getScenarios() {
    return Object.keys(APPLICATION_SCENARIOS).map(key => ({
      id: key,
      ...APPLICATION_SCENARIOS[key]
    }));
  }

  /**
   * 数据封装过程模拟
   */
  static encapsulateData(scenarioId, model = 'osi') {
    const scenario = APPLICATION_SCENARIOS[scenarioId];
    if (!scenario) {
      throw new Error('未找到指定的应用场景');
    }

    const sessionId = uuidv4();
    const layers = model.toLowerCase() === 'tcpip' ? TCPIP_LAYERS : OSI_LAYERS;
    const protocolStack = scenario.protocols;
    
    let currentData = {
      content: scenario.data.application,
      size: scenario.data.application.length
    };

    const encapsulationSteps = [];
    const layerKeys = Object.keys(layers).sort((a, b) => b - a); // 从高层到低层

    // 模拟每一层的封装过程
    for (let i = 0; i < layerKeys.length; i++) {
      const layerLevel = parseInt(layerKeys[i]);
      const layer = layers[layerLevel];
      const protocolName = protocolStack[i];
      
      if (protocolName && PROTOCOL_HEADERS[protocolName]) {
        const header = this.generateProtocolHeader(protocolName, currentData);
        const previousSize = currentData.size;
        
        currentData = {
          content: currentData.content,
          headers: [...(currentData.headers || []), header],
          size: currentData.size + (PROTOCOL_HEADERS[protocolName].size || 0)
        };

        encapsulationSteps.push({
          layer: layerLevel,
          layerName: layer.name,
          protocol: protocolName,
          action: 'encapsulate',
          header: header,
          dataSize: currentData.size,
          addedBytes: currentData.size - previousSize,
          timestamp: new Date().toISOString(),
          description: `${layer.name}添加${protocolName}头部`
        });
      }
    }

    return {
      sessionId,
      scenario: scenario.name,
      model: model.toUpperCase(),
      originalData: scenario.data,
      finalData: currentData,
      steps: encapsulationSteps,
      totalOverhead: currentData.size - scenario.data.application.length
    };
  }

  /**
   * 数据解封装过程模拟
   */
  static decapsulateData(sessionId, encapsulatedData) {
    if (!encapsulatedData || !encapsulatedData.headers) {
      throw new Error('无效的封装数据');
    }

    const decapsulationSteps = [];
    let currentData = { ...encapsulatedData };

    // 从低层到高层逐步解封装
    const headers = [...currentData.headers].reverse();
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const previousSize = currentData.size;
      
      // 移除当前层的头部
      currentData.headers = currentData.headers.slice(0, -1);
      currentData.size -= header.size || 0;

      decapsulationSteps.push({
        layer: header.layer,
        layerName: header.layerName,
        protocol: header.protocol,
        action: 'decapsulate',
        header: header,
        dataSize: currentData.size,
        removedBytes: previousSize - currentData.size,
        timestamp: new Date().toISOString(),
        description: `${header.layerName}移除${header.protocol}头部`
      });
    }

    return {
      sessionId,
      originalData: encapsulatedData,
      finalData: {
        content: currentData.content,
        size: currentData.content.length
      },
      steps: decapsulationSteps,
      removedOverhead: encapsulatedData.size - currentData.content.length
    };
  }

  /**
   * 生成协议头部
   */
  static generateProtocolHeader(protocolName, data) {
    const protocolDef = PROTOCOL_HEADERS[protocolName];
    if (!protocolDef) {
      return null;
    }

    const header = {
      protocol: protocolName,
      size: protocolDef.size || 0,
      fields: {},
      timestamp: new Date().toISOString()
    };

    // 根据协议类型生成相应的头部字段
    switch (protocolName) {
      case 'HTTP':
        header.fields = {
          method: 'GET',
          url: '/api/data',
          version: 'HTTP/1.1',
          headers: {
            'Content-Length': data.size.toString(),
            'Content-Type': 'text/html'
          }
        };
        break;
      
      case 'TCP':
        header.fields = {
          sourcePort: Math.floor(Math.random() * 65535) + 1024,
          destPort: 80,
          sequenceNumber: Math.floor(Math.random() * 4294967295),
          acknowledgmentNumber: 0,
          flags: ['SYN'],
          windowSize: 65535,
          checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase()
        };
        break;
      
      case 'UDP':
        header.fields = {
          sourcePort: Math.floor(Math.random() * 65535) + 1024,
          destPort: 53,
          length: data.size + 8,
          checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase()
        };
        break;
      
      case 'IP':
        header.fields = {
          version: 4,
          headerLength: 20,
          typeOfService: 0,
          totalLength: data.size + 20,
          identification: Math.floor(Math.random() * 65535),
          flags: ['DF'],
          fragmentOffset: 0,
          ttl: 64,
          protocol: protocolName === 'TCP' ? 6 : 17,
          headerChecksum: '0x' + Math.floor(Math.random() * 65535).toString(16).toUpperCase(),
          sourceIP: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
          destinationIP: '8.8.8.8'
        };
        break;
      
      case 'Ethernet':
        header.fields = {
          destMAC: this.generateMACAddress(),
          sourceMAC: this.generateMACAddress(),
          etherType: '0x0800'
        };
        break;
      
      default:
        header.fields = protocolDef.example || {};
    }

    return header;
  }

  /**
   * 生成随机MAC地址
   */
  static generateMACAddress() {
    const mac = [];
    for (let i = 0; i < 6; i++) {
      mac.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
    }
    return mac.join(':');
  }

  /**
   * 获取协议详细信息
   */
  static getProtocolDetails(protocolName) {
    const protocol = PROTOCOL_HEADERS[protocolName];
    if (!protocol) {
      throw new Error('未找到指定协议');
    }

    return {
      name: protocolName,
      ...protocol,
      description: this.getProtocolDescription(protocolName)
    };
  }

  /**
   * 获取协议描述
   */
  static getProtocolDescription(protocolName) {
    const descriptions = {
      'HTTP': 'HyperText Transfer Protocol - 超文本传输协议，用于Web浏览器和服务器之间的通信',
      'TCP': 'Transmission Control Protocol - 传输控制协议，提供可靠的、面向连接的数据传输',
      'UDP': 'User Datagram Protocol - 用户数据报协议，提供无连接的数据传输',
      'IP': 'Internet Protocol - 网际协议，负责数据包的路由和寻址',
      'Ethernet': '以太网协议，定义了局域网中数据帧的格式和传输规则'
    };
    
    return descriptions[protocolName] || '协议描述暂未提供';
  }
}

module.exports = ProtocolService;
