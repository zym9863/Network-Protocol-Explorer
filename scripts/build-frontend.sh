#!/bin/bash

# 前端构建脚本
echo "🏗️  开始构建前端应用..."

cd client

# 安装依赖
echo "📦 安装前端依赖..."
pnpm install

# 构建生产版本
echo "🔨 构建生产版本..."
pnpm run build

echo "✅ 前端构建完成！"
echo "📁 构建产物位于: client/dist"
echo "🚀 可以部署到 Cloudflare Pages"

cd ..

echo ""
echo "🌐 部署信息:"
echo "前端: https://network-protocol-explorer.pages.dev/"
echo "后端: https://network-protocol-explorer.onrender.com/"
