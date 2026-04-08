import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, GitBranch, ListChecks, LogOut, Settings, Sparkles, Target, Wrench, X } from 'lucide-react';
import { AgentTool, BotVariable, BUILT_IN_FUNCTIONS, ExitNodeType, FlowAsrBiasing, FlowEntityType, FlowFunction, FlowNode, FlowNodeType, FlowStepKind } from '../../types';
import PromptEditor from '../ui/PromptEditor';
import { Label } from '../ui/FormComponents';

interface FlowNodeConfigProps {
  node: FlowNode | null;
  availableFunctions?: FlowFunction[];
  availableVariables?: BotVariable[];
  availableTools?: AgentTool[];
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

const STEP_TYPES: FlowStepKind[] = ['default', 'collect', 'function'];
const ENTITY_TYPES: FlowEntityType[] = ['text', 'phone', 'number', 'datetime', 'address', 'email', 'alphanumeric'];
const ASR_TYPES: FlowAsrBiasing[] = ['default', 'alphanumeric', 'name', 'datetime', 'number', 'address'];

export default function FlowNodeConfig({
  node,
  availableFunctions = [],
  availableVariables = [],
  availableTools = [],
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

  if (!localNode) {
    return <div className="flex h-full items-center justify-center p-8 text-sm text-slate-400">Select a node</div>;
  }

  const updateNodeData = (updates: Partial<FlowNode['data']>) => {
    if (readOnly) return;
    const nextNode = { ...localNode, data: { ...localNode.data, ...updates } };
    setLocalNode(nextNode);
    onChange?.(nextNode);
  };

  const updateStepPrompt = (updates: Record<string, any>) =>
    updateNodeData({
      stepPrompt: {
        prompt: localNode.data.stepPrompt?.prompt || '',
        visibleFunctionIds: localNode.data.stepPrompt?.visibleFunctionIds || [],
        transitionFunctionIds: localNode.data.stepPrompt?.transitionFunctionIds || [],
        ...updates,
      },
    });

  const toggleId = (current: string[] | undefined, id: string, onNext: (next: string[]) => void) => {
    const next = (current || []).includes(id) ? (current || []).filter((item) => item !== id) : [...(current || []), id];
    onNext(next);
  };

  const isStepNode = localNode.type === FlowNodeType.DEFAULT;
  const isExitNode = localNode.type === FlowNodeType.EXIT;
  const examples = localNode.data.fewShotExamples || [];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{localNode.data.name || 'Unnamed Node'}</div>
          <div className="text-[11px] text-slate-400">{localNode.id}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"><X size={16} /></button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Section title="Basic" icon={<Settings size={16} />}>
          <div>
            <Label label="Node Name" />
            <input value={localNode.data.name || ''} disabled={readOnly} onChange={(e) => updateNodeData({ name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
          </div>
          <div>
            <Label label="Description" />
            <textarea rows={3} value={localNode.data.description || ''} disabled={readOnly} onChange={(e) => updateNodeData({ description: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" />
          </div>
          {isStepNode ? (
            <div>
              <Label label="Step Preset" />
              <select value={localNode.data.stepType || 'default'} disabled={readOnly} onChange={(e) => updateNodeData({ stepType: e.target.value as FlowStepKind })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">
                {STEP_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          ) : null}
        </Section>

        {localNode.type !== FlowNodeType.START ? (
          <Section title="Step Prompt" icon={<FileText size={16} />}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Use <code className="rounded bg-amber-100 px-1 font-mono">/tool_name</code>, <code className="rounded bg-amber-100 px-1 font-mono">/function_name</code> and <code className="rounded bg-amber-100 px-1 font-mono">{'{{variable_name}}'}</code>.
            </div>
            <PromptEditor
              value={localNode.data.stepPrompt?.prompt || ''}
              onChange={(prompt) => updateStepPrompt({ prompt })}
              variables={availableVariables.map((item) => ({ name: item.name, description: item.description }))}
              availableTools={availableTools}
              availableFunctions={allFunctions}
              height="h-32"
              placeholder="Describe what this step should do."
            />
          </Section>
        ) : null}

        {isStepNode ? (
          <Section title="Tools and Functions" icon={<Wrench size={16} />} defaultExpanded={false}>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">Tools</div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                  {availableTools.map((tool) => {
                    const selected = (localNode.data.toolIds || []).includes(tool.id);
                    return <button key={tool.id} type="button" disabled={readOnly} onClick={() => toggleId(localNode.data.toolIds, tool.id, (toolIds) => updateNodeData({ toolIds }))} className={`rounded-full border px-3 py-1.5 text-xs ${selected ? 'border-transparent bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>{tool.name}</button>;
                  })}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">Visible Functions</div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-sky-50 p-2">
                  {allFunctions.filter((item) => item.category === 'visible').map((item) => {
                    const selected = (localNode.data.stepPrompt?.visibleFunctionIds || []).includes(item.id);
                    return <button key={item.id} type="button" disabled={readOnly} onClick={() => toggleId(localNode.data.stepPrompt?.visibleFunctionIds, item.id, (visibleFunctionIds) => updateStepPrompt({ visibleFunctionIds }))} className={`rounded-full border px-3 py-1.5 text-xs ${selected ? 'border-transparent bg-sky-600 text-white' : 'border-sky-200 bg-white text-slate-600'}`}>{item.name}</button>;
                  })}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-600">Transition Functions</div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-emerald-50 p-2">
                  {allFunctions.filter((item) => item.category === 'transition').map((item) => {
                    const selected = (localNode.data.stepPrompt?.transitionFunctionIds || []).includes(item.id);
                    return <button key={item.id} type="button" disabled={readOnly} onClick={() => toggleId(localNode.data.stepPrompt?.transitionFunctionIds, item.id, (transitionFunctionIds) => updateStepPrompt({ transitionFunctionIds }))} className={`rounded-full border px-3 py-1.5 text-xs ${selected ? 'border-transparent bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-slate-600'}`}>{item.name}</button>;
                  })}
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        {isStepNode ? (
          <Section title="Entity Collection" icon={<Target size={16} />} defaultExpanded={localNode.data.stepType === 'collect'}>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
              <div><div className="text-sm font-medium text-slate-800">Enable Entity Collection</div><div className="mt-1 text-xs text-slate-500">Entity, ASR and DTMF live here.</div></div>
              <input type="checkbox" checked={Boolean(localNode.data.entityConfig?.enabled)} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { enabled: e.target.checked, entityName: localNode.data.entityConfig?.entityName || '', entityType: localNode.data.entityConfig?.entityType || 'text', prompt: localNode.data.entityConfig?.prompt || '', asrBiasing: localNode.data.entityConfig?.asrBiasing || 'default', required: localNode.data.entityConfig?.required ?? true, inputMode: localNode.data.entityConfig?.inputMode || 'speech', dtmfMaxDigits: localNode.data.entityConfig?.dtmfMaxDigits || 6 } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            </label>
            {localNode.data.entityConfig?.enabled ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="Entity Name" /><input value={localNode.data.entityConfig?.entityName || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, entityName: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                  <div><Label label="Entity Type" /><select value={localNode.data.entityConfig?.entityType || 'text'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, entityType: e.target.value as FlowEntityType } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">{ENTITY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="Input Mode" /><select value={localNode.data.entityConfig?.inputMode || 'speech'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, inputMode: e.target.value as 'speech' | 'dtmf' } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"><option value="speech">speech</option><option value="dtmf">dtmf</option></select></div>
                  <div><Label label="ASR Biasing" /><select value={localNode.data.entityConfig?.asrBiasing || 'default'} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, asrBiasing: e.target.value as FlowAsrBiasing } })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100">{ASR_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
                </div>
                {localNode.data.entityConfig?.inputMode === 'dtmf' ? (
                  <div><Label label="DTMF Max Digits" /><input type="number" min={1} max={20} value={localNode.data.entityConfig?.dtmfMaxDigits || 6} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, dtmfMaxDigits: Number(e.target.value) || 1 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /><div className="mt-1 text-[11px] text-slate-400">DTMF</div></div>
                ) : null}
                <div><Label label="Collection Prompt" /><textarea rows={3} value={localNode.data.entityConfig?.prompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ entityConfig: { ...localNode.data.entityConfig, enabled: true, prompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </>
            ) : null}
          </Section>
        ) : null}

        {isStepNode ? (
          <Section title="Retry Strategy" icon={<Sparkles size={16} />} defaultExpanded={Boolean(localNode.data.retryConfig?.enabled)}>
            <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
              <div><div className="text-sm font-medium text-slate-800">Enable Retry</div><div className="mt-1 text-xs text-slate-500">Configure no-input, no-match and fallback path.</div></div>
              <input type="checkbox" checked={Boolean(localNode.data.retryConfig?.enabled)} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { enabled: e.target.checked, maxAttempts: localNode.data.retryConfig?.maxAttempts || 3, noInputPrompt: localNode.data.retryConfig?.noInputPrompt || '', noMatchPrompt: localNode.data.retryConfig?.noMatchPrompt || '', fallbackTargetId: localNode.data.retryConfig?.fallbackTargetId || '', repromptDelayMs: localNode.data.retryConfig?.repromptDelayMs || 0 } })} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
            </label>
            {localNode.data.retryConfig?.enabled ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label label="Max Attempts" /><input type="number" min={1} max={10} value={localNode.data.retryConfig?.maxAttempts || 3} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, maxAttempts: Number(e.target.value) || 1 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                  <div><Label label="Reprompt Delay (ms)" /><input type="number" min={0} value={localNode.data.retryConfig?.repromptDelayMs || 0} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, repromptDelayMs: Number(e.target.value) || 0 } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                </div>
                <div><Label label="No Input Prompt" /><textarea rows={2} value={localNode.data.retryConfig?.noInputPrompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, noInputPrompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div><Label label="No Match Prompt" /><textarea rows={2} value={localNode.data.retryConfig?.noMatchPrompt || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, noMatchPrompt: e.target.value } })} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                <div><Label label="Fallback Target Id" /><input value={localNode.data.retryConfig?.fallbackTargetId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ retryConfig: { ...localNode.data.retryConfig, enabled: true, fallbackTargetId: e.target.value } })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
              </>
            ) : null}
          </Section>
        ) : null}

        {(isStepNode || isExitNode) ? (
          <Section title="Flow Navigation" icon={<GitBranch size={16} />}>
            <div><Label label="Target Flow Id" /><input value={localNode.data.gotoFlowId || ''} disabled={readOnly} onChange={(e) => updateNodeData({ gotoFlowId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /><div className="mt-1 text-[11px] text-slate-400">Use this for sub flow jump, return flow or explicit handoff routing.</div></div>
          </Section>
        ) : null}

        {isStepNode ? (
          <Section title="Few-shot Examples" icon={<ListChecks size={16} />} defaultExpanded={false}>
            <div className="flex items-center justify-between"><div className="text-xs text-slate-500">Provide short examples to constrain this step.</div><button type="button" disabled={readOnly} onClick={() => updateNodeData({ fewShotExamples: [...examples, { input: '', output: '' }] })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">Add Example</button></div>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={`${localNode.id}_${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between"><div className="text-xs font-medium text-slate-600">Example {index + 1}</div><button type="button" disabled={readOnly} onClick={() => updateNodeData({ fewShotExamples: examples.filter((_, i) => i !== index) })} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-red-500"><X size={14} /></button></div>
                  <div className="space-y-3">
                    <div><Label label="Input" /><textarea rows={2} value={example.input} disabled={readOnly} onChange={(e) => updateNodeData({ fewShotExamples: examples.map((item, i) => i === index ? { ...item, input: e.target.value } : item) })} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                    <div><Label label="Expected Output" /><textarea rows={2} value={example.output} disabled={readOnly} onChange={(e) => updateNodeData({ fewShotExamples: examples.map((item, i) => i === index ? { ...item, output: e.target.value } : item) })} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100" /></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {isExitNode ? (
          <Section title="Exit Behavior" icon={<LogOut size={16} />}>
            <div className="space-y-2">
              {[ExitNodeType.FINISH, ExitNodeType.HANDOFF, ExitNodeType.STOP].map((item) => {
                const selected = (localNode.data.exitType || ExitNodeType.FINISH) === item;
                return <label key={item} className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${selected ? 'border-primary bg-sky-50' : 'border-slate-200 bg-white'}`}><input type="radio" name={`exit_${localNode.id}`} checked={selected} disabled={readOnly} onChange={() => updateNodeData({ exitType: item })} className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary" /><div><div className="text-sm font-medium text-slate-800">{item}</div></div></label>;
              })}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  );
}

export type { FlowNodeConfigProps };
