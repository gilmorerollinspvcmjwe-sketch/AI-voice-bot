
import React, { useState } from 'react';
import { ArrowRight, Workflow, Bot } from 'lucide-react';
import { BotConfiguration, ExtractionConfig, MarketingCampaign } from '../../types';
import { generateBotPrompt } from '../../services/geminiService';
import BotBasicConfig from './BotBasicConfig';
import BotStrategyConfig from './BotStrategyConfig';
import BotBusinessConfig from './BotBusinessConfig';
import BotVariableConfig from './BotVariableConfig';
import BotDebugConfig from './BotDebugConfig';
import BotIntentConfig from './intent/BotIntentConfig';
import BotMarketingConfig from './BotMarketingConfig';
import BotAgentConfig from './BotAgentConfig';

interface BotConfigFormProps {
  initialData: BotConfiguration;
  onSave: (data: BotConfiguration) => void;
  onCancel: () => void;
  extractionConfigs: ExtractionConfig[];
  campaigns: MarketingCampaign[]; 
}

const BotConfigForm: React.FC<BotConfigFormProps> = ({ initialData, onSave, onCancel, extractionConfigs, campaigns }) => {
  const [config, setConfig] = useState<BotConfiguration>({ 
    ...initialData,
    orchestrationType: initialData.orchestrationType || 'WORKFLOW' 
  });
  
  const [activeTab, setActiveTab] = useState<'BASIC' | 'FLOW' | 'TOOLS' | 'STRATEGY' | 'BUSINESS' | 'VARIABLES' | 'DEBUG' | 'MARKETING'>('BASIC');
  const [isGenerating, setIsGenerating] = useState(false);

  const updateField = <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSmartGenerate = async () => {
    if (!config.name) return alert("请先填写配置模板名称");
    setIsGenerating(true);
    try {
      const result = await generateBotPrompt(config.name, 'General', config.description);
      setConfig(prev => ({ ...prev, description: result.description, systemPrompt: result.systemPrompt }));
    } catch (error) {
      console.error(error);
      alert("AI 生成失败，请稍后重试。");
    } finally { setIsGenerating(false); }
  };

  const handleSave = () => {
    onSave(config);
    
    // Create and show success toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-8 bg-green-50 text-green-700 border border-green-200 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
      <div>
        <h4 class="font-bold text-sm">保存成功</h4>
        <p class="text-xs text-green-600 mt-0.5">配置已更新</p>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full pb-20">
      {/* Form Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button onClick={onCancel} className="text-xs text-slate-400 hover:text-primary mb-2 flex items-center transition-colors">
            <ArrowRight size={12} className="rotate-180 mr-1" /> 返回列表
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {initialData.id ? '编辑机器人配置' : '新建机器人配置'}
          </h1>
        </div>
        
        {/* Orchestration Type Switch */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center shadow-inner">
           <button 
             onClick={() => updateField('orchestrationType', 'WORKFLOW')}
             className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${config.orchestrationType === 'WORKFLOW' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Workflow size={14} className="mr-2" /> 流程画布模式
           </button>
           <button 
             onClick={() => updateField('orchestrationType', 'AGENT')}
             className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${config.orchestrationType === 'AGENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Bot size={14} className="mr-2" /> 智能体编排模式
           </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8 overflow-x-auto">
        {[
          { id: 'BASIC', label: '基础配置' },
          ...(config.orchestrationType === 'WORKFLOW' 
              ? [{ id: 'FLOW', label: '意图技能 (Flow Canvas)' }]
              : [{ id: 'TOOLS', label: '工具调用 (Tool Calling)' }]
          ),
          { id: 'STRATEGY', label: '对话策略' },
          { id: 'VARIABLES', label: '变量配置' },
          { id: 'BUSINESS', label: '业务分析' },
          { id: 'MARKETING', label: '营销活动' }, 
          { id: 'DEBUG', label: '模型调试' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'BASIC' && (
          <BotBasicConfig 
            config={config} 
            updateField={updateField} 
            isGenerating={isGenerating} 
            handleSmartGenerate={handleSmartGenerate} 
            onSave={handleSave}
            onCancel={onCancel}
          />
        )}

        {/* Workflow Canvas */}
        {activeTab === 'FLOW' && config.orchestrationType === 'WORKFLOW' && (
           <div className="animate-in fade-in duration-500">
             <BotIntentConfig 
               config={config} 
               updateField={updateField}
               extractionConfigs={extractionConfigs}
             />
             <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100 mt-6">
               <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
                 保存配置
               </button>
               <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
                 取消
               </button>
             </div>
           </div>
        )}

        {/* Agent Tool Calling */}
        {activeTab === 'TOOLS' && config.orchestrationType === 'AGENT' && (
           <div className="animate-in fade-in duration-500">
             <BotAgentConfig 
               config={config} 
               updateField={updateField}
               extractionConfigs={extractionConfigs}
             />
             <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100 mt-6">
               <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
                 保存配置
               </button>
               <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
                 取消
               </button>
             </div>
           </div>
        )}

        {activeTab === 'STRATEGY' && (
          <BotStrategyConfig 
            config={config} 
            updateField={updateField} 
            onSave={handleSave}
            onCancel={onCancel}
          />
        )}

        {activeTab === 'VARIABLES' && (
          <BotVariableConfig 
            variables={config.variables || []} 
            onUpdate={(vars) => updateField('variables', vars)} 
            onSave={handleSave}
            onCancel={onCancel}
          />
        )}

        {activeTab === 'BUSINESS' && (
           <div className="animate-in fade-in duration-500">
             <BotBusinessConfig 
              config={config}
              updateField={updateField}
              onSave={handleSave}
              onCancel={onCancel}
              extractionConfigs={extractionConfigs}
            />
           </div>
        )}

        {activeTab === 'MARKETING' && (
           <div className="animate-in fade-in duration-500">
             <BotMarketingConfig 
              config={config}
              updateField={updateField}
              campaigns={campaigns}
            />
             <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100 mt-6">
               <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
                 保存配置
               </button>
               <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
                 取消
               </button>
             </div>
           </div>
        )}

        {activeTab === 'DEBUG' && (
          <div className="animate-in fade-in duration-500 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <BotDebugConfig config={config} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BotConfigForm;
