<template>
  <div class="about">
    <el-page-header @back="$router.push('/')" content="关于网络协议探险家" />
    
    <div class="about-content">
      <!-- 项目介绍 -->
      <el-card class="intro-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon" size="24">
              <InfoFilled />
            </el-icon>
            <span>项目介绍</span>
          </div>
        </template>
        
        <div class="intro-content">
          <p class="intro-text">
            网络协议探险家是一个基于现代Web技术构建的网络协议学习和分析工具。
            它旨在帮助学生、网络工程师和开发者更好地理解网络协议的工作原理，
            通过可视化的方式展示数据在网络协议栈中的传输过程。
          </p>
          
          <div class="features-grid">
            <div class="feature-item">
              <el-icon class="feature-icon" size="32">
                <Share />
              </el-icon>
              <h4>协议模拟</h4>
              <p>支持OSI七层模型和TCP/IP四层模型的可视化模拟</p>
            </div>
            
            <div class="feature-item">
              <el-icon class="feature-icon" size="32">
                <Document />
              </el-icon>
              <h4>PCAP分析</h4>
              <p>强大的网络抓包文件分析和可视化功能</p>
            </div>
            
            <div class="feature-item">
              <el-icon class="feature-icon" size="32">
                <Monitor />
              </el-icon>
              <h4>实时演示</h4>
              <p>动态展示数据封装和解封装的完整过程</p>
            </div>
            
            <div class="feature-item">
              <el-icon class="feature-icon" size="32">
                <DataAnalysis />
              </el-icon>
              <h4>深度分析</h4>
              <p>详细的协议头部信息和统计数据展示</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 技术栈 -->
      <el-card class="tech-stack" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon" size="24">
              <Setting />
            </el-icon>
            <span>技术栈</span>
          </div>
        </template>
        
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <div class="tech-category">
              <h4>前端技术</h4>
              <div class="tech-items">
                <el-tag class="tech-tag" type="primary">Vue 3</el-tag>
                <el-tag class="tech-tag" type="primary">TypeScript</el-tag>
                <el-tag class="tech-tag" type="primary">Vite</el-tag>
                <el-tag class="tech-tag" type="primary">Element Plus</el-tag>
                <el-tag class="tech-tag" type="primary">Pinia</el-tag>
                <el-tag class="tech-tag" type="primary">Vue Router</el-tag>
                <el-tag class="tech-tag" type="primary">Axios</el-tag>
                <el-tag class="tech-tag" type="primary">ECharts</el-tag>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="12" :lg="12">
            <div class="tech-category">
              <h4>后端技术</h4>
              <div class="tech-items">
                <el-tag class="tech-tag" type="success">Node.js</el-tag>
                <el-tag class="tech-tag" type="success">Express.js</el-tag>
                <el-tag class="tech-tag" type="success">Multer</el-tag>
                <el-tag class="tech-tag" type="success">Joi</el-tag>
                <el-tag class="tech-tag" type="success">CORS</el-tag>
                <el-tag class="tech-tag" type="success">Helmet</el-tag>
                <el-tag class="tech-tag" type="success">Morgan</el-tag>
                <el-tag class="tech-tag" type="success">UUID</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 功能特性 -->
      <el-card class="features-detail" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon" size="24">
              <Star />
            </el-icon>
            <span>功能特性</span>
          </div>
        </template>
        
        <el-collapse>
          <el-collapse-item title="OSI/TCP-IP 协议模拟器" name="1">
            <ul class="feature-list">
              <li>支持OSI七层模型和TCP/IP四层模型切换</li>
              <li>多种应用场景模拟（Web浏览、邮件发送、文件传输、DNS查询）</li>
              <li>可视化展示数据封装和解封装过程</li>
              <li>详细的协议头部信息展示</li>
              <li>动画演示功能，支持步进控制</li>
              <li>实时显示数据大小变化和开销统计</li>
            </ul>
          </el-collapse-item>
          
          <el-collapse-item title="PCAP 文件分析工具" name="2">
            <ul class="feature-list">
              <li>支持 .pcap、.pcapng、.cap 格式文件</li>
              <li>文件大小限制 100MB，支持拖拽上传</li>
              <li>数据包列表展示，支持分页浏览</li>
              <li>多维度搜索和过滤功能</li>
              <li>详细的数据包信息查看</li>
              <li>协议分布统计和可视化</li>
              <li>十六进制数据查看器</li>
              <li>协议层级结构展示</li>
            </ul>
          </el-collapse-item>
          
          <el-collapse-item title="用户体验优化" name="3">
            <ul class="feature-list">
              <li>响应式设计，支持移动端访问</li>
              <li>深色模式支持</li>
              <li>国际化界面（中文）</li>
              <li>实时加载状态提示</li>
              <li>错误处理和用户友好的提示信息</li>
              <li>键盘快捷键支持</li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <!-- 使用说明 -->
      <el-card class="usage-guide" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon" size="24">
              <QuestionFilled />
            </el-icon>
            <span>使用说明</span>
          </div>
        </template>
        
        <el-steps direction="vertical" :active="4">
          <el-step title="协议模拟器使用">
            <template #description>
              <p>1. 选择协议模型（OSI或TCP/IP）</p>
              <p>2. 选择应用场景（Web浏览、邮件等）</p>
              <p>3. 选择模拟方向（封装、解封装或完整过程）</p>
              <p>4. 点击"开始模拟"查看结果</p>
              <p>5. 使用控制按钮进行步进演示</p>
            </template>
          </el-step>
          
          <el-step title="PCAP文件分析">
            <template #description>
              <p>1. 拖拽或点击上传PCAP文件</p>
              <p>2. 等待文件解析完成</p>
              <p>3. 查看文件统计信息和协议分布</p>
              <p>4. 使用搜索和过滤功能筛选数据包</p>
              <p>5. 点击数据包查看详细信息</p>
            </template>
          </el-step>
          
          <el-step title="数据包详情查看">
            <template #description>
              <p>1. 在数据包列表中点击任意行</p>
              <p>2. 查看基本信息和协议标志</p>
              <p>3. 展开协议层查看详细字段</p>
              <p>4. 查看十六进制原始数据</p>
            </template>
          </el-step>
          
          <el-step title="高级功能">
            <template #description>
              <p>1. 使用协议过滤器快速筛选</p>
              <p>2. 按IP地址搜索相关数据包</p>
              <p>3. 调整分页大小优化浏览体验</p>
              <p>4. 查看协议统计了解流量分布</p>
            </template>
          </el-step>
        </el-steps>
      </el-card>

      <!-- 版本信息 -->
      <el-card class="version-info" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon" size="24">
              <Promotion />
            </el-icon>
            <span>版本信息</span>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
          <el-descriptions-item label="发布日期">2024年7月</el-descriptions-item>
          <el-descriptions-item label="开发语言">TypeScript / JavaScript</el-descriptions-item>
          <el-descriptions-item label="许可证">MIT License</el-descriptions-item>
          <el-descriptions-item label="前端框架">Vue 3 + Element Plus</el-descriptions-item>
          <el-descriptions-item label="后端框架">Express.js</el-descriptions-item>
        </el-descriptions>
        
        <div class="contact-info">
          <h4>联系方式</h4>
          <p>如果您在使用过程中遇到问题或有改进建议，欢迎联系我们：</p>
          <div class="contact-links">
            <el-button type="primary" link>
              <el-icon><Message /></el-icon>
              发送邮件
            </el-button>
            <el-button type="success" link>
              <el-icon><ChatDotRound /></el-icon>
              在线反馈
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个页面主要是静态内容，不需要复杂的逻辑
</script>

<style scoped>
.about {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.about-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.header-icon {
  color: var(--el-color-primary);
}

.intro-content {
  line-height: 1.8;
}

.intro-text {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin-bottom: 24px;
  text-align: justify;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-item:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.feature-icon {
  color: var(--el-color-primary);
  margin-bottom: 12px;
}

.feature-item h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.feature-item p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.tech-category {
  margin-bottom: 20px;
}

.tech-category h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  margin: 2px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 6px 0;
  color: var(--el-text-color-regular);
  position: relative;
  padding-left: 20px;
  line-height: 1.6;
}

.feature-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--el-color-primary);
  font-weight: bold;
  font-size: 16px;
}

.contact-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}

.contact-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

.contact-info p {
  color: var(--el-text-color-regular);
  margin-bottom: 16px;
  line-height: 1.6;
}

.contact-links {
  display: flex;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-links {
    flex-direction: column;
    align-items: flex-start;
  }
}
/* 关于页面样式 */
</style>
