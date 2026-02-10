
import React, { useState } from 'react';
import { 
  Plus, Search, Download, ArrowRight, X, Volume2, Play, Loader2, Upload, ChevronDown, CheckCircle2
} from 'lucide-react';
import { QAPair } from '../../types';
import { TagInput, Label, Switch as ToggleSwitch } from '../ui/FormComponents';

// --- MOCK DATA ---
const MOCK_QA_PAIRS: QAPair[] = [
  {
    id: '1',
    standardQuestion: '你吃什么',
    similarQuestions: [],
    answer: '是',
    validityType: 'permanent',
    lastUpdated: 1773134010000,
    isActive: true,
    audioResources: {
      'Azure-Xiaoxiao': 'mock_url_1',
      'Azure-Yunxi': 'mock_url_2'
    }
  },
  {
    id: '2',
    standardQuestion: '你什么工作',
    similarQuestions: [],
    answer: '上班',
    validityType: 'permanent',
    lastUpdated: 1773133991000,
    isActive: true,
    // No audio resources generated yet
  },
  {
    id: '3',
    standardQuestion: '你在哪',
    similarQuestions: [],
    answer: '北京',
    validityType: 'permanent',
    lastUpdated: 1773133985000,
    isActive: false, 
  },
  {
    id: '4',
    standardQuestion: '你是谁?',
    similarQuestions: ['你是干嘛的?', '你是做什么的?', '你叫什么?'],
    answer: '我是顾问',
    validityType: 'permanent',
    lastUpdated: 1773133571000,
    isActive: true,
    audioResources: {
      'Azure-Xiaoxiao': 'mock_url_3'
    }
  }
];

// Mock available voices in the system
const ACTIVE_SYSTEM_VOICES = ['Azure-Xiaoxiao', 'Azure-Yunxi', 'Gemini-Voice-Kore'];

export default function QAManager() {
  const [qaPairs, setQaPairs] = useState<QAPair[]>(MOCK_QA_PAIRS);
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [editingItem, setEditingItem] = useState<QAPair | null>(null);
  
  // Modal States
  const [isBatchTTSOpen, setIsBatchTTSOpen] = useState(false);
  const [activeAudioPopover, setActiveAudioPopover] = useState<string | null>(null); // ID of the row with open audio popover
  
  // Import/Export States
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; fail: number } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<QAPair>>({});

  // Batch TTS State
  const [batchVoices, setBatchVoices] = useState<string[]>(['Azure-Xiaoxiao']);
  const [batchStrategy, setBatchStrategy] = useState<'missing' | 'all'>('missing');
  const [batchScope, setBatchScope] = useState<'active' | 'selected'>('active');
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);

  const handleCreate = () => {
    setFormData({
      standardQuestion: '',
      similarQuestions: [],
      answer: '',
      validityType: 'permanent',
      isActive: true,
      audioResources: {},
    });
    setEditingItem(null);
    setView('FORM');
  };

  const handleEdit = (item: QAPair) => {
    setFormData({ ...item });
    setEditingItem(item);
    setView('FORM');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该问答对吗？')) {
      setQaPairs(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.standardQuestion || !formData.answer) {
      alert('请填写完整标准问题和答案');
      return;
    }

    const newItem: QAPair = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      standardQuestion: formData.standardQuestion!,
      similarQuestions: formData.similarQuestions || [],
      answer: formData.answer!,
      validityType: formData.validityType || 'permanent',
      validityStart: formData.validityStart,
      validityEnd: formData.validityEnd,
      lastUpdated: Date.now(),
      isActive: formData.isActive ?? true,
      audioResources: formData.audioResources || {},
    };

    setQaPairs(prev => {
      if (editingItem) {
        return prev.map(p => p.id === editingItem.id ? newItem : p);
      }
      return [newItem, ...prev];
    });

    setView('LIST');
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    setQaPairs(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
  };

  // --- Import/Export Logic ---
  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      // Simulate API processing delay
      setTimeout(() => {
        setIsImporting(false);
        setImportResult({ success: 12, fail: 3 }); // Mock result
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 1500);
    }
  };

  const handleExport = (type: 'full' | 'template') => {
    setIsExportMenuOpen(false);
    if (type === 'full') {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `qa_knowledge_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("模版下载开始...");
    }
  };

  // --- Batch TTS Logic ---
  const startBatchTTS = () => {
    // Simulate API call
    setBatchProgress({ current: 0, total: 100 });
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setBatchProgress({ current: progress, total: 100 });
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
           setBatchProgress(null);
           setIsBatchTTSOpen(false);
           alert("批量生成任务已完成！");
           // Mock update: add mock audio to items without it
           setQaPairs(prev => prev.map(p => {
             if (p.isActive) {
               const resources = { ...p.audioResources };
               batchVoices.forEach(v => {
                 if (!resources[v] || batchStrategy === 'all') {
                   resources[v] = `generated_${Date.now()}`;
                 }
               });
               return { ...p, audioResources: resources };
             }
             return p;
           }));
        }, 500);
      }
    }, 100);
  };

  if (view === 'FORM') {
    return (
      <div className="p-6 max-w-5xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-2">
         {/* Form Header */}
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button onClick={() => setView('LIST')} className="text-xs text-slate-500 hover:text-primary flex items-center transition-colors mr-3 px-2 py-1 rounded hover:bg-slate-100">
                <ArrowRight size={14} className="rotate-180 mr-1" /> 返回
              </button>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                {editingItem ? '编辑问答对' : '新建问答对'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
               <span className="text-xs font-medium text-slate-600">启用状态</span>
               <ToggleSwitch label="" checked={formData.isActive ?? true} onChange={(v) => setFormData({...formData, isActive: v})} />
            </div>
         </div>

         <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
            {/* Standard Question */}
            <div className="max-w-3xl">
               <Label label="标准问题" required />
               <input 
                 className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                 placeholder="例如：你的公司在哪里？"
                 value={formData.standardQuestion}
                 onChange={(e) => setFormData({...formData, standardQuestion: e.target.value})}
               />
               <p className="text-[11px] text-slate-400 mt-1.5 ml-0.5">该问题将作为NLP匹配的核心依据，请尽量简练准确。</p>
            </div>

            {/* Similar Questions */}
            <div className="max-w-3xl">
               <Label label="相似问题" tooltip="添加语义相近的问法，增加匹配命中率。" />
               <TagInput 
                 label="" 
                 placeholder="输入后回车 (如: 你们在哪办公?)"
                 tags={formData.similarQuestions || []}
                 onChange={(tags) => setFormData({...formData, similarQuestions: tags})}
               />
            </div>

            {/* Answer */}
            <div className="max-w-3xl">
               <div className="flex justify-between items-center mb-2">
                 <Label label="答案内容" required />
                 <div className="flex bg-slate-100 rounded p-0.5 border border-slate-200">
                    <button className="px-2 py-0.5 text-xs font-medium rounded bg-white text-slate-700 shadow-sm border border-slate-200">文本</button>
                    <button className="px-2 py-0.5 text-xs font-medium rounded text-slate-400 hover:text-slate-600">富文本</button>
                 </div>
               </div>
               <textarea 
                 className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all leading-relaxed"
                 placeholder="请输入回答内容..."
                 value={formData.answer}
                 onChange={(e) => setFormData({...formData, answer: e.target.value})}
               />
            </div>

            {/* Validity */}
            <div>
               <Label label="有效期" />
               <div className="flex space-x-6 mt-2">
                  <label className="flex items-center cursor-pointer group">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mr-2 transition-colors ${formData.validityType === 'permanent' ? 'border-primary' : 'border-slate-300'}`}>
                      {formData.validityType === 'permanent' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <input type="radio" className="hidden" checked={formData.validityType === 'permanent'} onChange={() => setFormData({...formData, validityType: 'permanent'})} />
                    <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">永久有效</span>
                  </label>
                  {/* Additional validity options can be added here */}
               </div>
            </div>
         </div>

         {/* Footer Actions */}
         <div className="mt-6 flex items-center space-x-3 max-w-3xl">
            <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-all shadow-sm">
              保存更改
            </button>
            <button onClick={() => setView('LIST')} className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              取消
            </button>
         </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-6 max-w-full mx-auto w-full relative h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">问答对管理</h1>
          <p className="text-xs text-slate-500 mt-1">
             维护 NLP 知识库，支持批量生成 TTS 语音。
          </p>
        </div>
        <div className="flex space-x-3">
           {/* Import Button */}
           <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".xlsx,.csv" />
           <button 
             onClick={triggerImport}
             disabled={isImporting}
             className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-primary transition-colors flex items-center shadow-sm"
           >
             {isImporting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Upload size={14} className="mr-1.5" />}
             导入
           </button>

           {/* Export Dropdown */}
           <div className="relative">
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-primary transition-colors flex items-center shadow-sm"
              >
                <Download size={14} className="mr-1.5" /> 导出 <ChevronDown size={12} className="ml-1 opacity-50" />
              </button>
              {isExportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                     <button onClick={() => handleExport('full')} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary block">全量导出</button>
                     <button onClick={() => handleExport('template')} className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary block border-t border-slate-50">下载模版</button>
                  </div>
                </>
              )}
           </div>

           <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>

           <button 
             onClick={() => setIsBatchTTSOpen(true)}
             className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 hover:text-primary transition-colors flex items-center shadow-sm"
           >
             <Volume2 size={14} className="mr-1.5" /> 录音配置
           </button>
           <button 
             onClick={handleCreate}
             className="bg-primary text-white px-4 py-1.5 rounded-md font-medium text-xs hover:bg-sky-600 transition-all flex items-center shadow-sm"
           >
             <Plus size={16} className="mr-1.5" /> 新增
           </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
           <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:border-primary outline-none w-64 bg-white"
                placeholder="搜索标准问题或答案..."
              />
           </div>
           <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 pl-2">
                  共 {qaPairs.length} 条
              </span>
           </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="w-10 px-4 py-3 bg-slate-50">
                   <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                </th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/5">标准问题</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/4">相似问题</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-1/4">答案预览</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">录音资源</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">更新时间</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {qaPairs.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group relative">
                  <td className="px-4 py-3">
                     <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm font-medium ${item.isActive ? 'text-slate-700' : 'text-slate-400'}`}>{item.standardQuestion}</div>
                  </td>
                  <td className="px-4 py-3">
                    {item.similarQuestions && item.similarQuestions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.similarQuestions.slice(0, 2).map((q, i) => (
                           <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border border-transparent ${item.isActive ? 'text-slate-500 bg-slate-100' : 'text-slate-300 bg-slate-50 border-slate-100'}`}>{q}</span>
                        ))}
                        {item.similarQuestions.length > 2 && <span className="text-[10px] text-slate-400 self-center">...</span>}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm truncate max-w-xs ${item.isActive ? 'text-slate-600' : 'text-slate-400'}`} title={item.answer}>
                      {item.answer}
                    </div>
                  </td>
                  
                  {/* Audio Status Column */}
                  <td className="px-4 py-3 relative">
                     <div className="relative inline-block">
                        {item.audioResources && Object.keys(item.audioResources).length > 0 ? (
                          <button 
                             onClick={() => setActiveAudioPopover(activeAudioPopover === item.id ? null : item.id)}
                             className="flex items-center text-blue-600 hover:text-blue-800 transition-colors px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-100"
                          >
                             <Play size={10} className="fill-current mr-1" />
                             <span className="text-[10px] font-bold">{Object.keys(item.audioResources).length}</span>
                          </button>
                        ) : (
                          <div className="flex items-center text-slate-300" title="仅支持实时TTS">
                             <Volume2 size={14} />
                          </div>
                        )}

                       {/* Popover */}
                       {activeAudioPopover === item.id && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded shadow-lg border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">音频资源</span>
                                <button onClick={() => setActiveAudioPopover(null)}><X size={10} className="text-slate-400 hover:text-slate-600"/></button>
                             </div>
                             
                             <div className="space-y-0.5 mb-2">
                                {item.audioResources && Object.keys(item.audioResources).length > 0 ? (
                                   Object.keys(item.audioResources).map(voice => (
                                     <div key={voice} className="flex justify-between items-center text-xs text-slate-600 hover:bg-slate-50 p-1.5 rounded cursor-pointer group/item">
                                        <span className="truncate max-w-[140px]">{voice}</span>
                                        <Play size={10} className="text-primary opacity-0 group-hover/item:opacity-100" />
                                     </div>
                                   ))
                                ) : (
                                  <div className="text-xs text-slate-400 text-center py-2">无资源</div>
                                )}
                             </div>
                          </div>
                       )}
                     </div>
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </td>
                  
                  {/* Active Switch Column */}
                  <td className="px-4 py-3">
                     <div className="scale-75 origin-left">
                       <ToggleSwitch 
                         label="" 
                         checked={item.isActive} 
                         onChange={(v) => toggleActive(item.id, v)} 
                       />
                     </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-3 text-xs">
                       <button onClick={() => handleEdit(item)} className="text-primary hover:text-sky-700 font-medium">编辑</button>
                       <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch TTS Modal */}
      {isBatchTTSOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <Volume2 size={16} className="mr-2 text-primary" />
                    批量录音生成 (Batch TTS)
                 </h3>
                 <button onClick={() => !batchProgress && setIsBatchTTSOpen(false)} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                    <X size={16} />
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 {batchProgress ? (
                    <div className="py-6 text-center space-y-4">
                       <Loader2 size={32} className="mx-auto text-primary animate-spin" />
                       <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-700">正在生成音频文件...</h4>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                             <div 
                                className="bg-primary h-full transition-all duration-200"
                                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                             ></div>
                          </div>
                          <p className="text-xs text-slate-400">
                             进度: {batchProgress.current} / {batchProgress.total}
                          </p>
                       </div>
                    </div>
                 ) : (
                   <>
                      {/* Section 1: Target Voices */}
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">1. 目标音色</label>
                         <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50">
                            {ACTIVE_SYSTEM_VOICES.map(voice => (
                               <label key={voice} className="flex items-center cursor-pointer hover:bg-slate-100 p-1 rounded">
                                  <input 
                                     type="checkbox" 
                                     className="rounded border-slate-300 text-primary focus:ring-primary/20 mr-2.5 scale-90"
                                     checked={batchVoices.includes(voice)}
                                     onChange={(e) => {
                                        if (e.target.checked) setBatchVoices([...batchVoices, voice]);
                                        else setBatchVoices(batchVoices.filter(v => v !== voice));
                                     }}
                                  />
                                  <span className="text-xs text-slate-700 font-medium">{voice}</span>
                               </label>
                            ))}
                         </div>
                      </div>

                      {/* Section 2: Scope */}
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">2. 覆盖范围</label>
                         <div className="flex space-x-4">
                            <label className="flex items-center cursor-pointer">
                               <input type="radio" checked={batchScope === 'active'} onChange={() => setBatchScope('active')} className="mr-1.5 text-primary scale-90" />
                               <span className="text-xs text-slate-600">所有启用状态的问答</span>
                            </label>
                            <label className="flex items-center cursor-pointer opacity-50 cursor-not-allowed">
                               <input type="radio" checked={batchScope === 'selected'} disabled className="mr-1.5 text-primary scale-90" />
                               <span className="text-xs text-slate-600">仅勾选的问答 (0)</span>
                            </label>
                         </div>
                      </div>

                      {/* Section 3: Strategy */}
                      <div>
                         <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">3. 生成策略</label>
                         <div className="flex flex-col space-y-1.5">
                            <label className="flex items-center cursor-pointer">
                               <input type="radio" checked={batchStrategy === 'missing'} onChange={() => setBatchStrategy('missing')} className="mr-1.5 text-primary scale-90" />
                               <span className="text-xs text-slate-600">增量生成 (仅跳过已存在的录音)</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                               <input type="radio" checked={batchStrategy === 'all'} onChange={() => setBatchStrategy('all')} className="mr-1.5 text-primary scale-90" />
                               <span className="text-xs text-slate-600">强制覆盖 (重新生成所有录音)</span>
                            </label>
                         </div>
                      </div>
                   </>
                 )}
              </div>

              {!batchProgress && (
                 <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
                    <button onClick={() => setIsBatchTTSOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 text-xs font-medium hover:bg-white">
                       取消
                    </button>
                    <button 
                       onClick={startBatchTTS} 
                       disabled={batchVoices.length === 0}
                       className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-sky-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       开始任务
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}

      {/* Import Result Modal */}
      {importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-lg shadow-xl w-80 overflow-hidden p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                 <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">导入完成</h3>
              <p className="text-sm text-slate-500 mb-6">
                 成功导入 <span className="font-bold text-green-600">{importResult.success}</span> 条数据<br/>
                 失败 <span className="font-bold text-red-500">{importResult.fail}</span> 条数据
              </p>
              <button onClick={() => setImportResult(null)} className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-sky-600">
                 确定
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
