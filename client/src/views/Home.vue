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
  padding: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.welcome-banner {
  margin-bottom: var(--spacing-2xl);
  background: var(--gradient-primary);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  border-radius: var(--radius-xl) !important;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(255,255,255,0.1), transparent);
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2xl) var(--spacing-xl);
  position: relative;
  z-index: 1;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(45deg, #fff, rgba(255,255,255,0.9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255,255,255,0.5);
  animation: fadeIn 0.8s ease-out;
}

.banner-subtitle {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-lg);
  opacity: 0.95;
  animation: fadeIn 1s ease-out 0.2s both;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.banner-features {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  animation: fadeIn 1.2s ease-out 0.4s both;
}

.banner-features .el-tag {
  border-radius: var(--radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  font-weight: 500;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.2) !important;
  border: 1px solid rgba(255,255,255,0.3);
  color: white !important;
}

.banner-image {
  flex-shrink: 0;
  margin-left: 40px;
}

.network-icon {
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.6));
  animation: pulse 2s infinite, fadeIn 1s ease-out 0.6s both;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 20px rgba(255,255,255,0.6));
  }
  50% { 
    transform: scale(1.05);
    filter: drop-shadow(0 0 30px rgba(255,255,255,0.8));
  }
}

.feature-cards {
  margin-bottom: var(--spacing-2xl);
}

.feature-card {
  height: 100%;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  background: var(--bg-card) !important;
  border-radius: var(--radius-xl) !important;
  overflow: hidden;
  position: relative;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
}

.feature-card:hover::before {
  transform: translateX(0);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-light);
}

.card-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg) 0;
  background: var(--bg-tertiary);
  margin: calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-lg);
  position: relative;
}

.card-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2));
  animation: pulse 3s infinite;
}

.card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
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
  color: var(--success-color);
  font-weight: bold;
  font-size: 16px;
}

.card-footer {
  text-align: center;
}

.tech-features,
.quick-start {
  margin-bottom: var(--spacing-2xl);
  animation: fadeIn 0.8s ease-out;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-2xl);
  color: var(--text-primary);
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
}

.tech-item {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.tech-item:hover {
  background: var(--bg-tertiary);
  transform: translateY(-4px);
}

.tech-item:hover .tech-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 6px 12px rgba(99, 102, 241, 0.3));
}

.tech-icon {
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-normal);
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
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
  margin-top: var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
}

.start-buttons .el-button {
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.start-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
