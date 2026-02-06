
import React, { useState } from 'react';
import { 
  Megaphone, Plus, Search, Edit3, Trash2, Calendar, MapPin, Tag, 
  CheckCircle2, Clock, ArrowRight, X, PlayCircle
} from 'lucide-react';
import { MarketingCampaign } from '../../types';
import { Input, Label, TagInput, Select, Switch } from '../ui/FormComponents';

interface CampaignManagerProps {
  campaigns?: MarketingCampaign[]; // Optional to support existing usage
  onUpdateCampaigns?: (campaigns: MarketingCampaign[]) => void;
}

// Keep mocks here for fallback or initial state in parent
export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  {
    id: '1',
    name: '双11高端理财推广',
    status: 'active',
    targetRegions: ['上海', '北京', '深圳'],
    targetTags: ['高净值', '风险偏好:稳健'],
    startDate: '2024-11-01',
    endDate: '2024-11-15',
    speechContent: '张先生，正好双11我们有一款专属的稳健理财产品，年化收益4.5%，特别适合您这样的稳健型客户，您有兴趣了解一下吗？',
    smsTemplateId: 'SMS_998877',
    exposureCount: 1250,
    conversionCount: 88,
    updatedAt: 1715420000000
  },
  {
    id: '2',
    name: '夏季空调清洗服务推荐',
    status: 'scheduled',
    targetRegions: ['广州', '杭州'],
    targetTags: ['家庭用户', '老客户'],
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    speechContent: '王女士，天气马上热了，我们现在有老客户专属的空调清洗优惠套餐，给您预约个师傅上门看看？',
    exposureCount: 0,
    conversionCount: 0,
    updatedAt: 1715410000000
  },
  {
    id: '3',
    name: '新用户首单关怀',
    status: 'ended',
    targetRegions: [],
    targetTags: ['新注册'],
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    speechContent: '欢迎加入我们，送您一张无门槛优惠券已到账。',
    exposureCount: 5400,
    conversionCount: 320,
    updatedAt: 1712000000000
  }
];

export default function CampaignManager({ campaigns: propCampaigns, onUpdateCampaigns }: CampaignManagerProps = {}) {
  // Use props if provided, otherwise use local state (legacy support)
  const [localCampaigns, setLocalCampaigns] = useState<MarketingCampaign[]>(MOCK_CAMPAIGNS);
  const campaigns = propCampaigns || localCampaigns;
  
  const updateCampaigns = (newCampaigns: MarketingCampaign[]) => {
    if (onUpdateCampaigns) {
      onUpdateCampaigns(newCampaigns);
    } else {
      setLocalCampaigns(newCampaigns);
    }
  };

  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [editingItem, setEditingItem] = useState<MarketingCampaign | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({});

  const handleCreate = () => {
    setFormData({
      name: '',
      status: 'draft',
      targetRegions: [],
      targetTags: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      speechContent: '',
      exposureCount: 0,
      conversionCount: 0
    });
    setEditingItem(null);
    setView('FORM');
  };

  const handleEdit = (item: MarketingCampaign) => {
    setFormData({ ...item });
    setEditingItem(item);
    setView('FORM');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该营销活动吗？')) {
      updateCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.name) return alert("活动名称不能为空");
    if (!formData.speechContent) return alert("推广话术不能为空");

    const newItem: MarketingCampaign = {
      ...formData as MarketingCampaign,
      id: editingItem ? editingItem.id : Date.now().toString(),
      updatedAt: Date.now()
    };

    if (editingItem) {
      updateCampaigns(campaigns.map(c => c.id === editingItem.id ? newItem : c));
    } else {
      updateCampaigns([newItem, ...campaigns]);
    }
    setView('LIST');
  };

  const getStatusBadge = (status: MarketingCampaign['status']) => {
    switch(status) {
      case 'active': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100"><CheckCircle2 size={10} className="mr-1"/> 进行中</span>;
      case 'scheduled': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Clock size={10} className="mr-1"/> 未开始</span>;
      case 'ended': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">已结束</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">草稿</span>;
    }
  };

  if (view === 'FORM') {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full h-full flex flex-col">
         {/* Form Header */}
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button onClick={() => setView('LIST')} className="text-xs text-slate-500 hover:text-primary flex items-center transition-colors mr-3 px-2 py-1 rounded hover:bg-slate-100">
                <ArrowRight size={14} className="rotate-180 mr-1" /> 返回列表
              </button>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {editingItem ? '编辑营销活动' : '创建新活动'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
               <span className="text-sm font-medium text-slate-600">活动状态:</span>
               <Select 
                 className="w-32"
                 value={formData.status} 
                 onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                 options={[
                   { label: '草稿 (Draft)', value: 'draft' },
                   { label: '进行中 (Active)', value: 'active' },
                   { label: '未开始 (Scheduled)', value: 'scheduled' },
                   { label: '已结束 (Ended)', value: 'ended' },
                 ]}
               />
            </div>
         </div>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               
               {/* Basic Info */}
               <section>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                     <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2">1</span>
                     基本信息
                  </h3>
                  <div className="grid grid-cols-2 gap-6 pl-8">
                     <Input 
                        label="活动名称" 
                        required 
                        placeholder="例如：双11大促推广"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                     <div className="grid grid-cols-2 gap-4">
                        <Input 
                           label="开始日期" 
                           type="date"
                           required
                           value={formData.startDate}
                           onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                        <Input 
                           label="结束日期" 
                           type="date"
                           value={formData.endDate}
                           onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                     </div>
                  </div>
               </section>

               {/* Targeting */}
               <section>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                     <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2">2</span>
                     定向人群 (Targeting)
                  </h3>
                  <div className="space-y-6 pl-8">
                     <div>
                        <Label label="目标地区 (Region)" tooltip="仅针对特定区域的客户触发" />
                        <TagInput 
                           label="" 
                           placeholder="输入城市或省份后回车 (如: 上海)"
                           tags={formData.targetRegions || []}
                           onChange={(tags) => setFormData({...formData, targetRegions: tags})}
                        />
                     </div>
                     <div>
                        <Label label="客户画像标签 (Tags)" tooltip="必须包含以下标签的客户才会被触达" />
                        <TagInput 
                           label="" 
                           placeholder="输入标签后回车 (如: 高净值)"
                           tags={formData.targetTags || []}
                           onChange={(tags) => setFormData({...formData, targetTags: tags})}
                        />
                     </div>
                     <div>
                        <Label label="排除标签 (Exclude)" tooltip="包含以下任意标签的客户将被排除" />
                        <TagInput 
                           label="" 
                           placeholder="输入标签后回车 (如: 黑名单)"
                           tags={formData.excludeTags || []}
                           onChange={(tags) => setFormData({...formData, excludeTags: tags})}
                        />
                     </div>
                  </div>
               </section>

               {/* Content */}
               <section>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                     <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2">3</span>
                     触达内容
                  </h3>
                  <div className="pl-8 space-y-6">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <Label label="语音插播话术 (TTS)" required />
                           <button className="text-xs text-primary flex items-center hover:underline">
                              <PlayCircle size={12} className="mr-1" /> 试听效果
                           </button>
                        </div>
                        <textarea 
                           className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                           placeholder="请输入机器人需要播报的营销话术..."
                           value={formData.speechContent}
                           onChange={(e) => setFormData({...formData, speechContent: e.target.value})}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                           提示：支持变量插值，例如 &#123;&#123;customer_name&#125;&#125;
                        </p>
                     </div>
                     
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <Input 
                           label="关联短信模版 (可选)" 
                           placeholder="SMS_TEMPLATE_ID"
                           value={formData.smsTemplateId || ''}
                           onChange={(e) => setFormData({...formData, smsTemplateId: e.target.value})}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                           若填写，将在营销话术播报后自动触发短信发送（如优惠券链接）。
                        </p>
                     </div>
                  </div>
               </section>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
               <button onClick={() => setView('LIST')} className="px-6 py-2 border border-slate-300 rounded text-slate-600 text-sm font-medium hover:bg-white">
                  取消
               </button>
               <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded text-sm font-bold hover:bg-sky-600 shadow-sm">
                  保存配置
               </button>
            </div>
         </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-8 max-w-full mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            <Megaphone size={24} className="mr-3 text-rose-500" />
            营销活动中心
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            配置基于客户画像的智能营销插播策略，提升业务转化率。
          </p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-all flex items-center shadow-lg shadow-sky-100"
        >
          <Plus size={18} className="mr-2" /> 新建活动
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-primary outline-none w-64 bg-white"
                 placeholder="搜索活动名称..."
               />
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-500">
               <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> 进行中: {campaigns.filter(c => c.status === 'active').length}</span>
               <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span> 未开始: {campaigns.filter(c => c.status === 'scheduled').length}</span>
            </div>
         </div>

         {/* Table */}
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">活动名称</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">状态</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-1/4">定向条件</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">有效期</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">曝光/转化</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">操作</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {campaigns.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-800 text-sm mb-1">{item.name}</div>
                           <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.speechContent}</div>
                        </td>
                        <td className="px-6 py-4">
                           {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1.5">
                              {item.targetRegions.length > 0 && (
                                 <div className="flex items-center text-[10px] text-slate-600">
                                    <MapPin size={10} className="mr-1 text-slate-400" />
                                    {item.targetRegions.join(', ')}
                                 </div>
                              )}
                              {item.targetTags.length > 0 && (
                                 <div className="flex flex-wrap gap-1">
                                    {item.targetTags.map((tag, i) => (
                                       <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] border border-indigo-100">{tag}</span>
                                    ))}
                                 </div>
                              )}
                              {item.targetRegions.length === 0 && item.targetTags.length === 0 && <span className="text-xs text-slate-300">无限制 (全员)</span>}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                           <div className="flex items-center mb-1">
                              <Calendar size={12} className="mr-1.5 opacity-70" />
                              {item.startDate}
                           </div>
                           <div className="pl-4 opacity-50">
                              至 {item.endDate || '长期'}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col text-xs">
                              <span className="font-bold text-slate-700">{item.exposureCount} 次触达</span>
                              <span className="text-green-600 font-medium">{item.conversionCount} 次转化 ({item.exposureCount > 0 ? ((item.conversionCount / item.exposureCount)*100).toFixed(1) : 0}%)</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-sky-50 rounded transition-all">
                                 <Edit3 size={16} />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
