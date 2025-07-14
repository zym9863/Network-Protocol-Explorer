<template>
  <div class="protocol-simulator">
    <el-page-header @back="$router.push('/')" content="OSI/TCP-IP 协议模拟器" />
    
    <div class="simulator-content">
      <!-- 控制面板 -->
      <el-card class="control-panel" shadow="never">
        <template #header>
          <div class="card-header">
            <span>模拟控制</span>
          </div>
        </template>
        
        <el-form :model="simulationForm" label-width="100px">
          <el-form-item label="协议模型">
            <el-radio-group v-model="simulationForm.model" @change="handleModelChange">
              <el-radio-button label="osi">OSI 七层模型</el-radio-button>
              <el-radio-button label="tcpip">TCP/IP 四层模型</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="应用场景">
            <el-select 
              v-model="simulationForm.scenarioId" 
              placeholder="请选择应用场景"
              style="width: 100%"
              @change="handleScenarioChange"
            >
              <el-option
                v-for="scenario in scenarios"
                :key="scenario.id"
                :label="scenario.name"
                :value="scenario.id"
              >
                <span>{{ scenario.name }}</span>
                <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                  {{ scenario.description }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="模拟方向">
            <el-radio-group v-model="simulationForm.direction">
              <el-radio-button label="encapsulate">封装过程</el-radio-button>
              <el-radio-button label="decapsulate">解封装过程</el-radio-button>
              <el-radio-button label="both">完整过程</el-radio-button>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="startSimulation"
              :loading="isLoading"
              :disabled="!simulationForm.scenarioId"
            >
              <el-icon><VideoPlay /></el-icon>
              开始模拟
            </el-button>
            <el-button @click="resetSimulation" :disabled="!hasResult">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 协议层展示 -->
      <el-card class="layers-panel" shadow="never" v-if="layers">
        <template #header>
          <div class="card-header">
            <span>{{ layers.model }} 协议层</span>
          </div>
        </template>
        
        <div class="layers-container">
          <div 
            v-for="layer in layers.layers" 
            :key="layer.level"
            class="layer-item"
            :class="{ 
              'active': isLayerActive(layer.level),
              'completed': isLayerCompleted(layer.level)
            }"
          >
            <div class="layer-header">
              <span class="layer-level">{{ layer.level }}</span>
              <span class="layer-name">{{ layer.name }}</span>
              <span class="layer-english">{{ layer.englishName }}</span>
            </div>
            <div class="layer-protocols">
              <el-tag 
                v-for="protocol in layer.protocols.slice(0, 3)" 
                :key="protocol"
                size="small"
                type="info"
              >
                {{ protocol }}
              </el-tag>
              <el-tag v-if="layer.protocols.length > 3" size="small" type="info">
                +{{ layer.protocols.length - 3 }}
              </el-tag>
            </div>
            <div class="layer-description">
              {{ layer.description }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- 模拟结果 -->
      <el-card class="simulation-result" shadow="never" v-if="hasResult">
        <template #header>
          <div class="card-header">
            <span>模拟结果</span>
            <div class="simulation-controls">
              <el-button-group>
                <el-button 
                  size="small" 
                  @click="prevStep" 
                  :disabled="currentStep === 0"
                >
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  @click="playAnimation"
                  :disabled="isPlaying"
                >
                  <el-icon><VideoPlay /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  @click="stopAnimation"
                  :disabled="!isPlaying"
                >
                  <el-icon><VideoPause /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  @click="nextStep" 
                  :disabled="currentStep === totalSteps - 1"
                >
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        
        <div class="result-content">
          <!-- 步骤进度 -->
          <div class="step-progress">
            <el-progress 
              :percentage="stepPercentage" 
              :show-text="false"
              stroke-width="8"
            />
            <div class="step-info">
              <span>步骤 {{ currentStep + 1 }} / {{ totalSteps }}</span>
              <span v-if="currentStepData">{{ currentStepData.description }}</span>
            </div>
          </div>
          
          <!-- 当前步骤详情 -->
          <div class="step-details" v-if="currentStepData">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="协议层">
                {{ currentStepData.layerName }}
              </el-descriptions-item>
              <el-descriptions-item label="协议">
                {{ currentStepData.protocol }}
              </el-descriptions-item>
              <el-descriptions-item label="操作">
                {{ currentStepData.action === 'encapsulate' ? '封装' : '解封装' }}
              </el-descriptions-item>
              <el-descriptions-item label="数据大小">
                {{ currentStepData.dataSize }} 字节
              </el-descriptions-item>
              <el-descriptions-item label="头部信息" span="2">
                <el-tag 
                  v-for="(value, key) in currentStepData.header.fields" 
                  :key="key"
                  size="small"
                  style="margin: 2px"
                >
                  {{ key }}: {{ formatHeaderValue(value) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useProtocolStore } from '@/stores/protocol'
import { ElMessage } from 'element-plus'

const protocolStore = useProtocolStore()

// 响应式数据
const simulationForm = ref({
  model: 'osi' as 'osi' | 'tcpip',
  scenarioId: '',
  direction: 'both' as 'encapsulate' | 'decapsulate' | 'both'
})

// 计算属性
const layers = computed(() => protocolStore.layers)
const scenarios = computed(() => protocolStore.scenarios)
const isLoading = computed(() => protocolStore.isLoading)
const hasResult = computed(() => protocolStore.encapsulationResult || protocolStore.decapsulationResult)
const currentStep = computed(() => protocolStore.currentStep)
const totalSteps = computed(() => protocolStore.totalSteps)
const currentStepData = computed(() => protocolStore.currentStepData)
const isPlaying = computed(() => protocolStore.isPlaying)

const stepPercentage = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round(((currentStep.value + 1) / totalSteps.value) * 100)
})

// 方法
const handleModelChange = () => {
  protocolStore.setModel(simulationForm.value.model)
  loadLayers()
}

const handleScenarioChange = () => {
  const scenario = scenarios.value.find((s: any) => s.id === simulationForm.value.scenarioId)
  if (scenario) {
    protocolStore.setCurrentScenario(scenario)
  }
}

const loadLayers = async () => {
  try {
    await protocolStore.loadLayers()
  } catch (error) {
    ElMessage.error('加载协议层失败')
  }
}

const loadScenarios = async () => {
  try {
    await protocolStore.loadScenarios()
  } catch (error) {
    ElMessage.error('加载应用场景失败')
  }
}

const startSimulation = async () => {
  try {
    switch (simulationForm.value.direction) {
      case 'encapsulate':
        await protocolStore.simulateEncapsulation(simulationForm.value.scenarioId)
        break
      case 'decapsulate':
        await protocolStore.simulateEncapsulation(simulationForm.value.scenarioId)
        await protocolStore.simulateDecapsulation()
        break
      case 'both':
        await protocolStore.simulateBoth(simulationForm.value.scenarioId)
        break
    }
    ElMessage.success('模拟完成')
  } catch (error) {
    ElMessage.error('模拟失败')
  }
}

const resetSimulation = () => {
  protocolStore.resetSimulation()
}

const prevStep = () => {
  protocolStore.prevStep()
}

const nextStep = () => {
  protocolStore.nextStep()
}

const playAnimation = () => {
  protocolStore.playAnimation(1500) // 1.5秒每步
}

const stopAnimation = () => {
  protocolStore.stopAnimation()
}

const isLayerActive = (level: number) => {
  if (!currentStepData.value) return false
  return currentStepData.value.layer === level
}

const isLayerCompleted = (level: number) => {
  if (!currentStepData.value) return false
  return currentStep.value > 0 && level > currentStepData.value.layer
}

const formatHeaderValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

// 生命周期
onMounted(() => {
  protocolStore.setModel(simulationForm.value.model)
  loadLayers()
  loadScenarios()
})

// 监听模型变化
watch(() => simulationForm.value.model, () => {
  protocolStore.setModel(simulationForm.value.model)
})
</script>

<style scoped>
.protocol-simulator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.simulator-content {
  margin-top: 20px;
  display: grid;
  gap: 20px;
}

.control-panel {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.layers-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layer-item {
  padding: 16px;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s;
  background: var(--el-bg-color);
}

.layer-item.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  transform: scale(1.02);
}

.layer-item.completed {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.layer-level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.layer-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.layer-english {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.layer-protocols {
  margin-bottom: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.layer-description {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
}

.simulation-controls {
  display: flex;
  gap: 8px;
}

.step-progress {
  margin-bottom: 20px;
}

.step-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.step-details {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .simulator-content {
    grid-template-columns: 1fr;
  }
  
  .layer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .step-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
