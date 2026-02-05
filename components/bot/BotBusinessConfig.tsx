

import React, { useState } from 'react';
import { Edit3, ChevronDown, ArrowUpDown, LayoutList, X, Plus, Database, HelpCircle, Trash2 } from 'lucide-react';
import { Switch, Select } from '../ui/FormComponents';
import { LabelGroup, BotConfiguration, ExtractionConfig, ModelType, TagItem, Parameter } from '../../types';

interface BotBusinessConfigProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  onSave: () => void;
  onCancel: () => void;
  extractionConfigs: ExtractionConfig[];
}

const BotBusinessConfig: React.FC<BotBusinessConfigProps> = ({ config, updateField, onSave, onCancel, extractionConfigs }) => {
  const [activeSubTab, setActiveSubTab] = useState<'TAG' | 'SATISFACTION' | 'SUMMARY' | 'INFO_EXTRACTION'>('TAG');
  const [tagModal, setTagModal] = useState<{ isOpen: boolean, groupId: string, name: string, description: string } | null>(null);

  const groups = config.labelGroups;

  const onUpdate = (newGroups: LabelGroup[]) => {
    updateField('labelGroups', newGroups);
  };

  const addGroup = () => {
    const newGroup: LabelGroup = {
      id: Date.now().toString(),
      name: '新增标签组',
      tags: [],
      enabled: true
    };
    onUpdate([...groups, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<LabelGroup>) => {
    onUpdate(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGroup = (id: string) => {
    onUpdate(groups.filter(g => g.id !== id));
  };

  const openTagModal = (groupId: string) => {
    setTagModal({ isOpen: true, groupId, name: '', description: '' });
  };

  const handleTagSubmit = () => {
    if (!tagModal || !tagModal.name) return;
    const group = groups.find(g => g.id === tagModal.groupId);
    if (group) {
      const newTag: TagItem = { name: tagModal.name, description: tagModal.description };
      updateGroup(tagModal.groupId, { tags: [...group.tags, newTag] });
    }
    setTagModal(null);
  };

  const removeTag = (groupId: string, tagName: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      updateGroup(groupId, { tags: group.tags.filter(t => t.name !== tagName) });
    }
  };

  // --- Parameter Management (Copied logic from BotBasicConfig) ---
  const addParameter = () => {
    const newParam: Parameter = { id: Date.now().toString(), key: '', description: '' };
    updateField('parameters', [...config.parameters, newParam]);
  };

  const updateParameter = (id: string, key: keyof Parameter, value: string) => {
    const newParams = config.parameters.map(p => {
      if (p.id === id) {
        return { ...p, [key]: value };
      }
      return p;
    });
    updateField('parameters', newParams);
  };

  const removeParameter = (id: string) => {
    updateField('parameters', config.parameters.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8 bg-white/50 px-4 -mx-4">
        {[
          { id: 'TAG', label: '标签管理' },
          { id: 'SATISFACTION', label: '满意度分析' },
          { id: 'SUMMARY', label: '通话小结' },
          { id: 'INFO_EXTRACTION', label: '信息提取' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeSubTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'TAG' && (
        <div className="space-y-4">
          <div className="flex justify-end mb-2">
            <button 
              onClick={addGroup}
              className="bg-primary text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-sky-600 transition-all flex items-center shadow-sm"
            >
              新增标签组
            </button>
          </div>

          <div className="bg-white rounded border border-gray-200 shadow-sm divide-y divide-gray-100">
            {groups.map((group) => (
              <div key={group.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-800">{group.name}</span>
                    <button className="text-slate-300 hover:text-primary transition-colors">
                      <Edit3 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-6">
                    {group.name === '情绪标签' && (
                      <div className="flex items-center space-x-2">
                         <Switch 
                          label="" 
                          checked={group.enabled || false} 
                          onChange={(v) => updateGroup(group.id, { enabled: v })} 
                        />
                        <span className="text-xs text-slate-400 font-medium">{group.enabled ? '开' : '关'}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs font-medium">
                      {group.name === '用户画像' && (
                        <>
                          <div className="flex items-center space-x-2 text-slate-500">
                            <span>标签规则：</span>
                            <div className="relative">
                              <select className="bg-white border border-gray-200 rounded px-2 py-1 outline-none text-slate-700 pr-6 appearance-none min-w-[80px]">
                                <option>多标签</option>
                                <option>单标签</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400" />
                            </div>
                          </div>
                          <button className="text-primary hover:underline flex items-center">
                            排序 <ArrowUpDown size={12} className="ml-1" />
                          </button>
                          <button onClick={() => removeGroup(group.id)} className="text-primary hover:underline flex items-center">
                            删除标签组
                          </button>
                          <button className="text-slate-800">
                             <LayoutList size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  {group.tags.map((tag, idx) => (
                    <div 
                      key={idx} 
                      className={`px-4 py-1.5 text-xs font-medium rounded transition-all flex items-center group/tag relative ${
                        group.name === '意向标签' || group.name === '情绪标签' 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'border border-gray-200 text-slate-700 bg-white hover:border-primary/30'
                      }`}
                      title={tag.description}
                    >
                      {tag.name}
                      {tag.description && (
                         <div className="w-1.5 h-1.5 bg-blue-400 rounded-full absolute -top-0.5 -right-0.5 border border-white"></div>
                      )}
                      {group.name === '用户画像' && (
                        <button 
                          onClick={() => removeTag(group.id, tag.name)}
                          className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {group.name === '用户画像' && (
                    <button 
                      onClick={() => openTagModal(group.id)}
                      className="px-4 py-1.5 text-xs font-medium rounded border border-dashed border-gray-300 text-slate-400 hover:border-primary hover:text-primary transition-all flex items-center"
                    >
                      <Plus size={14} className="mr-1" /> 添加标签
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'SATISFACTION' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-12 text-center text-slate-400">
          满意度分析模块开发中...
        </div>
      )}

      {activeSubTab === 'SUMMARY' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-12 text-center text-slate-400">
          通话小结模块开发中...
        </div>
      )}

      {activeSubTab === 'INFO_EXTRACTION' && (
        <div className="space-y-6">
          {/* Main Config Selection */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
            <div className="max-w-2xl">
               <div className="flex items-center mb-6 text-slate-800 font-bold">
                 <div className="p-2 bg-blue-50 text-primary rounded-lg mr-3">
                   <Database size={20} />
                 </div>
                 配置信息提取方案
               </div>
               
               <Select 
                 label="选择接口配置方案" 
                 tooltip="选择在对话过程中使用的信息提取配置方案（API定义等）。"
                 value={config.extractionConfigId || ''}
                 onChange={(e) => updateField('extractionConfigId', e.target.value)}
                 options={[
                   { label: '请选择...', value: '' },
                   ...extractionConfigs.map(c => ({ label: c.name, value: c.id }))
                 ]}
               />
               
               {config.extractionConfigId && (
                 <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 mb-6">
                    <div className="font-bold mb-2 text-xs uppercase text-slate-500">关联方案详情</div>
                    {extractionConfigs.find(c => c.id === config.extractionConfigId)?.description || '暂无描述'}
                 </div>
               )}
            </div>
          </div>

          {/* Model & Prompt Configuration (Moved Here) */}
          {config.extractionConfigId && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="max-w-7xl">
                 <div className="flex items-center mb-6 text-slate-800 font-bold">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg mr-3">
                     <HelpCircle size={20} />
                   </div>
                   提取逻辑配置 (LLM)
                 </div>
                 
                 {/* Extraction Model Selection Removed */}

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                   <div className="lg:col-span-7">
                      <div className="flex items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">提取提示词 (Prompt)</label>
                      </div>
                      <textarea 
                        className="w-full h-80 px-4 py-3 text-sm border border-gray-200 rounded focus:border-primary outline-none transition-all font-mono leading-relaxed bg-slate-50/30 resize-none"
                        value={config.extractionPrompt}
                        onChange={(e) => updateField('extractionPrompt', e.target.value)}
                        placeholder="例如：请从用户的回答中提取订单号和手机号码..."
                      />
                      <p className="text-xs text-slate-400 mt-2">指导模型如何从对话中提取所需信息，并映射到接口参数。</p>
                   </div>
                   
                   <div className="lg:col-span-5">
                      <div className="bg-slate-50/50 border border-slate-100 rounded p-4 h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-700">提取变量参数</span>
                          <button onClick={addParameter} className="text-[10px] px-2 py-0.5 border border-primary text-primary rounded hover:bg-primary/5 flex items-center">
                             <Plus size={10} className="mr-1" /> 添加
                          </button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {config.parameters.map((param) => (
                            <div key={param.id} className="flex space-x-2 items-center">
                              <div className="flex-1 min-w-0 relative">
                                 <select 
                                   className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded bg-white outline-none appearance-none"
                                   value={param.key}
                                   onChange={(e) => updateParameter(param.id, 'key', e.target.value)}
                                 >
                                   <option value="">选择变量 (英)</option>
                                   {config.variables?.map(v => (
                                     <option key={v.id} value={v.name}>{v.name}</option>
                                   ))}
                                 </select>
                                 <ChevronDown size={10} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
                              </div>
                              
                              <div className="flex-[2] min-w-0">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded bg-white outline-none focus:border-primary placeholder:text-slate-300"
                                  placeholder="输入提取指令/描述"
                                  value={param.description || ''}
                                  onChange={(e) => updateParameter(param.id, 'description', e.target.value)}
                                />
                              </div>

                              <button onClick={() => removeParameter(param.id)} className="text-slate-300 hover:text-red-500 shrink-0">
                                 <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                          {config.parameters.length === 0 && <div className="text-[10px] text-slate-400 text-center py-4">暂无变量</div>}
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100">
         <button onClick={onSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
           保存配置
         </button>
         <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
           取消
         </button>
      </div>

      {/* Tag Modal */}
      {tagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">添加自定义标签</h3>
              <button onClick={() => setTagModal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标签名称</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary outline-none text-sm"
                  placeholder="如：高意向"
                  value={tagModal.name}
                  onChange={(e) => setTagModal({...tagModal, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标签描述 (可选)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-primary outline-none text-sm"
                  placeholder="如：客户明确表示购买意愿"
                  value={tagModal.description}
                  onChange={(e) => setTagModal({...tagModal, description: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setTagModal(null)} className="px-4 py-2 border border-gray-300 rounded text-slate-600 text-sm font-medium hover:bg-white">取消</button>
              <button onClick={handleTagSubmit} className="px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-sky-600">添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotBusinessConfig;
