// 这个页面管理语音通话产生的自动跟进任务，并用规则画布配置自动化跟进链路。
import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  GitBranch,
  Pause,
  PhoneCall,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { FollowUpRule, FollowUpTask, FollowUpTaskStatus } from '../../types';
import {
  FOLLOW_UP_STATUS_LABELS,
  FOLLOW_UP_TRIGGER_LABELS,
  formatDateTime,
  MOCK_FOLLOW_UP_RULES,
  MOCK_FOLLOW_UP_TASKS,
} from '../marketing/mockCustomerOperations';

const tabItems = [
  { id: 'TASKS', label: '跟进任务' },
  { id: 'RULES', label: '规则编排' },
  { id: 'REPORT', label: '跟进报表' },
] as const;

type TabId = typeof tabItems[number]['id'];
type RuleGraphNodeType = 'trigger' | 'condition' | 'time' | 'protection' | 'action' | 'retry' | 'exit';

interface RuleGraphNode {
  id: RuleGraphNodeType;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ElementType;
  tone: string;
}

const statusClass = (status: FollowUpTaskStatus) => {
  if (status === 'completed' || status === 'connected') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'pending' || status === 'running' || status === 'no_answer') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (status === 'rejected' || status === 'failed' || status === 'expired') return 'bg-red-50 text-red-600 border-red-100';
  if (status === 'transferred') return 'bg-purple-50 text-purple-700 border-purple-100';
  return 'bg-slate-50 text-slate-600 border-slate-100';
};

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ' + className}>{children}</span>
);

// 兼容只有 ID、没有名称的跟进规则数据。
const formatRuleScope = (rule: FollowUpRule) => {
  const botNames = rule.botNames && rule.botNames.length > 0 ? rule.botNames : rule.applicableBotIds;
  const flowNames = rule.flowNames && rule.flowNames.length > 0 ? rule.flowNames : rule.applicableFlowIds;
  return `${botNames.join('、') || '未指定机器人'} · ${flowNames.join('、') || '未指定 Flow'}`;
};

// 把规则配置转成可视化编排节点。
const buildRuleGraphNodes = (rule: FollowUpRule): RuleGraphNode[] => [
  {
    id: 'trigger',
    title: '触发事件',
    subtitle: rule.triggers.map(trigger => FOLLOW_UP_TRIGGER_LABELS[trigger]).join('、'),
    detail: '识别用户是否表达稍后联系、明确时间、考虑一下或通话后回访。',
    icon: GitBranch,
    tone: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    id: 'condition',
    title: '条件判断',
    subtitle: `适用机器人 ${rule.applicableBotIds.length} 个，Flow ${rule.applicableFlowIds.length} 个`,
    detail: '仅当机器人、Flow、用户表达和规则启用状态同时满足时生成任务。',
    icon: Settings2,
    tone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    id: 'time',
    title: '时间计算',
    subtitle: rule.useUserSpecifiedTime ? '优先使用用户指定时间' : `默认 ${rule.defaultDelayDays} 天后`,
    detail: `执行时间段 ${rule.preferredTimeRange}，用户未说明时按默认时间生成计划外呼。`,
    icon: CalendarClock,
    tone: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  },
  {
    id: 'protection',
    title: '触达保护',
    subtitle: `每日最多 ${rule.touchProtection.maxDailyCalls} 次，拒绝冷却 ${rule.touchProtection.rejectCooldownDays} 天`,
    detail: `夜间${rule.touchProtection.avoidNightCalls ? '禁止' : '允许'}外呼，投诉风险${rule.touchProtection.blockComplaintRisk ? '拦截' : '不拦截'}，黑名单${rule.touchProtection.blockBlacklist ? '拦截' : '不拦截'}。`,
    icon: ShieldCheck,
    tone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    id: 'action',
    title: '执行动作',
    subtitle: rule.actions.join('、'),
    detail: `到期后进入执行 Flow：${rule.executionFlowId || '未指定'}，可自动外呼、创建人工任务或回写标签。`,
    icon: PhoneCall,
    tone: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    id: 'retry',
    title: '重试策略',
    subtitle: `最多 ${rule.retryPolicy.maxRetries} 次，${rule.retryPolicy.retryIntervalHours} 小时后重试`,
    detail: `每天最多 ${rule.retryPolicy.maxDailyAttempts} 次，失败后动作：${rule.retryPolicy.failureAction}`,
    icon: RefreshCw,
    tone: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    id: 'exit',
    title: '退出条件',
    subtitle: rule.exitConditions.join('、'),
    detail: '满足任一退出条件后，任务关闭并将结果回写到画像和报表。',
    icon: CheckCircle2,
    tone: 'bg-slate-50 text-slate-600 border-slate-200',
  },
];

const buildReport = (tasks: FollowUpTask[]) => {
  const total = tasks.length;
  const executed = tasks.filter(task => task.status !== 'pending' && task.status !== 'cancelled').length;
  const connected = tasks.filter(task => task.status === 'connected' || task.status === 'completed').length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const noAnswer = tasks.filter(task => task.status === 'no_answer').length;
  const cancelled = tasks.filter(task => task.status === 'cancelled').length;
  const transferred = tasks.filter(task => task.status === 'transferred').length;
  const rate = (value: number) => total ? `${Math.round((value / total) * 100)}%` : '0%';
  return { total, executed, connected, completed, noAnswer, cancelled, transferred, rate };
};

const ruleRows = (rules: FollowUpRule[], tasks: FollowUpTask[]) => rules.map(rule => {
  const related = tasks.filter(task => task.ruleId === rule.id);
  const completed = related.filter(task => task.status === 'completed').length;
  const noAnswer = related.filter(task => task.status === 'no_answer').length;
  return {
    rule,
    generated: related.length,
    completed,
    noAnswer,
    completionRate: related.length ? `${Math.round((completed / related.length) * 100)}%` : '0%',
  };
});

export default function FollowUpManager() {
  const [activeTab, setActiveTab] = useState<TabId>('TASKS');
  const [tasks, setTasks] = useState<FollowUpTask[]>(MOCK_FOLLOW_UP_TASKS);
  const [rules] = useState<FollowUpRule[]>(MOCK_FOLLOW_UP_RULES);
  const [activeRuleId, setActiveRuleId] = useState(rules[0]?.id || '');
  const [activeNodeId, setActiveNodeId] = useState<RuleGraphNodeType>('trigger');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<FollowUpTask | null>(null);

  const filteredTasks = useMemo(() => {
    const keyword = searchTerm.trim();
    if (!keyword) return tasks;
    return tasks.filter(task =>
      task.customerName.includes(keyword) ||
      task.phoneNumber.includes(keyword) ||
      task.reason.includes(keyword) ||
      task.executionBotName.includes(keyword) ||
      task.executionFlowName.includes(keyword)
    );
  }, [tasks, searchTerm]);

  const activeRule = rules.find(rule => rule.id === activeRuleId) || rules[0];
  const graphNodes = activeRule ? buildRuleGraphNodes(activeRule) : [];
  const activeNode = graphNodes.find(node => node.id === activeNodeId) || graphNodes[0];
  const report = buildReport(tasks);
  const rows = ruleRows(rules, tasks);

  const updateTaskStatus = (taskId: string, status: FollowUpTaskStatus, result: string) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status, latestResult: result } : task));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, status, latestResult: result } : prev);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
      <div className="flex justify-between items-start mb-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">自动跟进</h1>
          <p className="text-sm text-slate-500 mt-1">管理用户表达稍后联系、预约回访和未接通重试任务。</p>
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-5">
        <Metric title="生成任务数" value={report.total} />
        <Metric title="已执行任务数" value={report.executed} />
        <Metric title="接通率" value={report.rate(report.connected)} tone="green" />
        <Metric title="完成率" value={report.rate(report.completed)} tone="green" />
        <Metric title="未接通率" value={report.rate(report.noAnswer)} tone="amber" />
        <Metric title="取消率" value={report.rate(report.cancelled)} />
        <Metric title="转人工率" value={report.rate(report.transferred)} tone="purple" />
      </div>

      {activeTab === 'TASKS' && (
        <div className="bg-white border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:border-primary outline-none w-80 bg-white"
                placeholder="搜索客户、手机号、跟进原因或 Flow"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="text-xs text-slate-500">自动跟进负责业务上下文，外呼任务负责实际拨号执行。</div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <Th>客户</Th>
                  <Th>来源通话</Th>
                  <Th>跟进原因</Th>
                  <Th>计划外呼时间</Th>
                  <Th>执行机器人 / Flow</Th>
                  <Th>当前状态</Th>
                  <Th>最近执行结果</Th>
                  <Th align="right">操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{task.customerName}</div>
                      <div className="text-xs text-slate-500 mt-1">{task.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <div>{task.sourceCallId}</div>
                      <div className="mt-1">{task.sourceBotName}</div>
                      <div className="mt-1">{task.sourceFlowName}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700 max-w-xs">{task.reason}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDateTime(task.plannedCallTime)}</td>
                    <td className="px-4 py-4 text-slate-600">
                      <div className="flex items-center gap-1"><Bot size={13} />{task.executionBotName}</div>
                      <div className="text-xs text-slate-400 mt-1">{task.executionFlowName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={statusClass(task.status)}>{FOLLOW_UP_STATUS_LABELS[task.status]}</Badge>
                      <div className="text-xs text-slate-400 mt-2">重试 {task.retryCount} 次</div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 max-w-xs">{task.latestResult || '暂无结果'}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedTask(task)} className="px-2 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:text-primary hover:border-primary">查看</button>
                        <button onClick={() => updateTaskStatus(task.id, 'running', '已立即执行，等待外呼结果')} className="px-2 py-1 border border-emerald-100 rounded text-xs text-emerald-600 hover:bg-emerald-50">立即执行</button>
                        <button onClick={() => updateTaskStatus(task.id, 'cancelled', '运营手动取消')} className="px-2 py-1 border border-amber-100 rounded text-xs text-amber-600 hover:bg-amber-50">取消</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RULES' && activeRule && activeNode && (
        <div className="grid grid-cols-[260px_1fr_320px] gap-4 flex-1 min-h-0">
          <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">规则列表</h3>
              <p className="text-xs text-slate-500 mt-1">选择一条规则查看编排图。</p>
            </div>
            <div className="divide-y divide-slate-100">
              {rules.map(rule => (
                <button
                  key={rule.id}
                  onClick={() => {
                    setActiveRuleId(rule.id);
                    setActiveNodeId('trigger');
                  }}
                  className={'w-full text-left p-4 hover:bg-slate-50 ' + (rule.id === activeRule.id ? 'bg-blue-50/60' : 'bg-white')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-slate-900">{rule.name}</span>
                    <Badge className={rule.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}>{rule.enabled ? '启用' : '停用'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{formatRuleScope(rule)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 flex flex-col min-w-0">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">规则画布</h3>
                <p className="text-xs text-slate-500 mt-1">按“触发 → 判断 → 时间 → 保护 → 动作 → 重试 → 退出”配置自动跟进链路。</p>
              </div>
              <button className="px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50">保存规则</button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:18px_18px]">
              <div className="min-w-[760px]">
                <div className="flex items-center gap-3">
                  {graphNodes.map((node, index) => (
                    <React.Fragment key={node.id}>
                      <RuleGraphNodeCard node={node} active={node.id === activeNode.id} onClick={() => setActiveNodeId(node.id)} />
                      {index < graphNodes.length - 1 && <div className="h-px w-10 bg-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-8 bg-white/90 border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900">规则执行预览</h4>
                  <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                    <Info label="适用范围" value={formatRuleScope(activeRule)} />
                    <Info label="执行 Flow" value={activeRule.executionFlowId || '未指定'} />
                    <Info label="重试间隔" value={`${activeRule.retryPolicy.retryIntervalHours} 小时`} />
                    <Info label="退出条件" value={`${activeRule.exitConditions.length} 个`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 overflow-auto">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">节点配置</h3>
              <p className="text-xs text-slate-500 mt-1">当前节点：{activeNode.title}</p>
            </div>
            <div className="p-4 space-y-4">
              <div className={'border p-4 ' + activeNode.tone}>
                <activeNode.icon size={20} />
                <h4 className="font-semibold mt-3">{activeNode.title}</h4>
                <p className="text-sm mt-1">{activeNode.subtitle}</p>
                <p className="text-xs mt-3 opacity-80">{activeNode.detail}</p>
              </div>
              <NodeConfigDetails nodeId={activeNode.id} rule={activeRule} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REPORT' && (
        <div className="grid grid-cols-2 gap-4 overflow-auto">
          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><BarChart3 size={18} />不同规则效果对比</h3>
            <div className="mt-4 space-y-3">
              {rows.map(row => (
                <div key={row.rule.id} className="border border-slate-100 p-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{row.rule.name}</span>
                    <span className="text-sm text-emerald-600">完成率 {row.completionRate}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                    <Info label="生成任务" value={row.generated} />
                    <Info label="已完成" value={row.completed} />
                    <Info label="未接通" value={row.noAnswer} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><RefreshCw size={18} />不同机器人 / Flow 效果对比</h3>
            <div className="mt-4 space-y-3">
              {Array.from(new Set(tasks.map(task => `${task.executionBotName}|${task.executionFlowName}`))).map(key => {
                const [bot, flow] = key.split('|');
                const related = tasks.filter(task => task.executionBotName === bot && task.executionFlowName === flow);
                const completed = related.filter(task => task.status === 'completed').length;
                return (
                  <div key={key} className="border border-slate-100 p-4">
                    <div className="font-medium text-slate-800">{bot}</div>
                    <div className="text-xs text-slate-500 mt-1">{flow}</div>
                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <Info label="任务数" value={related.length} />
                      <Info label="完成数" value={completed} />
                      <Info label="平均跟进时长" value="2.4 分钟" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center">
          <div className="bg-white shadow-2xl w-[560px] max-h-[80vh] overflow-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">跟进任务详情</h3>
              <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <Info label="客户手机号" value={selectedTask.phoneNumber} />
              <Info label="客户姓名" value={selectedTask.customerName} />
              <Info label="来源通话" value={selectedTask.sourceCallId} />
              <Info label="跟进原因" value={selectedTask.reason} />
              <Info label="计划外呼时间" value={formatDateTime(selectedTask.plannedCallTime)} />
              <Info label="执行机器人" value={selectedTask.executionBotName} />
              <Info label="执行 Flow" value={selectedTask.executionFlowName} />
              <Info label="当前状态" value={FOLLOW_UP_STATUS_LABELS[selectedTask.status]} />
              <Info label="最近执行结果" value={selectedTask.latestResult || '暂无结果'} />
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateTaskStatus(selectedTask.id, 'completed', '已接通并完成跟进')} className="flex-1 bg-emerald-600 text-white rounded py-2 text-sm">
                  <CheckCircle2 size={15} className="inline mr-1" /> 标记完成
                </button>
                <button onClick={() => updateTaskStatus(selectedTask.id, 'transferred', '用户要求人工接管')} className="flex-1 bg-primary text-white rounded py-2 text-sm">
                  <PhoneCall size={15} className="inline mr-1" /> 转人工
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const RuleGraphNodeCard: React.FC<{ node: RuleGraphNode; active: boolean; onClick: () => void }> = ({ node, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={'w-28 h-28 border bg-white text-left p-3 transition-all ' + (active ? 'border-primary shadow-md ring-2 ring-primary/10' : 'border-slate-200 hover:border-primary/50')}
  >
    <div className={'h-8 w-8 flex items-center justify-center border ' + node.tone}>
      <node.icon size={16} />
    </div>
    <div className="mt-3 text-sm font-semibold text-slate-900">{node.title}</div>
    <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">{node.subtitle}</div>
  </button>
);

const NodeConfigDetails: React.FC<{ nodeId: RuleGraphNodeType; rule: FollowUpRule }> = ({ nodeId, rule }) => {
  if (nodeId === 'trigger') {
    return <DetailList title="触发事件配置" items={rule.triggers.map(trigger => FOLLOW_UP_TRIGGER_LABELS[trigger])} />;
  }
  if (nodeId === 'condition') {
    return <DetailList title="条件判断配置" items={[`机器人：${rule.applicableBotIds.join('、')}`, `Flow：${rule.applicableFlowIds.join('、')}`, `状态：${rule.enabled ? '启用' : '停用'}`]} />;
  }
  if (nodeId === 'time') {
    return <DetailList title="时间计算配置" items={[rule.useUserSpecifiedTime ? '优先使用用户指定时间' : '使用默认时间', `默认 ${rule.defaultDelayDays} 天后`, `执行时间段 ${rule.preferredTimeRange}`]} />;
  }
  if (nodeId === 'protection') {
    return <DetailList title="触达保护配置" items={[`每天最多 ${rule.touchProtection.maxDailyCalls} 次`, `每周最多 ${rule.touchProtection.maxWeeklyCalls || '-'} 次`, `拒绝后冷却 ${rule.touchProtection.rejectCooldownDays} 天`, rule.touchProtection.blockComplaintRisk ? '投诉风险客户不触达' : '投诉风险客户可触达']} />;
  }
  if (nodeId === 'action') {
    return <DetailList title="执行动作配置" items={[`动作：${rule.actions.join('、')}`, `执行机器人：${rule.executionBotId || '-'}`, `执行 Flow：${rule.executionFlowId || '-'}`]} />;
  }
  if (nodeId === 'retry') {
    return <DetailList title="重试策略配置" items={[`最大重试 ${rule.retryPolicy.maxRetries} 次`, `未接通后多久重试：${rule.retryPolicy.retryIntervalHours} 小时`, `每天最多 ${rule.retryPolicy.maxDailyAttempts} 次`, `失败后动作 ${rule.retryPolicy.failureAction}`]} />;
  }
  return <DetailList title="退出条件配置" items={rule.exitConditions} />;
};

const DetailList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div>
    <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    <div className="mt-3 space-y-2">
      {items.map(item => (
        <div key={item} className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{item}</div>
      ))}
    </div>
  </div>
);

const Metric: React.FC<{ title: string; value: string | number; tone?: 'green' | 'amber' | 'purple' }> = ({ title, value, tone }) => {
  const toneClass = tone === 'green' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : tone === 'purple' ? 'text-purple-600' : 'text-slate-900';
  return (
    <div className="bg-white border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className={'text-xl font-bold mt-1 ' + toneClass}>{value}</p>
    </div>
  );
};

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' }> = ({ children, align = 'left' }) => (
  <th className={'px-4 py-3 text-xs font-semibold text-slate-500 ' + (align === 'right' ? 'text-right' : 'text-left')}>{children}</th>
);

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-100 p-3">
    <p className="text-xs text-slate-400">{label}</p>
    <div className="font-medium text-slate-700 mt-1">{value}</div>
  </div>
);
