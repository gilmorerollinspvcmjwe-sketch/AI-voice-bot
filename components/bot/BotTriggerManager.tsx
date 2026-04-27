import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Check, Power, Zap } from 'lucide-react';
import { BotConfiguration, BotTrigger } from '../../types';

interface BotTriggerManagerProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
}

const TRIGGER_TIME_OPTIONS = [
  { value: 'call_start', label: '通话开始' },
  { value: 'call_end', label: '通话结束' },
];

const ACTION_OPTIONS = [
  { value: 'satisfaction_survey', label: '发送满意度调查' },
  { value: 'send_sms', label: '发送短信' },
  { value: 'extract_info', label: '提取信息' },
  { value: 'call_api', label: '调用接口' },
];

const BotTriggerManager: React.FC<BotTriggerManagerProps> = ({ config, updateField }) => {
  const [editingTrigger, setEditingTrigger] = useState<BotTrigger | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const triggers = config.triggers || [];

  const handleCreate = () => {
    const newTrigger: BotTrigger = {
      id: Date.now().toString(),
      name: '',
      description: '',
      triggerTime: 'call_start',
      action: 'call_api',
      actionConfig: {},
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingTrigger(newTrigger);
    setIsCreating(true);
  };

  const handleEdit = (trigger: BotTrigger) => {
    setEditingTrigger({ ...trigger });
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    const updatedTriggers = triggers.filter(t => t.id !== id);
    updateField('triggers', updatedTriggers);
  };

  const handleToggleEnabled = (id: string) => {
    const updatedTriggers = triggers.map(t => 
      t.id === id ? { ...t, isEnabled: !t.isEnabled, updatedAt: new Date().toISOString() } : t
    );
    updateField('triggers', updatedTriggers);
  };

  const handleSave = () => {
    if (!editingTrigger) return;
    if (!editingTrigger.name.trim()) {
      alert('请输入触发器名称');
      return;
    }

    const updatedTrigger = { ...editingTrigger, updatedAt: new Date().toISOString() };
    
    if (isCreating) {
      updateField('triggers', [...triggers, updatedTrigger]);
    } else {
      const updatedTriggers = triggers.map(t => t.id === editingTrigger.id ? updatedTrigger : t);
      updateField('triggers', updatedTriggers);
    }

    setEditingTrigger(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingTrigger(null);
    setIsCreating(false);
  };

  const updateEditingTrigger = (key: keyof BotTrigger, value: any) => {
    if (!editingTrigger) return;
    setEditingTrigger({ ...editingTrigger, [key]: value });
  };

  const getTriggerTimeLabel = (value: string) => 
    TRIGGER_TIME_OPTIONS.find(o => o.value === value)?.label || value;

  const getActionLabel = (value: string) => 
    ACTION_OPTIONS.find(o => o.value === value)?.label || value;

  if (editingTrigger) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              {isCreating ? '新建触发器' : '编辑触发器'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs text-slate-600 border border-gray-200 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <X size={12} /> 取消
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-sky-600 transition-colors flex items-center gap-1"
              >
                <Check size={12} /> 保存
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">触发器名称 *</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                placeholder="如：通话开始记录、通话结束满意度"
                value={editingTrigger.name}
                onChange={(e) => updateEditingTrigger('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">启用状态</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateEditingTrigger('isEnabled', !editingTrigger.isEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    editingTrigger.isEnabled 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <Power size={12} />
                  {editingTrigger.isEnabled ? '已启用' : '已禁用'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">描述</label>
            <textarea
              className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none resize-none"
              placeholder="描述这个触发器的作用..."
              value={editingTrigger.description || ''}
              onChange={(e) => updateEditingTrigger('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">触发时机 *</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                value={editingTrigger.triggerTime}
                onChange={(e) => updateEditingTrigger('triggerTime', e.target.value)}
              >
                {TRIGGER_TIME_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">动作 *</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                value={editingTrigger.action}
                onChange={(e) => updateEditingTrigger('action', e.target.value)}
              >
                {ACTION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 动作配置 */}
          {editingTrigger.action === 'send_sms' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">短信配置</h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">短信模板ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                  placeholder="如：SMS_123456"
                  value={editingTrigger.actionConfig?.smsTemplateId || ''}
                  onChange={(e) => updateEditingTrigger('actionConfig', {
                    ...editingTrigger.actionConfig,
                    smsTemplateId: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">短信参数（JSON格式）</label>
                <textarea
                  className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none resize-none font-mono"
                  placeholder='{"name": "{{user_name}}", "order_id": "{{order_id}}"}'
                  value={editingTrigger.actionConfig?.smsParams ? JSON.stringify(editingTrigger.actionConfig.smsParams, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const params = e.target.value ? JSON.parse(e.target.value) : {};
                      updateEditingTrigger('actionConfig', {
                        ...editingTrigger.actionConfig,
                        smsParams: params
                      });
                    } catch {}
                  }}
                />
              </div>
            </div>
          )}

          {editingTrigger.action === 'call_api' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">接口配置</h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">接口配置ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                  placeholder="选择或输入接口配置ID"
                  value={editingTrigger.actionConfig?.apiConfigId || ''}
                  onChange={(e) => updateEditingTrigger('actionConfig', {
                    ...editingTrigger.actionConfig,
                    apiConfigId: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">接口参数（JSON格式）</label>
                <textarea
                  className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none resize-none font-mono"
                  placeholder='{"phone": "{{user_phone}}", "call_id": "{{call_id}}"}'
                  value={editingTrigger.actionConfig?.apiParams ? JSON.stringify(editingTrigger.actionConfig.apiParams, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const params = e.target.value ? JSON.parse(e.target.value) : {};
                      updateEditingTrigger('actionConfig', {
                        ...editingTrigger.actionConfig,
                        apiParams: params
                      });
                    } catch {}
                  }}
                />
              </div>
            </div>
          )}

          {editingTrigger.action === 'extract_info' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">信息提取配置</h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">提取字段（逗号分隔）</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                  placeholder="如：用户满意度,问题是否解决,是否需要回访"
                  value={editingTrigger.actionConfig?.extractionFields?.join(', ') || ''}
                  onChange={(e) => updateEditingTrigger('actionConfig', {
                    ...editingTrigger.actionConfig,
                    extractionFields: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                  })}
                />
              </div>
            </div>
          )}

          {editingTrigger.action === 'satisfaction_survey' && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-700">满意度调查配置</h4>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">调查问题（逗号分隔）</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none"
                  placeholder="如：您对本次服务满意吗？,问题是否得到解决？"
                  value={editingTrigger.actionConfig?.surveyQuestions?.join(', ') || ''}
                  onChange={(e) => updateEditingTrigger('actionConfig', {
                    ...editingTrigger.actionConfig,
                    surveyQuestions: e.target.value.split(',').map(q => q.trim()).filter(q => q)
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-slate-800">触发器管理</h3>
          </div>
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-sky-600 transition-colors flex items-center gap-1"
          >
            <Plus size={12} /> 新建触发器
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">配置通话开始和结束时的自动化动作</p>
      </div>

      <div className="p-6">
        {triggers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-2">暂无触发器</p>
            <p className="text-xs text-slate-400">点击"新建触发器"开始配置</p>
          </div>
        ) : (
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div
                key={trigger.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleEnabled(trigger.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      trigger.isEnabled 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    <Power size={10} />
                    {trigger.isEnabled ? '启用' : '禁用'}
                  </button>
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">{trigger.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{getTriggerTimeLabel(trigger.triggerTime)}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-xs text-primary">{getActionLabel(trigger.action)}</span>
                    </div>
                    {trigger.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{trigger.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(trigger)}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(trigger.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotTriggerManager;