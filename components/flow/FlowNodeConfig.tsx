// 流程节点配置面板，按 PolyAI 理念简化：用提示词驱动，工具/代码块通过 / 引用。
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, LogOut, Settings, Sparkles, Target, X } from 'lucide-react';
import { AgentTool, BotVariable, BUILT_IN_FUNCTIONS, DelayProfile, ExitNodeType, FlowAsrBiasing, FlowEntityType, FlowFunction, FlowNode, FlowNodeType } from '../../types';
import PromptEditor from '../ui/PromptEditor';
import { Label } from '../ui/FormComponents';
import { getDelayProfileOptions, getStateVariableOptions } from '../../services/polyaiConfigHelpers';

interface FlowNodeConfigProps {
  node: FlowNode | null;
  availableFunctions?: FlowFunction[];
  availableVariables?: BotVariable[];
  availableTools?: AgentTool[];
  availableDelayProfiles?: DelayProfile[];
  availableFlows?: Array<{ id: string; name: string }>;
  onChange?: (node: FlowNode) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

function Section({ title, icon, children, defaultExpanded = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">{icon}<span>{title}</span></div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {expanded ? <div className="space-y-4 p-4">{children}</div> : null}
    </section>
  );
}

const ENTITY_TYPES: FlowEntityType[] = ['text', 'phone', 'number', 'datetime', 'address', 'email', 'alphanumeric'];
const ASR_TYPES: FlowAsrBiasing[] = ['default', 'alphanumeric', 'name', 'datetime', 'number', 'address'];
const HANDOFF_OPTIONS = [
  { id: 'handoff_human_service', label: '人工客服队列' },
  { id: 'handoff_vip_service', label: 'VIP 专席' },
  { id: 'handoff_risk_service', label: '高风险专员' },
];

function toggleStringId(current: string[] | undefined, id: string) {
  return (current || []).includes(id) ? (current || []).filter((item) => item !== id) : [...(current || []), id];
}

export default function FlowNodeConfig({
  node,
  availableFunctions = [],
  availableVariables = [],
  availableTools = [],
  availableDelayProfiles = [],
  availableFlows = [],
  onChange,
  onClose,
  readOnly = false,
}: FlowNodeConfigProps) {
  const [localNode, setLocalNode] = useState<FlowNode | null>(node);
  useEffect(() => setLocalNode(node), [node]);

  const allFunctions = useMemo(() => {
    const builtInIds = new Set(BUILT_IN_FUNCTIONS.map((item) => item.id));
    return [...BUILT_IN_FUNCTIONS, ...availableFunctions.filter((item) => !builtInIds.has(item.id))];
  }, [availableFunctions]);
  const codeBlocks = useMemo(() => availableFunctions.filter((item) => !item.isBuiltIn), [availableFunctions]);
  const delayProfiles = useMemo(() => getDelayProfileOptions(availableDelayProfiles), [availableDelayProfiles]);
  const stateVariables = useMemo(() => getStateVariableOptions(availableVariables), [availableVariables]);

  if (!localNode) {
    return <div className="flex h-full items-center justify-center p-8 text-sm text-slate-400">请选择一个节点</div>;
  }

  const isStepNode = localNode.type === FlowNodeType.DEFAULT;
  const isExitNode = localNode.type === FlowNodeType.EXIT;
  const examples = localNode.data.fewShotExamples || [];
  const hasEntityCollection = Boolean(localNode.data.entityConfig?.enabled);
  const selectedPrimaryFunction = localNode.data.primaryFunctionId
    ? allFunctions.find((item) => item.id === localNode.data.primaryFunctionId)
    : null;
  const entityInputMode = localNode.data.entityConfig?.inputMode || 'speech';

  const updateNode = (nextNode: FlowNode) => {
    setLocalNode(nextNode);
    onChange?.(nextNode);
  };

  const updateNodeData = (updates: Partial<FlowNode['data']>) => {
    if (readOnly) return;
    updateNode({ ...localNode, data: { ...localNode.data, ...updates } });
  };

  const updateStepPrompt = (updates: Partial<NonNullable<FlowNode['data']['stepPrompt']>>) => {
    updateNodeData({
      stepPrompt: {
        prompt: localNode.data.stepPrompt?.prompt || '',
        visibleFunctionIds: localNode.data.stepPrompt?.visibleFunctionIds || [],
        transitionFunctionIds: localNode.data.stepPrompt?.transitionFunctionIds || [],
        codeBlockIds: localNode.data.stepPrompt?.codeBlockIds || [],
        ...updates,
      },
    });
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{localNode.data.name || '未命名节点'}</div>
          <div className="text-[11px] text-slate-400">{localNode.id}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X size={16} /></button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* 基础信息 */}
        {isStepNode ? (
          <Section title="步骤设置" icon={<Settings size={16} />}>
            <div>
              <Label label="步骤名称" />
              <input value={localNode.data.name || ''} disabled={readOnly} onChange={(e) => updateNodeData({ name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
            </div>
            <div>
              <Label label="步骤备注" />
              <textarea rows={2} value={localNode.data.description || ''} disabled={readOnly} onChange={(e) => updateNodeData({ description: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" placeholder="选填，例如：这里负责确认订单号并决定是否继续。" />
            </div>
          </Section>
        ) : (
          <Section title="基础信息" icon={<Settings size={16} />}>
            <div>
              <Label label="节点名称" />
              <input value={localNode.data.name || ''} disabled={readOnly} onChange={(e) => updateNodeData({ name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
            </div>
            <div>
              <Label label="节点描述" />
              <textarea rows={3} value={localNode.data.description || ''} disabled={readOnly} onChange={(e) => updateNodeData({ description: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
            </div>
          </Section>
        )}

        {/* 提示词 - 核心配置，所有节点（除开始节点）都有 */}
        {localNode.type !== FlowNodeType.START ? (
          <Section title="提示词" icon={<FileText size={16} />}>
            <PromptEditor
              value={localNode.data.stepPrompt?.prompt || ''}
              onChange={(prompt) => updateStepPrompt({ prompt })}
              variables={availableVariables.map((item) => ({ name: item.name, description: item.description }))}
              availableTools={availableTools}
              availableFunctions={codeBlocks}
              availableFlows={availableFlows}
              height="h-32"
              placeholder="描述这个步骤要完成的对话目标。使用 / 引用工具、代码块或流程。"
            />
          </Section>
        ) : null}

        {/* 实体采集 - 仅步骤节点，默认折叠 */}
        {isStepNode ? (
          <Section title="实体采集" icon={<Target size={16} />} defaultExpanded={hasEntityCollection}>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">启用实体采集</div>
                <div className="mt-1 text-xs text-slate-500">需要结构化采集用户输入时启用。</div>
              </div>
              <input type="checkbox" checked={hasEntityCollection} disabled={readOnly} onChange={(e) => updateNodeData({ stepType: e.target.checked ? 'collect' : (selectedPrimaryFunction ? 'function' : 'default'), entityConfig: { enabled: e.target.checked, entityName: localNode.data.entityConfig?.entityName || '', entityType: localNode.data.entityConfig?.entityType || 'text', prompt: localNode.data.entityConfig?.prompt || '', asrBiasing: localNode.data.entityConfig?.asrBiasing || 'default', required: localNode.data.entityConfig?.required ?? true, inputMode: localNode.data.entityConfig?.inputMode || 'speech', dtmfMaxDigits: localNode.data.entityConfig?.dtmfMaxDigits || 6, dtmfTerminator: localNode.data.entityConfig?.dtmfTerminator || '#', dtmfFirstDigitTimeoutMs: localNode.data.entityConfig?.dtmfFirstDigitTimeoutMs || 5000, dtmfInterDigitTimeoutMs: localNode.data.entityConfig?.dtmfInterDigitTimeoutMs || 2500, collectWhileSpeaking: localNode.data.entityConfig?.collectWhileSpeaking ?? false, containsPii: localNode.data.entityConfig?.containsPii ?? false, validationPattern: localNode.data.entityConfig?.validationPattern || '', options: localNode.data.entityConfig?.options || [] } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            </label>

            {hasEntityCollection ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="实体名称" /><input value={localNode.data.entityConfig?.entityName || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, entityName: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                  <div><Label label="实体类型" /><select value={localNode.data.entityConfig?.entityType || 'text'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, entityType: e.target.value as FlowEntityType } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">{ENTITY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                </div>
                <div><Label label="采集提示词" /><textarea rows={3} value={localNode.data.entityConfig?.prompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, prompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </>
            ) : null}
          </Section>
        ) : null}

        {/* 高级设置 - 默认折叠 */}
        {isStepNode ? (
          <Section title="高级设置" icon={<Sparkles size={16} />} defaultExpanded={false}>
            {/* 重试策略 */}
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
              <div>
                <div className="text-sm font-medium text-slate-800">启用重试</div>
                <div className="mt-1 text-xs text-slate-500">只在这个步骤需要单独兜底时配置。</div>
              </div>
              <input type="checkbox" checked={Boolean(localNode.data.retryConfig?.enabled)} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { enabled: e.target.checked, maxAttempts: localNode.data.retryConfig?.maxAttempts || 3, noInputPrompt: localNode.data.retryConfig?.noInputPrompt || '', noMatchPrompt: localNode.data.retryConfig?.noMatchPrompt || '', confirmationPrompt: localNode.data.retryConfig?.confirmationPrompt || '', fallbackAction: localNode.data.retryConfig?.fallbackAction || 'goto_node', fallbackTargetId: localNode.data.retryConfig?.fallbackTargetId || '', fallbackFlowId: localNode.data.retryConfig?.fallbackFlowId || '', handoffTargetId: localNode.data.retryConfig?.handoffTargetId || '', repromptDelayMs: localNode.data.retryConfig?.repromptDelayMs || 0 } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            </label>
            {localNode.data.retryConfig?.enabled ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="最大尝试次数" /><input type="number" min={1} max={10} value={localNode.data.retryConfig?.maxAttempts || 3} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, maxAttempts: Number(e.target.value) || 1 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                  <div><Label label="重试等待 (ms)" /><input type="number" min={0} value={localNode.data.retryConfig?.repromptDelayMs || 0} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, repromptDelayMs: Number(e.target.value) || 0 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                </div>
                <div><Label label="无输入话术" /><textarea rows={2} value={localNode.data.retryConfig?.noInputPrompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, noInputPrompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div><Label label="无匹配话术" /><textarea rows={2} value={localNode.data.retryConfig?.noMatchPrompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, noMatchPrompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="兜底动作" /><select value={localNode.data.retryConfig?.fallbackAction || 'goto_node'} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, fallbackAction: e.target.value as 'goto_node' | 'goto_flow' | 'handoff' | 'exit' } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="goto_node">跳转节点</option><option value="goto_flow">跳转 Flow</option><option value="handoff">转人工</option><option value="exit">结束</option></select></div>
                  <div><Label label="兜底节点" /><input value={localNode.data.retryConfig?.fallbackTargetId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, fallbackTargetId: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                </div>
              </>
            ) : null}

            {/* 流程动作 */}
            <div className="border-t border-dashed border-slate-200 pt-4">
              <div className="mb-3 text-xs font-medium text-slate-600">流程动作</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label label="目标 Flow" tooltip="选择要跳转到的 Flow" />
                  <select
                    value={localNode.data.gotoFlowId || ''}
                    disabled={readOnly}
                    onChange={(e) => updateNodeData({ gotoFlowId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
                  >
                    <option value="">不跳转</option>
                    {availableFlows.map((flow) => (
                      <option key={flow.id} value={flow.id}>{flow.name}</option>
                    ))}
                  </select>
                  {localNode.data.gotoFlowId && !availableFlows.find(f => f.id === localNode.data.gotoFlowId) && (
                    <p className="mt-1 text-xs text-red-500">目标 Flow 不存在</p>
                  )}
                </div>
                <div><Label label="转人工目标" /><select value={localNode.data.handoffTargetId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ handoffTargetId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="">未指定</option>{HANDOFF_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
              </div>
              <div className="mt-3"><Label label="转接原因 / 路由备注" /><textarea rows={2} value={localNode.data.handoffReason || ''} disabled={readOnly} onChange={(e) => updateNodeData({ handoffReason: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
            </div>

            {/* 采集细项 - 仅当启用实体采集时显示 */}
            {hasEntityCollection ? (
              <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
                <div className="mb-3 text-xs font-medium text-slate-600">采集细项</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="输入模式" /><select value={entityInputMode} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, inputMode: e.target.value as 'speech' | 'dtmf' | 'speech_or_dtmf' } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="speech">仅语音</option><option value="dtmf">仅按键</option><option value="speech_or_dtmf">语音 + 按键</option></select></div>
                  <div><Label label="ASR 偏置" /><select value={localNode.data.entityConfig?.asrBiasing || 'default'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, asrBiasing: e.target.value as FlowAsrBiasing } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">{ASR_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-600"><input type="checkbox" checked={localNode.data.entityConfig?.required ?? true} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, required: e.target.checked } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />必填</label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-600"><input type="checkbox" checked={localNode.data.entityConfig?.containsPii ?? false} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, containsPii: e.target.checked } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />敏感信息</label>
                </div>

                {(entityInputMode === 'dtmf' || entityInputMode === 'speech_or_dtmf') ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div><Label label="DTMF 位数" /><input type="number" min={1} max={20} value={localNode.data.entityConfig?.dtmfMaxDigits || 6} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, dtmfMaxDigits: Number(e.target.value) || 1 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                      <div><Label label="结束键" /><select value={localNode.data.entityConfig?.dtmfTerminator || '#'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, dtmfTerminator: e.target.value as '#' | '*' } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="#">#</option><option value="*">*</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div><Label label="首位超时 (ms)" /><input type="number" min={0} value={localNode.data.entityConfig?.dtmfFirstDigitTimeoutMs || 5000} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, dtmfFirstDigitTimeoutMs: Number(e.target.value) || 0 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                      <div><Label label="位间超时 (ms)" /><input type="number" min={0} value={localNode.data.entityConfig?.dtmfInterDigitTimeoutMs || 2500} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, dtmfInterDigitTimeoutMs: Number(e.target.value) || 0 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                    </div>
                    <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-600"><input type="checkbox" checked={localNode.data.entityConfig?.collectWhileSpeaking ?? false} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, collectWhileSpeaking: e.target.checked } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />播报时采集按键</label>
                  </>
                ) : null}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><Label label="校验函数" /><select value={localNode.data.entityValidationFunctionId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityValidationFunctionId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="">无</option>{allFunctions.map((fn) => <option key={fn.id} value={fn.id}>{fn.name}</option>)}</select></div>
                  <div><Label label="归一化函数" /><select value={localNode.data.entityNormalizationFunctionId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityNormalizationFunctionId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="">无</option>{allFunctions.map((fn) => <option key={fn.id} value={fn.id}>{fn.name}</option>)}</select></div>
                </div>
                <div className="mt-3"><Label label="校验表达式" /><input value={localNode.data.entityConfig?.validationPattern || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, validationPattern: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div className="mt-3"><Label label="候选项" /><textarea rows={3} value={(localNode.data.entityConfig?.options || []).join('\n')} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, options: e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </div>
            ) : null}

            {/* 函数参数 - 仅当选择主函数时显示 */}
            {selectedPrimaryFunction ? (
              <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
                <div className="mb-3 text-xs font-medium text-slate-600">函数参数</div>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {selectedPrimaryFunction.parameters.map((param) => (
                    <div key={param.name} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-slate-600">{param.name}</span>
                      <select
                        value={(localNode.data.functionArgsMapping || []).find((mapping) => mapping.argName === param.name)?.sourceType || 'variable'}
                        disabled={readOnly}
                        onChange={(e) => {
                          const current = localNode.data.functionArgsMapping || [];
                          const existing = current.find((mapping) => mapping.argName === param.name);
                          const updated = existing
                            ? current.map((mapping) => mapping.argName === param.name ? { ...mapping, sourceType: e.target.value as 'variable' | 'state' | 'constant' | 'entity' } : mapping)
                            : [...current, { argName: param.name, sourceType: e.target.value as 'variable' | 'state' | 'constant' | 'entity', sourceKey: '' }];
                          updateNodeData({ functionArgsMapping: updated });
                        }}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        <option value="variable">变量</option>
                        <option value="state">状态</option>
                        <option value="constant">常量</option>
                        <option value="entity">实体</option>
                      </select>
                      <input
                        type="text"
                        value={(localNode.data.functionArgsMapping || []).find((mapping) => mapping.argName === param.name)?.sourceKey || ''}
                        disabled={readOnly}
                        onChange={(e) => {
                          const current = localNode.data.functionArgsMapping || [];
                          const existing = current.find((mapping) => mapping.argName === param.name);
                          const updated = existing
                            ? current.map((mapping) => mapping.argName === param.name ? { ...mapping, sourceKey: e.target.value } : mapping)
                            : [...current, { argName: param.name, sourceType: 'variable', sourceKey: e.target.value }];
                          updateNodeData({ functionArgsMapping: updated });
                        }}
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 状态变量 */}
            <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
              <div className="mb-3 text-xs font-medium text-slate-600">状态变量</div>
              <div className="space-y-3">
                <div>
                  <Label label="读取状态键" tooltip="此步骤需要读取的状态变量" />
                  <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {stateVariables.map((v) => {
                      const selected = (localNode.data.readStateKeys || []).includes(v.name);
                      return (
                        <button key={v.id} type="button" disabled={readOnly} onClick={() => updateNodeData({ readStateKeys: toggleStringId(localNode.data.readStateKeys, v.name) })} className={`rounded-full border px-2 py-1 text-[11px] ${selected ? 'border-transparent bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
                          {v.name}
                        </button>
                      );
                    })}
                    {!stateVariables.length && <div className="px-2 py-1 text-xs text-slate-400">暂无状态变量</div>}
                  </div>
                </div>
                <div>
                  <Label label="写入状态键" tooltip="此步骤会修改的状态变量" />
                  <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {stateVariables.map((v) => {
                      const selected = (localNode.data.writeStateKeys || []).includes(v.name);
                      return (
                        <button key={v.id} type="button" disabled={readOnly} onClick={() => updateNodeData({ writeStateKeys: toggleStringId(localNode.data.writeStateKeys, v.name) })} className={`rounded-full border px-2 py-1 text-[11px] ${selected ? 'border-transparent bg-green-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
                          {v.name}
                        </button>
                      );
                    })}
                    {!stateVariables.length && <div className="px-2 py-1 text-xs text-slate-400">暂无状态变量</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Few-shot 示例 */}
            <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-medium text-slate-600">Few-shot 示例</div>
                <button type="button" disabled={readOnly} onClick={() => updateNodeData({ fewShotExamples: [...examples, { input: '', output: '' }] })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                  新增示例
                </button>
              </div>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={`${localNode.id}_${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between"><div className="text-xs font-medium text-slate-600">示例 {index + 1}</div><button type="button" disabled={readOnly} onClick={() => updateNodeData({ fewShotExamples: examples.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-500"><X size={14} /></button></div>
                    <div className="space-y-3">
                      <div><Label label="输入" /><textarea rows={2} value={example.input} disabled={readOnly} onChange={(e) => updateNodeData({ fewShotExamples: examples.map((item, itemIndex) => itemIndex === index ? { ...item, input: e.target.value } : item) })} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                      <div><Label label="期望输出" /><textarea rows={2} value={example.output} disabled={readOnly} onChange={(e) => updateNodeData({ fewShotExamples: examples.map((item, itemIndex) => itemIndex === index ? { ...item, output: e.target.value } : item) })} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                    </div>
                  </div>
                ))}
                {!examples.length ? <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">未添加示例</div> : null}
              </div>
            </div>
          </Section>
        ) : null}

        {/* 退出行为 - 仅退出节点 */}
        {isExitNode ? (
          <Section title="退出行为" icon={<LogOut size={16} />}>
            <div className="space-y-2">
              {[ExitNodeType.FINISH, ExitNodeType.HANDOFF, ExitNodeType.STOP].map((item) => {
                const selected = (localNode.data.exitType || ExitNodeType.FINISH) === item;
                return <label key={item} className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${selected ? 'border-primary bg-sky-50' : 'border-slate-200 bg-white'}`}><input type="radio" name={`exit_${localNode.id}`} checked={selected} disabled={readOnly} onChange={() => updateNodeData({ exitType: item })} className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary" /><div className="text-sm font-medium text-slate-800">{item === ExitNodeType.FINISH ? '正常结束' : item === ExitNodeType.HANDOFF ? '转人工' : '立即停止'}</div></label>;
              })}
            </div>
            {(localNode.data.exitType || ExitNodeType.FINISH) === ExitNodeType.HANDOFF ? (
              <div className="space-y-3">
                <div><Label label="转人工目标" /><select value={localNode.data.handoffTargetId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ handoffTargetId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="">未指定</option>{HANDOFF_OPTIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
                <div><Label label="转接原因" /><textarea rows={2} value={localNode.data.handoffReason || ''} disabled={readOnly} onChange={(e) => updateNodeData({ handoffReason: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </div>
            ) : null}
          </Section>
        ) : null}
      </div>
    </div>
  );
}

export type { FlowNodeConfigProps };
