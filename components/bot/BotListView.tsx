
import React from 'react';
import { Settings2, Trash2, Plus } from 'lucide-react';
import { BotConfiguration } from '../../types';

interface BotListViewProps {
  bots: BotConfiguration[];
  onEdit: (bot: BotConfiguration) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const BotListView: React.FC<BotListViewProps> = ({ bots, onEdit, onDelete, onCreate }) => (
  <div className="p-8 max-w-7xl mx-auto w-full">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">机器人方案管理</h1>
        <p className="text-sm text-slate-500 mt-1">创建和配置您的 AI 语音机器人话术方案</p>
      </div>
      <button 
        onClick={onCreate}
        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-600 transition-all flex items-center shadow-lg shadow-sky-100"
      >
        <Plus size={18} className="mr-2" /> 新建配置方案
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/5">名称</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">描述</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">状态</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">引擎</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">更新时间</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bots.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Settings2 size={32} className="opacity-20" />
                  </div>
                  <p>暂无配置方案</p>
                </div>
              </td>
            </tr>
          ) : (
            bots.map(bot => (
              <tr key={bot.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{bot.name || '未命名'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-500 truncate max-w-xs" title={bot.description}>
                    {bot.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bot.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {bot.status ? '已启用' : '待启用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{bot.llmType}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(bot.lastUpdated).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(bot)} className="p-2 text-slate-400 hover:text-primary hover:bg-sky-50 rounded-lg transition-colors">
                      <Settings2 size={18} />
                    </button>
                    <button onClick={() => onDelete(bot.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default BotListView;
