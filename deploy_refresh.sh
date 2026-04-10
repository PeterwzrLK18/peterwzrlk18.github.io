#!/bin/bash

# 1. 确认当前所在分支（默认 main，可根据需要修改）
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "🚀 开始强制刷新 GitHub Pages 资源..."

# 2. 清除 Git 远程跟踪的缓存（不会删除本地物理文件）
echo "🧹 正在清理 Git 索引..."
git rm -r --cached . > /dev/null

# 3. 重新添加所有文件
echo "📝 重新建立文件索引..."
git add .

# 4. 提交更改
# 使用时间戳确保每次 Commit Message 都不一样
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "💾 提交更改..."
git commit -m "Manual Cache Flush: $TIMESTAMP"

# 5. 强制推送到远程
echo "⬆️ 正在强制推送到远程 $BRANCH 分支..."
git push origin $BRANCH --force

echo "✅ 完成！请等待 1-2 分钟让 GitHub Pages 重新构建。"
echo "💡 提示：如果浏览器仍看到旧图，请使用 Ctrl+F5 强刷页面。"