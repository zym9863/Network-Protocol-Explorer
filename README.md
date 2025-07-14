# 网络协议探险家 (Network Protocol Explorer)

一个基于 Express + Vue 的网络协议学习和分析工具，提供 OSI/TCP-IP 模型可视化模拟和 PCAP 文件解析功能。

## 功能特性

### 1. OSI/TCP-IP 参考模型可视化模拟器
- 🔄 动态展示数据封装和解封装过程
- 📊 可视化各层协议处理流程
- 🎯 支持多种应用场景模拟
- 📋 详细的协议头部信息展示

### 2. 网络抓包数据 (PCAP) 解析与分析工具
- 📁 支持 .pcap 和 .pcapng 文件上传
- 📊 清晰的数据包列表展示
- 🔍 详细的协议分层结构分析
- 🔎 搜索和筛选功能
- 📈 十六进制原始数据查看

## 技术栈

- **后端**: Express.js + Node.js
- **前端**: Vue 3 + Vite
- **包管理**: pnpm
- **PCAP解析**: node-pcap-parser
- **UI组件**: Element Plus

## 项目结构

```
network-protocol-explorer/
├── server/                 # Express 后端
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   └── utils/          # 工具函数
│   ├── uploads/            # 文件上传目录
│   └── package.json
├── client/                 # Vue 前端
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/          # 页面
│   │   ├── stores/         # 状态管理
│   │   └── utils/          # 工具函数
│   └── package.json
└── package.json           # 根目录配置
```

## 快速开始

### 安装依赖
```bash
# 安装所有依赖
npm run install:all
```

### 开发模式
```bash
# 同时启动前后端开发服务器
npm run dev
```

### 生产构建
```bash
# 构建前端
npm run client:build

# 启动后端服务器
npm run server:start
```

## API 接口

### OSI 模型模拟
- `POST /api/protocol/encapsulate` - 数据封装模拟
- `POST /api/protocol/decapsulate` - 数据解封装模拟
- `GET /api/protocol/layers` - 获取协议层信息

### PCAP 文件分析
- `POST /api/pcap/upload` - 上传 PCAP 文件
- `GET /api/pcap/packets/:fileId` - 获取数据包列表
- `GET /api/pcap/packet/:fileId/:packetId` - 获取数据包详情

## 开发说明

本项目采用前后端分离架构：
- 后端提供 RESTful API 服务
- 前端负责用户界面和交互
- 使用 pnpm 作为包管理器
- 支持热重载开发模式

## 许可证

MIT License
