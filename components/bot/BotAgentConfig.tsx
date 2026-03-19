import React, { useState, useMemo } from 'react';
import { 
  Wrench, Plus, Trash2, Edit3, Volume2, MessageSquare, Zap, Link
} from 'lucide-react';
import { BotConfiguration, AgentTool, ExtractionConfig } from '../../types';
import AgentToolModal from './agent/AgentToolModal';
import McpServerModal from './agent/McpServerModal';
// import ToolCategorySection from './agent/ToolCategorySection';
// import QuickAddToolPanel from './agent/QuickAddToolPanel';
// import { getAllPresetTools, getPresetToolConfig } from '../../services/presetTools';

interface Props {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  extractionConfigs: ExtractionConfig[];
}

export default function BotAgentConfig({ config, updateField, extractionConfigs }: Props) {
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Helper to ensure agentConfig exists
  const agentConfig = config.agentConfig || {
    tools: [],
    mcpServers: [], // MCP 服务器列表
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
    // const presetTool = getPresetToolConfig(presetId);
    // if (presetTool) {
    //   openToolModal(presetTool);
    // }
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
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMcpModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center"
              title="添加 MCP 服务器"
            >
               <Link size={14} className="mr-1.5" /> 添加 MCP
            </button>
            <button 
              onClick={() => openToolModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center"
            >
               <Plus size={14} className="mr-1.5" /> 添加工具
            </button>
         </div>
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
                // <ToolCategorySection
                //   key={category}
                //   category={category}
                //   tools={tools}
                //   onEditTool={openToolModal}
                //   onDeleteTool={handleDeleteTool}
                // />
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">{category}</h3>
                  {tools.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-slate-200">
                          <span className="text-sm">{tool.icon || '🔧'}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{tool.name}</div>
                          <div className="text-[10px] text-slate-500">{tool.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openToolModal(tool)} className="text-slate-400 hover:text-primary">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteTool(tool.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* Quick Add Panel */}
        {/* <QuickAddToolPanel onAddTool={handleQuickAddTool} /> */}
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

      {/* MCP Server Modal */}
      {isMcpModalOpen && (
         <McpServerModal 
            onClose={() => setIsMcpModalOpen(false)}
            onSave={(mcpServer) => {
              const newServers = [...(agentConfig.mcpServers || []), mcpServer];
              updateAgentConfig({ mcpServers: newServers });
              setIsMcpModalOpen(false);
            }}
         />
      )}

    </div>
  );
}
