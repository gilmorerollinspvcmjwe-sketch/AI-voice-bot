
import React, { useState } from 'react';
import { Plus, Trash2, Edit3, X, Server, MessageSquare, Database } from 'lucide-react';
import { BotVariable } from '../../types';

interface BotVariableConfigProps {
  variables: BotVariable[];
  onUpdate: (variables: BotVariable[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const VARIABLE_TYPES: { label: string; value: BotVariable['type'] }[] = [
  { label: '文本', value: 'TEXT' },
  { label: '数字', value: 'NUMBER' },
  { label: '日期', value: 'DATE' },
  { label: '日期时间', value: 'DATETIME' },
  { label: '时间', value: 'TIME' },
  { label: '布尔值', value: 'BOOLEAN' },
];

const BotVariableConfig: React.FC<BotVariableConfigProps> = ({ variables, onUpdate, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'INPUT' | 'CONVERSATION' | 'EXTRACTION'>('INPUT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<BotVariable | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<BotVariable>>({
    name: '',
    type: 'TEXT',
    description: ''
  });

  // Filter variables based on active tab
  const filteredVariables = variables.filter(v => {
    if (activeTab === 'INPUT') {
      return v.category === 'INPUT' || (!v.category && !v.isSystem);
    }
    if (activeTab === 'CONVERSATION') {
      return v.category === 'CONVERSATION' || v.isSystem;
    }
    if (activeTab === 'EXTRACTION') {
      return v.category === 'EXTRACTION';
    }
    return false;
  });

  const openModal = (variable?: BotVariable) => {
    if (variable) {
      setEditingVar(variable);
      setFormData({ ...variable });
    } else {
      setEditingVar(null);
      setFormData({ name: '', type: 'TEXT', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVar(null);
  };

  const handleSubmit = () => {
    if (!formData.name) return alert('请输入变量英文名称');

    if (editingVar) {
      // Edit existing
      const updated = variables.map(v => v.id === editingVar.id ? { ...v, ...formData } as BotVariable : v);
      onUpdate(updated);
    } else {
      // Create new
      const newVar: BotVariable = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type as any,
        description: formData.description || '',
        isSystem: false,
        category: activeTab // Auto-assign category
      };
      onUpdate([...variables, newVar]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该变量吗？这将可能影响引用了该变量的流程。')) {
      onUpdate(variables.filter(v => v.id !== id));
    }
  };

  const getTypeName = (type: string) => {
    return VARIABLE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8 bg-white/50 px-4 -mx-4">
        {[
          { id: 'INPUT', label: '输入变量', icon: Server },
          { id: 'CONVERSATION', label: '对话变量', icon: MessageSquare },
          { id: 'EXTRACTION', label: '提取变量', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon size={14} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
         <div className="text-xs text-slate-500">
            {activeTab === 'INPUT' && '配置机器人初始化时需要的外部输入参数 (如: user_name, order_id)。'}
            {activeTab === 'CONVERSATION' && '配置对话过程中产生的系统变量或临时变量。'}
            {activeTab === 'EXTRACTION' && '配置需要从用户对话中提取的关键信息变量 (Slot)。'}
         </div>
         <button 
           onClick={() => openModal()}
           className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-600 transition-all flex items-center shadow-sm"
         >
           <Plus size={16} className="mr-2" /> 
           添加{activeTab === 'INPUT' ? '输入' : activeTab === 'CONVERSATION' ? '对话' : '提取'}变量
         </button>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">序号</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">变量名(英)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">数据类型</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">变量描述</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500">来源</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVariables.map((v, index) => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">{index + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800 font-mono">{v.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{getTypeName(v.type)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{v.description || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className={`px-2 py-0.5 rounded text-xs ${v.isSystem ? 'bg-gray-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                    {v.isSystem ? '系统预置' : (v.category === 'INPUT' ? '外部输入' : (v.category === 'EXTRACTION' ? '模型提取' : '自定义'))}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {!v.isSystem && (
                    <div className="flex justify-end space-x-4 text-sm">
                      <button onClick={() => openModal(v)} className="text-primary hover:underline">编辑</button>
                      <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:underline">删除</button>
                    </div>
                  )}
                  {v.isSystem && <span className="text-xs text-slate-300 italic pr-2">禁止编辑</span>}
                </td>
              </tr>
            ))}
            {filteredVariables.length === 0 && (
               <tr>
                 <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    暂无{activeTab === 'INPUT' ? '输入' : activeTab === 'CONVERSATION' ? '对话' : '提取'}变量数据
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100">
         <button onClick={onSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
           保存配置
         </button>
         <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
           取消
         </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                 {editingVar ? '编辑变量' : `添加${activeTab === 'INPUT' ? '输入' : activeTab === 'CONVERSATION' ? '对话' : '提取'}变量`}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>变量英文名称 (ID)
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm font-mono"
                  placeholder="如：user_feedback"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 mt-1">用于系统内部引用，建议使用小写英文和下划线。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>数据类型
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm bg-white"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  {VARIABLE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  变量描述
                </label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm h-20 resize-none"
                  placeholder="请输入该变量的用途说明"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded text-slate-600 text-sm font-medium hover:bg-white transition-colors">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-sky-600 transition-colors">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotVariableConfig;
