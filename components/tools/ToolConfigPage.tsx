
import React, { useState, useMemo } from 'react';
import { 
  Wrench, Plus, Trash2, Edit3, Link, Settings
} from 'lucide-react';
import { AgentTool, ExtractionConfig } from '../../types';
import AgentToolModal from '../bot/agent/AgentToolModal';
import McpServerModal from '../bot/agent/McpServerModal';

// Mock extraction configs for tool creation
const MOCK_EXTRACTION_CONFIGS: ExtractionConfig[] = [
  {
    id: 'get_last_order',
    name: '查询最近订单',
    description: '根据手机号获取用户最近一笔行程信息',
    lastUpdated: Date.now(),
    params: [{ id: '1', key: 'user_phone', desc: '用户手机号' }],
    interfaceUrl: 'https://api.example.com/v1/orders/last',
    method: 'GET',
    authType: 'url',
    bodyType: 'json',
    bodyContent: '',
    responseMapping: [
      { key: 'order_id', path: '$.data.order_id' }
    ]
  }
];

// Mock initial tools
const INITIAL_TOOLS: AgentTool[] = [
  {
    id: 'tool_api_call',
    name: 'API 调用',
    description: '调用外部 API 接口获取数据',
    type: 'API',
    enabled: true,
    category: 'api_call'
  },
  {
    id: 'tool_sms',
    name: '发送短信',
    description: '向用户发送短信通知',
    type: 'SMS',
    enabled: true,
    category: 'communication'
  },
  {
    id: 'tool_query_order',
    name: '查询订单',
    description: '查询用户订单状态',
    type: 'API',
    enabled: true,
    category: 'api_call'
  },
  {
    id: 'tool_transfer',
    name: '转人工',
    description: '转接人工客服',
    type: 'TRANSFER',
    enabled: true,
    category: 'transfer'
  }
];

const CATEGORY_LABELS: Record<string, string> = {
  api_call: 'API 调用',
  communication: '通信工具',
  transfer: '转接工具',
  other: '其他工具'
};

export default function ToolConfigPage() {
  const [tools, setTools] = useState<AgentTool[]>(INITIAL_TOOLS);
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // Tool Handlers
  const handleSaveTool = (tool: AgentTool) => {
    let newTools = [...tools];
    const index = newTools.findIndex(t => t.id === tool.id);
    if (index >= 0) {
      newTools[index] = tool;
    } else {
      newTools.push(tool);
    }
    setTools(newTools);
    setIsToolModalOpen(false);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('确定删除该工具吗？')) {
      setTools(tools.filter(t => t.id !== id));
    }
  };

  const openToolModal = (tool?: AgentTool) => {
    setEditingTool(tool || null);
    setIsToolModalOpen(true);
  };

  // Group tools by category
  const groupedTools = useMemo(() => {
    const groups: Record<string, AgentTool[]> = {
      api_call: [],
      communication: [],
      transfer: [],
      other: []
    };
    
    tools.forEach(tool => {
      const category = tool.category || 'other';
      if (groups[category]) {
        groups[category].push(tool);
      } else {
        groups.other.push(tool);
      }
    });
    
    return groups;
  }, [tools]);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center">
            <Wrench size={20} className="mr-2 text-indigo-600" />
            工具配置
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            配置智能体可调用的外部能力，这些工具可在机器人配置、流程编排、问答对中绑定使用。
          </p>
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

      {/* Tool List */}
      <div className="space-y-6">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
            <Wrench size={48} className="mb-3 opacity-20" />
            <p className="text-sm">暂无工具，请点击右上角添加</p>
          </div>
        ) : (
          Object.entries(groupedTools).map(([category, categoryTools]) => 
            categoryTools.length > 0 && (
              <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-slate-700">{CATEGORY_LABELS[category] || category}</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryTools.map(tool => (
                    <div key={tool.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                          <span className="text-lg">{tool.icon || '🔧'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{tool.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              tool.enabled 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {tool.enabled ? '已启用' : '已禁用'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {tool.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {tool.id}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openToolModal(tool)} 
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTool(tool.id)} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Usage Hint */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start gap-3">
          <Settings size={16} className="text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">使用提示</h4>
            <p className="text-xs text-blue-600 mt-1">
              配置好的工具可以在以下场景使用：
            </p>
            <ul className="text-xs text-blue-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>机器人配置 - 意图技能中的工具调用节点</li>
              <li>流程编排 - Flow 步骤节点的函数绑定</li>
              <li>问答对管理 - QA 回答时触发的工具</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tool Modal */}
      {isToolModalOpen && (
        <AgentToolModal 
          tool={editingTool || undefined}
          onSave={handleSaveTool}
          onClose={() => setIsToolModalOpen(false)}
          extractionConfigs={MOCK_EXTRACTION_CONFIGS}
        />
      )}

      {/* MCP Server Modal */}
      {isMcpModalOpen && (
        <McpServerModal 
          onClose={() => setIsMcpModalOpen(false)}
          onSave={(mcpServer) => {
            // Handle MCP server save
            setIsMcpModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
