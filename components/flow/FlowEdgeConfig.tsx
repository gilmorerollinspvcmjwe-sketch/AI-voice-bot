import React from 'react';
import { ArrowRightLeft, GitBranch, SlidersHorizontal, X } from 'lucide-react';
import { BUILT_IN_FUNCTIONS, FlowEdge, FlowFunction, FlowNode } from '../../types';
import { Label } from '../ui/FormComponents';

interface FlowEdgeConfigProps {
  edge: FlowEdge | null;
  sourceNode?: FlowNode | null;
  targetNode?: FlowNode | null;
  availableFunctions?: FlowFunction[];
  onChange?: (edge: FlowEdge) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

const EDGE_TYPE_OPTIONS: Array<{ value: NonNullable<FlowEdge['edgeType']>; label: string; description: string }> = [
  { value: 'normal', label: '普通连线', description: '默认顺序流转。' },
  { value: 'conditional', label: '条件分支', description: '满足条件后命中。' },
  { value: 'fallback', label: '兜底分支', description: '重试耗尽或校验失败后的兜底。' },
  { value: 'goto_flow', label: '跨 Flow', description: '表示 goto flow / return flow。' },
];

const CONDITION_MODES: Array<{ value: NonNullable<FlowEdge['condition']>['mode']; label: string }> = [
  { value: 'expression', label: '表达式' },
  { value: 'entity', label: '实体' },
  { value: 'state', label: '状态' },
  { value: 'intent', label: '意图' },
];

export default function FlowEdgeConfig({
  edge,
  sourceNode,
  targetNode,
  availableFunctions = [],
  onChange,
  onClose,
  readOnly = false,
}: FlowEdgeConfigProps) {
  if (!edge) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-400">
        <div>
          <ArrowRightLeft size={40} className="mx-auto mb-3 text-slate-200" />
          <div className="text-sm font-medium text-slate-500">请选择一条边</div>
          <div className="mt-1 text-xs leading-6 text-slate-400">这里会显示分支条件、优先级和调试规则。</div>
        </div>
      </div>
    );
  }

  const updateEdge = (updates: Partial<FlowEdge>) => {
    if (readOnly) return;
    onChange?.({ ...edge, ...updates });
  };

  const transitionFunctions = [...BUILT_IN_FUNCTIONS, ...availableFunctions].filter(
    (item, index, list) => item.category === 'transition' && list.findIndex((candidate) => candidate.id === item.id) === index,
  );

  const condition = edge.condition || { mode: 'expression' as const };
  const requiredEntitiesText = (edge.requiredEntities || []).join('\n');

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-slate-600" />
          <div>
            <div className="text-sm font-semibold text-slate-800">边条件编辑器</div>
            <div className="text-[11px] text-slate-400">{edge.id}</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <GitBranch size={12} />
            分支路径
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <div><span className="text-slate-400">从：</span>{sourceNode?.data.name || edge.source}</div>
            <div><span className="text-slate-400">到：</span>{targetNode?.data.name || edge.target}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <SlidersHorizontal size={15} className="text-slate-500" />
            分支配置
          </div>

          <div className="space-y-4">
            <div>
              <Label label="边标签" />
              <input type="text" value={edge.label || ''} disabled={readOnly} onChange={(event) => updateEdge({ label: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" placeholder="例如：校验通过 / 重试失败" />
            </div>

            <div>
              <Label label="分支描述" />
              <textarea rows={2} value={edge.description || ''} disabled={readOnly} onChange={(event) => updateEdge({ description: event.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" placeholder="告诉模型这条边在什么情况下应该被命中" />
            </div>

            <div>
              <Label label="分支类型" />
              <div className="space-y-2">
                {EDGE_TYPE_OPTIONS.map((option) => {
                  const selected = (edge.edgeType || 'normal') === option.value;
                  return (
                    <label key={option.value} className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${selected ? 'border-primary bg-sky-50' : 'border-slate-200 hover:border-slate-300'} ${readOnly ? 'opacity-60' : ''}`}>
                      <input type="radio" name={`edge_type_${edge.id}`} checked={selected} disabled={readOnly} onChange={() => updateEdge({ edgeType: option.value })} className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{option.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{option.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label label="条件模式" />
                <select value={condition.mode} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, mode: event.target.value as NonNullable<FlowEdge['condition']>['mode'] } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">
                  {CONDITION_MODES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <Label label="优先级" />
                <input type="number" min={1} value={edge.priority ?? 1} disabled={readOnly} onChange={(event) => updateEdge({ priority: Number(event.target.value) || 1 })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
              </div>
            </div>

            {condition.mode === 'expression' ? (
              <div>
                <Label label="条件表达式" />
                <textarea rows={3} value={condition.expression || edge.conditionSummary || ''} disabled={readOnly} onChange={(event) => updateEdge({ conditionSummary: event.target.value, condition: { ...condition, expression: event.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" placeholder="例如：retryCount >= 3 && phone_number" />
              </div>
            ) : null}

            {condition.mode === 'entity' ? (
              <div className="grid grid-cols-2 gap-3">
                <div><Label label="实体名" /><input value={condition.entityName || ''} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, entityName: event.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div><Label label="操作符" /><select value={condition.operator || 'exists'} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, operator: event.target.value as 'exists' | 'equals' | 'not_equals' | 'contains' } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="exists">exists</option><option value="equals">equals</option><option value="not_equals">not_equals</option><option value="contains">contains</option></select></div>
                <div className="col-span-2"><Label label="比较值" /><input value={condition.value || ''} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, value: event.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </div>
            ) : null}

            {condition.mode === 'state' || condition.mode === 'intent' ? (
              <div className="grid grid-cols-2 gap-3">
                <div><Label label={condition.mode === 'state' ? '状态字段' : '意图名'} /><input value={condition.stateKey || ''} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, stateKey: event.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div><Label label="比较值" /><input value={condition.value || ''} disabled={readOnly} onChange={(event) => updateEdge({ condition: { ...condition, value: event.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </div>
            ) : null}

            <div>
              <Label label="前置实体（每行一个）" />
              <textarea rows={3} value={requiredEntitiesText} disabled={readOnly} onChange={(event) => updateEdge({ requiredEntities: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" placeholder="例如：phone_number&#10;confirmation_code" />
            </div>

            <div>
              <Label label="过渡函数" />
              <select value={edge.transitionFunctionId || ''} disabled={readOnly} onChange={(event) => updateEdge({ transitionFunctionId: event.target.value || undefined })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">
                <option value="">未绑定</option>
                {transitionFunctions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>

            <div>
              <Label label="调试规则" />
              <select value={edge.debugRule || ''} disabled={readOnly} onChange={(event) => updateEdge({ debugRule: (event.target.value || undefined) as FlowEdge['debugRule'] })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">
                <option value="">Auto</option>
                <option value="always">always</option>
                <option value="condition">condition</option>
                <option value="entity_collected">entity_collected</option>
                <option value="retry_exhausted">retry_exhausted</option>
              </select>
              <div className="mt-1 text-[11px] text-slate-400">用于半模拟调试时强制命中某条分支。</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export type { FlowEdgeConfigProps };
