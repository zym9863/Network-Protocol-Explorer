import request from '@/utils/request'
import type {
  ProtocolModel,
  ApplicationScenario,
  EncapsulationResult,
  DecapsulationResult,
  SimulationParams
} from '@/types'

/**
 * 协议相关API
 */
export const protocolApi = {
  /**
   * 获取协议层信息
   */
  getLayers(model: 'osi' | 'tcpip' = 'osi') {
    return request.get<ProtocolModel>('/protocol/layers', {
      params: { model }
    })
  },

  /**
   * 获取应用场景列表
   */
  getScenarios() {
    return request.get<ApplicationScenario[]>('/protocol/scenarios')
  },

  /**
   * 获取协议详细信息
   */
  getProtocolDetails(protocolName: string) {
    return request.get(`/protocol/details/${protocolName}`)
  },

  /**
   * 数据封装模拟
   */
  encapsulate(scenarioId: string, model: 'osi' | 'tcpip' = 'osi') {
    return request.post<EncapsulationResult>('/protocol/encapsulate', {
      scenarioId,
      model
    })
  },

  /**
   * 数据解封装模拟
   */
  decapsulate(sessionId: string, encapsulatedData: any) {
    return request.post<DecapsulationResult>('/protocol/decapsulate', {
      sessionId,
      encapsulatedData
    })
  },

  /**
   * 完整协议模拟演示
   */
  simulate(params: SimulationParams) {
    return request.post('/protocol/simulate', params)
  }
}
