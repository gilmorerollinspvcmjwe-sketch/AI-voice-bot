// 工具配置页，承接工具与 MCP 能力资产的配置入口。
import React, { useMemo, useState } from 'react';
import { Edit3, Link, Plus, Power, Search, Trash2, Wrench } from 'lucide-react';
import { AgentTool, BotConfiguration, BotVariable, ExtractionConfig } from '../../types';
import AgentToolModal from '../bot/agent/AgentToolModal';
import McpServerModal from '../bot/agent/McpServerModal';
import GeoLocationToolConfig from './GeoLocationToolConfig';

const MOCK_EXTRACTION_CONFIGS: ExtractionConfig[] = [
  {
    id: 'get_last_order',
    name: '查询最近订单',
    description: '根据手机号获取用户最近一笔行程信息',
    lastUpdated: Date.now(),
    params: [{ id: '1', key: 'user_phone', desc: '用户手机号', source: 'variable' }],
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
  { id: 'tool_geo_location', name: 'query_location', description: '查询地理位置信息（门店、网点等）', type: 'CUSTOM', enabled: true, category: 'other', icon: '📍', parameters: [] },
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

interface ToolConfigPageProps {
  bots?: BotConfiguration[];
}

export default function ToolConfigPage({ bots = [] }: ToolConfigPageProps) {
  const [tools, setTools] = useState<AgentTool[]>(INITIAL_TOOLS);
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORY_OPTIONS)[number]['id']>('all');
  const [keyword, setKeyword] = useState('');

  const availableVariables = useMemo<BotVariable[]>(() => {
    const uniqueVariables = new Map<string, BotVariable>();

    bots.forEach((bot) => {
      (bot.variables || []).forEach((variable) => {
        const key = `${variable.name}|${variable.type}|${variable.description || ''}`;
        if (!uniqueVariables.has(key)) {
          uniqueVariables.set(key, {
            ...variable,
            id: `${bot.id}:${variable.id}`,
          });
        }
      });
    });

    return Array.from(uniqueVariables.values());
  }, [bots]);

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
    const normalizedKeyword = keyword.trim().toLowerCase();
    return tools.filter((item) => {
      const matchesCategory = activeCategory === 'all' || (item.category || 'other') === activeCategory;
      const matchesKeyword = !normalizedKeyword || [item.name, item.description, item.type, item.id, CATEGORY_LABELS[item.category || 'other']]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
      return matchesCategory && matchesKeyword;
    });
  }, [activeCategory, keyword, tools]);

  const getCountByCategory = (category: (typeof CATEGORY_OPTIONS)[number]['id']) => {
    if (category === 'all') {
      return tools.length;
    }
    return tools.filter((item) => (item.category || 'other') === category).length;
  };

  return (
    <div className="px-[var(--layout-content-padding-x)] py-[var(--layout-content-padding-y)] max-w-[var(--layout-panel-max-width)] mx-auto w-full space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[var(--typography-size-headline)] font-bold text-[var(--color-semantic-text-primary)] tracking-tight flex items-center">
            <Wrench size={22} className="mr-2 text-[var(--color-semantic-primary)]" />
            工具配置
          </h1>
          <p className="text-sm text-[var(--color-semantic-text-tertiary)] mt-1">管理语音 Agent 可调用的 API、短信、转接和 MCP 能力。</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMcpModalOpen(true)} className="h-[var(--component-button-height-md)] px-4 bg-[var(--color-semantic-success)] text-white rounded-[var(--component-button-radius)] text-sm font-semibold hover:bg-[var(--color-green-700)] shadow-[var(--shadow-xs)] flex items-center">
            <Link size={15} className="mr-1.5" />
            添加 MCP
          </button>
          <button onClick={() => { setEditingTool(null); setIsToolModalOpen(true); }} className="h-[var(--component-button-height-md)] px-4 bg-[var(--color-semantic-primary)] text-white rounded-[var(--component-button-radius)] text-sm font-semibold hover:bg-[var(--color-semantic-primary-hover)] shadow-[var(--shadow-xs)] flex items-center">
            <Plus size={15} className="mr-1.5" />
            添加工具
          </button>
        </div>
      </div>

      <section className="bg-[var(--color-semantic-bg-surface)] rounded-[var(--component-card-radius)] border border-[var(--color-semantic-border-default)] shadow-[var(--shadow-xs)] overflow-hidden">
        <div className="min-h-[var(--component-filter-toolbar-height)] px-4 py-3 border-b border-[var(--color-semantic-border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[var(--component-search-width-md)] max-w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-semantic-text-placeholder)]" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full h-[var(--component-search-height)] pl-9 pr-3 rounded-[var(--component-search-radius)] border border-[var(--color-semantic-border-default)] bg-[var(--color-semantic-bg-surface)] text-sm outline-none hover:border-[var(--color-semantic-border-strong)] focus:border-[var(--color-semantic-border-focus)]"
                placeholder="搜索工具名称 / 类型 / ID"
              />
            </div>
            <div className="flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-semantic-bg-subtle)] p-1">
              {CATEGORY_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`h-8 px-3 rounded-[var(--radius-md)] text-xs font-semibold transition-colors ${
                    activeCategory === item.id ? 'bg-[var(--color-semantic-bg-surface)] text-[var(--color-semantic-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--color-semantic-text-tertiary)] hover:text-[var(--color-semantic-text-primary)]'
                  }`}
                >
                  {item.label} {getCountByCategory(item.id)}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-[var(--color-semantic-text-tertiary)]">当前展示 {filteredTools.length} 个工具</span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-semantic-text-tertiary)]">
            <Wrench size={40} className="mb-3 opacity-20" />
            <p className="text-sm font-semibold text-[var(--color-semantic-text-secondary)]">暂无匹配工具</p>
            <p className="text-xs mt-1">请清空搜索条件，或添加一个新工具。</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--component-table-border)]">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="min-h-[var(--density-default-row)] flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--color-semantic-bg-row-hover)] transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 bg-[var(--color-semantic-bg-surface)] rounded-[var(--radius-control)] flex items-center justify-center border border-[var(--color-semantic-border-default)] shadow-[var(--shadow-xs)] shrink-0">
                    <span className="text-lg">{tool.icon || '🔧'}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-semantic-text-primary)]">{tool.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-[var(--component-badge-radius)] bg-[var(--color-semantic-bg-subtle)] text-[var(--color-semantic-text-tertiary)] border border-[var(--color-semantic-border-subtle)]">{tool.type}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-[var(--component-badge-radius)] bg-[var(--color-semantic-primary-soft)] text-[var(--color-semantic-primary-text)] border border-[var(--color-blue-100)]">{CATEGORY_LABELS[tool.category || 'other']}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-[var(--component-badge-radius)] border ${tool.enabled ? 'bg-[var(--color-semantic-success-soft)] text-[var(--color-semantic-success)] border-[var(--color-green-100)]' : 'bg-[var(--color-semantic-bg-subtle)] text-[var(--color-semantic-text-tertiary)] border-[var(--color-semantic-border-subtle)]'}`}>{tool.enabled ? '已启用' : '已禁用'}</span>
                    </div>
                    <div className="text-xs text-[var(--color-semantic-text-secondary)] mt-1 truncate max-w-2xl" title={tool.description}>{tool.description}</div>
                    <div className="text-[11px] text-[var(--color-semantic-text-placeholder)] font-mono mt-1">{tool.id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleToolEnabled(tool.id)} className={`h-8 px-3 rounded-[var(--radius-md)] text-xs font-semibold border flex items-center transition-colors ${tool.enabled ? 'text-[var(--color-semantic-success)] border-[var(--color-green-100)] bg-[var(--color-semantic-success-soft)] hover:bg-[var(--color-green-100)]' : 'text-[var(--color-semantic-text-tertiary)] border-[var(--color-semantic-border-default)] bg-white hover:bg-[var(--state-hover-bg)]'}`}>
                    <Power size={12} className="mr-1" />
                    {tool.enabled ? '停用' : '启用'}
                  </button>
                  <button onClick={() => {
                    if (tool.id === 'tool_geo_location') {
                      setIsGeoModalOpen(true);
                    } else {
                      setEditingTool(tool);
                      setIsToolModalOpen(true);
                    }
                  }} className="h-8 px-3 rounded-[var(--radius-md)] text-xs font-semibold border border-[var(--color-semantic-border-default)] text-[var(--color-semantic-text-secondary)] hover:bg-[var(--state-hover-bg)] flex items-center transition-colors">
                    <Edit3 size={12} className="mr-1" />
                    编辑
                  </button>
                  <button onClick={() => handleDeleteTool(tool.id)} className="h-8 px-3 rounded-[var(--radius-md)] text-xs font-semibold border border-[var(--color-red-100)] text-[var(--color-semantic-danger)] hover:bg-[var(--color-semantic-danger-soft)] flex items-center transition-colors">
                    <Trash2 size={12} className="mr-1" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isToolModalOpen && (
        <AgentToolModal
          tool={editingTool || undefined}
          onSave={handleSaveTool}
          onClose={() => setIsToolModalOpen(false)}
          extractionConfigs={MOCK_EXTRACTION_CONFIGS}
          availableVariables={availableVariables}
        />
      )}
      {isMcpModalOpen && <McpServerModal onClose={() => setIsMcpModalOpen(false)} onSave={() => setIsMcpModalOpen(false)} />}
      {isGeoModalOpen && <GeoLocationToolConfig onClose={() => setIsGeoModalOpen(false)} />}
    </div>
  );
}
