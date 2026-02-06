
import React, { useState } from 'react';
import { Megaphone, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BotConfiguration, MarketingCampaign } from '../../types';
import { Switch, Label, Select } from '../ui/FormComponents';

interface Props {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
  campaigns: MarketingCampaign[];
}

const BotMarketingConfig: React.FC<Props> = ({ config, updateField, campaigns }) => {
  const toggleTiming = (timing: string) => {
    const current = config.marketingTimings || [];
    if (current.includes(timing)) {
      updateField('marketingTimings', current.filter(t => t !== timing));
    } else {
      updateField('marketingTimings', [...current, timing]);
    }
  };

  const toggleCampaign = (id: string) => {
    const current = config.activeCampaignIds || [];
    if (current.includes(id)) {
      updateField('activeCampaignIds', current.filter(c => c !== id));
    } else {
      updateField('activeCampaignIds', [...current, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Switch */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mr-4">
            <Megaphone size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">启用智能营销插播</h3>
            <p className="text-xs text-slate-500 mt-1">
              开启后，机器人将根据客户画像在合适时机自动插入营销内容。
            </p>
          </div>
        </div>
        <Switch 
          label="" 
          checked={config.marketingEnabled || false} 
          onChange={(v) => updateField('marketingEnabled', v)} 
        />
      </div>

      <div className={`space-y-6 transition-opacity duration-300 ${!config.marketingEnabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Timing and Strategy */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Timing */}
              <div>
                 <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                    <Clock size={16} className="mr-2 text-slate-500" />
                    触发时机 (Trigger Timing)
                 </h4>
                 <div className="space-y-3">
                    <label className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <input 
                         type="checkbox" 
                         className="mr-3 rounded border-slate-300 text-primary focus:ring-primary"
                         checked={config.marketingTimings?.includes('post_resolution')}
                         onChange={() => toggleTiming('post_resolution')}
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-700">业务办理成功后</div>
                          <div className="text-xs text-slate-500">主流程任务完成后（如查完余额）</div>
                       </div>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <input 
                         type="checkbox" 
                         className="mr-3 rounded border-slate-300 text-primary focus:ring-primary"
                         checked={config.marketingTimings?.includes('silence')}
                         onChange={() => toggleTiming('silence')}
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-700">静默空档期</div>
                          <div className="text-xs text-slate-500">对话出现长时间停顿时自动填充</div>
                       </div>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <input 
                         type="checkbox" 
                         className="mr-3 rounded border-slate-300 text-primary focus:ring-primary"
                         checked={config.marketingTimings?.includes('pre_hangup')}
                         onChange={() => toggleTiming('pre_hangup')}
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-700">通话结束前 (挽留)</div>
                          <div className="text-xs text-slate-500">挂机前的最后一次营销尝试</div>
                       </div>
                    </label>
                 </div>
              </div>

              {/* Strategy */}
              <div>
                 <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                    <AlertTriangle size={16} className="mr-2 text-slate-500" />
                    冲突策略 (Conflict Strategy)
                 </h4>
                 <div className="space-y-3">
                    <label className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <input 
                         type="radio" 
                         name="strategy"
                         className="mr-3 text-primary focus:ring-primary"
                         checked={config.marketingConflictStrategy === 'service_first'}
                         onChange={() => updateField('marketingConflictStrategy', 'service_first')}
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-700">服务优先 (保守)</div>
                          <div className="text-xs text-slate-500">仅在非核心业务流程中触发，避免打断用户</div>
                       </div>
                    </label>
                    <label className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <input 
                         type="radio" 
                         name="strategy"
                         className="mr-3 text-primary focus:ring-primary"
                         checked={config.marketingConflictStrategy === 'marketing_first'}
                         onChange={() => updateField('marketingConflictStrategy', 'marketing_first')}
                       />
                       <div>
                          <div className="text-sm font-bold text-slate-700">营销优先 (激进)</div>
                          <div className="text-xs text-slate-500">只要符合画像，强制尝试插入营销内容</div>
                       </div>
                    </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Campaign Selector */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-6">
           <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
              <CheckCircle2 size={16} className="mr-2 text-slate-500" />
              关联活动 (Active Campaigns)
           </h4>
           <p className="text-xs text-slate-500 mb-4">
              勾选适用于此机器人的营销活动。系统将根据客户画像自动匹配最合适的一个活动。
           </p>
           
           <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {campaigns.map(campaign => (
                 <label key={campaign.id} className={`flex items-center p-3 border rounded-lg transition-colors cursor-pointer ${
                    config.activeCampaignIds?.includes(campaign.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                 }`}>
                    <input 
                       type="checkbox" 
                       className="mr-3 rounded border-slate-300 text-primary focus:ring-primary"
                       checked={config.activeCampaignIds?.includes(campaign.id)}
                       onChange={() => toggleCampaign(campaign.id)}
                    />
                    <div className="flex-1">
                       <div className="flex justify-between">
                          <span className="text-sm font-bold text-slate-700">{campaign.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                             {campaign.status}
                          </span>
                       </div>
                       <div className="text-xs text-slate-500 mt-1 truncate">
                          {campaign.speechContent}
                       </div>
                    </div>
                 </label>
              ))}
              {campaigns.length === 0 && (
                 <div className="text-center py-8 text-slate-400 text-xs">
                    暂无营销活动，请前往“营销活动”模块创建。
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default BotMarketingConfig;
