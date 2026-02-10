
import React, { useState, useEffect } from 'react';
import { X, Plug, Plus, Trash2, HelpCircle, Music, MessageSquare } from 'lucide-react';
import { AgentTool, ExtractionConfig, AgentToolParameter } from '../../../types';
import { Input, Select, Switch, Label } from '../../ui/FormComponents';

interface AgentToolModalProps {
  tool?: AgentTool;
  onSave: (tool: AgentTool) => void;
  onClose: () => void;
  extractionConfigs: ExtractionConfig[];
}

const DEFAULT_TOOL: AgentTool = {
  id: '',
  name: '',
  description: '',
  type: 'API',
  parameters: [],
  executionStrategy: {
    playFiller: true,
    fillerType: 'TTS',
    fillerContent: '正在为您查询，请稍候...'
  },
  responseInstruction: ''
};

export default function AgentToolModal({ tool, onSave, onClose, extractionConfigs }: AgentToolModalProps) {
  const [formData, setFormData] = useState<AgentTool>(tool || { ...DEFAULT_TOOL, id: Date.now().toString() });

  // When API ref changes, auto-populate parameters if empty
  const handleRefChange = (refId: string) => {
    const api = extractionConfigs.find(c => c.id === refId);
    let newParams = formData.parameters;
    
    if (api && formData.type === 'API') {
      // Auto generate params from API config
      const apiParams: AgentToolParameter[] = api.params.map(p => ({
        name: p.key,
        type: 'string', // Default assumption
        description: p.desc || `Parameter for ${p.key}`,
        required: true
      }));
      newParams = apiParams;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      refId, 
      parameters: newParams,
      // Auto-suggest name if empty
      name: prev.name || (api ? `query_${api.name}` : '')
    }));
  };

  const addParameter = () => {
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, { name: '', type: 'string', description: '', required: true }]
    }));
  };

  const updateParameter = (index: number, updates: Partial<AgentToolParameter>) => {
    const newParams = [...formData.parameters];
    newParams[index] = { ...newParams[index], ...updates };
    setFormData(prev => ({ ...prev, parameters: newParams }));
  };

  const removeParameter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name) return alert("请输入工具/函数名称");
    if (!formData.description) return alert("请输入工具描述，这对于LLM识别至关重要");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-bold text-slate-800 flex items-center">
            <Plug size={18} className="mr-2 text-primary" />
            {tool ? '编辑智能体工具' : '添加智能体工具'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. Basic Info */}
          <section>
            <div className="flex items-center space-x-4 mb-4">
               <div className="flex-1">
                  <Label label="工具类型" required />
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                     {['API'].map(t => (
                       <button
                         key={t}
                         onClick={() => setFormData(prev => ({ ...prev, type: t as any }))}
                         className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                           formData.type === t ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                         }`}
                       >
                         {t === 'API' && '外部接口 (Function Call)'}
                       </button>
                     ))}
                  </div>
               </div>
               
               {formData.type === 'API' && (
                 <div className="flex-[2]">
                    <Label label="关联 API 配置" required />
                    <Select 
                       options={[{label: '请选择...', value: ''}, ...extractionConfigs.map(c => ({label: c.name, value: c.id}))]}
                       value={formData.refId || ''}
                       onChange={(e) => handleRefChange(e.target.value)}
                    />
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <Label label="函数名称 (Function Name)" required tooltip="LLM 将使用此名称调用工具，建议使用蛇形命名法 (e.g. query_order)" />
                  <Input 
                    className="font-mono text-xs"
                    placeholder="e.g. query_order_status"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div>
                  <Label label="中文别名 (可选)" />
                  <Input 
                    placeholder="e.g. 查询订单"
                  />
               </div>
            </div>

            <div className="mb-4">
               <Label label="工具描述 (Prompt Description)" required tooltip="非常重要！告诉大模型在什么场景下应该使用此工具。" />
               <textarea 
                  className="w-full h-20 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary outline-none resize-none"
                  placeholder="例如：当用户询问发货状态、物流进度或订单详情时使用此工具。需要提供订单号。"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>

            {/* New Response Instruction */}
            <div>
               <Label label="结果回复指引 (Response Instruction)" tooltip="指导大模型在获取到接口数据后，如何向用户播报结果。可包含话术风格或必须播报的字段。" />
               <textarea 
                  className="w-full h-20 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary outline-none resize-none bg-blue-50/20"
                  placeholder="例如：请以热情的语气回复，重点播报订单状态和预计到达时间。如果订单已发货，请询问用户是否需要发送物流短信。"
                  value={formData.responseInstruction || ''}
                  onChange={(e) => setFormData({...formData, responseInstruction: e.target.value})}
               />
            </div>
          </section>

          {/* 2. Parameters */}
          <section>
             <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-700">参数定义 (JSON Schema)</h4>
                <button onClick={addParameter} className="text-xs text-primary flex items-center hover:underline">
                   <Plus size={12} className="mr-1" /> 添加参数
                </button>
             </div>
             
             {formData.parameters.length === 0 && (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded text-center text-xs text-slate-400">
                   此工具无需参数 (空)
                </div>
             )}

             <div className="space-y-3">
                {formData.parameters.map((param, idx) => (
                   <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="w-1/4">
                         <label className="text-[10px] font-bold text-slate-500 mb-1 block">参数名 (Key)</label>
                         <input 
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                            value={param.name}
                            onChange={(e) => updateParameter(idx, { name: e.target.value })}
                            placeholder="order_id"
                         />
                      </div>
                      <div className="w-1/5">
                         <label className="text-[10px] font-bold text-slate-500 mb-1 block">类型</label>
                         <select 
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                            value={param.type}
                            onChange={(e) => updateParameter(idx, { type: e.target.value })}
                         >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                         </select>
                      </div>
                      <div className="flex-1">
                         <label className="text-[10px] font-bold text-slate-500 mb-1 block">描述 (Description)</label>
                         <input 
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                            value={param.description}
                            onChange={(e) => updateParameter(idx, { description: e.target.value })}
                            placeholder="参数用途说明"
                         />
                      </div>
                      <div className="w-10 pt-5 text-center">
                         <button onClick={() => removeParameter(idx)} className="text-slate-300 hover:text-red-500">
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </section>

          {/* 3. Execution UX */}
          <section className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-indigo-900 flex items-center">
                   <Music size={16} className="mr-2" /> 执行体验 (Execution UX)
                </h4>
                <div className="flex items-center space-x-2">
                   <span className="text-xs text-indigo-700">启用防静默填充</span>
                   <Switch 
                      label="" 
                      checked={formData.executionStrategy?.playFiller || false}
                      onChange={(v) => setFormData(prev => ({ ...prev, executionStrategy: { ...prev.executionStrategy!, playFiller: v } }))}
                   />
                </div>
             </div>
             
             {formData.executionStrategy?.playFiller && (
                <div className="grid grid-cols-3 gap-4 animate-in fade-in">
                   <div>
                      <Label label="填充类型" />
                      <Select 
                         options={[{label: 'TTS 播报', value: 'TTS'}, {label: '音频文件', value: 'AUDIO'}]}
                         value={formData.executionStrategy.fillerType}
                         onChange={(e) => setFormData(prev => ({ ...prev, executionStrategy: { ...prev.executionStrategy!, fillerType: e.target.value as any } }))}
                      />
                   </div>
                   <div className="col-span-2">
                      <Label label={formData.executionStrategy.fillerType === 'TTS' ? '播报文案' : '音频 URL'} />
                      <Input 
                         value={formData.executionStrategy.fillerContent}
                         onChange={(e) => setFormData(prev => ({ ...prev, executionStrategy: { ...prev.executionStrategy!, fillerContent: e.target.value } }))}
                         placeholder={formData.executionStrategy.fillerType === 'TTS' ? "正在查询，请稍候..." : "https://..."}
                      />
                   </div>
                </div>
             )}
             <p className="text-[10px] text-indigo-400 mt-2 flex items-center">
                <HelpCircle size={10} className="mr-1" />
                当模型决定调用此工具时，系统将立即播放填充音，直到工具执行完成并生成新的回复。
             </p>
          </section>

        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-slate-600 text-sm hover:bg-white transition-colors">
            取消
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-sky-600 shadow-sm transition-colors">
            保存工具
          </button>
        </div>
      </div>
    </div>
  );
}
