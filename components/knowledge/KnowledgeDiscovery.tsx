
import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Settings, Filter, Check, X, ArrowUpRight, 
  MessageSquare, UserCog, Loader2, Plus, Clock, AlertCircle,
  Calendar, ChevronLeft, ChevronRight, Play, Eye, Tag,
  ChevronDown, Trash2
} from 'lucide-react';
import { KnowledgeCandidate, KnowledgeSettings, QAPair } from '../../types';
import { Switch, Slider, Select } from '../ui/FormComponents';
import CategorySelector from './CategorySelector';

// --- MOCK DATA ---
const MOCK_CANDIDATES: KnowledgeCandidate[] = [
  {
    id: '1',
    question: '如何开具增值税发票？',
    similarQuestions: ['在哪里开发票', '发票怎么弄'],
    answer: '您可以在小程序"我的订单"中选择对应订单，点击"申请开票"，填写抬头信息后即可提交。电子发票将在24小时内发送至您的邮箱。',
    sourceType: 'bot_dialog',
    sourceId: 'Call_20240520_8832',
    frequency: 12,
    confidence: 0.95,
    extractedTime: Date.now() - 3600000,
    status: 'pending',
    category: '售后服务',
    autoCategory: '售后服务',
    categoryConfidence: 0.92
  },
  {
    id: '2',
    question: '退货地址是什么？',
    similarQuestions: ['把货寄到哪里', '售后地址'],
    answer: '我们的退货地址是：北京市朝阳区酒仙桥路10号B座3层，收件人：售后部，电话：400-888-9999。',
    sourceType: 'human_takeover',
    sourceId: 'Call_20240519_1102',
    frequency: 8,
    confidence: 0.88,
    extractedTime: Date.now() - 86400000,
    status: 'pending',
    category: '物流配送',
    autoCategory: '物流配送',
    categoryConfidence: 0.85
  },
  {
    id: '3',
    question: '周末发货吗？',
    answer: '周末仓库正常发货，但受物流公司影响，揽收时间可能会稍微延迟。',
    sourceType: 'bot_dialog',
    sourceId: 'Call_20240520_9912',
    frequency: 5,
    confidence: 0.72,
    extractedTime: Date.now() - 120000,
    status: 'pending',
    category: '物流配送',
    autoCategory: '物流配送',
    categoryConfidence: 0.78
  },
  {
    id: '4',
    question: '你们有线下门店吗？',
    answer: '目前我们主要通过线上渠道销售，暂时没有线下实体门店。',
    sourceType: 'bot_dialog',
    sourceId: 'Call_20240520_4421',
    frequency: 3,
    confidence: 0.91,
    extractedTime: Date.now() - 4500000,
    status: 'pending',
    category: '产品咨询',
    autoCategory: '产品咨询',
    categoryConfidence: 0.88
  },
  {
    id: '5',
    question: '什么时候上新款？',
    similarQuestions: ['有新品吗', '最近有什么新货'],
    answer: '我们通常在每月的1号和15号上新，请关注店铺首页公告。',
    sourceType: 'bot_dialog',
    sourceId: 'Call_20240521_1234',
    frequency: 2,
    confidence: 0.65,
    extractedTime: Date.now() - 500000,
    status: 'pending',
    category: '产品咨询',
    autoCategory: '产品咨询',
    categoryConfidence: 0.72
  }
];

const MOCK_TRANSCRIPTS: Record<string, {role: 'user' | 'agent' | 'bot', content: string, time: string}[]> = {
  'Call_20240520_8832': [
    { role: 'bot', content: '您好，这里是商城客服，请问有什么可以帮您？', time: '10:00:01' },
    { role: 'user', content: '我想问下那个发票怎么弄啊？', time: '10:00:05' },
    { role: 'bot', content: '您是想开具增值税发票吗？', time: '10:00:08' },
    { role: 'user', content: '对的，公司报销用。', time: '10:00:12' },
    { role: 'bot', content: '明白。您可以在小程序"我的订单"中选择对应订单，点击"申请开票"，填写抬头信息后即可提交。电子发票将在24小时内发送至您的邮箱。', time: '10:00:15' },
    { role: 'user', content: '好的谢谢。', time: '10:00:20' }
  ],
  'Call_20240519_1102': [
    { role: 'bot', content: '您好，请问有什么问题？', time: '14:20:00' },
    { role: 'user', content: '我要退货，地址发我一下。', time: '14:20:05' },
    { role: 'bot', content: '好的，请稍等，正在为您查询订单信息...', time: '14:20:08' },
    { role: 'agent', content: '先生您好，我是人工客服工号9527。退货地址是：北京市朝阳区酒仙桥路10号B座3层，收件人售后部。', time: '14:20:30' },
    { role: 'user', content: '电话呢？', time: '14:20:35' },
    { role: 'agent', content: '电话是 400-888-9999。', time: '14:20:40' }
  ]
};

const DEFAULT_SETTINGS: KnowledgeSettings = {
  enableExtraction: true,
  extractionPrompt: '请分析对话内容，提取用户咨询的高频业务问题及对应的标准回答。忽略寒暄语和无效沟通。',
  enableMissingIdentification: false,
  heatCalculationCycle: 'weekly',
  extractionSchedule: 'realtime',
  sourceFilter: 'all',
  confidenceThreshold: 60
};

// 可用分类列表
const DEFAULT_CATEGORIES = ['售后服务', '物流配送', '支付相关', '产品咨询', '账户问题', '优惠活动', '未分类'];

export default function KnowledgeDiscovery() {
  const [candidates, setCandidates] = useState<KnowledgeCandidate[]>(MOCK_CANDIDATES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<KnowledgeSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [viewingSource, setViewingSource] = useState<KnowledgeCandidate | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [batchCategory, setBatchCategory] = useState('');
  const [syncToQA, setSyncToQA] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCandidates = candidates.filter(c => {
    if (c.status !== filter) return false;
    if (c.confidence * 100 < settings.confidenceThreshold) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Handlers ---
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCandidates.map(c => c.id));
    }
  };

  // 更新单个条目的分类
  const handleUpdateCategory = (id: string, category: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, category } : c
    ));
  };

  // 采纳单个条目
  const handleAdopt = (item: KnowledgeCandidate) => {
    const updatedItem: KnowledgeCandidate = {
      ...item,
      status: 'approved',
      adoptedAt: Date.now(),
      adoptedBy: 'current_user'
    };
    
    setCandidates(prev => prev.map(c => c.id === item.id ? updatedItem : c));
    setSelectedIds(selectedIds.filter(i => i !== item.id));
    
    // 同步到问答对管理
    if (syncToQA) {
      syncToQAManager(updatedItem);
    }
    
    showToast('已采纳', `已添加到${item.category || '默认分类'}`);
  };

  // 批量采纳
  const handleBatchAdopt = () => {
    const targetCategory = batchCategory || '默认分类';
    
    selectedIds.forEach(id => {
      const item = candidates.find(c => c.id === id);
      if (item) {
        const updatedItem: KnowledgeCandidate = {
          ...item,
          status: 'approved',
          category: targetCategory,
          adoptedAt: Date.now(),
          adoptedBy: 'current_user'
        };
        
        setCandidates(prev => prev.map(c => c.id === id ? updatedItem : c));
        
        if (syncToQA) {
          syncToQAManager(updatedItem);
        }
      }
    });
    
    setSelectedIds([]);
    setShowBatchMenu(false);
    setBatchCategory('');
    showToast('批量采纳完成', `已采纳 ${selectedIds.length} 条知识`);
  };

  // 批量修改分类
  const handleBatchUpdateCategory = () => {
    if (!batchCategory) return;
    
    selectedIds.forEach(id => {
      setCandidates(prev => prev.map(c => 
        c.id === id ? { ...c, category: batchCategory } : c
      ));
    });
    
    setShowBatchMenu(false);
    setBatchCategory('');
    showToast('批量修改完成', `已修改 ${selectedIds.length} 条知识的分类`);
  };

  // 批量忽略
  const handleBatchReject = () => {
    selectedIds.forEach(id => {
      setCandidates(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'rejected' } : c
      ));
    });
    
    setSelectedIds([]);
    setShowBatchMenu(false);
    showToast('批量忽略完成', `已忽略 ${selectedIds.length} 条知识`);
  };

  // 同步到问答对管理
  const syncToQAManager = (item: KnowledgeCandidate) => {
    const qaPair: QAPair = {
      id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: item.question,
      answer: item.answer,
      similarQuestions: item.similarQuestions || [],
      category: item.category || '默认分类',
      status: 'active',
      source: 'knowledge_discovery',
      sourceId: item.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 这里应该调用API保存到问答对管理
    console.log('同步到问答对管理:', qaPair);
    
    // 触发事件通知问答对管理组件
    window.dispatchEvent(new CustomEvent('qa-pair-added', { detail: qaPair }));
  };

  // 添加新分类
  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  const handleManualExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      showToast('手动任务已完成', '新增 0 条知识候选 (模拟)');
    }, 2000);
  };

  const showToast = (title: string, msg: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-8 bg-green-50 text-green-700 border border-green-200 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300';
    toast.innerHTML = `
      <div class="p-1 bg-green-100 rounded-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M20 6L9 17l-5-5"></path></svg></div>
      <div>
        <h4 class="font-bold text-sm">${title}</h4>
        <p class="text-xs text-green-600 mt-0.5">${msg}</p>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-full mx-auto w-full h-full flex flex-col relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <Lightbulb size={20} className="text-amber-500 mr-2" />
            知识发现
          </h1>
          <p className="text-xs text-slate-500 mt-1">
             利用大模型自动从历史对话中挖掘高价值问答对，辅助知识库建设。
          </p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-primary transition-colors flex items-center shadow-sm"
           >
             <Settings size={14} className="mr-1.5" /> 知识运营设置
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
           <div className="flex items-center space-x-4">
              <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                 {['pending', 'approved', 'rejected'].map((s) => (
                    <button 
                      key={s}
                      onClick={() => { setFilter(s as any); setSelectedIds([]); setCurrentPage(1); }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        filter === s ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {s === 'pending' ? '待审核' : (s === 'approved' ? '已采纳' : '已忽略')}
                    </button>
                 ))}
              </div>
              <span className="text-xs text-slate-400 border-l border-slate-200 pl-4">
                 共 {filteredCandidates.length} 条
              </span>
           </div>

           {selectedIds.length > 0 && (
             <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-5 duration-200">
                <span className="text-xs text-slate-500 mr-2">已选 {selectedIds.length} 项</span>
                
                {/* 批量操作下拉 */}
                <div className="relative">
                  <button 
                    onClick={() => setShowBatchMenu(!showBatchMenu)}
                    className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primary/90 flex items-center"
                  >
                    批量操作
                    <ChevronDown size={12} className="ml-1" />
                  </button>
                  
                  {showBatchMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowBatchMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                        {/* 批量采纳 */}
                        <div className="px-3 py-2 border-b border-slate-100">
                          <div className="text-xs font-bold text-slate-700 mb-2">批量采纳到</div>
                          <CategorySelector
                            value={batchCategory}
                            onChange={setBatchCategory}
                            categories={categories}
                            onAddCategory={handleAddCategory}
                            placeholder="选择分类"
                          />
                          <label className="flex items-center mt-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={syncToQA}
                              onChange={(e) => setSyncToQA(e.target.checked)}
                              className="mr-1.5 rounded border-slate-300 text-primary"
                            />
                            同步到问答对管理
                          </label>
                          <button
                            onClick={handleBatchAdopt}
                            disabled={!batchCategory}
                            className="w-full mt-2 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            确认采纳
                          </button>
                        </div>
                        
                        {/* 批量修改分类 */}
                        <div className="px-3 py-2 border-b border-slate-100">
                          <div className="text-xs font-bold text-slate-700 mb-2">批量修改分类</div>
                          <CategorySelector
                            value={batchCategory}
                            onChange={setBatchCategory}
                            categories={categories}
                            onAddCategory={handleAddCategory}
                            placeholder="选择新分类"
                          />
                          <button
                            onClick={handleBatchUpdateCategory}
                            disabled={!batchCategory}
                            className="w-full mt-2 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            确认修改
                          </button>
                        </div>
                        
                        {/* 批量忽略 */}
                        <button 
                          onClick={handleBatchReject}
                          className="w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center"
                        >
                          <X size={12} className="mr-2 text-slate-400" />
                          批量忽略
                        </button>
                      </div>
                    </>
                  )}
                </div>
             </div>
           )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="w-10 px-4 py-3 bg-slate-50">
                   <input 
                     type="checkbox" 
                     className="rounded border-slate-300 text-primary focus:ring-primary/20"
                     checked={paginatedCandidates.length > 0 && selectedIds.length === paginatedCandidates.length}
                     onChange={handleSelectAll}
                   />
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/4">建议问题</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/3">建议答案</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">分类</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">来源/热度</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCandidates.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                     <div className="flex flex-col items-center">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <Filter size={24} className="opacity-20" />
                       </div>
                       <p className="text-sm">暂无{filter === 'pending' ? '待审核' : (filter === 'approved' ? '已采纳' : '已忽略')}的知识条目</p>
                     </div>
                   </td>
                 </tr>
              ) : (
                paginatedCandidates.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4 align-top pt-5">
                       <input 
                         type="checkbox" 
                         className="rounded border-slate-300 text-primary focus:ring-primary/20"
                         checked={selectedIds.includes(item.id)}
                         onChange={() => handleSelect(item.id)}
                       />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm font-bold text-slate-800 mb-1">{item.question}</div>
                      {item.similarQuestions && item.similarQuestions.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                            {item.similarQuestions.slice(0, 2).map((q, i) => (
                               <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{q}</span>
                            ))}
                            {item.similarQuestions.length > 2 && <span className="text-[10px] text-slate-400">+{item.similarQuestions.length - 2}</span>}
                         </div>
                      )}
                      <div className="text-xs text-slate-400 mt-2">提取时间: {new Date(item.extractedTime).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 max-h-24 overflow-y-auto custom-scrollbar">
                        {item.answer}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <CategorySelector
                        value={item.category || ''}
                        onChange={(category) => handleUpdateCategory(item.id, category)}
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        showConfidence={true}
                        confidence={item.categoryConfidence}
                        autoCategory={item.autoCategory}
                      />
                    </td>
                    <td className="px-4 py-4 align-top">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-slate-600">
                            {item.sourceType === 'human_takeover' ? <UserCog size={12} className="mr-1 text-purple-500"/> : <MessageSquare size={12} className="mr-1 text-blue-500"/>}
                            {item.sourceType === 'human_takeover' ? '人工接管' : '机器对话'}
                          </div>
                          <div className="text-xs text-slate-500 bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded w-fit font-mono">
                             🔥 {item.frequency} 次
                          </div>
                          <div className="flex items-center mt-1">
                            <div className={`w-12 h-1.5 rounded-full overflow-hidden bg-slate-100 mr-2`}>
                               <div className={`h-full rounded-full ${item.confidence > 0.9 ? 'bg-green-500' : (item.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500')}`} style={{width: `${item.confidence * 100}%`}}></div>
                            </div>
                            <span className="text-xs font-mono text-slate-500">{Math.round(item.confidence * 100)}%</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                       <div className="flex justify-end space-x-2">
                         {item.status === 'pending' && (
                           <>
                             <button 
                               onClick={() => handleAdopt(item)}
                               className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                               title="采纳"
                             >
                               <Check size={16} />
                             </button>
                             <button 
                               onClick={() => {
                                 setCandidates(prev => prev.map(c => c.id === item.id ? { ...c, status: 'rejected' } : c));
                                 setSelectedIds(selectedIds.filter(i => i !== item.id));
                               }}
                               className="p-1.5 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded transition-colors"
                               title="忽略"
                             >
                               <X size={16} />
                             </button>
                           </>
                         )}
                         <button 
                           onClick={() => setViewingSource(item)}
                           className="p-1.5 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded" 
                           title="查看来源对话"
                         >
                           <ArrowUpRight size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
           <span className="text-xs text-slate-500">
              显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} 条，共 {filteredCandidates.length} 条
           </span>
           <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 text-xs font-medium rounded border ${p === currentPage ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-[650px] overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800">知识运营设置</h3>
                 <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {/* Section 1: Extraction Toggle */}
                 <div className="flex items-start justify-between">
                    <div>
                       <h4 className="text-sm font-bold text-slate-800 mb-1">FAQ自动抽取</h4>
                       <p className="text-xs text-slate-500">开启后自动从智能体对话和人工对话中抽取优秀FAQ。</p>
                    </div>
                    <Switch 
                       label="" 
                       checked={settings.enableExtraction} 
                       onChange={(v) => setSettings({...settings, enableExtraction: v})} 
                    />
                 </div>

                 {/* Section 2: Requirements */}
                 <div className={`transition-opacity duration-200 space-y-6 ${!settings.enableExtraction ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="relative">
                       <label className="text-sm font-bold text-slate-800 mb-2 block">抽取Prompt指令</label>
                       <textarea 
                          className="w-full h-24 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none resize-none transition-all placeholder:text-slate-400"
                          value={settings.extractionPrompt}
                          onChange={(e) => setSettings({...settings, extractionPrompt: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="text-xs font-bold text-slate-600 mb-1.5 block">触发任务频率</label>
                           <Select 
                             options={[
                               { label: '实时 (通话结束即触发)', value: 'realtime' },
                               { label: '每日凌晨 2:00', value: 'daily_2am' },
                               { label: '仅手动触发', value: 'manual' }
                             ]}
                             value={settings.extractionSchedule}
                             onChange={(e) => setSettings({...settings, extractionSchedule: e.target.value as any})}
                           />
                           {settings.extractionSchedule === 'manual' && (
                             <button 
                               onClick={handleManualExtraction}
                               disabled={isExtracting}
                               className="mt-2 w-full py-2 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100 hover:bg-blue-100 flex items-center justify-center disabled:opacity-60"
                             >
                               {isExtracting ? <Loader2 size={12} className="animate-spin mr-1"/> : <Play size={12} className="mr-1"/>}
                               立即执行提取任务
                             </button>
                           )}
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-600 mb-1.5 block">热度计算周期</label>
                           <Select 
                             options={[
                               { label: '最近 24 小时', value: 'daily' },
                               { label: '最近 7 天', value: 'weekly' },
                               { label: '最近 30 天', value: 'monthly' }
                             ]}
                             value={settings.heatCalculationCycle}
                             onChange={(e) => setSettings({...settings, heatCalculationCycle: e.target.value as any})}
                           />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="text-xs font-bold text-slate-600 mb-1.5 block">数据源过滤</label>
                           <Select 
                             options={[
                               { label: '所有对话', value: 'all' },
                               { label: '仅人工接管对话 (推荐)', value: 'human_takeover' }
                             ]}
                             value={settings.sourceFilter}
                             onChange={(e) => setSettings({...settings, sourceFilter: e.target.value as any})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-600 mb-1.5 block flex justify-between">
                             <span>置信度阈值过滤</span>
                             <span className="text-primary">{settings.confidenceThreshold}%</span>
                           </label>
                           <div className="pt-2 px-1">
                             <Slider 
                               label="" 
                               min={0} 
                               max={100} 
                               value={settings.confidenceThreshold} 
                               onChange={(v) => setSettings({...settings, confidenceThreshold: v})} 
                             />
                           </div>
                           <p className="text-[10px] text-slate-400 mt-1">低于此分数的提取结果将自动忽略</p>
                        </div>
                    </div>
                 </div>

                 {/* Section 3: Missing Knowledge */}
                 <div className="flex items-start justify-between border-t border-gray-100 pt-6">
                    <div>
                       <h4 className="text-sm font-bold text-slate-800 mb-1">知识缺失识别</h4>
                       <p className="text-xs text-slate-500">开启后自动从智能体对话识别知识缺失问题（如回答"不知道"的情况）。</p>
                    </div>
                    <Switch 
                       label="" 
                       checked={settings.enableMissingIdentification} 
                       onChange={(v) => setSettings({...settings, enableMissingIdentification: v})} 
                    />
                 </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50/50">
                 <button 
                   onClick={() => setIsSettingsOpen(false)}
                   className="px-6 py-2 border border-transparent text-slate-600 font-bold text-sm hover:text-slate-800 transition-colors"
                 >
                   取消
                 </button>
                 <button 
                   onClick={() => setIsSettingsOpen(false)}
                   className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all"
                 >
                   保存配置
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* View Source Drawer */}
      {viewingSource && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] flex justify-end">
           <div className="w-[500px] bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-gray-200">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 border border-indigo-200">
                       <MessageSquare size={16} />
                    </span>
                    <div>
                       <h3 className="text-sm font-bold text-slate-800">来源对话溯源</h3>
                       <p className="text-[10px] text-slate-500 font-mono">{viewingSource.sourceId}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewingSource(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                 </button>
              </div>

              {/* Extraction Info */}
              <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
                 <div className="flex items-start mb-2">
                    <div className="min-w-[40px] text-[10px] font-bold text-indigo-400 uppercase mt-0.5">问题</div>
                    <div className="text-sm font-bold text-indigo-900 leading-tight">{viewingSource.question}</div>
                 </div>
                 <div className="flex items-start">
                    <div className="min-w-[40px] text-[10px] font-bold text-indigo-400 uppercase mt-0.5">答案</div>
                    <div className="text-xs text-indigo-800 leading-relaxed opacity-80">{viewingSource.answer}</div>
                 </div>
                 {viewingSource.similarQuestions && viewingSource.similarQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-indigo-200/50">
                       <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">相似问法</div>
                       <div className="flex flex-wrap gap-1">
                          {viewingSource.similarQuestions.map((q, i) => (
                             <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white border border-indigo-100 text-indigo-600 rounded">{q}</span>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              {/* Chat Transcript */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                 {MOCK_TRANSCRIPTS[viewingSource.sourceId] ? (
                    MOCK_TRANSCRIPTS[viewingSource.sourceId].map((msg, i) => (
                       <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm text-[10px] font-bold border ${
                                msg.role === 'user' ? 'bg-white text-slate-600 ml-2 border-slate-200' : (msg.role === 'agent' ? 'bg-purple-100 text-purple-600 mr-2 border-purple-200' : 'bg-blue-100 text-blue-600 mr-2 border-blue-200')
                             }`}>
                                {msg.role === 'user' ? '用户' : (msg.role === 'agent' ? '坐席' : 'AI')}
                             </div>
                             <div className="flex flex-col">
                                <div className={`px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm border ${
                                   msg.role === 'user' 
                                     ? 'bg-white text-slate-800 border-gray-100 rounded-tr-none' 
                                     : (msg.role === 'agent' ? 'bg-purple-50 text-slate-800 border-purple-100 rounded-tl-none' : 'bg-blue-50 text-slate-800 border-blue-100 rounded-tl-none')
                                }`}>
                                   {msg.content}
                                </div>
                                <span className={`text-[10px] text-slate-300 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                   {msg.time}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                       <AlertCircle size={24} className="mb-2 opacity-30" />
                       <p className="text-sm">暂无该会话的详细记录</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// Icon helper
const Edit3Icon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);
