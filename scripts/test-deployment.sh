#!/bin/bash

echo "🧪 开始部署测试..."

# 检查前端构建产物
if [ -d "client/dist" ]; then
    echo "✅ 前端构建产物存在"
    echo "📁 构建文件数量: $(find client/dist -type f | wc -l)"
    echo "📦 构建产物大小: $(du -sh client/dist | cut -f1)"
else
    echo "❌ 前端构建产物不存在，请先运行 pnpm run build:frontend"
    exit 1
fi

# 检查环境变量文件
if [ -f "client/.env.production" ]; then
    echo "✅ 生产环境变量文件存在"
    echo "🔧 环境变量内容:"
    cat client/.env.production
else
    echo "❌ 生产环境变量文件不存在"
fi

# 检查部署配置文件
if [ -f "client/public/_headers" ]; then
    echo "✅ Cloudflare Pages _headers 文件存在"
fi

if [ -f "client/public/_redirects" ]; then
    echo "✅ Cloudflare Pages _redirects 文件存在"
fi

if [ -f "render.yaml" ]; then
    echo "✅ Render 部署配置文件存在"
fi

# 检查后端依赖
cd server
echo "🔍 检查后端依赖..."
if npm list cors > /dev/null 2>&1; then
    echo "✅ CORS 依赖已安装"
else
    echo "❌ CORS 依赖未安装"
fi

echo ""
echo "🚀 部署准备检查完成！"
echo ""
echo "📋 下一步部署指南:"
echo "1. 将代码推送到 GitHub 仓库"
echo "2. 在 Render 控制台部署后端 (https://dashboard.render.com/)"
echo "3. 在 Cloudflare Pages 控制台部署前端 (https://dash.cloudflare.com/)"
echo "4. 使用 test/cors-test.html 测试跨域配置"
echo ""
echo "🌐 预期部署地址:"
echo "前端: https://network-protocol-explorer.pages.dev/"
echo "后端: https://network-protocol-explorer.onrender.com/"
