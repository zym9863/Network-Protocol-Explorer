<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-banner" shadow="never">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="banner-title">网络协议探险家</h1>
          <p class="banner-subtitle">深入理解网络协议，可视化学习OSI/TCP-IP模型</p>
          <div class="banner-features">
            <el-tag type="primary" size="large">协议模拟</el-tag>
            <el-tag type="success" size="large">PCAP分析</el-tag>
            <el-tag type="warning" size="large">可视化学习</el-tag>
          </div>
        </div>
        <div class="banner-image">
          <el-icon class="network-icon" size="120">
            <Connection />
          </el-icon>
        </div>
      </div>
    </el-card>

    <!-- 功能卡片 -->
    <div class="feature-cards">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :md="12" :lg="12">
          <el-card class="feature-card" shadow="hover" @click="goToProtocol">
            <div class="card-header">
              <el-icon class="card-icon" size="48">
                <Share />
              </el-icon>
              <h3>OSI/TCP-IP 协议模拟器</h3>
            </div>
            <div class="card-content">
              <p>可视化展示数据在网络协议栈中的封装和解封装过程</p>
              <ul class="feature-list">
                <li>支持OSI七层模型和TCP/IP四层模型</li>
                <li>多种应用场景模拟</li>
                <li>动态演示封装过程</li>
                <li>详细的协议头部信息</li>
              </ul>
            </div>
            <div class="card-footer">
              <el-button type="primary" size="large">
                开始模拟
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="12" :lg="12">
          <el-card class="feature-card" shadow="hover" @click="goToPcap">
            <div class="card-header">
              <el-icon class="card-icon" size="48">
                <Document />
              </el-icon>
              <h3>PCAP 文件分析工具</h3>
            </div>
            <div class="card-content">
              <p>上传和分析网络抓包文件，深入了解网络流量</p>
              <ul class="feature-list">
                <li>支持.pcap和.pcapng格式</li>
                <li>数据包列表和详情查看</li>
                <li>协议统计和分析</li>
                <li>搜索和过滤功能</li>
              </ul>
            </div>
            <div class="card-footer">
              <el-button type="success" size="large">
                分析文件
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 技术特性 -->
    <el-card class="tech-features" shadow="never">
      <h2 class="section-title">技术特性</h2>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="tech-item">
            <el-icon class="tech-icon" size="32">
              <Monitor />
            </el-icon>
            <h4>可视化界面</h4>
            <p>直观的图形界面，让复杂的网络协议变得易于理解</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="tech-item">
            <el-icon class="tech-icon" size="32">
              <Lightning />
            </el-icon>
            <h4>实时模拟</h4>
            <p>动态演示数据包在协议栈中的处理过程</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" :md="8" :lg="8">
          <div class="tech-item">
            <el-icon class="tech-icon" size="32">
              <DataAnalysis />
            </el-icon>
            <h4>深度分析</h4>
            <p>详细的协议分析和统计信息</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 快速开始 -->
    <el-card class="quick-start" shadow="never">
      <h2 class="section-title">快速开始</h2>
      <el-steps :active="0" align-center>
        <el-step title="选择功能" description="选择协议模拟或PCAP分析" />
        <el-step title="配置参数" description="设置模拟场景或上传文件" />
        <el-step title="查看结果" description="分析结果和可视化展示" />
      </el-steps>
      <div class="start-buttons">
        <el-button type="primary" size="large" @click="goToProtocol">
          <el-icon><Share /></el-icon>
          协议模拟
        </el-button>
        <el-button type="success" size="large" @click="goToPcap">
          <el-icon><Document /></el-icon>
          PCAP分析
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToProtocol = () => {
  router.push('/protocol')
}

const goToPcap = () => {
  router.push('/pcap')
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-banner {
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 20px;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.banner-subtitle {
  font-size: 1.2rem;
  margin-bottom: 24px;
  opacity: 0.9;
}

.banner-features {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.banner-image {
  flex-shrink: 0;
  margin-left: 40px;
}

.network-icon {
  color: rgba(255, 255, 255, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.feature-cards {
  margin-bottom: 40px;
}

.feature-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--el-color-primary);
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-icon {
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-content {
  margin-bottom: 24px;
}

.card-content p {
  font-size: 1rem;
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 4px 0;
  color: var(--el-text-color-regular);
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--el-color-success);
  font-weight: bold;
}

.card-footer {
  text-align: center;
}

.tech-features,
.quick-start {
  margin-bottom: 30px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 30px;
  color: var(--el-text-color-primary);
}

.tech-item {
  text-align: center;
  padding: 20px;
}

.tech-icon {
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.tech-item h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.tech-item p {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

.start-buttons {
  text-align: center;
  margin-top: 30px;
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .banner-image {
    margin-left: 0;
    margin-top: 20px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .start-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
