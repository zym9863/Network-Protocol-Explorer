import request from '@/utils/request'
import type {
  PcapFileInfo,
  PacketListResponse,
  PacketDetails,
  FileStatistics,
  SearchParams,
  FilterParams
} from '@/types'

/**
 * PCAP文件分析相关API
 */
export const pcapApi = {
  /**
   * 上传PCAP文件
   */
  uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData()
    formData.append('pcapFile', file)
    
    return request.upload<{
      fileId: string
      fileName: string
      fileSize: number
      totalPackets: number
      statistics: FileStatistics
      uploadTime: string
    }>('/pcap/upload', formData, onProgress)
  },

  /**
   * 获取文件信息和统计
   */
  getFileInfo(fileId: string) {
    return request.get<{
      fileInfo: PcapFileInfo
      statistics: FileStatistics
      parseTime: string
    }>(`/pcap/files/${fileId}`)
  },

  /**
   * 获取数据包列表
   */
  getPackets(fileId: string, params?: FilterParams) {
    return request.get<PacketListResponse>(`/pcap/packets/${fileId}`, {
      params
    })
  },

  /**
   * 获取数据包详情
   */
  getPacketDetails(fileId: string, packetId: number) {
    return request.get<PacketDetails>(`/pcap/packet/${fileId}/${packetId}`)
  },

  /**
   * 搜索数据包
   */
  searchPackets(fileId: string, params: SearchParams) {
    return request.post<PacketListResponse>(`/pcap/search/${fileId}`, params)
  },

  /**
   * 获取协议统计
   */
  getProtocolStats(fileId: string) {
    return request.get<FileStatistics>(`/pcap/stats/${fileId}`)
  },

  /**
   * 删除文件
   */
  deleteFile(fileId: string) {
    return request.delete(`/pcap/files/${fileId}`)
  }
}
