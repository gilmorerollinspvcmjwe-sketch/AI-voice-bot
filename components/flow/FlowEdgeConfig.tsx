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
  { value: 'normal', label: 'Normal', description: 'Default forward transition.' },
  { value: 'conditional', label: 'Conditional', description: 'Branch based on state or function result.' },
  { value: 'fallback', label: 'Fallback', description: 'Fallback route when retries or checks fail.' },
  { value: 'goto_flow', label: 'Goto Flow', description: 'Represents a cross-flow jump or return.' },
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
          <div className="text-sm font-medium text-slate-500">Select an edge</div>
          <div className="mt-1 text-xs leading-6 text-slate-400">Condition, branch type and priority will appear here.</div>
        </div>
      </div>
    );
  }

  const updateEdge = (updates: Partial<FlowEdge>) => {
    if (readOnly) return;
    onChange?.({
      ...edge,
      ...updates,
    });
  };

  const transitionFunctions = [...BUILT_IN_FUNCTIONS, ...availableFunctions].filter(
    (item, index, list) => item.category === 'transition' && list.findIndex((candidate) => candidate.id === item.id) === index,
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-slate-600" />
          <div>
            <div className="text-sm font-semibold text-slate-800">Edge Conditions</div>
            <div className="text-[11px] text-slate-400">{edge.id}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <GitBranch size={12} />
            Branch Route
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              <span className="text-slate-400">From:</span> {sourceNode?.data.name || edge.source}
            </div>
            <div>
              <span className="text-slate-400">To:</span> {targetNode?.data.name || edge.target}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <SlidersHorizontal size={15} className="text-slate-500" />
            Branch Config
          </div>

          <div className="space-y-4">
            <div>
              <Label label="Edge label" />
              <input
                type="text"
                value={edge.label || ''}
                disabled={readOnly}
                onChange={(event) => updateEdge({ label: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
                placeholder="Validation success"
              />
            </div>

            <div>
              <Label label="Branch type" />
              <div className="space-y-2">
                {EDGE_TYPE_OPTIONS.map((option) => {
                  const selected = (edge.edgeType || 'normal') === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${
                        selected ? 'border-primary bg-sky-50' : 'border-slate-200 hover:border-slate-300'
                      } ${readOnly ? 'opacity-60' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`edge_type_${edge.id}`}
                        checked={selected}
                        disabled={readOnly}
                        onChange={() => updateEdge({ edgeType: option.value })}
                        className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{option.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">{option.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label label="Transition Function" />
              <select
                value={edge.transitionFunctionId || ''}
                disabled={readOnly}
                onChange={(event) => updateEdge({ transitionFunctionId: event.target.value || undefined })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
              >
                <option value="">None</option>
                {transitionFunctions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-slate-400">Bind a transition function to explain or simulate branch routing.</div>
            </div>

            <div>
              <Label label="Condition Summary" />
              <textarea
                rows={4}
                value={edge.conditionSummary || ''}
                disabled={readOnly}
                onChange={(event) => updateEdge({ conditionSummary: event.target.value })}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
                placeholder="Example: isVerified === true && retryCount < 3"
              />
            </div>

            <div>
              <Label label="Priority" />
              <input
                type="number"
                min={1}
                value={edge.priority ?? 1}
                disabled={readOnly}
                onChange={(event) => updateEdge({ priority: Number(event.target.value) || 1 })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
              />
              <div className="mt-1 text-[11px] text-slate-400">Lower number means higher priority when multiple conditions match.</div>
            </div>

            <div>
              <Label label="Debug Rule" />
              <select
                value={edge.debugRule || ''}
                disabled={readOnly}
                onChange={(event) =>
                  updateEdge({
                    debugRule: (event.target.value || undefined) as FlowEdge['debugRule'],
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
              >
                <option value="">Auto</option>
                <option value="always">always</option>
                <option value="condition">condition</option>
                <option value="entity_collected">entity_collected</option>
                <option value="retry_exhausted">retry_exhausted</option>
              </select>
              <div className="mt-1 text-[11px] text-slate-400">Use a debug rule when you want the branch simulator to force a route on entity collection or retry exhaustion.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export type { FlowEdgeConfigProps };
