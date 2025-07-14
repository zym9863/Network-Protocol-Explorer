const ProtocolService = require('../services/protocolService');
const Joi = require('joi');

/**
 * 协议控制器
 */
class ProtocolController {

  /**
   * 获取协议层信息
   */
  static async getLayers(req, res, next) {
    try {
      const { model = 'osi' } = req.query;
      
      // 验证模型参数
      const schema = Joi.object({
        model: Joi.string().valid('osi', 'tcpip').default('osi')
      });
      
      const { error, value } = schema.validate({ model });
      if (error) {
        return res.status(400).json({
          success: false,
          error: '无效的模型参数',
          details: error.details
        });
      }

      const layerInfo = ProtocolService.getLayerInfo(value.model);
      
      res.json({
        success: true,
        data: layerInfo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取应用场景列表
   */
  static async getScenarios(req, res, next) {
    try {
      const scenarios = ProtocolService.getScenarios();
      
      res.json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 数据封装模拟
   */
  static async encapsulate(req, res, next) {
    try {
      const schema = Joi.object({
        scenarioId: Joi.string().required(),
        model: Joi.string().valid('osi', 'tcpip').default('osi')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.details
        });
      }

      const result = ProtocolService.encapsulateData(value.scenarioId, value.model);
      
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
   * 数据解封装模拟
   */
  static async decapsulate(req, res, next) {
    try {
      const schema = Joi.object({
        sessionId: Joi.string().required(),
        encapsulatedData: Joi.object({
          content: Joi.string().required(),
          headers: Joi.array().required(),
          size: Joi.number().required()
        }).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.details
        });
      }

      const result = ProtocolService.decapsulateData(value.sessionId, value.encapsulatedData);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message.includes('无效')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * 获取协议详细信息
   */
  static async getProtocolDetails(req, res, next) {
    try {
      const { protocolName } = req.params;
      
      if (!protocolName) {
        return res.status(400).json({
          success: false,
          error: '协议名称不能为空'
        });
      }

      const protocolDetails = ProtocolService.getProtocolDetails(protocolName.toUpperCase());
      
      res.json({
        success: true,
        data: protocolDetails
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
   * 协议模拟演示
   */
  static async simulate(req, res, next) {
    try {
      const schema = Joi.object({
        scenarioId: Joi.string().required(),
        model: Joi.string().valid('osi', 'tcpip').default('osi'),
        direction: Joi.string().valid('encapsulate', 'decapsulate', 'both').default('both')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: '请求参数验证失败',
          details: error.details
        });
      }

      const result = {
        scenario: value.scenarioId,
        model: value.model,
        direction: value.direction
      };

      // 执行封装过程
      if (value.direction === 'encapsulate' || value.direction === 'both') {
        result.encapsulation = ProtocolService.encapsulateData(value.scenarioId, value.model);
      }

      // 执行解封装过程
      if (value.direction === 'decapsulate' || value.direction === 'both') {
        if (result.encapsulation) {
          result.decapsulation = ProtocolService.decapsulateData(
            result.encapsulation.sessionId,
            result.encapsulation.finalData
          );
        } else {
          return res.status(400).json({
            success: false,
            error: '解封装需要先进行封装或提供封装数据'
          });
        }
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProtocolController;
