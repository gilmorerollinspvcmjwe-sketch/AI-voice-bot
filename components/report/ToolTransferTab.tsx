// 工具与转人工页签，展示工具调用稳定性和人工承接压力。
import React from 'react';
import { CheckCircle, Headphones, Phone, Timer } from 'lucide-react';
import { ToolCallReport, TransferReport } from '../../types';
import { formatDuration, formatRate, StatCard, StatusBadge } from './reportUi';

interface ToolTransferTabProps {
  tools: ToolCallReport[];
  transferReport: TransferReport;
}

export default function ToolTransferTab({ tools, transferReport }: ToolTransferTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="转人工总量" value={transferReport.totalTransfers} tone="blue" icon={<Headphones size={22} />} />
        <StatCard title="转人工成功率" value={formatRate(transferReport.successRate)} tone="green" icon={<CheckCircle size={22} />} />
        <StatCard title="平均排队时长" value={formatDuration(transferReport.avgQueueSeconds)} tone="amber" icon={<Timer size={22} />} />
        <StatCard title="排队挂断量" value={transferReport.queueHangupCount} tone="red" icon={<Phone size={22} />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><h3 className="text-base font-bold text-slate-800">工具调用报表</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">工具名称</th><th className="px-5 py-3">类型</th><th className="px-5 py-3">调用次数</th><th className="px-5 py-3">成功率</th><th className="px-5 py-3">平均耗时</th><th className="px-5 py-3">超时次数</th><th className="px-5 py-3">直接播报次数</th><th className="px-5 py-3">调模型回复</th><th className="px-5 py-3">失败原因 TOP1</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{tools.map(tool => (<tr key={tool.toolId}><td className="px-5 py-3"><b>{tool.toolName}</b><p className="text-xs text-slate-400">关联机器人 {tool.botCount} 个</p></td><td className="px-5 py-3"><StatusBadge tone="blue">{tool.toolType}</StatusBadge></td><td className="px-5 py-3">{tool.callCount}</td><td className="px-5 py-3"><StatusBadge tone={tool.successRate > 0.9 ? 'green' : 'amber'}>{formatRate(tool.successRate)}</StatusBadge></td><td className="px-5 py-3">{tool.avgLatencyMs}ms</td><td className="px-5 py-3">{tool.timeoutCount}</td><td className="px-5 py-3">{tool.directPlayCount}<p className="text-xs text-slate-400">成功率 {formatRate(tool.directPlaySuccessRate)}</p></td><td className="px-5 py-3">{tool.modelReplyCount}<p className="text-xs text-slate-400">节省 {tool.savedModelCalls} 次</p></td><td className="px-5 py-3">{tool.topFailureReason}</td></tr>))}</tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-100 p-5"><h3 className="text-base font-bold text-slate-800">转人工分析</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">转人工原因</th><th className="px-5 py-3">次数</th><th className="px-5 py-3">占比</th><th className="px-5 py-3">成功率</th><th className="px-5 py-3">平均排队</th><th className="px-5 py-3">排队挂断率</th></tr></thead><tbody className="divide-y divide-slate-100">{transferReport.reasons.map(item => (<tr key={item.reason}><td className="px-5 py-3 font-semibold">{item.reason}<p className="text-xs text-slate-400">来源：{item.mainSourceFlow}</p></td><td className="px-5 py-3">{item.count}</td><td className="px-5 py-3">{item.percentage}%</td><td className="px-5 py-3">{formatRate(item.successRate)}</td><td className="px-5 py-3">{formatDuration(item.avgQueueSeconds)}</td><td className="px-5 py-3">{formatRate(item.queueHangupRate)}</td></tr>))}</tbody></table></div></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-base font-bold text-slate-800">排队体验指标</h3><div className="space-y-4">{transferReport.queueBands.map(item => (<div key={item.range}><div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{item.range}</span><span>{item.count}（{item.percentage}%）</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} /></div></div>))}</div><div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">转人工后解决率：{formatRate(transferReport.solvedAfterTransferRate)}</div></div>
      </div>
    </div>
  );
}
