
import React, { useState } from 'react';
import { 
  Sparkles, Loader2, Cpu, Volume2, Mic, MessageSquare, Plus, Trash2, ChevronDown
} from 'lucide-react';
import { Input, Select, Slider, Switch, TagInput, Label } from '../ui/FormComponents';
import { BotConfiguration, ModelType, TTSModel, ASRModel, EMOTIONS, Parameter } from '../../types';
import PromptGeneratorModal from './PromptGeneratorModal';

interface BotBasicConfigProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  isGenerating: boolean;
  handleSmartGenerate: () => void; // Legacy, kept for interface compatibility if needed, but overridden locally
  onSave: () => void;
  onCancel: () => void;
}

const BotBasicConfig: React.FC<BotBasicConfigProps> = ({ 
  config, 
  updateField, 
  onSave,
  onCancel
}) => {
  const [showGenerator, setShowGenerator] = useState(false);

  const addParameter = () => {
    // Only add if there are available variables
    const newParam: Parameter = { id: Date.now().toString(), key: '', description: '' };
    updateField('parameters', [...config.parameters, newParam]);
  };

  const updateParameter = (id: string, key: string, value: string) => {
    const newParams = config.parameters.map(p => {
      if (p.id === id) {
        if (key === 'key') {
          // Find the selected variable
          const selectedVar = config.variables?.find(v => v.name === value);
          // Auto-fill description from variable if available
          const desc = p.description || (selectedVar ? selectedVar.description : '');
          return { ...p, key: value, description: desc };
        }
        return { ...p, [key]: value };
      }
      return p;
    });
    updateField('parameters', newParams);
  };

  const removeParameter = (id: string) => {
    updateField('parameters', config.parameters.filter(p => p.id !== id));
  };

  const handleApplyGeneratedPrompt = (desc: string, prompt: string) => {
    updateField('description', desc);
    updateField('systemPrompt', prompt);
    setShowGenerator(false);
  };

  return (
    <div className="space-y-6">
      {/* Prompt Generator Modal */}
      <PromptGeneratorModal 
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onApply={handleApplyGeneratedPrompt}
        existingVariables={config.variables || []}
      />

      <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-5">基础信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input 
            label="配置模板名称" 
            required 
            placeholder="请输入模板名称" 
            value={config.name} 
            onChange={(e) => updateField('name', e.target.value)} 
          />
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <Label label="描述" />
              <button 
                onClick={() => setShowGenerator(true)} 
                className="text-primary text-xs flex items-center hover:underline bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 transition-colors font-bold"
              >
                <Sparkles size={12} className="mr-1 fill-sky-200" />
                AI 智能生成
              </button>
            </div>
            <textarea 
              className="w-full h-12 px-3 py-2 text-sm border border-gray-200 rounded focus:border-primary outline-none transition-all resize-none" 
              placeholder="用于信贷业务的逾期提醒与还款计划制定。" 
              value={config.description} 
              onChange={(e) => updateField('description', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-5">核心模型配置</h3>
        <div className="bg-slate-50/50 rounded p-6 border border-slate-100">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-blue-100 text-primary rounded">
              <Cpu size={14} />
            </div>
            <span className="text-xs font-bold text-slate-700">大模型配置</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <Select 
                label="大模型类型" 
                tooltip="选择用于生成对话内容的基础大语言模型。"
                options={Object.values(ModelType) as string[]} 
                value={config.llmType} 
                onChange={(e) => updateField('llmType', e.target.value as ModelType)} 
              />
            </div>
            <div className="lg:col-span-4">
              <Slider label="温度 (Temperature)" min={0} max={1} step={0.1} value={config.temperature} onChange={(v) => updateField('temperature', v)} tooltip="控制生成文本的随机性" />
            </div>
            <div className="lg:col-span-4">
              <Slider label="核采样 (Top-P)" min={0} max={1} step={0.1} value={config.topP} onChange={(v) => updateField('topP', v)} tooltip="另一种控制生成多样性的采样方式" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-pink-100 text-pink-600 rounded">
              <Volume2 size={14} />
            </div>
            <span className="text-xs font-bold text-slate-700">TTS 语音配置</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <Select label="TTS模型" options={Object.values(TTSModel) as string[]} value={config.ttsModel} onChange={(e) => updateField('ttsModel', e.target.value as TTSModel)} />
              <Select label="音色选择" options={['Azure-Xiaoxiao', 'Azure-Yunxi', 'Google-Wavenet-A', 'Gemini-Voice-Kore']} value={config.voiceName} onChange={(e) => updateField('voiceName', e.target.value)} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Slider label="音量" min={0} max={100} value={config.volume} onChange={(v) => updateField('volume', v)} />
              <Slider label="语速" min={0.5} max={2.0} step={0.1} value={config.speed} onChange={(v) => updateField('speed', v)} />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Select label="情绪" options={EMOTIONS as string[]} value={config.emotion} onChange={(e) => updateField('emotion', e.target.value)} />
              <div className="bg-slate-50 border border-slate-100 rounded p-4">
                 <Label label="预览：" />
                 <div className="text-[11px] text-slate-500 leading-relaxed italic">
                   当前音色风格为 {config.emotion}，适合标准服务场景。
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-1.5 bg-teal-100 text-teal-600 rounded">
              <Mic size={14} />
            </div>
            <span className="text-xs font-bold text-slate-700">ASR 识别配置</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-4">
              <Select label="ASR模型" options={Object.values(ASRModel) as string[]} value={config.asrModel} onChange={(e) => updateField('asrModel', e.target.value as ASRModel)} />
            </div>
            <div className="lg:col-span-4 space-y-4">
               <Input label="静音时长 (ms)" tooltip="检测到静音多长时间后切断识别" value={config.asrSilenceDurationMs} onChange={(e) => updateField('asrSilenceDurationMs', parseInt(e.target.value) || 0)} />
            </div>
            <div className="lg:col-span-4 space-y-6 pt-2">
              <Switch label="允许被打断" checked={config.asrInterruptible} onChange={(v) => updateField('asrInterruptible', v)} tooltip="客户说话时是否立刻停止机器人播报" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-5">提示词与传参逻辑</h3>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare size={14} className="text-primary" />
                <span className="text-xs font-bold text-slate-700">可视化填写提示词</span>
              </div>
              <div className="flex items-center space-x-3">
                 <span className="text-[10px] text-slate-400">使用 {`{变量名}`} 插入动态参数</span>
                 <button 
                  onClick={() => setShowGenerator(true)} 
                  className="text-primary text-[10px] flex items-center hover:underline bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 transition-colors font-bold"
                >
                  <Sparkles size={10} className="mr-1 fill-sky-200" />
                  AI 生成
                </button>
              </div>
            </div>
            <textarea 
              className="w-full h-80 px-4 py-3 text-sm border border-gray-200 rounded focus:border-primary outline-none transition-all font-mono leading-relaxed bg-slate-50/30" 
              value={config.systemPrompt} 
              onChange={(e) => updateField('systemPrompt', e.target.value)} 
              placeholder="你是一个专业的客服助手..."
            />
          </div>
          <div className="lg:col-span-4">
            <div className="bg-slate-50/50 border border-slate-100 rounded p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-700">业务变量参数</span>
                <button onClick={addParameter} className="text-[10px] px-2 py-0.5 border border-primary text-primary rounded hover:bg-primary/5 flex items-center">
                   <Plus size={10} className="mr-1" /> 添加
                </button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {config.parameters.map((param) => (
                  <div key={param.id} className="flex space-x-2 items-center">
                    <div className="w-1/2 relative">
                       <select 
                         className="w-full px-2 py-1 text-[11px] border border-gray-200 rounded bg-white outline-none appearance-none"
                         value={param.key}
                         onChange={(e) => updateParameter(param.id, 'key', e.target.value)}
                       >
                         <option value="">选择变量</option>
                         {config.variables?.map(v => (
                           <option key={v.id} value={v.name}>{v.name}</option>
                         ))}
                       </select>
                       <ChevronDown size={10} className="absolute right-1 top-2 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <div className="w-1/2 px-2 py-1 text-[11px] bg-slate-100 rounded text-slate-500 font-mono truncate border border-slate-200">
                      {param.key || '-'}
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

      <div className="flex justify-start space-x-4 pt-4 border-t border-gray-100">
         <button onClick={onSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium shadow-sm transition-all">
           保存配置
         </button>
         <button onClick={onCancel} className="px-6 py-2 border border-gray-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium transition-all">
           取消
         </button>
      </div>
    </div>
  );
};

export default BotBasicConfig;
