// 经营报表页签，展示业务完成率、失败量和业务维度明细。
import React from 'react';
import { AlertTriangle, CheckCircle, Phone, TrendingUp } from 'lucide-react';
import { BusinessResultReport } from '../../types';
import { formatDuration, formatRate, StatCard, StatusBadge } from './reportUi';

interface BusinessReportTabProps {
  data: BusinessResultReport[];
  onOpenFlow: () => void;
}

export default function BusinessReportTab({ data, onOpenFlow }: BusinessReportTabProps) {
  const totalCompleted = data.reduce((sum, item) => sum + item.completedCount, 0);
  const totalTriggered = data.reduce((sum, item) => sum + item.triggerCount, 0);
  const totalFailed = data.reduce((sum, item) => sum + item.failedCount, 0);
  const totalAbandoned = data.reduce((sum, item) => sum + item.abandonedCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="业务完成量" value={totalCompleted} desc="流程完成、工具成功或人工标记完成" tone="green" icon={<CheckCircle size={22} />} />
        <StatCard title="业务完成率" value={formatRate(totalCompleted / totalTriggered)} desc="按触发次数计算" tone="blue" icon={<TrendingUp size={22} />} />
        <StatCard title="失败量" value={totalFailed} desc="未完成闭环的业务" tone="red" icon={<AlertTriangle size={22} />} />
        <StatCard title="客户主动放弃量" value={totalAbandoned} desc="通话中途挂断或排队放弃" tone="amber" icon={<Phone size={22} />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5"><h3 className="text-base font-bold text-slate-800">业务结果报表</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">业务名称</th><th className="px-5 py-3">触发次数</th><th className="px-5 py-3">完成次数</th><th className="px-5 py-3">完成率</th><th className="px-5 py-3">转人工次数</th><th className="px-5 py-3">转人工率</th><th className="px-5 py-3">平均处理时长</th><th className="px-5 py-3">失败原因 TOP1</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(item => (
                <tr key={item.id}>
                  <td className="px-5 py-3"><button className="font-bold text-primary" onClick={onOpenFlow}>{item.businessName}</button><p className="text-xs text-slate-400">关联流程：{item.relatedFlowName}</p></td>
                  <td className="px-5 py-3">{item.triggerCount}</td><td className="px-5 py-3">{item.completedCount}</td><td className="px-5 py-3"><StatusBadge tone={item.completionRate > 0.8 ? 'green' : 'amber'}>{formatRate(item.completionRate)}</StatusBadge></td><td className="px-5 py-3">{item.transferCount}</td><td className="px-5 py-3">{formatRate(item.transferRate)}</td><td className="px-5 py-3">{formatDuration(item.avgHandleTime)}</td><td className="px-5 py-3">{item.topFailureReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
