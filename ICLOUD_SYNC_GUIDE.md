# 跨设备开发同步指南

## 🎯 核心原理

您的"小红衣"项目文件夹存储在 **iCloud** 中，这意味着：
- ✅ 项目文件夹内的所有文件会自动跨设备同步
- ✅ 只要在不同设备上登录同一个 Apple ID，就能访问最新版本
- ✅ 包括：代码、配置、上下文、文档

## 📁 关键同步文件

```
小红衣/
├── .claude/
│   └── settings.local.json          ✅ Claude Code 权限配置
├── .claude-context/
│   └── session-summary.json         ✅ 会话摘要（快速恢复）
├── CLAUDE.md                         ✅ 技术文档和开发历史
├── DEVELOPMENT_LOG.md                ✅ 详细开发日志
└── [所有源代码文件]                   ✅ 自动同步
```

## 🔄 跨设备开发流程

### 从设备 A 切换到设备 B

**步骤 1**: 确保设备 A 的工作已保存
```bash
# 在设备 A 上
git add .
git commit -m "更新进度"
git push  # 如果使用 Git 远程仓库
```

**步骤 2**: 等待 iCloud 同步完成
- 查看 iCloud 同步状态
- 确保所有文件都是最新版本

**步骤 3**: 在设备 B 上打开项目
```bash
cd ~/Desktop/小红衣  # 或您的 iCloud 路径
```

**步骤 4**: 启动 Claude Code 并恢复上下文
```
请先读取 .claude-context/session-summary.json 恢复上下文
```

**步骤 5**: 继续开发！

## 💡 实用技巧

### 每次会话结束时
完成重要功能后，我会自动更新：
1. ✅ `.claude-context/session-summary.json` - 会话摘要
2. ✅ `DEVELOPMENT_LOG.md` - 开发日志
3. ✅ `CLAUDE.md` - 开发历史（如需要）

### 每次会话开始时
只需说：
```
请恢复项目上下文
```

我会自动：
1. 读取 `session-summary.json`
2. 查看 `DEVELOPMENT_LOG.md` 最新记录
3. 了解当前开发状态
4. 准备继续工作

## ⚠️ 注意事项

### iCloud 同步延迟
- 文件可能需要几秒到几分钟才能同步
- 如果发现文件不是最新，请检查 iCloud 同步状态
- 重要工作记得用 Git 提交到远程仓库

### 冲突处理
如果在不同设备上同时修改同一文件：
1. iCloud 会创建冲突副本
2. 保留最新版本
3. 必要时手动合并

### 仅限项目文件夹
- ✅ 项目文件夹内的文件会同步
- ❌ `~/.claude/` 不会同步（全局配置）
- ❌ `~/.claude/history.jsonl` 不会同步（对话历史）

## 🎉 总结

**一句话**：所有重要的上下文信息都保存在项目文件夹内，通过 iCloud 自动同步，让您在任何设备上都能无缝继续开发！

**快速命令**：
```bash
# 在新设备上开始工作
cd ~/Desktop/小红衣
# 打开 Claude Code，说："请恢复项目上下文"
```
