/**
 * 类型定义文件
 */

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

// 协议层信息
export interface ProtocolLayer {
  level: number
  name: string
  englishName: string
  protocols: string[]
  description: string
  functions: string[]
  osiEquivalent?: number[]
}

// 协议模型信息
export interface ProtocolModel {
  model: string
  layers: ProtocolLayer[]
}

// 应用场景
export interface ApplicationScenario {
  id: string
  name: string
  description: string
  protocols: string[]
  data: {
    application: string
    size: number
  }
}

// 协议头部字段
export interface ProtocolHeader {
  protocol: string
  size: number
  fields: Record<string, any>
  timestamp: string
}

// 封装步骤
export interface EncapsulationStep {
  layer: number
  layerName: string
  protocol: string
  action: 'encapsulate' | 'decapsulate'
  header: ProtocolHeader
  dataSize: number
  addedBytes?: number
  removedBytes?: number
  timestamp: string
  description: string
}

// 封装结果
export interface EncapsulationResult {
  sessionId: string
  scenario: string
  model: string
  originalData: any
  finalData: any
  steps: EncapsulationStep[]
  totalOverhead: number
}

// 解封装结果
export interface DecapsulationResult {
  sessionId: string
  originalData: any
  finalData: any
  steps: EncapsulationStep[]
  removedOverhead: number
}

// PCAP文件信息
export interface PcapFileInfo {
  id: string
  originalName: string
  fileName: string
  size: number
  uploadTime: string
  mimeType: string
}

// 数据包信息
export interface PacketInfo {
  id: number
  timestamp: string
  capturedLength: number
  originalLength: number
  protocol: string
  sourceIP: string
  destinationIP: string
  sourcePort?: number
  destinationPort?: number
  flags: string[]
  info: string
  layers: PacketLayer[]
}

// 数据包层级信息
export interface PacketLayer {
  name: string
  protocol: string
  fields: Record<string, any>
}

// 数据包详情
export interface PacketDetails extends PacketInfo {
  hexData: HexDataLine[]
  rawData: RawDataInfo
}

// 十六进制数据行
export interface HexDataLine {
  offset: string
  hex: string
  ascii: string
}

// 原始数据信息
export interface RawDataInfo {
  frameNumber: number
  timestamp: string
  capturedLength: number
  originalLength: number
  protocols: string[]
  summary: string
}

// 分页信息
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 数据包列表响应
export interface PacketListResponse {
  packets: PacketInfo[]
  pagination: PaginationInfo
  filters?: Record<string, any>
}

// 协议统计
export interface ProtocolStats {
  protocol: string
  count: number
  percentage: string
}

// 文件统计信息
export interface FileStatistics {
  totalPackets: number
  totalBytes: number
  protocolDistribution: ProtocolStats[]
  topIPs: Array<{ ip: string; count: number }>
  timeRange?: {
    start: string
    end: string
  }
}

// 搜索参数
export interface SearchParams {
  query: string
  field: 'sourceIP' | 'destinationIP' | 'protocol' | 'info'
  page?: number
  limit?: number
}

// 过滤参数
export interface FilterParams {
  protocol?: string
  sourceIP?: string
  destIP?: string
  page?: number
  limit?: number
}

// 模拟参数
export interface SimulationParams {
  scenarioId: string
  model: 'osi' | 'tcpip'
  direction: 'encapsulate' | 'decapsulate' | 'both'
}

// 路由元信息
export interface RouteMeta {
  title: string
  icon?: string
  requiresAuth?: boolean
}
