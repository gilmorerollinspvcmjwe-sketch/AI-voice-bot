import fs from 'node:fs';

const source = fs.readFileSync('components/bot/BotStrategyConfig.tsx', 'utf8');
const types = fs.readFileSync('types.ts', 'utf8');

for (const snippet of [
  '通道确认话术',
  '未听清话术',
  "config.channelCheckSpeech",
  "updateField('channelCheckSpeech'",
  "config.unclearSpeech",
  "updateField('unclearSpeech'",
]) {
  if (!source.includes(snippet)) {
    throw new Error(`BotStrategyConfig 缺少特殊话术配置：${snippet}`);
  }
}

for (const snippet of ['channelCheckSpeech?: string;', 'unclearSpeech?: string;']) {
  if (!types.includes(snippet)) {
    throw new Error(`types.ts 缺少特殊话术字段：${snippet}`);
  }
}

console.log('bot strategy special speech static check ok');
