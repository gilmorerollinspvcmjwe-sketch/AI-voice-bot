// 变量管理页，统一承接输入变量、State 和提取变量配置。
import React, { useMemo, useState } from 'react';
import { Database, Edit3, Lock, MessageSquare, Plus, Server, Trash2, X } from 'lucide-react';
import { BotVariable } from '../../types';

interface BotVariableConfigProps {
  variables: BotVariable[];
  onUpdate: (variables: BotVariable[]) => void;
  stateDefaults?: string;
  stateWriteRules?: string;
  onStateDefaultsChange?: (value: string) => void;
  onStateWriteRulesChange?: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

interface KeyValueItem {
  id: string;
  key: string;
  value: string;
}

interface RuleItem {
  id: string;
  key: string;
  rule: string;
}

const VARIABLE_TYPES: { label: string; value: BotVariable['type'] }[] = [
  { label: '文本', value: 'TEXT' },
  { label: '数字', value: 'NUMBER' },
  { label: '日期', value: 'DATE' },
  { label: '日期时间', value: 'DATETIME' },
  { label: '时间', value: 'TIME' },
  { label: '布尔值', value: 'BOOLEAN' },
];

const SYSTEM_VARIABLES: BotVariable[] = [
  { id: 'sys_current_date', name: 'current_date', type: 'DATE', description: '当前日期', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_current_time', name: 'current_time', type: 'TIME', description: '当前时间', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_current_datetime', name: 'current_datetime', type: 'DATETIME', description: '当前日期时间', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_user_phone', name: 'user_phone', type: 'TEXT', description: '用户电话号码', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_call_id', name: 'call_id', type: 'TEXT', description: '当前通话 ID', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_turn_count', name: 'turn_count', type: 'NUMBER', description: '当前对话轮次', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_last_user_utterance', name: 'last_user_utterance', type: 'TEXT', description: '用户上一轮发言', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_last_bot_utterance', name: 'last_bot_utterance', type: 'TEXT', description: '机器人上一轮回复', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_active_flow_id', name: 'active_flow_id', type: 'TEXT', description: '当前流程 ID', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_active_step_id', name: 'active_step_id', type: 'TEXT', description: '当前步骤 ID', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_last_function_name', name: 'last_function_name', type: 'TEXT', description: '最后调用的函数', isSystem: true, category: 'CONVERSATION', source: 'system' },
  { id: 'sys_last_function_status', name: 'last_function_status', type: 'TEXT', description: '最后函数状态', isSystem: true, category: 'CONVERSATION', source: 'system' },
];

const VARIABLE_SOURCES = [
  { label: '系统', value: 'system' },
  { label: '用户输入', value: 'user_input' },
  { label: '模型提取', value: 'extraction' },
  { label: 'API 调用', value: 'api' },
  { label: '流程写入', value: 'flow' },
];

const parseKeyValueText = (value: string): KeyValueItem[] =>
  value
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.trim())
    .map(({ line, index }) => {
      const [key, ...rest] = line.split('=');
      return { id: `default_${index}`, key: key?.trim() || '', value: rest.join('=').trim() };
    });

const serializeKeyValueText = (items: KeyValueItem[]) =>
  items
    .filter((item) => item.key.trim() || item.value.trim())
    .map((item) => `${item.key.trim()}=${item.value.trim()}`)
    .join('\n');

const parseRuleText = (value: string): RuleItem[] =>
  value
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.trim())
    .map(({ line, index }) => {
      const [key, ...rest] = line.split('->');
      return { id: `rule_${index}`, key: key?.trim() || '', rule: rest.join('->').trim() };
    });

const serializeRuleText = (items: RuleItem[]) =>
  items
    .filter((item) => item.key.trim() || item.rule.trim())
    .map((item) => `${item.key.trim()} -> ${item.rule.trim()}`)
    .join('\n');

const getTypeName = (type: string) => VARIABLE_TYPES.find((item) => item.value === type)?.label || type;
const getSourceName = (source?: string) => VARIABLE_SOURCES.find((item) => item.value === source)?.label || '自定义';
const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;

const BotVariableConfig: React.FC<BotVariableConfigProps> = ({
  variables,
  onUpdate,
  stateDefaults = '',
  stateWriteRules = '',
  onStateDefaultsChange,
  onStateWriteRulesChange,
  onSave,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'INPUT' | 'CONVERSATION' | 'EXTRACTION'>('INPUT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<BotVariable | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [formData, setFormData] = useState<Partial<BotVariable>>({
    name: '',
    type: 'TEXT',
    description: '',
    isStateful: false,
    source: 'user_input',
    defaultValue: '',
  });

  const stateDefaultItems = useMemo(() => parseKeyValueText(stateDefaults), [stateDefaults]);
  const stateRuleItems = useMemo(() => parseRuleText(stateWriteRules), [stateWriteRules]);
  const customStateVariables = useMemo(
    () => variables.filter((item) => !item.isSystem && (item.category === 'CONVERSATION' || (item.category !== 'INPUT' && item.category !== 'EXTRACTION'))),
    [variables],
  );

  const filteredVariables = useMemo(() => {
    if (activeTab === 'INPUT') {
      return variables.filter((item) => item.category === 'INPUT' || (!item.category && !item.isSystem));
    }
    if (activeTab === 'EXTRACTION') {
      return variables.filter((item) => item.category === 'EXTRACTION');
    }
    return customStateVariables;
  }, [activeTab, customStateVariables, variables]);

  const isStateTab = activeTab === 'CONVERSATION';

  const openModal = (variable?: BotVariable) => {
    if (variable) {
      setEditingVar(variable);
      setFormData({ ...variable });
      setShowAdvancedFields(Boolean(variable.source || variable.defaultValue));
    } else {
      setEditingVar(null);
      setFormData({
        name: '',
        type: 'TEXT',
        description: '',
        isStateful: isStateTab,
        source: isStateTab ? 'flow' : activeTab === 'EXTRACTION' ? 'extraction' : 'user_input',
        defaultValue: '',
      });
      setShowAdvancedFields(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVar(null);
    setShowAdvancedFields(false);
  };

  const handleSubmit = () => {
    if (!formData.name?.trim()) {
      alert('请输入变量英文名称');
      return;
    }

    if (editingVar) {
      onUpdate(
        variables.map((item) =>
          item.id === editingVar.id
            ? ({ ...item, ...formData, name: formData.name?.trim(), description: formData.description || '' } as BotVariable)
            : item,
        ),
      );
    } else {
      onUpdate([
        ...variables,
        {
          id: Date.now().toString(),
          name: formData.name.trim(),
          type: (formData.type || 'TEXT') as BotVariable['type'],
          description: formData.description || '',
          isSystem: false,
          category: activeTab,
          source: (formData.source || (isStateTab ? 'flow' : 'user_input')) as BotVariable['source'],
          isStateful: formData.isStateful ?? isStateTab,
          defaultValue: formData.defaultValue || '',
        },
      ]);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除该变量吗？')) {
      onUpdate(variables.filter((item) => item.id !== id));
    }
  };

  const updateDefaultItems = (updater: (items: KeyValueItem[]) => KeyValueItem[]) => {
    onStateDefaultsChange?.(serializeKeyValueText(updater(stateDefaultItems)));
  };

  const updateRuleItems = (updater: (items: RuleItem[]) => RuleItem[]) => {
    onStateWriteRulesChange?.(serializeRuleText(updater(stateRuleItems)));
  };

  const renderRows = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500">名称</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500">类型</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500">说明</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500">来源</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500">状态</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredVariables.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-800 font-mono">{item.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{getTypeName(item.type)}</td>
              <td className="px-6 py-4 text-sm text-slate-500">{item.description || '-'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{getSourceName(item.source)}</td>
              <td className="px-6 py-4">
                <span className={`text-[10px] px-2 py-1 rounded ${item.isStateful ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {item.isStateful ? '跨轮保留' : '当前会话'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openModal(item)} className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
                    <Edit3 size={12} className="mr-1" />
                    编辑
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 flex items-center">
                    <Trash2 size={12} className="mr-1" />
                    删除
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredVariables.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                暂无配置
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 space-x-8 bg-white/50 px-4 -mx-4">
        {[
          { id: 'INPUT', label: '输入', icon: Server },
          { id: 'CONVERSATION', label: 'State', icon: MessageSquare },
          { id: 'EXTRACTION', label: '提取', icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {isStateTab && (
        <div className="space-y-4">
          <div className="bg-white rounded border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-slate-800">系统内置</div>
              <span className="text-xs text-slate-400">{SYSTEM_VARIABLES.length} 个</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SYSTEM_VARIABLES.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-800 font-mono">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">{getTypeName(item.type)}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">默认值</div>
                <button onClick={() => updateDefaultItems((items) => [...items, { id: createId('default'), key: '', value: '' }])} className="px-2.5 py-1.5 text-xs font-bold text-primary bg-sky-50 rounded-lg hover:bg-sky-100 flex items-center">
                  <Plus size={12} className="mr-1" />
                  添加
                </button>
              </div>
              <div className="space-y-2">
                {stateDefaultItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input value={item.key} onChange={(e) => updateDefaultItems((items) => items.map((current) => (current.id === item.id ? { ...current, key: e.target.value } : current)))} placeholder="state_key" className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary font-mono" />
                    <input value={item.value} onChange={(e) => updateDefaultItems((items) => items.map((current) => (current.id === item.id ? { ...current, value: e.target.value } : current)))} placeholder="default_value" className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary font-mono" />
                    <button onClick={() => updateDefaultItems((items) => items.filter((current) => current.id !== item.id))} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {stateDefaultItems.length === 0 && <div className="text-xs text-slate-400 py-5 text-center border border-dashed border-slate-200 rounded-lg">暂无默认值</div>}
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">写入规则</div>
                <button onClick={() => updateRuleItems((items) => [...items, { id: createId('rule'), key: '', rule: '' }])} className="px-2.5 py-1.5 text-xs font-bold text-primary bg-sky-50 rounded-lg hover:bg-sky-100 flex items-center">
                  <Plus size={12} className="mr-1" />
                  添加
                </button>
              </div>
              <div className="space-y-2">
                {stateRuleItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input value={item.key} onChange={(e) => updateRuleItems((items) => items.map((current) => (current.id === item.id ? { ...current, key: e.target.value } : current)))} placeholder="state_key" className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary font-mono" />
                    <input value={item.rule} onChange={(e) => updateRuleItems((items) => items.map((current) => (current.id === item.id ? { ...current, rule: e.target.value } : current)))} placeholder="write_rule" className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary" />
                    <button onClick={() => updateRuleItems((items) => items.filter((current) => current.id !== item.id))} className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {stateRuleItems.length === 0 && <div className="text-xs text-slate-400 py-5 text-center border border-dashed border-slate-200 rounded-lg">暂无写入规则</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm font-bold text-slate-800">{isStateTab ? '自定义 State' : activeTab === 'INPUT' ? '输入变量' : '提取变量'}</div>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-600 transition-all flex items-center shadow-sm">
          <Plus size={16} className="mr-2" />
          {isStateTab ? '添加 State' : activeTab === 'INPUT' ? '添加输入变量' : '添加提取变量'}
        </button>
      </div>

      {renderRows()}

      <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100">
        <button onClick={onSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
          保存配置
        </button>
        <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
          取消
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-[520px] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingVar ? '编辑变量' : isStateTab ? '添加 State' : activeTab === 'INPUT' ? '添加输入变量' : '添加提取变量'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>变量英文名
                </label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono" placeholder="booking_reference" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <span className="text-red-500 mr-1">*</span>类型
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white" value={formData.type || 'TEXT'} onChange={(e) => setFormData({ ...formData, type: e.target.value as BotVariable['type'] })}>
                    {VARIABLE_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-slate-50">
                    <span className="text-sm text-slate-700">跨轮保留</span>
                    <input type="checkbox" checked={formData.isStateful ?? false} onChange={(e) => setFormData({ ...formData, isStateful: e.target.checked })} className="rounded border-slate-300" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">说明</label>
                <textarea className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm h-20 resize-none" placeholder="用途说明" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div>
                <button onClick={() => setShowAdvancedFields((value) => !value)} className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                  {showAdvancedFields ? '收起更多设置' : '更多设置'}
                </button>
              </div>

              {showAdvancedFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">来源</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white" value={formData.source || 'user_input'} onChange={(e) => setFormData({ ...formData, source: e.target.value as BotVariable['source'] })}>
                      {VARIABLE_SOURCES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">默认值</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono" placeholder="可选" value={formData.defaultValue || ''} onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded text-slate-600 text-sm font-medium hover:bg-white transition-colors">
                取消
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-sky-600 transition-colors">
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotVariableConfig;
