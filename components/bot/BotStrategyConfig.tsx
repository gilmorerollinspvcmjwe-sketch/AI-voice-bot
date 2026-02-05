
import React from 'react';
import { 
  Headset, Search, RotateCcw, Clock, PhoneOff, CheckCircle2, 
  MessageSquare, UserX, PlusCircle, X, Volume2, MicOff, Mic
} from 'lucide-react';
import { Switch, Label, TagInput, Select } from '../ui/FormComponents';
import { BotConfiguration } from '../../types';

// --- Helper Components ---

const StrategyCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8 transition-all hover:shadow-md">
    <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center">
        <div className="p-2 bg-white rounded-lg shadow-sm mr-3 text-primary border border-gray-100">
          {icon}
        </div>
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
);

const SubSection: React.FC<{ title: string; enabled?: boolean; onToggle?: (v: boolean) => void; children: React.ReactNode }> = ({ title, enabled, onToggle, children }) => (
  <div className={`mb-8 last:mb-0 transition-all duration-300 ${onToggle && !enabled ? 'opacity-50' : 'opacity-100'}`}>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-slate-700 flex items-center">
        <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
        {title}
      </h4>
      {onToggle && (
        <Switch label="" checked={enabled || false} onChange={onToggle} />
      )}
    </div>
    <div className={`pl-3 border-l border-slate-100 ml-1 space-y-4 ${onToggle && !enabled ? 'pointer-events-none' : ''}`}>
      {children}
    </div>
  </div>
);

// --- Main Component ---

interface BotStrategyConfigProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const BotStrategyConfig: React.FC<BotStrategyConfigProps> = ({ config, updateField, onSave, onCancel }) => {
  return (
    <div className="space-y-6">
      <StrategyCard title="开场欢迎语" icon={<MessageSquare size={18} />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 mr-3 shadow-sm text-primary">
                <Volume2 size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">启用开场白</div>
                <div className="text-[11px] text-slate-500">电话接通后机器人首先播放的话术</div>
              </div>
            </div>
            <Switch label="" checked={config.welcomeMessageEnabled} onChange={(v) => updateField('welcomeMessageEnabled', v)} />
          </div>
          
          <div className={`transition-opacity duration-200 ${!config.welcomeMessageEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                 <Label label="欢迎语话术" required />
                 <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center">
                       {config.welcomeMessageInterruptible ? <Mic size={10} className="mr-1"/> : <MicOff size={10} className="mr-1"/>}
                       允许打断
                    </span>
                    <Switch label="" checked={config.welcomeMessageInterruptible ?? true} onChange={(v) => updateField('welcomeMessageInterruptible', v)} />
                 </div>
              </div>
              <textarea 
                className="w-full h-24 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white leading-relaxed shadow-sm"
                value={config.welcomeMessage}
                onChange={(e) => updateField('welcomeMessage', e.target.value)}
                placeholder="例如：您好，这里是XX科技，请问有什么可以帮您？"
              />
          </div>
        </div>
      </StrategyCard>

      <StrategyCard title="转人工策略" icon={<Headset size={18} />}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <SubSection title="触发条件">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 mr-3 shadow-sm text-primary">
                    <Search size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">意图识别转人工</div>
                    <div className="text-[11px] text-slate-500">包含默认语义识别及下方自定义关键词</div>
                  </div>
                </div>
                <Switch label="" checked={config.transferIntentDefaultEnabled} onChange={(v) => updateField('transferIntentDefaultEnabled', v)} />
              </div>
              
              <div className={`bg-white p-4 border border-slate-100 rounded-xl shadow-sm ${!config.transferIntentDefaultEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                   <Label label="自定义转人工关键词" tooltip="添加特定的词汇来强制触发转人工流程" />
                </div>
                <TagInput 
                  label="" 
                  placeholder="输入词汇后回车..." 
                  tags={config.transferCustomIntents} 
                  onChange={(tags) => updateField('transferCustomIntents', tags)} 
                  disabled={!config.transferIntentDefaultEnabled}
                />
                
                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                   <div className="text-xs text-slate-500 flex flex-col">
                      <span className="font-bold text-slate-700">意图确认阈值</span>
                      <span className="scale-90 origin-left opacity-70">连续识别到 N 次才执行动作</span>
                   </div>
                   <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-1">
                      <button 
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary disabled:opacity-30"
                        onClick={() => updateField('transferIntentThreshold', Math.max(1, (config.transferIntentThreshold || 1) - 1))}
                        disabled={config.transferIntentThreshold <= 1}
                      >-</button>
                      <input 
                         className="w-8 text-center bg-transparent text-xs font-bold outline-none" 
                         value={config.transferIntentThreshold || 1} 
                         readOnly 
                      />
                      <button 
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary disabled:opacity-30"
                        onClick={() => updateField('transferIntentThreshold', Math.min(5, (config.transferIntentThreshold || 1) + 1))}
                        disabled={config.transferIntentThreshold >= 5}
                      >+</button>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-opacity ${config.transferConditionDurationEnabled ? 'opacity-40' : 'opacity-100'}`}>
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                        <RotateCcw size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">最大轮次限制</span>
                        <div className="flex items-center mt-1 space-x-1">
                          <input 
                            type="number" 
                            disabled={config.transferConditionDurationEnabled}
                            className="w-12 h-7 px-1 text-xs border border-gray-200 rounded text-center font-bold focus:border-primary outline-none disabled:bg-gray-100" 
                            value={config.transferConditionRounds} 
                            onChange={(e) => updateField('transferConditionRounds', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <span className="text-[10px] text-slate-400">轮自动转接</span>
                        </div>
                      </div>
                   </div>
                   <Switch 
                      label="" 
                      checked={config.transferConditionRoundsEnabled} 
                      onChange={(v) => {
                        updateField('transferConditionRoundsEnabled', v);
                        if (v) updateField('transferConditionDurationEnabled', false);
                      }} 
                   />
                </div>

                <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-opacity ${config.transferConditionRoundsEnabled ? 'opacity-40' : 'opacity-100'}`}>
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                        <Clock size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">最大通话时长</span>
                        <div className="flex items-center mt-1 space-x-1">
                          <input 
                            type="number" 
                            disabled={config.transferConditionRoundsEnabled}
                            className="w-12 h-7 px-1 text-xs border border-gray-200 rounded text-center font-bold focus:border-primary outline-none disabled:bg-gray-100" 
                            value={config.transferConditionDuration} 
                            onChange={(e) => updateField('transferConditionDuration', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <span className="text-[10px] text-slate-400">秒自动转接</span>
                        </div>
                      </div>
                   </div>
                   <Switch 
                      label="" 
                      checked={config.transferConditionDurationEnabled} 
                      onChange={(v) => {
                        updateField('transferConditionDurationEnabled', v);
                        if (v) updateField('transferConditionRoundsEnabled', false);
                      }} 
                   />
                </div>
              </div>
            </SubSection>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 h-full">
              <Label label="引导话术" tooltip="转接成功前播放的安抚话术" required />
              <textarea 
                className="w-full h-32 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white leading-relaxed mb-6"
                value={config.transferSpeech}
                onChange={(e) => updateField('transferSpeech', e.target.value)}
                placeholder="例如：为了更好地帮您处理问题，正为您转接人工客服，请稍后。"
              />
              
              <div className="pt-6 border-t border-sky-200/50">
                <Label label="目标 IVR 队列" required />
                <Select 
                  label="" 
                  options={[
                    { label: '默认通用技能组', value: 'ivr_default_queue' },
                    { label: '专家坐席组', value: 'ivr_expert' },
                    { label: '投诉建议专线', value: 'ivr_complaint' }
                  ]} 
                  value={config.transferIvrTarget} 
                  onChange={(e) => updateField('transferIvrTarget', e.target.value)} 
                />
              </div>
            </div>
          </div>
        </div>
      </StrategyCard>

      <StrategyCard title="挂机策略" icon={<PhoneOff size={18} />}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <SubSection title="终止条件">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 mr-3 shadow-sm text-green-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">业务闭环挂机</div>
                    <div className="text-[11px] text-slate-500">当收集到所有必需信息后，AI 主动道别挂机</div>
                  </div>
                </div>
                <Switch label="" checked={config.hangupIntentDefaultEnabled} onChange={(v) => updateField('hangupIntentDefaultEnabled', v)} />
              </div>
              
              <div className={`bg-white p-4 border border-slate-100 rounded-xl shadow-sm mb-4 ${!config.hangupIntentDefaultEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                   <Label label="负向意图库 (黑名单)" tooltip="识别到明确拒绝、辱骂词汇时强制挂机" />
                </div>
                <TagInput 
                  label="" 
                  placeholder="如：滚、不需要..." 
                  tags={config.hangupCustomIntents} 
                  onChange={(tags) => updateField('hangupCustomIntents', tags)} 
                  disabled={!config.hangupIntentDefaultEnabled}
                />

                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                   <div className="text-xs text-slate-500 flex flex-col">
                      <span className="font-bold text-slate-700">意图确认阈值</span>
                      <span className="scale-90 origin-left opacity-70">连续识别到 N 次才执行动作</span>
                   </div>
                   <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 px-1">
                      <button 
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary disabled:opacity-30"
                        onClick={() => updateField('hangupIntentThreshold', Math.max(1, (config.hangupIntentThreshold || 1) - 1))}
                        disabled={config.hangupIntentThreshold <= 1}
                      >-</button>
                      <input 
                         className="w-8 text-center bg-transparent text-xs font-bold outline-none" 
                         value={config.hangupIntentThreshold || 1} 
                         readOnly 
                      />
                      <button 
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-primary disabled:opacity-30"
                        onClick={() => updateField('hangupIntentThreshold', Math.min(5, (config.hangupIntentThreshold || 1) + 1))}
                        disabled={config.hangupIntentThreshold >= 5}
                      >+</button>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-opacity ${config.hangupConditionDurationEnabled ? 'opacity-40' : 'opacity-100'}`}>
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                        <RotateCcw size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">最大轮次限制</span>
                        <div className="flex items-center mt-1 space-x-1">
                          <input 
                            type="number" 
                            disabled={config.hangupConditionDurationEnabled}
                            className="w-12 h-7 px-1 text-xs border border-gray-200 rounded text-center font-bold focus:border-primary outline-none disabled:bg-gray-100" 
                            value={config.hangupConditionRounds} 
                            onChange={(e) => updateField('hangupConditionRounds', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <span className="text-[10px] text-slate-400">轮自动挂机</span>
                        </div>
                      </div>
                   </div>
                   <Switch 
                      label="" 
                      checked={config.hangupConditionRoundsEnabled} 
                      onChange={(v) => {
                        updateField('hangupConditionRoundsEnabled', v);
                        if (v) updateField('hangupConditionDurationEnabled', false);
                      }} 
                   />
                </div>

                <div className={`flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition-opacity ${config.hangupConditionRoundsEnabled ? 'opacity-40' : 'opacity-100'}`}>
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                        <Clock size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">最大通话时长</span>
                        <div className="flex items-center mt-1 space-x-1">
                          <input 
                            type="number" 
                            disabled={config.hangupConditionRoundsEnabled}
                            className="w-12 h-7 px-1 text-xs border border-gray-200 rounded text-center font-bold focus:border-primary outline-none disabled:bg-gray-100" 
                            value={config.hangupConditionDuration} 
                            onChange={(e) => updateField('hangupConditionDuration', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                          <span className="text-[10px] text-slate-400">秒自动挂机</span>
                        </div>
                      </div>
                   </div>
                   <Switch 
                      label="" 
                      checked={config.hangupConditionDurationEnabled} 
                      onChange={(v) => {
                        updateField('hangupConditionDurationEnabled', v);
                        if (v) updateField('hangupConditionRoundsEnabled', false);
                      }} 
                   />
                </div>
              </div>
            </SubSection>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 h-full">
                <div className="flex items-center space-x-2 mb-4">
                   <MessageSquare size={16} className="text-primary" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-500">礼貌结语</span>
                </div>
                <textarea 
                  className="w-full h-32 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white leading-relaxed"
                  value={config.hangupSpeech}
                  onChange={(e) => updateField('hangupSpeech', e.target.value)}
                  placeholder="例如：感谢您的接听，有任何需要欢迎随时联系我们，祝您生活愉快，再见。"
                />
             </div>
          </div>
        </div>
      </StrategyCard>

      <StrategyCard title="无应答策略" icon={<UserX size={18} />}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">用户不回答时间间隔 (秒)</div>
                    <div className="text-[11px] text-slate-500 mt-1">系统等待客户回应的时长 (1-60s)</div>
                  </div>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                  <input 
                    type="number" 
                    min="1" max="60"
                    className="w-16 h-10 text-sm font-bold text-center outline-none" 
                    value={config.noAnswerInterval} 
                    onChange={(e) => updateField('noAnswerInterval', Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase pr-1">Sec</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm text-slate-500">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">连续未响应上限 (次)</div>
                    <div className="text-[11px] text-slate-500 mt-1">超过次数后自动执行挂机处理 (1-10次)</div>
                  </div>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                  <input 
                    type="number" 
                    min="1" max="10"
                    className="w-16 h-10 text-sm font-bold text-center outline-none" 
                    value={config.noAnswerMaxRepeats} 
                    onChange={(e) => updateField('noAnswerMaxRepeats', Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase pr-1">Times</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5">
             <div className="bg-sky-50 rounded-2xl p-6 border border-sky-100 h-full">
                <div className="flex items-center space-x-2 mb-4">
                   <MessageSquare size={16} className="text-primary" />
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-500">追问话术</span>
                </div>
                <textarea 
                  className="w-full h-32 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none bg-white leading-relaxed"
                  value={config.noAnswerSpeech}
                  onChange={(e) => updateField('noAnswerSpeech', e.target.value)}
                  placeholder="例如：不好意思，我没有听清，请您再说一遍好吗？"
                />
                <p className="text-[10px] text-slate-400 mt-2">当用户长时间不说话时，机器人自动播放的提示语。</p>
             </div>
          </div>
        </div>
      </StrategyCard>
      
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

export default BotStrategyConfig;
