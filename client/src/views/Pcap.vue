<template>
  <div class="pcap-analyzer">
    <el-page-header @back="$router.push('/')" content="PCAP 文件分析工具" />
    
    <div class="analyzer-content">
      <!-- 文件上传区域 -->
      <el-card class="upload-panel" shadow="never" v-if="!hasFile">
        <template #header>
          <div class="card-header">
            <span>上传 PCAP 文件</span>
          </div>
        </template>
        
        <el-upload
          class="upload-dragger"
          drag
          :auto-upload="false"
          :on-change="handleFileSelect"
          :show-file-list="false"
          accept=".pcap,.pcapng,.cap"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将 PCAP 文件拖拽到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .pcap、.pcapng、.cap 格式，文件大小不超过 100MB
            </div>
          </template>
        </el-upload>
        
        <div class="upload-progress" v-if="uploadProgress > 0">
          <el-progress 
            :percentage="uploadProgress" 
            :status="uploadProgress === 100 ? 'success' : undefined"
          />
          <p>正在上传和解析文件...</p>
        </div>
      </el-card>

      <!-- 文件信息和统计 -->
      <el-card class="file-info" shadow="never" v-if="hasFile">
        <template #header>
          <div class="card-header">
            <span>文件信息</span>
            <el-button type="danger" size="small" @click="deleteFile">
              <el-icon><Delete /></el-icon>
              删除文件
            </el-button>
          </div>
        </template>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="文件名">
            {{ currentFile?.originalName }}
          </el-descriptions-item>
          <el-descriptions-item label="文件大小">
            {{ formatFileSize(currentFile?.size || 0) }}
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">
            {{ formatTime(currentFile?.uploadTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="数据包总数">
            {{ fileStatistics?.totalPackets || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="总字节数">
            {{ formatFileSize(fileStatistics?.totalBytes || 0) }}
          </el-descriptions-item>
          <el-descriptions-item label="时间范围">
            {{ formatTimeRange() }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 协议分布图表 -->
        <div class="protocol-chart" v-if="protocolCounts.length > 0">
          <h4>协议分布</h4>
          <div class="protocol-stats">
            <div 
              v-for="stat in protocolCounts.slice(0, 5)" 
              :key="stat.protocol"
              class="protocol-item"
            >
              <span class="protocol-name">{{ stat.protocol }}</span>
              <el-progress 
                :percentage="parseFloat(stat.percentage)" 
                :show-text="false"
                stroke-width="12"
              />
              <span class="protocol-count">{{ stat.count }} ({{ stat.percentage }}%)</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 搜索和过滤 -->
      <el-card class="filter-panel" shadow="never" v-if="hasFile">
        <el-form :model="filterForm" inline>
          <el-form-item label="搜索">
            <el-input
              v-model="filterForm.searchQuery"
              placeholder="搜索数据包..."
              style="width: 200px"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="搜索字段">
            <el-select v-model="filterForm.searchField" style="width: 120px">
              <el-option label="信息" value="info" />
              <el-option label="源IP" value="sourceIP" />
              <el-option label="目标IP" value="destinationIP" />
              <el-option label="协议" value="protocol" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="协议">
            <el-select 
              v-model="filterForm.protocol" 
              placeholder="全部协议"
              clearable
              style="width: 120px"
              @change="handleFilter"
            >
              <el-option 
                v-for="protocol in availableProtocols" 
                :key="protocol"
                :label="protocol" 
                :value="protocol" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="源IP">
            <el-input
              v-model="filterForm.sourceIP"
              placeholder="源IP地址"
              style="width: 140px"
              @keyup.enter="handleFilter"
            />
          </el-form-item>
          
          <el-form-item label="目标IP">
            <el-input
              v-model="filterForm.destIP"
              placeholder="目标IP地址"
              style="width: 140px"
              @keyup.enter="handleFilter"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleFilter">
              <el-icon><Filter /></el-icon>
              过滤
            </el-button>
            <el-button @click="clearFilters">
              <el-icon><RefreshRight /></el-icon>
              清除
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据包列表 -->
      <el-card class="packets-table" shadow="never" v-if="hasPackets">
        <template #header>
          <div class="card-header">
            <span>数据包列表</span>
            <span class="packet-count">
              共 {{ pagination.total }} 个数据包
            </span>
          </div>
        </template>
        
        <el-table 
          :data="packets" 
          stripe 
          @row-click="handleRowClick"
          v-loading="isLoading"
        >
          <el-table-column prop="id" label="序号" width="80" />
          <el-table-column prop="timestamp" label="时间戳" width="180">
            <template #default="{ row }">
              {{ formatTime(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceIP" label="源IP" width="140" />
          <el-table-column prop="destinationIP" label="目标IP" width="140" />
          <el-table-column prop="protocol" label="协议" width="80">
            <template #default="{ row }">
              <el-tag :type="getProtocolTagType(row.protocol)" size="small">
                {{ row.protocol }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="capturedLength" label="长度" width="80" />
          <el-table-column prop="info" label="信息" min-width="200" />
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :page-sizes="[20, 50, 100, 200]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>

      <!-- 数据包详情对话框 -->
      <el-dialog
        v-model="showPacketDetails"
        title="数据包详情"
        width="80%"
        :before-close="closePacketDetails"
      >
        <div v-if="currentPacket" class="packet-details">
          <!-- 基本信息 -->
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="帧号">
              {{ currentPacket.id + 1 }}
            </el-descriptions-item>
            <el-descriptions-item label="时间戳">
              {{ formatTime(currentPacket.timestamp) }}
            </el-descriptions-item>
            <el-descriptions-item label="捕获长度">
              {{ currentPacket.capturedLength }} 字节
            </el-descriptions-item>
            <el-descriptions-item label="原始长度">
              {{ currentPacket.originalLength }} 字节
            </el-descriptions-item>
            <el-descriptions-item label="协议">
              <el-tag :type="getProtocolTagType(currentPacket.protocol)">
                {{ currentPacket.protocol }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="标志">
              <el-tag 
                v-for="flag in currentPacket.flags" 
                :key="flag"
                size="small"
                style="margin-right: 4px"
              >
                {{ flag }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 协议层信息 -->
          <div class="protocol-layers">
            <h4>协议层信息</h4>
            <el-collapse>
              <el-collapse-item 
                v-for="(layer, index) in currentPacket.layers" 
                :key="index"
                :title="layer.name"
                :name="index"
              >
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item 
                    v-for="(value, key) in layer.fields" 
                    :key="key"
                    :label="key"
                  >
                    {{ formatHeaderValue(value) }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <!-- 十六进制数据 -->
          <div class="hex-data" v-if="currentPacket.hexData">
            <h4>十六进制数据</h4>
            <div class="hex-viewer">
              <div 
                v-for="line in currentPacket.hexData.slice(0, 20)" 
                :key="line.offset"
                class="hex-line"
              >
                <span class="hex-offset">{{ line.offset }}</span>
                <span class="hex-bytes">{{ line.hex }}</span>
                <span class="hex-ascii">{{ line.ascii }}</span>
              </div>
              <div v-if="currentPacket.hexData.length > 20" class="hex-more">
                ... 还有 {{ currentPacket.hexData.length - 20 }} 行数据
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePcapStore } from '@/stores/pcap'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile } from 'element-plus'

const pcapStore = usePcapStore()

// 响应式数据
const filterForm = ref({
  searchQuery: '',
  searchField: 'info' as 'sourceIP' | 'destinationIP' | 'protocol' | 'info',
  protocol: '',
  sourceIP: '',
  destIP: ''
})

const showPacketDetails = ref(false)

// 计算属性
const hasFile = computed(() => pcapStore.hasFile)
const hasPackets = computed(() => pcapStore.hasPackets)
const currentFile = computed(() => pcapStore.currentFile)
const fileStatistics = computed(() => pcapStore.fileStatistics)
const packets = computed(() => pcapStore.packets)
const currentPacket = computed(() => pcapStore.currentPacket)
const isLoading = computed(() => pcapStore.isLoading)
const uploadProgress = computed(() => pcapStore.uploadProgress)
const pagination = computed(() => pcapStore.pagination)
const protocolCounts = computed(() => pcapStore.protocolCounts)

const availableProtocols = computed(() => {
  const protocols = new Set(packets.value.map((p: any) => p.protocol))
  return Array.from(protocols).sort()
})

// 方法
const handleFileSelect = async (file: UploadFile) => {
  if (!file.raw) return
  
  try {
    await pcapStore.uploadFile(file.raw)
    ElMessage.success('文件上传成功')
  } catch (error) {
    ElMessage.error('文件上传失败')
  }
}

const handleSearch = () => {
  if (filterForm.value.searchQuery.trim()) {
    pcapStore.searchPackets(
      filterForm.value.searchQuery,
      filterForm.value.searchField
    )
  } else {
    handleFilter()
  }
}

const handleFilter = () => {
  const filters = {
    protocol: filterForm.value.protocol || undefined,
    sourceIP: filterForm.value.sourceIP || undefined,
    destIP: filterForm.value.destIP || undefined
  }
  pcapStore.setFilters(filters)
}

const clearFilters = () => {
  filterForm.value = {
    searchQuery: '',
    searchField: 'info',
    protocol: '',
    sourceIP: '',
    destIP: ''
  }
  pcapStore.clearFilters()
}

const handleRowClick = async (row: any) => {
  try {
    await pcapStore.loadPacketDetails(row.id)
    showPacketDetails.value = true
  } catch (error) {
    ElMessage.error('加载数据包详情失败')
  }
}

const closePacketDetails = () => {
  showPacketDetails.value = false
  pcapStore.clearCurrentPacket()
}

const handlePageChange = (page: number) => {
  pcapStore.changePage(page)
}

const handleSizeChange = (size: number) => {
  pcapStore.changePageSize(size)
}

const deleteFile = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除当前文件吗？此操作不可恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await pcapStore.deleteFile()
    ElMessage.success('文件删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('文件删除失败')
    }
  }
}

// 工具函数
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const formatTimeRange = () => {
  const range = fileStatistics.value?.timeRange
  if (!range) return '-'
  return `${formatTime(range.start)} - ${formatTime(range.end)}`
}

const getProtocolTagType = (protocol: string) => {
  const types: Record<string, string> = {
    'TCP': 'primary',
    'UDP': 'success',
    'ICMP': 'warning',
    'ARP': 'info'
  }
  return types[protocol] || 'default'
}

const formatHeaderValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

// 生命周期
onMounted(() => {
  // 如果有需要，可以在这里初始化一些数据
})
</script>

<style scoped>
.pcap-analyzer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.analyzer-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.upload-dragger {
  width: 100%;
}

.upload-progress {
  margin-top: 20px;
  text-align: center;
}

.protocol-chart {
  margin-top: 20px;
}

.protocol-chart h4 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.protocol-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.protocol-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.protocol-name {
  width: 60px;
  font-weight: 500;
}

.protocol-count {
  width: 100px;
  text-align: right;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.filter-panel .el-form {
  margin-bottom: 0;
}

.packet-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.packets-table .el-table {
  cursor: pointer;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.packet-details {
  max-height: 70vh;
  overflow-y: auto;
}

.protocol-layers {
  margin-top: 20px;
}

.protocol-layers h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.hex-data {
  margin-top: 20px;
}

.hex-data h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.hex-viewer {
  background: var(--el-bg-color-page);
  padding: 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.hex-line {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.hex-offset {
  color: var(--el-color-primary);
  width: 80px;
}

.hex-bytes {
  color: var(--el-text-color-primary);
  width: 400px;
}

.hex-ascii {
  color: var(--el-text-color-secondary);
}

.hex-more {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-panel .el-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-panel .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  
  .hex-line {
    flex-direction: column;
    gap: 4px;
  }
  
  .hex-bytes {
    width: auto;
    word-break: break-all;
  }
}
/* 导入PCAP页面样式 */
@import '../styles/pcap.css';
</style>
