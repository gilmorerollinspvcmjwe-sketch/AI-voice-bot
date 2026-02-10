
import React, { useState } from 'react';
import { 
  Wrench, Plus, Trash2, Edit3, Volume2, MessageSquare
} from 'lucide-react';
import { BotConfiguration, AgentTool, ExtractionConfig } from '../../types';
import AgentToolModal from './agent/AgentToolModal';

interface Props {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  extractionConfigs: ExtractionConfig[];
}

export default function BotAgentConfig({ config, updateField, extractionConfigs }: Props) {
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);

  // Helper to ensure agentConfig exists
  const agentConfig = config.agentConfig || {
    tools: [],
    generalFiller: { enabled: true, type: 'TTS', content: '请稍等...' },
    functionCallModel: 'gemini-pro'
  };

  const updateAgentConfig = (updates: any) => {
    updateField('agentConfig', { ...agentConfig, ...updates });
  };

  // Tool Handlers
  const handleSaveTool = (tool: AgentTool) => {
    let newTools = [...agentConfig.tools];
    const index = newTools.findIndex(t => t.id === tool.id);
    if (index >= 0) {
      newTools[index] = tool;
    } else {
      newTools.push(tool);
    }
    updateAgentConfig({ tools: newTools });
    setIsToolModalOpen(false);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('确定删除该工具吗？')) {
      updateAgentConfig({ tools: agentConfig.tools.filter(t => t.id !== id) });
    }
  };

  const openToolModal = (tool?: AgentTool) => {
    setEditingTool(tool || null);
    setIsToolModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] bg-slate-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
      
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
         <div>
            <h3 className="font-bold text-slate-800 flex items-center">
               <Wrench size={18} className="mr-2 text-indigo-600" />
               工具调用 (Tool Calling)
            </h3>
            <p className="text-xs text-slate-500 mt-1">配置 Agent 可调用的外部能力 (Functions)。提示词请在“基础配置”中设置。</p>
         </div>
         <button 
           onClick={() => openToolModal()}
           className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center"
         >
            <Plus size={14} className="mr-1.5" /> 添加工具
         </button>
      </div>
      
      {/* TOOL LIST */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
         {agentConfig.tools.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
               <Wrench size={32} className="mb-3 opacity-20" />
               <p className="text-sm">暂无工具，请点击右上角添加</p>
            </div>
         )}

         <div className="grid grid-cols-1 gap-4">
            {agentConfig.tools.map(tool => (
               <div key={tool.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-3 bg-blue-50 text-blue-600 border border-blue-100">
                           {tool.type}
                        </span>
                        <h4 className="font-bold text-slate-800 font-mono text-sm">{tool.name}</h4>
                     </div>
                     <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openToolModal(tool)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                           <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteTool(tool.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                           <Trash2 size={14} />
                        </button>
                     </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-4 pl-1 border-l-2 border-slate-100 leading-relaxed">
                     {tool.description}
                  </p>
                  
                  {/* Response Instruction Preview */}
                  {tool.responseInstruction && (
                     <div className="mb-4 bg-blue-50/30 p-2 rounded text-[10px] text-slate-500 flex items-start">
                        <MessageSquare size={12} className="mr-2 mt-0.5 text-blue-400" />
                        <div>
                           <span className="font-bold text-slate-600">回复指引: </span>
                           {tool.responseInstruction}
                        </div>
                     </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-50">
                     {/* Parameters Preview */}
                     <div className="flex flex-wrap gap-2 pl-1">
                        {tool.parameters.length > 0 ? tool.parameters.map((p, idx) => (
                           <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-mono">
                              {p.name}<span className="opacity-50">: {p.type}</span>
                           </span>
                        )) : (
                           <span className="text-[10px] text-slate-300 italic">无参数</span>
                        )}
                     </div>

                     {/* Filler Info */}
                     {tool.executionStrategy?.playFiller && (
                        <div className="flex items-center text-[10px] text-indigo-400">
                           <Volume2 size={10} className="mr-1.5" />
                           {tool.executionStrategy.fillerType === 'TTS' ? 'TTS 播报' : '音频播放'}
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Tool Modal */}
      {isToolModalOpen && (
         <AgentToolModal 
            tool={editingTool || undefined}
            onSave={handleSaveTool}
            onClose={() => setIsToolModalOpen(false)}
            extractionConfigs={extractionConfigs}
         />
      )}

    </div>
  );
}
