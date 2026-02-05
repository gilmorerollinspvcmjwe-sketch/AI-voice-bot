
import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { IntentNode, LabelGroup } from '../../../../types';
import { Label, Select } from '../../../ui/FormComponents';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
  availableNodes?: { label: string; value: string }[];
  labelGroups?: LabelGroup[]; // Receive global labels
}

const LogicConfig: React.FC<Props> = ({ node, onChange, availableNodes = [], labelGroups = [] }) => {
  // 5. Condition
  if (node.subType === 'condition') {
    return (
      <div className="space-y-4">
        {(node.config?.expressions || []).map((expr: any, idx: number) => (
          <div key={idx} className="p-3 bg-amber-50 border border-amber-100 rounded text-xs space-y-2 relative">
            <input 
              className="w-full px-2 py-1 bg-white border border-amber-200 rounded font-bold text-amber-800"
              placeholder="分支名称"
              value={expr.name}
              onChange={(e) => {
                const newExprs = [...(node.config?.expressions || [])];
                newExprs[idx] = { ...expr, name: e.target.value };
                onChange({ expressions: newExprs });
              }}
            />
            <textarea 
              className="w-full h-16 px-2 py-1 bg-white border border-amber-200 rounded resize-none font-mono text-slate-600"
              placeholder="JS表达式 (如: age > 18)"
              value={expr.logic}
              onChange={(e) => {
                const newExprs = [...(node.config?.expressions || [])];
                newExprs[idx] = { ...expr, logic: e.target.value };
                onChange({ expressions: newExprs });
              }}
            />
            {/* Target Node Selector for Branch */}
            <div className="flex items-center space-x-2 pt-1 border-t border-amber-200/50">
               <span className="text-[10px] text-amber-700 font-bold whitespace-nowrap">跳转至:</span>
               <select 
                  className="flex-1 px-2 py-1 text-[10px] border border-amber-200 rounded bg-white outline-none"
                  value={expr.targetNodeId || ''}
                  onChange={(e) => {
                    const newExprs = [...(node.config?.expressions || [])];
                    newExprs[idx] = { ...expr, targetNodeId: e.target.value };
                    onChange({ expressions: newExprs });
                  }}
               >
                  <option value="">-- 选择节点 --</option>
                  {availableNodes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
               </select>
            </div>

            <button 
              onClick={() => {
                const newExprs = (node.config?.expressions || []).filter((_: any, i: number) => i !== idx);
                onChange({ expressions: newExprs });
              }}
              className="absolute top-1 right-1 text-amber-300 hover:text-red-500"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={() => {
            const newExpr = { id: Date.now().toString(), name: '新分支', logic: '' };
            onChange({ expressions: [...(node.config?.expressions || []), newExpr] });
          }}
          className="w-full py-1.5 border border-dashed border-amber-300 rounded text-xs text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center"
        >
          <Plus size={12} className="mr-1" /> 添加条件分支
        </button>
      </div>
    );
  }

  // 6. Set Variable
  if (node.subType === 'set_variable') {
    return (
      <div className="space-y-3">
        <div className="flex space-x-2 text-[10px] text-slate-500 font-bold px-1">
          <span className="flex-1">变量名</span>
          <span className="w-16">操作</span>
          <span className="flex-1">值</span>
        </div>
        {(node.config?.operations || []).map((op: any, idx: number) => (
          <div key={idx} className="flex space-x-1 items-center">
            <input 
              className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded"
              placeholder="var_name"
              value={op.variableId}
              onChange={(e) => {
                const newOps = [...(node.config?.operations || [])];
                newOps[idx] = { ...op, variableId: e.target.value };
                onChange({ operations: newOps });
              }}
            />
            <select 
              className="w-16 px-1 py-1.5 text-xs border border-gray-200 rounded bg-white"
              value={op.type}
              onChange={(e) => {
                const newOps = [...(node.config?.operations || [])];
                newOps[idx] = { ...op, type: e.target.value };
                onChange({ operations: newOps });
              }}
            >
              <option value="SET">=</option>
              <option value="ADD">+</option>
              <option value="SUBTRACT">-</option>
            </select>
            <input 
              className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-gray-200 rounded"
              placeholder="value"
              value={op.value}
              onChange={(e) => {
                const newOps = [...(node.config?.operations || [])];
                newOps[idx] = { ...op, value: e.target.value };
                onChange({ operations: newOps });
              }}
            />
            <button 
              onClick={() => {
                const newOps = (node.config?.operations || []).filter((_: any, i: number) => i !== idx);
                onChange({ operations: newOps });
              }}
              className="text-slate-300 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button 
          onClick={() => {
            const newOp = { variableId: '', type: 'SET', value: '' };
            onChange({ operations: [...(node.config?.operations || []), newOp] });
          }}
          className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-slate-500 hover:text-primary hover:border-primary transition-colors flex items-center justify-center mt-2"
        >
          <Plus size={12} className="mr-1" /> 添加操作
        </button>
      </div>
    );
  }

  // 7. Tag (New)
  if (node.subType === 'tag') {
    const allTags = labelGroups.flatMap(g => g.tags.map(t => ({ label: `${g.name}: ${t.name}`, value: t.name })));
    
    return (
      <>
        <Select 
          label="动作"
          options={[{label: '添加标签', value: 'ADD'}, {label: '移除标签', value: 'REMOVE'}]}
          value={node.config?.action || 'ADD'}
          onChange={(e) => onChange({ action: e.target.value })}
        />
        <Label label="选择标签" />
        <select 
           className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white outline-none"
           value={node.config?.tags?.[0] || ''}
           onChange={(e) => onChange({ tags: [e.target.value] })}
        >
           <option value="">请选择标签...</option>
           {allTags.map((t, i) => <option key={i} value={t.value}>{t.label}</option>)}
        </select>
        {allTags.length === 0 && <div className="text-[10px] text-amber-500 mt-1">请先在“业务分析”中配置标签组。</div>}
      </>
    );
  }

  // 9. Script
  if (node.subType === 'script') {
    return (
      <>
        <Select 
          label="语言"
          options={['javascript', 'python']}
          value={node.config?.language || 'javascript'}
          onChange={(e) => onChange({ language: e.target.value })}
        />
        <Label label="代码内容" />
        <textarea 
          className="w-full h-64 px-3 py-2 text-xs border border-gray-200 rounded resize-none focus:border-primary outline-none font-mono bg-slate-900 text-green-400"
          value={node.config?.code || ''}
          onChange={(e) => onChange({ code: e.target.value })}
          spellCheck={false}
        />
      </>
    );
  }

  return null;
};

export default LogicConfig;
