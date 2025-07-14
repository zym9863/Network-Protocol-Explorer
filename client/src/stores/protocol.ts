import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { protocolApi } from '@/api/protocol'
import type {
  ProtocolModel,
  ApplicationScenario,
  EncapsulationResult,
  DecapsulationResult
} from '@/types'

/**
 * 协议模拟状态管理
 */
export const useProtocolStore = defineStore('protocol', () => {
  // 状态
  const currentModel = ref<'osi' | 'tcpip'>('osi')
  const layers = ref<ProtocolModel | null>(null)
  const scenarios = ref<ApplicationScenario[]>([])
  const currentScenario = ref<ApplicationScenario | null>(null)
  const encapsulationResult = ref<EncapsulationResult | null>(null)
  const decapsulationResult = ref<DecapsulationResult | null>(null)
  const isLoading = ref(false)
  const currentStep = ref(0)
  const isPlaying = ref(false)

  // 计算属性
  const totalSteps = computed(() => {
    if (encapsulationResult.value) {
      return encapsulationResult.value.steps.length
    }
    if (decapsulationResult.value) {
      return decapsulationResult.value.steps.length
    }
    return 0
  })

  const currentStepData = computed(() => {
    if (encapsulationResult.value && currentStep.value < encapsulationResult.value.steps.length) {
      return encapsulationResult.value.steps[currentStep.value]
    }
    if (decapsulationResult.value && currentStep.value < decapsulationResult.value.steps.length) {
      return decapsulationResult.value.steps[currentStep.value]
    }
    return null
  })

  // 动作
  const setModel = (model: 'osi' | 'tcpip') => {
    currentModel.value = model
  }

  const loadLayers = async () => {
    try {
      isLoading.value = true
      const response = await protocolApi.getLayers(currentModel.value)
      layers.value = response.data || null
    } catch (error) {
      console.error('加载协议层失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadScenarios = async () => {
    try {
      isLoading.value = true
      const response = await protocolApi.getScenarios()
      scenarios.value = response.data || []
    } catch (error) {
      console.error('加载应用场景失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentScenario = (scenario: ApplicationScenario) => {
    currentScenario.value = scenario
  }

  const simulateEncapsulation = async (scenarioId: string) => {
    try {
      isLoading.value = true
      const response = await protocolApi.encapsulate(scenarioId, currentModel.value)
      encapsulationResult.value = response.data || null
      decapsulationResult.value = null
      currentStep.value = 0
    } catch (error) {
      console.error('封装模拟失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const simulateDecapsulation = async () => {
    if (!encapsulationResult.value) {
      console.error('需要先进行封装模拟')
      return
    }

    try {
      isLoading.value = true
      const response = await protocolApi.decapsulate(
        encapsulationResult.value.sessionId,
        encapsulationResult.value.finalData
      )
      decapsulationResult.value = response.data || null
      currentStep.value = 0
    } catch (error) {
      console.error('解封装模拟失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const simulateBoth = async (scenarioId: string) => {
    try {
      isLoading.value = true
      const response = await protocolApi.simulate({
        scenarioId,
        model: currentModel.value,
        direction: 'both'
      })
      
      if (response.data) {
        encapsulationResult.value = response.data.encapsulation || null
        decapsulationResult.value = response.data.decapsulation || null
        currentStep.value = 0
      }
    } catch (error) {
      console.error('完整模拟失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps.value) {
      currentStep.value = step
    }
  }

  const resetSimulation = () => {
    encapsulationResult.value = null
    decapsulationResult.value = null
    currentStep.value = 0
    isPlaying.value = false
  }

  const playAnimation = async (speed: number = 1000) => {
    if (isPlaying.value || totalSteps.value === 0) return

    isPlaying.value = true
    currentStep.value = 0

    for (let i = 0; i < totalSteps.value; i++) {
      if (!isPlaying.value) break
      
      currentStep.value = i
      await new Promise(resolve => setTimeout(resolve, speed))
    }

    isPlaying.value = false
  }

  const stopAnimation = () => {
    isPlaying.value = false
  }

  return {
    // 状态
    currentModel,
    layers,
    scenarios,
    currentScenario,
    encapsulationResult,
    decapsulationResult,
    isLoading,
    currentStep,
    isPlaying,
    
    // 计算属性
    totalSteps,
    currentStepData,
    
    // 动作
    setModel,
    loadLayers,
    loadScenarios,
    setCurrentScenario,
    simulateEncapsulation,
    simulateDecapsulation,
    simulateBoth,
    nextStep,
    prevStep,
    goToStep,
    resetSimulation,
    playAnimation,
    stopAnimation
  }
})
