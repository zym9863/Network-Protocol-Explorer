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
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: 70px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
}

.logo-icon {
  color: white;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.nav-menu {
  background: transparent !important;
  border: none !important;
}

.nav-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.3s;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  color: white !important;
  border-bottom-color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.main-content {
  min-height: calc(100vh - 130px);
  padding: 20px;
  background: #f5f7fa;
}

.footer {
  background: #2c3e50;
  color: white;
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: center;
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
