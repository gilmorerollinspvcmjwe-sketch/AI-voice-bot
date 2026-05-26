// 监控报表入口，组织实时监控、经营报表、流程分析、工具转人工和通话明细。
import React, { useMemo, useState } from 'react';
import { BarChart3, Bot, Calendar, ChevronDown, Download, ListChecks, Phone, Radio, Wrench } from 'lucide-react';
import { AlertEvent, TimeRange } from '../../types';
import { getReportData, MOCK_BOTS } from './mockData';
import { cx } from './reportUi';
import RealtimeReportTab from './RealtimeReportTab';
import BusinessReportTab from './BusinessReportTab';
import FlowAnalysisTab from './FlowAnalysisTab';
import ToolTransferTab from './ToolTransferTab';
import CallDetailsTab from './CallDetailsTab';
import AlertCenterPanel from './AlertCenterPanel';
import SubscriptionPanel from './SubscriptionPanel';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'this_week', label: '本周' },
  { value: 'last_week', label: '上周' },
  { value: 'this_month', label: '本月' },
  { value: 'last_month', label: '上月' },
];

const TAB_OPTIONS = [
  { id: 'realtime', label: '实时监控', icon: Radio },
  { id: 'business', label: '经营报表', icon: BarChart3 },
  { id: 'flow', label: '流程分析', icon: ListChecks },
  { id: 'toolTransfer', label: '工具与转人工', icon: Wrench },
  { id: 'calls', label: '通话明细', icon: Phone },
];

const BUSINESS_LINE_OPTIONS = ['全部业务线', '售后服务', '营销外呼', '投诉处理'];
const CALL_DIRECTION_OPTIONS = ['全部呼叫', '呼入', '外呼'];

export default function MonitoringReport() {
  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');
  const [activeTab, setActiveTab] = useState('realtime');
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [showBotDropdown, setShowBotDropdown] = useState(false);
  const [businessLine, setBusinessLine] = useState(BUSINESS_LINE_OPTIONS[0]);
  const [callDirection, setCallDirection] = useState(CALL_DIRECTION_OPTIONS[0]);

  const reportData = useMemo(() => getReportData(timeRange), [timeRange]);

  // 演示版导出先给出明确反馈，后续可替换真实下载。
  const handleExport = () => {
    alert(`正在导出${TAB_OPTIONS.find(tab => tab.id === activeTab)?.label || '当前'}报表，格式支持 Excel / CSV。`);
  };

  // 演示版告警处理先给出明确反馈。
  const handleAcknowledgeAlert = (alertItem: AlertEvent) => {
    alert(`已确认告警：${alertItem.type}`);
  };

  const renderFilters = () => (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
        <Calendar size={16} className="ml-2 text-slate-400" />
        {TIME_RANGE_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={cx('rounded-md px-3 py-1.5 text-sm font-medium transition-all', timeRange === option.value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50')}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <button onClick={() => setShowBotDropdown(!showBotDropdown)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Bot size={16} /> 机器人 <ChevronDown size={14} />
        </button>
        {showBotDropdown && (
          <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            {MOCK_BOTS.map(bot => (
              <label key={bot.id} className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-slate-50">
                <input type="checkbox" className="mr-2" checked={selectedBots.includes(bot.id)} onChange={() => setSelectedBots(prev => (prev.includes(bot.id) ? prev.filter(id => id !== bot.id) : [...prev, bot.id]))} />
                {bot.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <select value={businessLine} onChange={e => setBusinessLine(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700">
        {BUSINESS_LINE_OPTIONS.map(option => <option key={option}>{option}</option>)}
      </select>
      <select value={callDirection} onChange={e => setCallDirection(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-slate-700">
        {CALL_DIRECTION_OPTIONS.map(option => <option key={option}>{option}</option>)}
      </select>
      <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Download size={16} /> 导出
      </button>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'realtime') {
      return <RealtimeReportTab data={reportData.realtimeMonitor} onViewCallDetail={() => setActiveTab('calls')} />;
    }
    if (activeTab === 'business') {
      return <div className="space-y-6"><BusinessReportTab data={reportData.businessResults} onOpenFlow={() => setActiveTab('flow')} /><AlertCenterPanel alerts={reportData.alertEvents} onAcknowledge={handleAcknowledgeAlert} /><SubscriptionPanel subscriptions={reportData.subscriptions} onCreate={handleExport} /></div>;
    }
    if (activeTab === 'flow') {
      return <FlowAnalysisTab report={reportData.flowFunnels[0]} />;
    }
    if (activeTab === 'toolTransfer') {
      return <ToolTransferTab tools={reportData.toolCalls} transferReport={reportData.transferReport} />;
    }
    if (activeTab === 'calls') {
      return <CallDetailsTab calls={reportData.callDetails} />;
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">监控报表</h1><p className="mt-1 text-sm text-slate-500">覆盖实时运行、异常告警、业务结果、流程漏斗、工具转人工和通话钻取。</p></div>
        {renderFilters()}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
        {TAB_OPTIONS.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cx('flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all', activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900')}><Icon size={16} />{tab.label}</button>;
        })}
      </div>

      {renderTabContent()}
    </div>
  );
}
