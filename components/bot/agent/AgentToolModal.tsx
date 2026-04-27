
import React, { useState, useEffect } from 'react';
import { X, Plug, Plus, Trash2, HelpCircle, MessageSquare } from 'lucide-react';
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
  responseInstruction: '',
  startSpeech: '正在为您查询，请稍候...',
  needReturn: true,
  successSpeech: '查询已完成，结果如下：',
  failureSpeech: '抱歉，查询遇到了问题，请稍后再试或联系人工客服。',
  interruptSpeech: '正在处理中，请稍候，处理完成后我会为您解答。'
};

export default function AgentToolModal({ tool, onSave, onClose, extractionConfigs }: AgentToolModalProps) {
  const [formData, setFormData] = useState<AgentTool>(tool || { ...DEFAULT_TOOL, id: Date.now().toString() });

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
            <div className="mb-4">
               <Label label="工具名称" required tooltip="LLM 将使用此名称调用工具，建议使用蛇形命名法 (e.g. query_order)" />
               <Input 
                 className="font-mono text-xs"
                 placeholder="e.g. query_order_status"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
               />
            </div>

            <div className="mb-4">
               <Label label="工具描述" required tooltip="非常重要！告诉大模型在什么场景下应该使用此工具。" />
               <textarea 
                  className="w-full h-20 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary outline-none resize-none"
                  placeholder="例如：当用户询问发货状态、物流进度或订单详情时使用此工具。需要提供订单号。"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
               />
            </div>

            {/* 接口选择 */}
            <div className="mb-4">
               <Label label="关联接口" tooltip="选择已配置好的接口方案，工具将调用此接口执行。" />
               <select 
                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white outline-none focus:border-primary"
                 value={formData.refId || ''}
                 onChange={(e) => setFormData({...formData, refId: e.target.value})}
               >
                 <option value="">不关联接口（仅作为模型能力）</option>
                 {extractionConfigs.map(config => (
                   <option key={config.id} value={config.id}>{config.name} - {config.description}</option>
                 ))}
               </select>
               {formData.refId && (
                 <p className="text-[10px] text-slate-400 mt-1">
                   已关联接口：{extractionConfigs.find(c => c.id === formData.refId)?.description || '暂无描述'}
                 </p>
               )}
            </div>

            {/* 模型使用指南 */}
            <div className="mb-4">
               <Label label="模型使用指南" tooltip="详细说明工具的使用方法、注意事项、示例等，帮助模型更好地理解和使用此工具。" />
               <textarea 
                  className="w-full h-24 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary outline-none resize-none bg-blue-50/20"
                  placeholder="例如：&#10;1. 此工具需要在获取到订单号后才能调用&#10;2. 如果用户没有提供订单号，请先询问用户&#10;3. 返回结果包含 order_status 字段，值为：pending/shipped/delivered"
                  value={formData.modelReadme || ''}
                  onChange={(e) => setFormData({...formData, modelReadme: e.target.value})}
               />
               <p className="text-[10px] text-slate-400 mt-1">给模型的详细使用说明，包括调用时机、参数要求、返回值说明等</p>
            </div>
          </section>

          {/* 2. Parameters */}
          <section>
             <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-700">参数定义</h4>
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
                         <label className="text-[10px] font-bold text-slate-500 mb-1 block">参数名</label>
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
                         <label className="text-[10px] font-bold text-slate-500 mb-1 block">描述</label>
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

          {/* 3. 工具调用话术 */}
          <section className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
             <h4 className="text-sm font-bold text-emerald-900 flex items-center mb-4">
                <MessageSquare size={16} className="mr-2" /> 工具调用话术
             </h4>
             
             <div className="space-y-4">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <Label label="工具调用开始话术" />
                   <HelpCircle size={12} className="text-slate-400" />
                 </div>
                 <textarea 
                   value={formData.startSpeech || ''}
                   onChange={(e) => setFormData({...formData, startSpeech: e.target.value})}
                   placeholder="工具开始执行时机器人说的话，如：正在为您查询，请稍候..."
                   className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:border-primary resize-none bg-white"
                   rows={2}
                 />
               </div>

               <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-emerald-200">
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-medium text-slate-700">工具是否需要返回结果</span>
                   <HelpCircle size={12} className="text-slate-400" />
                 </div>
                 <Switch 
                   label="" 
                   checked={formData.needReturn !== false}
                   onChange={(value) => setFormData({...formData, needReturn: value})}
                 />
               </div>
               <p className="text-[10px] text-emerald-600 -mt-2">关闭后，工具执行完成不会向用户汇报结果（适用于后台记录类工具）</p>

               {formData.needReturn !== false && (
                 <div className="space-y-4 animate-in fade-in">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <Label label="工具调用成功话术" />
                       <HelpCircle size={12} className="text-slate-400" />
                     </div>
                     <textarea 
                       value={formData.successSpeech || ''}
                       onChange={(e) => setFormData({...formData, successSpeech: e.target.value})}
                       placeholder="工具执行成功后的回复，如：查询已完成，结果如下："
                       className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:border-primary resize-none bg-white"
                       rows={2}
                     />
                   </div>

                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <Label label="工具调用失败话术" />
                       <HelpCircle size={12} className="text-slate-400" />
                     </div>
                     <textarea 
                       value={formData.failureSpeech || ''}
                       onChange={(e) => setFormData({...formData, failureSpeech: e.target.value})}
                       placeholder="工具执行失败后的回复，如：抱歉，查询遇到了问题..."
                       className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:border-primary resize-none bg-white"
                       rows={2}
                     />
                   </div>
                 </div>
               )}

               <div>
                 <div className="flex items-center gap-2 mb-2">
                   <Label label="调用中客户咨询回复话术" />
                   <HelpCircle size={12} className="text-slate-400" />
                 </div>
                 <textarea 
                   value={formData.interruptSpeech || ''}
                   onChange={(e) => setFormData({...formData, interruptSpeech: e.target.value})}
                   placeholder="工具执行期间，如果客户插话问问题，机器人如何回复"
                   className="w-full px-3 py-2 text-xs border border-emerald-200 rounded-lg focus:outline-none focus:border-primary resize-none bg-white"
                   rows={2}
                 />
                 <p className="text-[10px] text-emerald-600 mt-1">工具执行与对话并行，客户可在等待时继续说话</p>
               </div>
             </div>
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
