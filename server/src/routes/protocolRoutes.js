const express = require('express');
const ProtocolController = require('../controllers/protocolController');

const router = express.Router();

/**
 * 协议相关路由
 */

// 获取协议层信息
// GET /api/protocol/layers?model=osi|tcpip
router.get('/layers', ProtocolController.getLayers);

// 获取应用场景列表
// GET /api/protocol/scenarios
router.get('/scenarios', ProtocolController.getScenarios);

// 获取协议详细信息
// GET /api/protocol/details/:protocolName
router.get('/details/:protocolName', ProtocolController.getProtocolDetails);

// 数据封装模拟
// POST /api/protocol/encapsulate
// Body: { scenarioId: string, model?: 'osi'|'tcpip' }
router.post('/encapsulate', ProtocolController.encapsulate);

// 数据解封装模拟
// POST /api/protocol/decapsulate
// Body: { sessionId: string, encapsulatedData: object }
router.post('/decapsulate', ProtocolController.decapsulate);

// 完整协议模拟演示
// POST /api/protocol/simulate
// Body: { scenarioId: string, model?: 'osi'|'tcpip', direction?: 'encapsulate'|'decapsulate'|'both' }
router.post('/simulate', ProtocolController.simulate);

// API文档路由
router.get('/', (req, res) => {
  res.json({
    message: '网络协议模拟 API',
    version: '1.0.0',
    endpoints: {
      'GET /layers': '获取协议层信息',
      'GET /scenarios': '获取应用场景列表',
      'GET /details/:protocolName': '获取协议详细信息',
      'POST /encapsulate': '数据封装模拟',
      'POST /decapsulate': '数据解封装模拟',
      'POST /simulate': '完整协议模拟演示'
    },
    examples: {
      encapsulate: {
        url: '/api/protocol/encapsulate',
        method: 'POST',
        body: {
          scenarioId: 'web-browsing',
          model: 'osi'
        }
      },
      simulate: {
        url: '/api/protocol/simulate',
        method: 'POST',
        body: {
          scenarioId: 'web-browsing',
          model: 'tcpip',
          direction: 'both'
        }
      }
    }
  });
});

module.exports = router;
