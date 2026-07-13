# 当前进度

## 2026-07-13 RD-2547 特殊话术配置
- 对话策略新增“特殊话术”卡片，仅支持配置通道确认话术和未听清话术；模型、Prompt、阈值及回退逻辑由后端固定。

## 2026-07-10 RD-2442 Step 动作判断配置
- Flow Step 配置新增“转人工与挂机判断”区域，支持填写转人工判断提示词、选择一个目标 IVR、填写挂机判断提示词。
- 三项配置均为可选；普通主题也支持配置同一组转人工与挂机判断字段，流程主题不展示该配置。
- 已补充 Step 配置渲染测试。

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

## 2026-06-24 UI 设计规范接入
- 已按 `voice-agent-design-handoff/use.md` 读取设计规范，并将交付包核心文件复制到 `design/`：DESIGN、tokens、组件规范、原型。
- 已在 `src/index.css` 全局接入 `design/tokens/tokens.css`，并补充基础字体、页面背景、focus ring。
- 已在 `tailwind.config.js` 将 primary/sidebar/secondary、字体、圆角、阴影映射到 token；使用 RGB channel 兼容 Tailwind `/opacity` 写法。
- 已按规范升级公共壳层 `components/ui/LayoutComponents.tsx`：侧边栏、顶栏使用 token、保留菜单层级、补充 button 语义与 focus/hover。
- 已按规范升级现有基础表单组件 `components/ui/FormComponents.tsx`：Input、Select、Switch、Slider、TagInput、TextArea 使用 token 并保留原 API。
- 已验证：`node scripts\check-voice-agent-features.cjs` 全部 PASS；`npm run build` 通过，仅有 Vite chunk 体积提示；相关文件在 `tsc` 过滤输出中无新增报错。
- 未提交 git；当前工作区仍含此前未提交的长期流程/文档等改动，需要后续单独处理。

## 2026-06-24 机器人与工具页面 UI 升级
- 已按 `design/` 规范升级「机器人配置列表」：工具栏、搜索、状态筛选、表格密度、状态标签、固定操作列、空态均迁移到 token 体系。
- 已升级「机器人配置详情」外壳：页面容器、版本摘要区、Tabs、更多菜单、版本抽屉和发布弹窗使用 token 化后台组件视觉；未改变保存、发布、版本恢复等业务逻辑。
- 已升级「工具配置」：搜索、分类筛选、工具列表行、状态标签、启停/编辑/删除按钮统一企业后台风格；保留原新增工具、添加 MCP、地理工具编辑逻辑。
- 已修正 `ToolConfigPage` mock 参数缺失 `source` 的类型问题。
- 已验证：`node scripts\check-voice-agent-features.cjs` 全部 PASS；`npm run build` 通过，仅有 Vite chunk 体积提示；相关文件在 `tsc` 过滤输出中无新增报错。
- 未提交 git。
