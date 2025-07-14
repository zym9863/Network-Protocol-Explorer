<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref('/')

const handleSelect = (key: string) => {
  activeIndex.value = key
  router.push(key)
}
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo-section">
            <el-icon class="logo-icon" size="32">
              <Connection />
            </el-icon>
            <h1 class="title">网络协议探险家</h1>
          </div>

          <el-menu
            :default-active="activeIndex"
            class="nav-menu"
            mode="horizontal"
            @select="handleSelect"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/protocol">
              <el-icon><Share /></el-icon>
              <span>协议模拟器</span>
            </el-menu-item>
            <el-menu-item index="/pcap">
              <el-icon><Document /></el-icon>
              <span>PCAP分析</span>
            </el-menu-item>
            <el-menu-item index="/about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>

      <!-- 底部 -->
      <el-footer class="footer">
        <div class="footer-content">
          <p>&copy; 2024 网络协议探险家. 基于 Express + Vue 构建</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.header {
  background: var(--gradient-primary);
  color: white;
  padding: 0;
  height: 70px !important;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  bottom: -50%;
  left: -50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  color: white;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
  animation: pulse 2s infinite;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  letter-spacing: 0.5px;
}

.nav-menu {
  background: transparent !important;
  border: none !important;
  position: relative;
  z-index: 1;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 3px solid transparent !important;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.nav-menu .el-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transition: left var(--transition-normal);
}

.nav-menu .el-menu-item:hover::before {
  left: 0;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  color: white !important;
  border-bottom-color: white !important;
  background: transparent !important;
}

.main-content {
  min-height: calc(100vh - 130px);
  padding: 20px;
  background: var(--bg-secondary);
  position: relative;
}

.main-content::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: var(--text-muted);
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
}

.footer-content {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }

  .nav-menu {
    margin-top: 10px;
  }

  .title {
    font-size: 20px;
  }
}
</style>
