import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pcapApi } from '@/api/pcap'
import type {
  PcapFileInfo,
  PacketInfo,
  PacketDetails,
  FileStatistics,
  FilterParams,
  SearchParams
} from '@/types'

/**
 * PCAP文件分析状态管理
 */
export const usePcapStore = defineStore('pcap', () => {
  // 状态
  const currentFile = ref<PcapFileInfo | null>(null)
  const fileStatistics = ref<FileStatistics | null>(null)
  const packets = ref<PacketInfo[]>([])
  const currentPacket = ref<PacketDetails | null>(null)
  const isLoading = ref(false)
  const uploadProgress = ref(0)
  const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const filters = ref<FilterParams>({})
  const searchQuery = ref('')
  const searchField = ref<'sourceIP' | 'destinationIP' | 'protocol' | 'info'>('info')

  // 计算属性
  const hasFile = computed(() => !!currentFile.value)
  const hasPackets = computed(() => packets.value.length > 0)
  const protocolCounts = computed(() => {
    if (!fileStatistics.value) return []
    return fileStatistics.value.protocolDistribution
  })

  // 动作
  const uploadFile = async (file: File) => {
    try {
      isLoading.value = true
      uploadProgress.value = 0
      
      const response = await pcapApi.uploadFile(file, (progress: number) => {
        uploadProgress.value = progress
      })
      
      if (response.data) {
        currentFile.value = {
          id: response.data.fileId,
          originalName: response.data.fileName,
          fileName: response.data.fileName,
          size: response.data.fileSize,
          uploadTime: response.data.uploadTime,
          mimeType: file.type
        }
        
        fileStatistics.value = response.data.statistics
        
        // 自动加载第一页数据包
        await loadPackets()
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    } finally {
      isLoading.value = false
      uploadProgress.value = 0
    }
  }

  const loadFileInfo = async (fileId: string) => {
    try {
      isLoading.value = true
      const response = await pcapApi.getFileInfo(fileId)
      
      if (response.data) {
        currentFile.value = response.data.fileInfo
        fileStatistics.value = response.data.statistics
      }
    } catch (error) {
      console.error('加载文件信息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadPackets = async (params?: FilterParams) => {
    if (!currentFile.value) return

    try {
      isLoading.value = true
      
      const queryParams = {
        ...filters.value,
        ...params
      }
      
      const response = await pcapApi.getPackets(currentFile.value.id, queryParams)
      
      if (response.data) {
        packets.value = response.data.packets
        pagination.value = response.data.pagination
        filters.value = response.data.filters || {}
      }
    } catch (error) {
      console.error('加载数据包失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadPacketDetails = async (packetId: number) => {
    if (!currentFile.value) return

    try {
      isLoading.value = true
      const response = await pcapApi.getPacketDetails(currentFile.value.id, packetId)
      currentPacket.value = response.data || null
    } catch (error) {
      console.error('加载数据包详情失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const searchPackets = async (query: string, field?: string) => {
    if (!currentFile.value || !query.trim()) return

    try {
      isLoading.value = true
      
      const params: SearchParams = {
        query: query.trim(),
        field: (field as any) || searchField.value,
        page: 1,
        limit: pagination.value.limit
      }
      
      const response = await pcapApi.searchPackets(currentFile.value.id, params)
      
      if (response.data) {
        packets.value = response.data.packets
        pagination.value = response.data.pagination
        searchQuery.value = query
      }
    } catch (error) {
      console.error('搜索数据包失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setFilters = (newFilters: FilterParams) => {
    filters.value = { ...filters.value, ...newFilters }
    loadPackets()
  }

  const clearFilters = () => {
    filters.value = {}
    searchQuery.value = ''
    loadPackets()
  }

  const changePage = (page: number) => {
    if (searchQuery.value) {
      searchPackets(searchQuery.value)
    } else {
      loadPackets({ ...filters.value, page })
    }
  }

  const changePageSize = (limit: number) => {
    pagination.value.limit = limit
    pagination.value.page = 1
    
    if (searchQuery.value) {
      searchPackets(searchQuery.value)
    } else {
      loadPackets({ ...filters.value, page: 1, limit })
    }
  }

  const deleteFile = async () => {
    if (!currentFile.value) return

    try {
      isLoading.value = true
      await pcapApi.deleteFile(currentFile.value.id)
      
      // 清空状态
      currentFile.value = null
      fileStatistics.value = null
      packets.value = []
      currentPacket.value = null
      filters.value = {}
      searchQuery.value = ''
      pagination.value = {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      }
    } catch (error) {
      console.error('删除文件失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const clearCurrentPacket = () => {
    currentPacket.value = null
  }

  const reset = () => {
    currentFile.value = null
    fileStatistics.value = null
    packets.value = []
    currentPacket.value = null
    isLoading.value = false
    uploadProgress.value = 0
    filters.value = {}
    searchQuery.value = ''
    pagination.value = {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    }
  }

  return {
    // 状态
    currentFile,
    fileStatistics,
    packets,
    currentPacket,
    isLoading,
    uploadProgress,
    pagination,
    filters,
    searchQuery,
    searchField,
    
    // 计算属性
    hasFile,
    hasPackets,
    protocolCounts,
    
    // 动作
    uploadFile,
    loadFileInfo,
    loadPackets,
    loadPacketDetails,
    searchPackets,
    setFilters,
    clearFilters,
    changePage,
    changePageSize,
    deleteFile,
    clearCurrentPacket,
    reset
  }
})
