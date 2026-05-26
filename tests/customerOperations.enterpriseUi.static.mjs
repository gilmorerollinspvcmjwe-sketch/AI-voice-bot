import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

const followUp = read('../components/followup/FollowUpManager.tsx');
const profile = read('../components/marketing/CustomerProfileManager.tsx');
const campaign = read('../components/marketing/CampaignManager.tsx');
const botMarketing = read('../components/bot/BotMarketingConfig.tsx');

const checks = [
  [followUp, '规则编排'],
  [followUp, '规则画布'],
  [followUp, '节点配置'],
  [followUp, '触发事件'],
  [followUp, '条件判断'],
  [followUp, '时间计算'],
  [followUp, '触达保护'],
  [followUp, '执行动作'],
  [followUp, '重试策略'],
  [followUp, '退出条件'],
  [followUp, 'RuleGraphNode'],
  [profile, '客户筛选'],
  [profile, '通话时间线'],
  [profile, '标签证据链'],
  [campaign, '目标人群规则'],
  [campaign, '排除人群规则'],
  [campaign, '触发规则'],
  [campaign, '命中预估'],
  [botMarketing, '能力绑定'],
  [botMarketing, '绑定可用营销活动'],
  [botMarketing, '绑定自动跟进规则'],
  [botMarketing, '策略模板'],
];

for (const [content, expected] of checks) {
  if (!content.includes(expected)) {
    throw new Error(`Expected B端 UI implementation to include: ${expected}`);
  }
}

console.log('customer operations enterprise ui static check ok');
