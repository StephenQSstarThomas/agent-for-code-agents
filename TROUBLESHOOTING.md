# 🔧 故障排除指南

## 常见问题及解决方案

### ❌ Next.js 配置警告
```
⚠ Invalid next.config.js options detected:
⚠ Unrecognized key(s) in object: 'appDir' at "experimental"
```

**解决方案：** 
已修复 - 移除了过时的 `experimental.appDir` 配置。Next.js 14+ 默认启用 App Router。

### ❌ React.Children.only 错误
```
Error: React.Children.only expected to receive a single React element child.
```

**解决方案：**
已修复 - 更新了 Button 和 Textarea 组件，正确处理 `asChild` 属性和多个子元素的情况。

### ❌ 依赖安全漏洞
```
4 vulnerabilities (3 moderate, 1 critical)
```

**解决方案：**
已更新所有依赖到最新安全版本：
- Next.js: 14.0.4 → 15.1.0
- ESLint: 8.x → 9.17.0 
- 所有 Radix UI 组件到最新版本
- 其他所有依赖到安全版本

### ❌ ESLint 配置问题
```
npm warn deprecated eslint@8.57.1
```

**解决方案：**
- 升级到 ESLint 9.17.0
- 创建了兼容的 `.eslintrc.json` 配置
- 更新了 `eslint-config-next` 到 15.1.0

### ❌ 过时包警告
```
npm warn deprecated inflight@1.0.6
npm warn deprecated rimraf@3.0.2
npm warn deprecated glob@7.1.7
```

**解决方案：**
这些是传递依赖警告，已通过更新主要依赖包解决。

## 🚀 重新安装步骤

如果遇到持续问题，请按以下步骤重新安装：

### Windows:
```bash
# 1. 清理旧文件
cd frontend
rmdir /s /q node_modules
del package-lock.json

# 2. 重新安装
npm install

# 3. 启动
npm run dev
```

### Mac/Linux:
```bash
# 1. 清理旧文件
cd frontend
rm -rf node_modules package-lock.json

# 2. 重新安装  
npm install

# 3. 启动
npm run dev
```

## 🔍 调试步骤

### 1. 检查端口占用
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Mac/Linux  
lsof -i :3000
lsof -i :8000
```

### 2. 检查依赖安装
```bash
npm list --depth=0
```

### 3. 查看详细错误
```bash
npm run dev -- --verbose
```

### 4. 类型检查
```bash
npm run type-check
```

## 🛠️ 环境要求

确保满足以下要求：
- **Node.js**: 18.17.0 或更高版本
- **npm**: 9.0.0 或更高版本  
- **Python**: 3.8 或更高版本

检查版本：
```bash
node --version
npm --version
python --version
```

## 📝 已修复的问题

✅ **Next.js 配置**: 移除过时的 experimental.appDir 配置
✅ **React 组件**: 修复 Button 和 Textarea 组件的 children 处理
✅ **安全漏洞**: 更新所有依赖到最新安全版本
✅ **ESLint**: 升级到 9.x 并创建兼容配置
✅ **Tailwind**: 移除过时的 tailwindcss-animate 依赖

## 🆘 仍然有问题？

1. **清理缓存**:
   ```bash
   npm cache clean --force
   ```

2. **删除 .next 文件夹**:
   ```bash
   rm -rf .next
   ```

3. **重启开发服务器**:
   ```bash
   npm run dev
   ```

4. **检查浏览器控制台**: 按 F12 查看详细错误信息

## 📞 获取帮助

如果问题仍然存在：
1. 检查 `backend.log` 后端日志
2. 检查 `frontend.log` 前端日志  
3. 查看浏览器开发者工具的 Console 和 Network 标签
4. 确认防火墙没有阻止 3000 和 8000 端口

所有修复都已应用，现在应该可以正常启动和运行 UI！