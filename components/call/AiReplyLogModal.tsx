
// AI 回复日志弹窗，用于在通话详情中回看单轮回复的输入、理解、流程、知识工具、Prompt、模型输出和播报信息。
import React, { useMemo, useState } from 'react';
import { Copy, X } from 'lucide-react';

export interface AiReplyLogData {
  callId: string;
  turnName: string;
  time: string;
  userInput: string;
  assistantOutput: string;
  modelName: string;
  triggerType: string;
  topicName: string;
  flowName: string;
  stepName: string;
  firstResponseMs: string;
  totalMs: string;
}

interface AiReplyLogModalProps {
  log: AiReplyLogData | null;
  onClose: () => void;
}

const tabs = ['概览', '输入', '理解', '流程', '知识/工具', 'Prompt', '模型输出', '播报'] as const;
type LogTab = typeof tabs[number];

// 按当前轮次生成演示日志数据，后续可替换为真实接口返回。
const buildLogSections = (log: AiReplyLogData) => ({
  概览: [
    ['会话ID', log.callId], ['轮次', log.turnName], ['触发时间', log.time], ['触发类型', log.triggerType],
    ['模型', log.modelName], ['当前主题', log.topicName], ['当前流程', log.flowName], ['当前步骤', log.stepName],
    ['首响耗时', log.firstResponseMs], ['总耗时', log.totalMs],
  ],
  输入: [['用户原始文本', log.userInput], ['是否打断', '否'], ['本轮时间', log.time]],
  理解: [['识别主题', `${log.topicName} / 0.91`], ['实体抽取', '服务意图、业务关键词'], ['变量变化', '客户意图已更新']],
  流程: [['当前流程', log.flowName], ['当前步骤', log.stepName], ['命中边条件', '用户问题可由当前步骤回答']],
  '知识/工具': [['知识检索', '已检索业务知识库'], ['命中文档', '服务说明 / 售后规则'], ['工具调用', '本轮无异常']],
  Prompt: [['Prompt 组成', '系统规则 + 机器人主提示词 + 变量事实 + 知识召回 + 用户输入'], ['是否截断', '否']],
  模型输出: [['输出文本', log.assistantOutput], ['finishReason', 'stop'], ['token', '输入 1120 / 输出 28']],
  播报: [['播报文本', log.assistantOutput], ['音色', '默认音色'], ['TTS 首包', '180ms'], ['是否播报', '是']],
});

export default function AiReplyLogModal({ log, onClose }: AiReplyLogModalProps) {
  const [activeTab, setActiveTab] = useState<LogTab>('概览');
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const sections = useMemo(() => log ? buildLogSections(log) : null, [log]);

  if (!log || !sections) return null;

  // 复制当前日志 JSON，便于排查问题时粘贴给研发或模型工程师。
  const handleCopy = async () => {
    await navigator.clipboard?.writeText(JSON.stringify({ ...log, tab: activeTab, data: sections[activeTab] }, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-5xl max-h-[88vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI回复日志｜{log.turnName}</h3>
            <p className="text-xs text-slate-500 mt-1">{log.triggerType}｜{log.modelName}｜success</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-1"><Copy size={14} />复制日志</button>
            <button onClick={() => setShowJson(prev => !prev)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">查看原始JSON</button>
            {copied && <span className="text-xs text-emerald-600">已复制</span>}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
          </div>
        </div>
        <div className="px-4 py-2 border-b border-slate-100 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setShowJson(false); }} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${activeTab === tab ? 'bg-blue-50 text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>{tab}</button>
          ))}
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
            {sections[activeTab].map(([label, value]) => (
              <React.Fragment key={label}>
                <div className="text-slate-500">{label}</div>
                <div className="text-slate-800 break-words">{value}</div>
              </React.Fragment>
            ))}
          </div>
          {activeTab === 'Prompt' && (
            <div className="bg-slate-900 text-blue-50 rounded-xl p-4 text-xs leading-6 whitespace-pre-wrap">
{`system:\n你是企业电话语音机器人，只能根据配置、知识库和工具返回结果回答。\n\n用户输入：${log.userInput}\n当前流程：${log.flowName} / ${log.stepName}\n输出要求：回答简短、自然，适合电话播报。`}
            </div>
          )}
          {showJson && (
            <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 text-xs overflow-auto">{JSON.stringify({ ...log, tab: activeTab, data: sections[activeTab] }, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
