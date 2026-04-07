
import React from 'react';
import { Plus, X, Wrench, Code } from 'lucide-react';
import { IntentNode, ModelType, AgentTool, FlowFunction, BUILT_IN_FUNCTIONS } from '../../../../types';
import { Label, Select, Slider } from '../../../ui/FormComponents';
import SimpleErrorHandling from './SimpleErrorHandling';
import PromptEditor from '../../../ui/PromptEditor';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
  availableNodes?: { label: string; value: string }[];
  availableTools?: AgentTool[];
  availableFunctions?: FlowFunction[];
}

const CognitiveConfig: React.FC<Props> = ({ node, onChange, availableNodes = [], availableTools = [], availableFunctions = [] }) => {
  const selectedToolIds = node.config?.toolIds || [];
  const selectedFunctionIds = node.config?.functionIds || [];

  const allFunctions = [...BUILT_IN_FUNCTIONS, ...(availableFunctions || [])];

  const handleToolToggle = (toolId: string) => {
    const newToolIds = selectedToolIds.includes(toolId)
      ? selectedToolIds.filter(id => id !== toolId)
      : [...selectedToolIds, toolId];
    onChange({ toolIds: newToolIds });
  };

  const handleFunctionToggle = (functionId: string) => {
    const newFunctionIds = selectedFunctionIds.includes(functionId)
      ? selectedFunctionIds.filter(id => id !== functionId)
      : [...selectedFunctionIds, functionId];
    onChange({ functionIds: newFunctionIds });
  };

  // 3. LLM
  if (node.subType === 'llm') {
    return (
      <>
        <Select
          label="模型选择"
          options={Object.values(ModelType) as string[]}
          value={node.config?.modelType || ModelType.GEMINI_FLASH}
          onChange={(e) => onChange({ modelType: e.target.value })}
        />
        <div>
          <Label label="系统提示词 (System Prompt)" />
          <PromptEditor
            value={node.config?.systemPrompt || ''}
            onChange={(v) => onChange({ systemPrompt: v })}
            placeholder="设定此节点的具体人设和行为规范..."
            availableTools={availableTools}
            availableFunctions={allFunctions}
            height="h-40"
          />
        </div>
        <Slider
          label="随机性 (Temperature)"
          min={0} max={1} step={0.1}
          value={node.config?.temperature ?? 0.7}
          onChange={(v) => onChange({ temperature: v })}
        />

        {/* Tool Binding */}
        <div className="pt-4 border-t border-gray-100">
          <Label label="绑定工具 (Tools)" tooltip="绑定后可在提示词中用 / 引用，LLM 会根据上下文决定是否调用" />
          <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-100">
            {availableTools.length > 0 ? availableTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleToolToggle(tool.id)}
                className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                  selectedToolIds.includes(tool.id)
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-slate-600 hover:border-primary'
                }`}
              >
                <Wrench size={10} />
                {tool.name}
                {selectedToolIds.includes(tool.id) && (
                  <X size={10} className="ml-1" />
                )}
              </button>
            )) : (
              <p className="text-xs text-slate-400 py-2 px-3">暂无工具，请在「智能体配置」中添加工具</p>
            )}
          </div>
          {selectedToolIds.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-1">
              已选择 {selectedToolIds.length} 个工具，绑定后可调用外部 API
            </p>
          )}
        </div>

        {/* Code Block Binding */}
        <div className="pt-4 border-t border-gray-100">
          <Label label="绑定代码块 (Code Blocks)" tooltip="类似 Poly.ai 的 Transition Functions，可在提示词中用 / 引用，控制流程跳转" />
          <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded border border-slate-100">
            {allFunctions.map(fn => {
              const isSelected = selectedFunctionIds.includes(fn.id);
              return (
                <button
                  key={fn.id}
                  onClick={() => handleFunctionToggle(fn.id)}
                  className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  <Code size={10} />
                  {fn.name}
                  {fn.isBuiltIn && (
                    <span className="px-1 py-0.5 bg-amber-400/20 text-amber-600 text-[8px] rounded">内置</span>
                  )}
                  {isSelected && (
                    <X size={10} className="ml-1" />
                  )}
                </button>
              );
            })}
          </div>
          {selectedFunctionIds.length > 0 && (
            <p className="text-[10px] text-slate-400 mt-1">
              已选择 {selectedFunctionIds.length} 个代码块
            </p>
          )}
        </div>

        {/* Selected Code Blocks Preview */}
        {selectedFunctionIds.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <Label label="代码块代码预览" />
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {selectedFunctionIds.map(id => {
                const fn = allFunctions.find(f => f.id === id);
                if (!fn || !fn.code) return null;
                return (
                  <div key={id} className="bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{fn.name}</span>
                      {fn.isBuiltIn && <span className="text-[8px] px-1 py-0.5 bg-amber-400/20 text-amber-400 rounded">内置</span>}
                    </div>
                    <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto">
                      <code>{fn.code}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Few-shot Examples */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Label label="Few-shot 示例" />
            <button
              onClick={() => {
                const examples = node.config?.fewShotExamples || [];
                onChange({
                  fewShotExamples: [...examples, { input: '', output: '' }]
                });
              }}
              className="text-xs text-primary hover:text-primary/80 flex items-center"
            >
              <Plus size={12} className="mr-1" /> 添加示例
            </button>
          </div>
          {(node.config?.fewShotExamples || []).map((example: { input: string; output: string }, idx: number) => (
            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-100 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500">示例 {idx + 1}</span>
                <button
                  onClick={() => {
                    const examples = (node.config?.fewShotExamples || []).filter((_: any, i: number) => i !== idx);
                    onChange({ fewShotExamples: examples });
                  }}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
              <textarea
                className="w-full h-12 px-2 py-1.5 text-xs border border-gray-200 rounded resize-none mb-2"
                placeholder="用户输入..."
                value={example.input}
                onChange={(e) => {
                  const examples = [...(node.config?.fewShotExamples || [])];
                  examples[idx] = { ...examples[idx], input: e.target.value };
                  onChange({ fewShotExamples: examples });
                }}
              />
              <textarea
                className="w-full h-12 px-2 py-1.5 text-xs border border-gray-200 rounded resize-none"
                placeholder="期望回复..."
                value={example.output}
                onChange={(e) => {
                  const examples = [...(node.config?.fewShotExamples || [])];
                  examples[idx] = { ...examples[idx], output: e.target.value };
                  onChange({ fewShotExamples: examples });
                }}
              />
            </div>
          ))}
        </div>

        {/* Error Handling */}
        <div className="pt-4 border-t border-gray-100">
          <SimpleErrorHandling
            label="节点执行异常时跳转至"
            tooltip="异常包括API调用失败、响应超时、返回空内容等"
            value={node.config?.onErrorNodeId || ''}
            onChange={(value) => onChange({ onErrorNodeId: value })}
            availableNodes={availableNodes}
          />
        </div>
      </>
    );
  }

  // 4. Collect
  if (node.subType === 'collect') {
    return (
      <>
        <Select 
          label="收集类型"
          options={[
            {label: '意图 (Intent)', value: 'intent'},
            {label: '槽位 (Slot)', value: 'slot'},
            {label: '按键 (DTMF)', value: 'dtmf'}
          ]}
          value={node.config?.collectType || 'intent'}
          onChange={(e) => onChange({ collectType: e.target.value })}
        />
        
        {node.config?.collectType === 'slot' && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
            槽位收集将尝试从用户输入中提取指定变量。
          </div>
        )}

        {node.config?.collectType === 'dtmf' && (
          <>
            <Label label="最大位数" />
            <input 
              type="number"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
              value={node.config?.dtmfConfig?.maxDigits || 1}
              onChange={(e) => onChange({ 
                dtmfConfig: { 
                  ...(node.config?.dtmfConfig || {}), 
                  maxDigits: parseInt(e.target.value) 
                } 
              })}
            />
          </>
        )}

        {/* Error Handling */}
        <div className="pt-4 border-t border-gray-100">
          <SimpleErrorHandling
            label="收集异常时跳转至"
            tooltip="包括用户未响应超时、语音识别失败、用户打断等"
            value={node.config?.onCollectErrorNodeId || ''}
            onChange={(value) => onChange({ onCollectErrorNodeId: value })}
            availableNodes={availableNodes}
          />
        </div>
      </>
    );
  }

  return null;
};

export default CognitiveConfig;
