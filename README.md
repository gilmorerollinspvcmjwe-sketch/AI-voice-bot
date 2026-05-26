<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1roavSagafxEJgVSbE9FoTxOQjdVY5l6y

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 已完成功能列表

- 机器人配置、流程配置、主题管理、工具配置、坐席管理、通话记录和监控报表演示。
- 监控报表已增强为实时监控、经营报表、流程分析、工具与转人工、通话明细五个一级页签。
- 报表支持异常告警、业务完成率、流程漏斗、工具调用、转人工分析、通话钻取、订阅和导出入口。
- 客户运营能力已补充客户画像、营销活动、自动跟进及机器人级营销与跟进配置。
- 自动跟进规则已升级为规则画布，支持触发事件、条件判断、时间计算、触达保护、执行动作、重试策略和退出条件的图式查看。

## 待办事项

- 将当前前端模拟报表数据替换为真实后端接口。
- 将客户画像、营销活动和自动跟进数据接入真实后端接口。

## 搜索记录

- 本轮未新增外部搜索；监控报表增强基于现有产品方案和本地代码结构实现。
- 客户运营增强基于已确认的语音机器人场景方案和现有页面结构实施，未新增外部方案依赖。
