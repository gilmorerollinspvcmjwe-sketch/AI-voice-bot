// 工具配置页，承接工具与 MCP 能力资产的配置入口。
import React, { useMemo, useState } from 'react';
import { Edit3, Link, Plus, Power, Trash2, Wrench } from 'lucide-react';
import { AgentTool, ExtractionConfig } from '../../types';
import AgentToolModal from '../bot/agent/AgentToolModal';
import McpServerModal from '../bot/agent/McpServerModal';

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
    responseMapping: [{ key: 'order_id', path: '$.data.order_id' }],
  },
];

const INITIAL_TOOLS: AgentTool[] = [
  { id: 'tool_api_call', name: 'query_api', description: '调用外部接口获取数据', type: 'API', enabled: true, category: 'api_call', parameters: [] },
  { id: 'tool_sms', name: 'send_sms', description: '向用户发送短信通知', type: 'SMS', enabled: true, category: 'communication', parameters: [] },
  { id: 'tool_query_order', name: 'query_order', description: '查询用户订单状态', type: 'API', enabled: true, category: 'api_call', parameters: [] },
  { id: 'tool_transfer', name: 'transfer_call', description: '转接人工客服', type: 'TRANSFER', enabled: true, category: 'transfer', parameters: [] },
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: '全部' },
  { id: 'api_call', label: 'API' },
  { id: 'communication', label: '通信' },
  { id: 'transfer', label: '转接' },
  { id: 'other', label: '其他' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  api_call: 'API',
  communication: '通信',
  transfer: '转接',
  other: '其他',
};

export default function ToolConfigPage() {
  const [tools, setTools] = useState<AgentTool[]>(INITIAL_TOOLS);
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_OPTIONS)[number]['id']>('all');

  const handleSaveTool = (tool: AgentTool) => {
    const nextTools = [...tools];
    const index = nextTools.findIndex((item) => item.id === tool.id);
    if (index >= 0) {
      nextTools[index] = tool;
    } else {
      nextTools.push(tool);
    }
    setTools(nextTools);
    setIsToolModalOpen(false);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('确定删除该工具吗？')) {
      setTools(tools.filter((item) => item.id !== id));
    }
  };

  const toggleToolEnabled = (id: string) => {
    setTools((current) => current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  };

  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') {
      return tools;
    }
    return tools.filter((item) => (item.category || 'other') === activeCategory);
  }, [activeCategory, tools]);

  const getCountByCategory = (category: (typeof CATEGORY_OPTIONS)[number]['id']) => {
    if (category === 'all') {
      return tools.length;
    }
    return tools.filter((item) => (item.category || 'other') === category).length;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 flex items-center">
          <Wrench size={20} className="mr-2 text-indigo-600" />
          工具配置
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMcpModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center">
            <Link size={14} className="mr-1.5" />
            添加 MCP
          </button>
          <button onClick={() => { setEditingTool(null); setIsToolModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center">
            <Plus size={14} className="mr-1.5" />
            添加工具
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_OPTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveCategory(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              activeCategory === item.id ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label} {getCountByCategory(item.id)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Wrench size={40} className="mb-3 opacity-20" />
            <p className="text-sm">暂无工具</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                    <span className="text-lg">{tool.icon || '🔧'}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{tool.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{tool.type}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">{CATEGORY_LABELS[tool.category || 'other']}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 truncate">{tool.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{tool.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleToolEnabled(tool.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center ${tool.enabled ? 'text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-500 border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <Power size={12} className="mr-1" />
                    {tool.enabled ? '已启用' : '已禁用'}
                  </button>
                  <button onClick={() => { setEditingTool(tool); setIsToolModalOpen(true); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center">
                    <Edit3 size={12} className="mr-1" />
                    编辑
                  </button>
                  <button onClick={() => handleDeleteTool(tool.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-100 text-red-500 hover:bg-red-50 flex items-center">
                    <Trash2 size={12} className="mr-1" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isToolModalOpen && <AgentToolModal tool={editingTool || undefined} onSave={handleSaveTool} onClose={() => setIsToolModalOpen(false)} extractionConfigs={MOCK_EXTRACTION_CONFIGS} />}
      {isMcpModalOpen && <McpServerModal onClose={() => setIsMcpModalOpen(false)} onSave={() => setIsMcpModalOpen(false)} />}
    </div>
  );
}
