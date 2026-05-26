import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const reportDir = join(here, '..', 'components', 'report');
const report = readdirSync(reportDir)
  .filter(file => file.endsWith('.tsx') || file === 'mockData.ts')
  .map(file => readFileSync(join(reportDir, file), 'utf8'))
  .join('\n');
const types = readFileSync(join(here, '..', 'types.ts'), 'utf8');

const requiredLabels = [
  '实时监控',
  '经营报表',
  '流程分析',
  '工具与转人工',
  '通话明细',
  '异常告警中心',
  '报表订阅',
  '当前通话中',
  '业务完成率',
  '流程漏斗',
  '直接播报次数',
  '排队挂断率',
  '流程路径',
];

for (const label of requiredLabels) {
  if (!report.includes(label)) {
    throw new Error(`Expected report module to include ${label}`);
  }
}

const requiredTypes = [
  'RealtimeMonitorData',
  'AlertEvent',
  'BusinessResultReport',
  'FlowFunnelReport',
  'ToolCallReport',
  'TransferReport',
  'CallDetail',
  'ReportSubscription',
];

for (const typeName of requiredTypes) {
  if (!types.includes(`interface ${typeName}`)) {
    throw new Error(`Expected report type ${typeName}`);
  }
  if (!report.includes(typeName)) {
    throw new Error(`Expected report module to reference ${typeName}`);
  }
}

console.log('monitoring report enhancement static check ok');
