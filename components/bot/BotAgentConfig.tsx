import React, { useState, useMemo } from 'react';
import { 
  Wrench, Plus, Trash2, Edit3, Volume2, MessageSquare, Zap
} from 'lucide-react';
import { BotConfiguration, AgentTool, ExtractionConfig } from '../../types';
import AgentToolModal from './agent/AgentToolModal';
import ToolCategorySection from './agent/ToolCategorySection';
import QuickAddToolPanel from './agent/QuickAddToolPanel';
import { getAllPresetTools, getPresetToolConfig } from '../../services/presetTools';

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

  // Quick add tool handler
  const handleQuickAddTool = (presetId: string) => {
    const presetTool = getPresetToolConfig(presetId);
    if (presetTool) {
      openToolModal(presetTool);
    }
  };

  // Group tools by category
  const groupedTools = useMemo(() => {
    const groups: Record<string, AgentTool[]> = {
      api_call: [],
      communication: [],
      transfer: [],
      other: []
    };
    
    agentConfig.tools.forEach(tool => {
      const category = tool.category || 'other';
      if (groups[category]) {
        groups[category].push(tool);
      }
    });
    
    return groups;
  }, [agentConfig.tools]);

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] bg-slate-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
      
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
         <div>
            <h3 className="font-bold text-slate-800 flex items-center">
               <Wrench size={18} className="mr-2 text-indigo-600" />
               工具调用
            </h3>
            <p className="text-xs text-slate-500 mt-1">配置智能体可调用的外部能力。提示词请在"基础配置"中设置。</p>
         </div>
         <button 
           onClick={() => openToolModal()}
           className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center"
         >
            <Plus size={14} className="mr-1.5" /> 添加工具
         </button>
      </div>
      
      {/* TOOL LIST */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
        {agentConfig.tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Wrench size={32} className="mb-3 opacity-20" />
            <p className="text-sm">暂无工具，请点击右上角添加或使用下方快速添加</p>
          </div>
        ) : (
          // Category Sections
          <div>
            {Object.entries(groupedTools).map(([category, tools]) => 
              tools.length > 0 && (
                <ToolCategorySection
                  key={category}
                  category={category}
                  tools={tools}
                  onEditTool={openToolModal}
                  onDeleteTool={handleDeleteTool}
                />
              )
            )}
          </div>
        )}

        {/* Quick Add Panel */}
        <QuickAddToolPanel onAddTool={handleQuickAddTool} />
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
