const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const checks = [
  ['Bot list has current version column', () => read('components/bot/BotListView.tsx').includes('当前版本')],
  ['Bot list has online version column', () => read('components/bot/BotListView.tsx').includes('线上版本')],
  ['Bot config has version record entry', () => read('components/bot/BotConfigForm.tsx').includes('版本记录')],
  ['Bot config publish modal has debug/online scopes', () => read('components/bot/BotConfigForm.tsx').includes('仅调试') && read('components/bot/BotConfigForm.tsx').includes('发布上线')],
  ['AI reply log modal component exists', () => exists('components/call/AiReplyLogModal.tsx')],
  ['Call detail exposes AI reply log action', () => read('components/call/CallRecordDetail.tsx').includes('查看日志') && read('components/call/CallRecordDetail.tsx').includes('AiReplyLogModal')],
  ['Customer memory manager exists', () => exists('components/memory/CustomerMemoryManager.tsx')],
  ['Sidebar has customer memory menu', () => read('components/ui/LayoutComponents.tsx').includes('客户记忆')],
  ['Sidebar has memory management submenu', () => read('components/ui/LayoutComponents.tsx').includes('记忆管理') && read('components/ui/LayoutComponents.tsx').includes('记忆配置')],
  ['App routes customer memory pages', () => read('App.tsx').includes('CustomerMemoryManager') && read('App.tsx').includes("case '记忆管理'") && read('App.tsx').includes("case '记忆配置'")],
  ['Memory config has custom field management', () => read('components/memory/CustomerMemoryManager.tsx').includes('自定义记忆字段') && read('components/memory/CustomerMemoryManager.tsx').includes('新增字段') && read('components/memory/CustomerMemoryManager.tsx').includes('字段编码')],
  ['AI reply log has complete audit fields', () => read('components/call/AiReplyLogModal.tsx').includes('ASR final 文本') && read('components/call/AiReplyLogModal.tsx').includes('变量变化') && read('components/call/AiReplyLogModal.tsx').includes('工具原始返回') && read('components/call/AiReplyLogModal.tsx').includes('Prompt 拼接明细')],
  ['AI reply log has two mock scenarios', () => read('components/call/AiReplyLogModal.tsx').includes('search_jobs') && read('components/call/AiReplyLogModal.tsx').includes('知识召回型回复')],
];

let failed = 0;
for (const [name, fn] of checks) {
  let ok = false;
  try { ok = Boolean(fn()); } catch { ok = false; }
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
if (failed > 0) process.exit(1);
