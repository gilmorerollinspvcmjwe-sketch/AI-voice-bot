
import React, { useState } from 'react';
import { 
  UserSquare, Search, Filter, MapPin, Tag, MoreHorizontal, 
  X, Phone, MessageSquare, Ticket, Clock, Edit3, Calendar,
  ShieldCheck, Zap, History, Settings
} from 'lucide-react';
import { CustomerProfile } from '../../types';
import { TagInput, Label } from '../ui/FormComponents';

// --- Types for Local Use ---
interface TimelineEvent {
  id: string;
  type: 'CALL' | 'MARKETING' | 'TICKET' | 'SYSTEM';
  date: string;
  title: string;
  detail: string;
  status?: string;
}

// --- MOCK DATA ---
const MOCK_PROFILES: CustomerProfile[] = [
  {
    id: '1',
    name: '张伟',
    phoneNumber: '13800138000',
    region: '上海',
    tags: ['高净值', '价格敏感', '理财偏好'],
    lastInteraction: 1715420000000,
    notes: '客户对短期理财产品感兴趣，但对费率比较在意。建议下次推荐费率优惠活动。'
  },
  {
    id: '2',
    name: '李娜',
    phoneNumber: '13912345678',
    region: '北京',
    tags: ['VIP', '投诉风险', '多次进线'],
    lastInteraction: 1715310000000,
    notes: '近期有多次关于物流延误的投诉，情绪较激动。需安抚。'
  },
  {
    id: '3',
    name: '王强',
    phoneNumber: '15098765432',
    region: '深圳',
    tags: ['沉睡用户', '促销激活'],
    lastInteraction: 1709870000000,
    notes: '半年无活跃记录，双11大促营销已触达。'
  },
  {
    id: '4',
    name: '赵敏',
    phoneNumber: '18655556666',
    region: '杭州',
    tags: ['企业客户', '高频'],
    lastInteraction: 1715490000000,
    notes: '企业采购负责人，通常周一上午联系。'
  }
];

const MOCK_TIMELINE: Record<string, TimelineEvent[]> = {
  '1': [
    { id: 'e1', type: 'CALL', date: '2024-05-11 14:30', title: '智能外呼：双11理财推广', detail: '通话时长 45s，意向等级：A级', status: 'success' },
    { id: 'e2', type: 'MARKETING', date: '2024-05-11 14:32', title: '短信触达', detail: '发送优惠券链接短信', status: 'sent' },
    { id: 'e3', type: 'SYSTEM', date: '2024-05-01 10:00', title: '画像更新', detail: '系统自动添加标签：[理财偏好]', status: 'info' }
  ],
  '2': [
    { id: 'e1', type: 'TICKET', date: '2024-05-10 09:15', title: '工单创建', detail: '投诉：物流配送延误 #TK-9982', status: 'open' },
    { id: 'e2', type: 'CALL', date: '2024-05-10 09:10', title: '呼入接待', detail: '通话时长 120s，情绪：愤怒', status: 'handled' }
  ]
};

export default function CustomerProfileManager() {
  const [profiles, setProfiles] = useState<CustomerProfile[]>(MOCK_PROFILES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const filteredData = profiles.filter(p => 
    p.name.includes(searchTerm) || 
    p.phoneNumber.includes(searchTerm) ||
    p.tags.some(t => t.includes(searchTerm))
  );

  const openProfile = (profile: CustomerProfile) => {
    setSelectedProfile(profile);
    setIsDrawerOpen(true);
    setEditingNotes(false);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProfile(null);
  };

  const updateProfileTags = (newTags: string[]) => {
    if (!selectedProfile) return;
    const updated = { ...selectedProfile, tags: newTags };
    setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updated : p));
    setSelectedProfile(updated);
  };

  const updateProfileNotes = (newNotes: string) => {
    if (!selectedProfile) return;
    const updated = { ...selectedProfile, notes: newNotes };
    setProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updated : p));
    setSelectedProfile(updated);
  };

  // Helper to render timeline icons
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'CALL': return <Phone size={14} />;
      case 'MARKETING': return <Zap size={14} />;
      case 'TICKET': return <Ticket size={14} />;
      case 'SYSTEM': return <Settings size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'CALL': return 'bg-blue-100 text-blue-600';
      case 'MARKETING': return 'bg-purple-100 text-purple-600';
      case 'TICKET': return 'bg-amber-100 text-amber-600';
      case 'SYSTEM': return 'bg-slate-100 text-slate-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
              <UserSquare size={24} className="mr-3 text-primary" />
              客户画像管理 (CDP)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              集中管理客户数据资产，基于历史交互自动构建多维画像。
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-primary outline-none w-72"
                placeholder="搜索姓名、手机号或标签..."
                value={searchTerm}
                onChange={handleSearch}
              />
           </div>
           <div className="h-8 w-px bg-slate-200 mx-2"></div>
           <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Filter size={16} className="text-slate-400" />
              <span>筛选:</span>
              <select className="bg-transparent font-medium outline-none cursor-pointer hover:text-primary">
                 <option>所有地区</option>
                 <option>上海</option>
                 <option>北京</option>
              </select>
              <select className="bg-transparent font-medium outline-none cursor-pointer hover:text-primary ml-2">
                 <option>所有标签</option>
                 <option>VIP</option>
                 <option>高净值</option>
              </select>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">客户信息</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">归属地</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase w-1/3">画像标签</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">最近交互</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">操作</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredData.map(profile => (
                       <tr key={profile.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openProfile(profile)}>
                          <td className="px-6 py-4">
                             <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-3 shadow-sm ${
                                   profile.tags.includes('VIP') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                   {profile.name[0]}
                                </div>
                                <div>
                                   <div className="font-bold text-slate-800 text-sm flex items-center">
                                      {profile.name}
                                      {profile.tags.includes('VIP') && <ShieldCheck size={12} className="ml-1 text-amber-500 fill-amber-100" />}
                                   </div>
                                   <div className="text-xs text-slate-500 font-mono mt-0.5">{profile.phoneNumber}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center text-sm text-slate-600">
                                <MapPin size={14} className="mr-1 text-slate-400" />
                                {profile.region}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-1.5">
                                {profile.tags.slice(0, 4).map((tag, i) => (
                                   <span key={i} className={`px-2 py-0.5 rounded text-xs border ${
                                      tag === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                      tag.includes('风险') ? 'bg-red-50 text-red-600 border-red-100' :
                                      'bg-slate-50 text-slate-600 border-slate-100'
                                   }`}>
                                      {tag}
                                   </span>
                                ))}
                                {profile.tags.length > 4 && <span className="text-xs text-slate-400 self-center">...</span>}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                             <div className="flex items-center">
                                <History size={14} className="mr-1.5 opacity-70" />
                                {new Date(profile.lastInteraction).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-full transition-colors">
                                <MoreHorizontal size={18} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
              共 {filteredData.length} 位客户
           </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {isDrawerOpen && selectedProfile && (
         <div className="w-[450px] bg-white border-l border-gray-200 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300 absolute right-0 top-0 bottom-0">
            {/* Drawer Header */}
            <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative shrink-0">
               <div className="absolute top-4 right-4">
                  <button onClick={closeDrawer} className="text-white/50 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="absolute -bottom-10 left-6 flex items-end">
                  <div className="w-20 h-20 rounded-xl bg-white p-1 shadow-lg">
                     <div className={`w-full h-full rounded-lg flex items-center justify-center text-3xl font-bold ${
                        selectedProfile.tags.includes('VIP') ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                     }`}>
                        {selectedProfile.name[0]}
                     </div>
                  </div>
                  <div className="mb-12 ml-4">
                     <h2 className="text-xl font-bold text-white flex items-center">
                        {selectedProfile.name}
                        {selectedProfile.tags.includes('VIP') && (
                           <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded font-bold uppercase tracking-wider">VIP</span>
                        )}
                     </h2>
                     <div className="text-white/70 text-sm font-mono flex items-center mt-1">
                        <Phone size={12} className="mr-1.5" /> {selectedProfile.phoneNumber}
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-14 px-6 pb-6 space-y-8">
               
               {/* Basic Stats */}
               <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-100">
                  <div className="text-center">
                     <div className="text-xs text-slate-500 mb-1">通话次数</div>
                     <div className="text-lg font-bold text-slate-800">12</div>
                  </div>
                  <div className="text-center border-l border-r border-gray-100">
                     <div className="text-xs text-slate-500 mb-1">营销触达</div>
                     <div className="text-lg font-bold text-slate-800">5</div>
                  </div>
                  <div className="text-center">
                     <div className="text-xs text-slate-500 mb-1">工单记录</div>
                     <div className="text-lg font-bold text-slate-800">2</div>
                  </div>
               </div>

               {/* Tags */}
               <section>
                  <div className="flex justify-between items-center mb-3">
                     <h3 className="text-sm font-bold text-slate-800 flex items-center">
                        <Tag size={16} className="mr-2 text-primary" /> 画像标签
                     </h3>
                  </div>
                  <TagInput 
                     label=""
                     tags={selectedProfile.tags}
                     onChange={updateProfileTags}
                     placeholder="添加标签..."
                  />
               </section>

               {/* Notes / AI Insight */}
               <section>
                  <div className="flex justify-between items-center mb-3">
                     <h3 className="text-sm font-bold text-slate-800 flex items-center">
                        <MessageSquare size={16} className="mr-2 text-indigo-600" /> 
                        AI 洞察摘要
                     </h3>
                     <button onClick={() => setEditingNotes(!editingNotes)} className="text-slate-400 hover:text-slate-600">
                        <Edit3 size={14} />
                     </button>
                  </div>
                  {editingNotes ? (
                     <textarea 
                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:border-primary outline-none resize-none bg-slate-50"
                        value={selectedProfile.notes || ''}
                        onChange={(e) => updateProfileNotes(e.target.value)}
                        onBlur={() => setEditingNotes(false)}
                        autoFocus
                     />
                  ) : (
                     <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-slate-700 leading-relaxed relative">
                        <div className="absolute top-3 right-3 text-indigo-200">
                           <Zap size={16} />
                        </div>
                        {selectedProfile.notes || '暂无摘要'}
                     </div>
                  )}
               </section>

               {/* Timeline */}
               <section>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                     <History size={16} className="mr-2 text-slate-500" /> 
                     全渠道旅程
                  </h3>
                  <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                     {(MOCK_TIMELINE[selectedProfile.id] || []).map((event, idx) => (
                        <div key={idx} className="relative pl-8">
                           <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${getEventColor(event.type)}`}>
                              {getEventIcon(event.type)}
                           </div>
                           <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-sm font-bold text-slate-800">{event.title}</span>
                                 <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{event.date.split(' ')[0]}</span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                 {event.detail}
                              </p>
                           </div>
                        </div>
                     ))}
                     {(!MOCK_TIMELINE[selectedProfile.id] || MOCK_TIMELINE[selectedProfile.id].length === 0) && (
                        <div className="text-center text-xs text-slate-400 py-4">暂无历史记录</div>
                     )}
                  </div>
               </section>

            </div>
         </div>
      )}
    </div>
  );
}
