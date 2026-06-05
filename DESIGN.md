# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-06-04
- Primary product surfaces: AI 语音机器人后台、流程配置、工具配置、通话记录、综合运营报表。
- Evidence reviewed: `App.tsx`、`components/report/MonitoringReport.tsx`、`components/report/CallAnalysisTab.tsx`、`components/report/TopicFlowAnalysis.tsx`、`components/report/ToolTransferTab.tsx`、`components/report/reportUi.tsx`、`docs/监控报表最终呈现方案.md`、`README.md`、`ARCHITECTURE.md`。

## Brand
- Personality: 专业、清晰、可信，偏企业后台，不做娱乐化视觉。
- Trust signals: 指标口径清楚、筛选条件可见、数据状态明确、表格可排序和分页。
- Avoid: 炫技动画、过多颜色、把实时监控和历史报表混在一起、把 Topic 和 Flow 统计混在一起。

## Product goals
- Goals: 让业务人员能快速看到通话量、需求主题、流程表现、工具稳定性和实体质量。
- Non-goals: 不在报表页承载通话明细、实时排队、坐席空闲、告警订阅等独立模块。
- Success signals: 用户能看懂当前筛选口径，能对列表排序、搜索、分页，并能从无数据或加载中状态恢复。

## Personas and jobs
- Primary personas: 客服运营、业务负责人、机器人配置人员。
- User jobs: 看业务量变化、发现重复呼入和短通话、定位高频 Topic、查看 Flow 执行表现、发现工具和实体问题。
- Key contexts of use: 每日运营复盘、机器人调优前排查、业务周报/月报演示。

## Information architecture
- Primary navigation: 左侧菜单进入“监控报表”，页面内部不再使用多个 Tab。
- Core routes/screens: 综合运营报表单页，纵向分为通话统计、业务与流程分析、工具调用。
- Content hierarchy: 顶部筛选 → 核心指标卡 → 图表 → 可操作表格 → 展开明细。

## Design principles
- Principle 1: 报表先说明“当前看的是哪批数据”，再展示指标。
- Principle 2: Topic 表达“用户在聊什么”，Flow 表达“流程怎么跑”，二者分表展示。
- Tradeoffs: Demo 保留模拟加载、刷新和导出反馈，不接真实接口；但交互形态要接近真实产品。

## Visual language
- Color: 蓝色作为主色，绿色表示良好，橙色表示关注，红色表示风险。
- Typography: 标题粗体、指标数字加粗放大、辅助说明控制在一行短句。
- Spacing/layout rhythm: 卡片和表格使用 16-24px 间距，区块之间留出明显纵向呼吸。
- Shape/radius/elevation: 卡片使用圆角和轻阴影，避免重边框。
- Motion: 只保留 hover、刷新旋转、加载骨架等低干扰反馈。
- Imagery/iconography: 使用 lucide-react 图标，图标只辅助识别，不替代文字。

## Components
- Existing components to reuse: `StatCard`、`StatusBadge`、`SortableHeader`、`ReportTablePagination`、`EmptyTableState`、`LoadingBlock`。
- New/changed components: 报表列表工具栏、当前筛选口径条、搜索输入、每页条数选择。
- Variants and states: 默认、加载、无数据、无搜索结果、排序激活、分页禁用、刷新中。
- Token/component ownership: 报表共享展示组件集中在 `components/report/reportUi.tsx`。

## Accessibility
- Target standard: Demo 层面保证键盘可点击、按钮有文字、表头排序有 `aria-label`。
- Keyboard/focus behavior: 筛选按钮、刷新、导出、分页和排序都使用原生 button/select/input。
- Contrast/readability: 关键文字使用 slate-800/900，弱说明使用 slate-400/500。
- Screen-reader semantics: 表格保留原生 table/th/td 结构。
- Reduced motion and sensory considerations: 不使用大面积动画，加载只做轻量骨架。

## Responsive behavior
- Supported breakpoints/devices: 主要面向桌面后台，同时支持窄屏横向滚动表格。
- Layout adaptations: 顶部筛选自动换行；指标卡在窄屏两列、宽屏四列；宽表格使用横向滚动。
- Touch/hover differences: 可点击元素有 hover，触摸设备依赖原生点击反馈。

## Interaction states
- Loading: 筛选或刷新后展示“正在加载报表数据”和骨架。
- Empty: 列表无数据时展示空状态说明。
- Error: 当前 Demo 无真实接口，暂不展示接口错误；接后端后应补“重试”。
- Success: 刷新完成后更新当前报表数据。
- Disabled: 分页到首页/末页时禁用上一页/下一页。
- Offline/slow network: 当前 Demo 不接网络；真实接口接入后应保留加载骨架。

## Content voice
- Tone: 简洁、业务化、少术语。
- Terminology: “通话统计”“Topic 主题分析”“Flow 流程分析”“工具调用”保持固定。
- Microcopy rules: 不写无法解释的数据口径；演示反馈要说明“当前筛选条件”。

## Implementation constraints
- Framework/styling system: React 19 + TypeScript + Tailwind CSS。
- Design-token constraints: 沿用现有 `primary`、slate、blue/green/amber/red 色系。
- Performance constraints: 不引入新依赖；列表用前端分页模拟真实报表体验。
- Compatibility constraints: 保持 Vite 构建通过，不引入路由或 UI 组件库。
- Test/screenshot expectations: 静态测试覆盖报表入口、禁用项、加载、分页、排序、空态关键字；构建作为主要验证。

## Open questions
- [ ] 接入真实后端后是否需要“接口错误重试”和“导出任务队列”状态 / owner: 后端接口设计 / impact: 中
- [ ] 是否需要保存用户上次选择的筛选条件 / owner: 产品 / impact: 低
