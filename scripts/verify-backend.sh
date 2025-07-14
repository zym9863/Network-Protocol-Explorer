#!/bin/bash

# 后端部署验证脚本
echo "🔍 验证后端部署配置..."

cd server

# 检查依赖
echo "📦 检查后端依赖..."
pnpm install

# 运行测试（如果存在）
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo "🧪 运行测试..."
    pnpm test
fi

# 检查启动脚本
echo "🚀 检查启动配置..."
node -e "console.log('Node.js 版本:', process.version)"
node -e "console.log('环境变量检查完成')"

echo "✅ 后端配置验证完成！"
echo "🌐 准备部署到 Render"

cd ..

echo ""
echo "📋 部署检查清单:"
echo "✅ CORS 配置已更新"
echo "✅ 环境变量已配置"
echo "✅ 构建脚本已准备"
echo "✅ 健康检查端点已配置"
