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
  ['App routes customer memory page', () => read('App.tsx').includes('CustomerMemoryManager') && read('App.tsx').includes("case '客户记忆'")],
];

let failed = 0;
for (const [name, fn] of checks) {
  let ok = false;
  try { ok = Boolean(fn()); } catch { ok = false; }
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
if (failed > 0) process.exit(1);
