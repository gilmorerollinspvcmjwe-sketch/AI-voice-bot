import React, { useState } from 'react';
import { BotConfiguration } from '../../types';

interface BotKnowledgeConfigProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
}

const BotKnowledgeConfig: React.FC<BotKnowledgeConfigProps> = ({ config, updateField }) => {
  // 模拟KCS开通状态
  const [kcsEnabled, setKcsEnabled] = useState(false);
  
  // 模拟知识空间数据
  const knowledgeSpaces = [
    {
      id: '1',
      name: '全公司公用空间',
      type: 'space',
      checked: true,
      children: [
        {
          id: '2',
          name: '行政管理',
          type: 'folder',
          checked: true,
          children: [
            {
              id: '3',
              name: '员工手册2024.pdf',
              type: 'file',
              checked: true
            },
            {
              id: '4',
              name: '报销流程.docx',
              type: 'file',
              checked: true
            }
          ]
        },
        {
          id: '5',
          name: '审计合规目录',
          type: 'folder',
          checked: false,
          children: []
        }
      ]
    },
    {
      id: '6',
      name: '法务合规专区',
      type: 'space',
      checked: true,
      children: []
    }
  ];

  if (!kcsEnabled) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">知识检索配置</h3>
          <p className="text-slate-500 mb-6 max-w-md">
            知识检索功能需要开通KCS（知识管理系统）后使用。开通后，您可以配置知识空间、目录和文件，为机器人提供知识检索能力。
          </p>
          <button
            onClick={() => setKcsEnabled(true)}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium transition-all"
          >
            开通KCS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">知识检索配置</h3>
        <button className="text-sm text-primary hover:underline">
          帮助
        </button>
      </div>

      {/* 筛选条件 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">上传人</label>
          <input
            type="text"
            placeholder="姓名..."
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">上传时间</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm">
            <option>不限时间</option>
            <option>今天</option>
            <option>本周</option>
            <option>本月</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">更新人</label>
          <input
            type="text"
            placeholder="姓名..."
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">更新时间</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm">
            <option>不限时间</option>
            <option>今天</option>
            <option>本周</option>
            <option>本月</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">文件类型</label>
          <select className="w-full px-3 py-2 border border-gray-200 rounded text-sm">
            <option>所有类型</option>
            <option>PDF</option>
            <option>Word</option>
            <option>Excel</option>
          </select>
        </div>
      </div>

      {/* 常用预设 */}
      <div className="flex items-center mb-6">
        <span className="text-xs font-medium text-slate-600 mr-3">常用预设：</span>
        <button className="px-3 py-1 border border-gray-200 rounded text-xs text-slate-700 mr-2">
          法务审计专用范围
        </button>
        <button className="px-3 py-1 border border-dashed border-gray-300 rounded text-xs text-slate-700">
          + 存为预设
        </button>
      </div>

      {/* 搜索框 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="混合搜索: 知识空间、目录、或特定文档..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {/* 知识空间列表 */}
      <div className="space-y-4">
        {knowledgeSpaces.map((space) => (
          <div key={space.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={space.checked}
                  onChange={() => {}}
                  className="mr-2"
                />
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    🌐
                  </span>
                  <span className="font-medium text-slate-800">{space.name}</span>
                  <span className="text-xs text-slate-400 ml-2">知识空间根节点</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                －
              </button>
            </div>
            
            {space.children.map((folder) => (
              <div key={folder.id} className="pl-12 pr-4 py-3 border-t border-gray-100">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={folder.checked}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <div className="flex items-center">
                    <span className="w-5 h-5 flex items-center justify-center mr-2">
                      📁
                    </span>
                    <span className="text-slate-700">{folder.name}</span>
                  </div>
                </div>
                
                {folder.children.map((file) => (
                  <div key={file.id} className="pl-7 py-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={file.checked}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="text-slate-600 text-sm">{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 底部按钮 */}
      <div className="flex justify-end mt-8 space-x-4">
        <button className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
          取消
        </button>
        <button className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium transition-all flex items-center">
          确认应用
          <span className="ml-1 text-xs">⚡</span>
        </button>
      </div>
    </div>
  );
};

export default BotKnowledgeConfig;