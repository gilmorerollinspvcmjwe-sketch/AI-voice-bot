# 当前进度

## 当前正在做什么
- 已把三个语音 Agent 原型需求落到 React 项目：机器人版本管理、AI 回复日志弹窗、客户记忆后台。

## 上次停在哪里
- 新增 `scripts/check-voice-agent-features.cjs` 需求检查脚本，已通过。
- `npm run build` 已通过，Vite 仅提示现有 bundle 体积较大。

## 近期关键决定和原因
- 版本管理放在机器人列表和机器人配置详情页，不单独开页面，因为它是机器人配置的全局发布治理能力。
- AI 回复日志放在通话详情页的单轮 AI 回复旁，以弹窗查看链路日志。
- 客户记忆作为独立一级菜单和页面，不混入客户画像，避免画像运营和记忆配置职责混杂。

## 2026-06-24 需求补充落地
- 客户记忆已调整为独立一级菜单，二级菜单为「记忆管理」「记忆配置」。
- 「记忆配置」中补充自定义记忆字段管理，字段支持编码、名称、类型、启用、强制抽取、进入 Prompt、脱敏、有效期和抽取说明。
- AI 回复日志补齐输入、理解、流程、知识/工具、Prompt、模型、TTS 等审计字段，并增加工具调用型与知识召回型两类 mock 数据。
- 已验证：`node scripts\check-voice-agent-features.cjs` 全部 PASS；`npm run build` 通过，仅有 Vite chunk 体积提示。

## 2026-06-24 Subagent 审查修复
- 根据 code-reviewer 审查，补齐客户记忆页按钮反馈：重置筛选、开启/关闭记忆、保存草稿、发布配置、停用字段均有本地交互。
- 修复 AI 回复日志复制失败提示，Clipboard 不可用或失败时不再误报已复制。
- 修复 `Pill` 组件类型，相关改动文件在 `npx tsc --noEmit --pretty false` 输出中过滤无新增报错。
- 已验证：`node scripts\check-voice-agent-features.cjs` 全部 PASS；`npm run build` 通过，仅有 Vite chunk 体积提示。
