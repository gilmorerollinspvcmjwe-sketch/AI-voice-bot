import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Database, HelpCircle, X, ChevronDown, GitBranch, MessageCircle, Search, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Switch } from '../ui/FormComponents';
import PromptEditor from '../ui/PromptEditor';
import { BotConfiguration, BUILT_IN_FUNCTIONS } from '../../types';
import { getQATopicStoreEventName, loadQACategoryConfigs } from '../../services/qaTopicStore';
import { syncTopicBindingsWithCategories } from '../../services/polyaiConfigHelpers';

const LEXICON_CATEGORIES = ['产品名称', '技术术语', '行业概念', '医疗词汇', '公司名称', '自定义'];

// --- MultiSelect Dropdown Component ---
interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  tagColor?: 'blue' | 'green';
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ 
  options, 
  selected, 
  onChange, 
  placeholder = '请选择...',
  tagColor = 'blue',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeTag = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== option));
  };

  const tagClass = tagColor === 'green' 
    ? 'bg-green-50 text-green-600 border-green-100' 
    : 'bg-blue-50 text-blue-600 border-blue-100';

  const optionActiveClass = tagColor === 'green'
    ? 'bg-green-50 text-green-700'
    : 'bg-blue-50 text-blue-700';

  return (
    <div className="relative">
      {/* Trigger */}
      <div 
        className={`w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white cursor-pointer min-h-[38px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map(item => (
              <span 
                key={item} 
                className={`px-2 py-0.5 text-xs rounded border ${tagClass} flex items-center`}
                onClick={(e) => e.stopPropagation()}
              >
                {item}
                <X 
                  size={12} 
                  className="ml-1 cursor-pointer hover:opacity-70" 
                  onClick={(e) => !disabled && removeTag(item, e)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
            {options.map(option => (
              <div
                key={option}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                  selected.includes(option) ? optionActiveClass : 'text-slate-700'
                }`}
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {option}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- Simple Switch Component for List ---  
const SimpleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
}> = ({ checked, onChange }) => (
  <div 
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-300'}`}
    onClick={onChange}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </div>
);

// --- Topic Skill Editor Component ---
const TopicSkillEditor: React.FC<{
  skill: any;
  onSave: (skill: any) => void;
  onCancel: () => void;
}> = ({ skill, onSave, onCancel }) => {
  const [name, setName] = useState(skill?.name || '');
  const [exampleQuestions, setExampleQuestions] = useState<string[]>(
    skill?.exampleQuestions || ['']
  );
  const [prompt, setPrompt] = useState(skill?.prompt || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {skill ? '编辑主题技能' : '新建主题技能'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入主题技能名称，建议使用描述性文字"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              建议使用与主题技能描述性的文字，如"订单查询"、"账户余额查询"
            </p>
          </div>

          {/* 示例问题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              示例问题 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {exampleQuestions.map((question, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => {
                      const newQuestions = [...exampleQuestions];
                      newQuestions[index] = e.target.value;
                      setExampleQuestions(newQuestions);
                    }}
                    placeholder="请输入示例问题，如：如何查询订单状态？"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  
                  {index > 0 && (
                    <button
                      onClick={() => {
                        const newQuestions = exampleQuestions.filter((_, i) => i !== index);
                        setExampleQuestions(newQuestions);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => setExampleQuestions([...exampleQuestions, ''])}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                添加相似问
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              问题要具体多样，符合真实场景，如：如何查询订单状态？、我的订单在哪里查看？等
            </p>
          </div>

          {/* 提示词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词 <span className="text-red-500">*</span>
            </label>
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              placeholder="请输入提示词，内部支持文本加或启用各种工具和变量"
              variables={[]}
              availableTools={[]}
              availableFunctions={BUILT_IN_FUNCTIONS}
              height="h-40"
            />
            <p className="mt-1 text-xs text-gray-500">
              提示词可以调用工具变量等，如：{'{'}{'{'}工具(参数){'}'}{'}'} 或 {'{'}{'{'}变量{'}'}{'}'}
            </p>
          </div>



        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => onSave({
              id: skill?.id || Date.now().toString(),
              name,
              isEnabled: skill?.isEnabled || true,
              exampleQuestions: exampleQuestions.filter(q => q.trim() !== ''),
              prompt,
              createdAt: skill?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })}
            disabled={!name.trim() || exampleQuestions.every(q => !q.trim()) || !prompt.trim()}
            className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Knowledge Space Item Component ---
interface KnowledgeSpaceItemProps {
  item: any;
  isEditMode: boolean;
  onToggle: (id: string) => void;
  level?: number;
}

const KnowledgeSpaceItem: React.FC<KnowledgeSpaceItemProps> = ({ item, isEditMode, onToggle, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const indent = level * 20;

  const getIcon = (type: string) => {
    switch (type) {
      case 'space': return '🌐';
      case 'folder': return '📁';
      case 'file': return '📄';
      default: return '📦';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-3">
      {/* Space/Folder Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center" style={{ marginLeft: indent }}>
          {isEditMode && (
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          )}
          <div className="flex items-center">
            <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-xs">
              {getIcon(item.type)}
            </span>
            <span className="font-medium text-slate-800 text-sm">{item.name}</span>
            {item.type === 'space' && (
              <span className="text-xs text-slate-400 ml-2">知识空间</span>
            )}
          </div>
        </div>
        {item.children && item.children.length > 0 && (
          <ChevronDown 
            size={16} 
            className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          />
        )}
      </div>
      
      {/* Children */}
      {expanded && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child: any) => (
            <KnowledgeSpaceItem 
              key={child.id} 
              item={child} 
              isEditMode={isEditMode}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BotKnowledgeConfigProps {
  config: BotConfiguration;
  updateField: <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => void;
}

const BotKnowledgeConfig: React.FC<BotKnowledgeConfigProps> = ({ config, updateField }) => {
  const [activeTab, setActiveTab] = useState<'QA' | 'KB' | 'TOPIC_SKILL'>('QA');
  const [topicSkills, setTopicSkills] = useState(() => config.topicSkillLibraryConfig?.skills || []);
  const [filteredSkills, setFilteredSkills] = useState(() => config.topicSkillLibraryConfig?.skills || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [sortBy, setSortBy] = useState<'CREATED' | 'UPDATED' | 'NAME'>('CREATED');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [qaCategoryConfigs, setQaCategoryConfigs] = useState(() => config.qaCategoryConfigs || loadQACategoryConfigs());
  // 模拟KCS开通状态（仅用于知识库配置）
  const [kcsEnabled, setKcsEnabled] = useState(false);
  // 选中的技能ID列表
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // 模拟知识空间数据
  useEffect(() => {
    setQaCategoryConfigs(config.qaCategoryConfigs || loadQACategoryConfigs());
  }, [config.qaCategoryConfigs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncCategories = () => setQaCategoryConfigs(loadQACategoryConfigs());
    const eventName = getQATopicStoreEventName();
    window.addEventListener(eventName, syncCategories);
    return () => window.removeEventListener(eventName, syncCategories);
  }, []);

  useEffect(() => {
    if (config.qaCategoryConfigs === qaCategoryConfigs) return;
    updateField('qaCategoryConfigs', qaCategoryConfigs);
  }, [config.qaCategoryConfigs, qaCategoryConfigs, updateField]);

  const qaTopics = useMemo(
    () => qaCategoryConfigs.filter((item) => item.enabled !== false).map((item) => item.name),
    [qaCategoryConfigs],
  );

  const syncedTopicBindings = useMemo(
    () => syncTopicBindingsWithCategories(qaCategoryConfigs, config.topicBindings || []),
    [qaCategoryConfigs, config.topicBindings],
  );

  useEffect(() => {
    const currentBindings = config.topicBindings || [];
    if (JSON.stringify(currentBindings) === JSON.stringify(syncedTopicBindings)) return;
    updateField('topicBindings', syncedTopicBindings);
  }, [config.topicBindings, syncedTopicBindings, updateField]);

  const normalizedSmalltalkTopicId = useMemo(() => {
    if (!config.smalltalkTopicId) return '';
    const matchedById = qaCategoryConfigs.find((item) => item.id === config.smalltalkTopicId);
    if (matchedById) return matchedById.id;
    const matchedByName = qaCategoryConfigs.find((item) => item.name === config.smalltalkTopicId);
    return matchedByName?.id || '';
  }, [config.smalltalkTopicId, qaCategoryConfigs]);

  useEffect(() => {
    if (!config.smalltalkTopicId || config.smalltalkTopicId === normalizedSmalltalkTopicId) return;
    updateField('smalltalkTopicId', normalizedSmalltalkTopicId);
  }, [config.smalltalkTopicId, normalizedSmalltalkTopicId, updateField]);

  const [knowledgeSpaces, setKnowledgeSpaces] = useState([
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
  ]);

  // 主题技能库操作方法
  const getTopicSkills = () => {
    return config.topicSkillLibraryConfig?.skills || [];
  };

  // 监听筛选条件变化，更新筛选结果
  useEffect(() => {
    const skills = getTopicSkills();
    const filtered = applyFilters(skills, searchTerm, statusFilter, sortBy, sortOrder);
    setFilteredSkills(filtered);
    // 重置页码
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder, config.topicSkillLibraryConfig?.skills]);

  // 新增主题技能
  const addTopicSkill = (skill: any) => {
    const newSkills = [...getTopicSkills(), skill];
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills,
      totalCount: newSkills.length,
      totalPages: Math.ceil(newSkills.length / pageSize)
    });
    setCurrentPage(1);
  };

  // 更新主题技能
  const updateTopicSkill = (updatedSkill: any) => {
    const newSkills = getTopicSkills().map(skill =>
      skill.id === updatedSkill.id ? updatedSkill : skill
    );
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills
    });
  };

  // 删除主题技能
  const deleteTopicSkill = (id: string) => {
    const newSkills = getTopicSkills().filter(skill => skill.id !== id);
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills,
      totalCount: newSkills.length,
      totalPages: Math.ceil(newSkills.length / pageSize),
      currentPage: Math.min(currentPage, Math.ceil(newSkills.length / pageSize))
    });
  };

  // 切换主题技能启用/禁用状态
  const toggleTopicSkill = (id: string) => {
    const newSkills = getTopicSkills().map(skill =>
      skill.id === id ? { ...skill, isEnabled: !skill.isEnabled } : skill
    );
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills
    });
  };

  // 批量切换主题技能启用/禁用状态
  const batchToggleSkills = (enabled: boolean) => {
    const newSkills = getTopicSkills().map(skill =>
      selectedSkills.includes(skill.id) ? { ...skill, isEnabled: enabled } : skill
    );
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills
    });
    setSelectedSkills([]);
  };

  // 批量删除主题技能
  const batchDeleteSkills = () => {
    const newSkills = getTopicSkills().filter(skill => !selectedSkills.includes(skill.id));
    updateField('topicSkillLibraryConfig', {
      ...config.topicSkillLibraryConfig!,
      skills: newSkills,
      totalCount: newSkills.length,
      totalPages: Math.ceil(newSkills.length / pageSize),
      currentPage: Math.min(currentPage, Math.ceil(newSkills.length / pageSize))
    });
    setSelectedSkills([]);
  };

  // 筛选和检索逻辑
  const applyFilters = (
    skills: any[], 
    searchTerm: string, 
    statusFilter: string, 
    sortBy: string, 
    sortOrder: string
  ): any[] => {
    let filtered = [...skills];
    
    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        skill => 
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.exampleQuestions.some((q: string) => q.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 状态筛选
    if (statusFilter === 'ENABLED') {
      filtered = filtered.filter(skill => skill.isEnabled);
    } else if (statusFilter === 'DISABLED') {
      filtered = filtered.filter(skill => !skill.isEnabled);
    }
    
    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'CREATED':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'UPDATED':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'NAME':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'ASC' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // 翻页逻辑
  const getPagedData = (
    data: any[], 
    currentPage: number, 
    pageSize: number
  ): any[] => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  // 切换知识空间选择状态
  const toggleKnowledgeSpace = (id: string) => {
    const updateItem = (items: any[]): any[] => {
      return items.map(item => {
        if (item.id === id) {
          const newChecked = !item.checked;
          // 递归更新子项
          const updateChildren = (children: any[]): any[] => {
            return children.map(child => ({
              ...child,
              checked: newChecked,
              children: child.children ? updateChildren(child.children) : []
            }));
          };
          return {
            ...item,
            checked: newChecked,
            children: item.children ? updateChildren(item.children) : []
          };
        } else if (item.children) {
          return {
            ...item,
            children: updateItem(item.children)
          };
        }
        return item;
      });
    };
    setKnowledgeSpaces(updateItem(knowledgeSpaces));
  };

  return (
    <div className="p-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('QA')}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'QA' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            问答库配置
          </button>
          <button
            onClick={() => setActiveTab('KB')}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'KB' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            知识库配置
          </button>
          <button
            onClick={() => setActiveTab('TOPIC_SKILL')}
            className={`pb-2 text-sm font-bold transition-all relative ${
              activeTab === 'TOPIC_SKILL' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            主题技能库配置
          </button>
        </div>
      </div>

      {/* 问答库配置 */}
      {activeTab === 'QA' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-8 space-y-8 animate-in fade-in">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">启用问答库</h3>
                <p className="text-xs text-slate-500 mt-1">开启后，机器人将使用问答库中的内容回答用户提问</p>
              </div>
            </div>
            <Switch 
              label="" 
              checked={config.kbEnabled || false} 
              onChange={(v) => updateField('kbEnabled', v)} 
            />
          </div>

          <div className={`space-y-6 transition-opacity duration-300 ${!config.kbEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-bold text-slate-700">生效分类 (Allowed Categories)</span>
                <HelpCircle size={14} className="ml-1 text-slate-400" />
              </div>
              <div className="text-xs text-slate-500 mb-3">
                选择要使用的问答对分类和词库分类，用于知识库问答匹配
              </div>
              
              {/* 问答对分类选择 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">问答对分类</label>
                <MultiSelectDropdown
                  options={qaTopics}
                  selected={config.kbQACategories || []}
                  onChange={(selected) => updateField('kbQACategories', selected)}
                  placeholder="选择问答对分类"
                  disabled={!config.kbEnabled}
                />
              </div>
              
              {/* 词库分类选择 */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">词库分类</label>
                <MultiSelectDropdown
                  options={LEXICON_CATEGORIES}
                  selected={config.kbLexiconCategories || []}
                  onChange={(selected) => updateField('kbLexiconCategories', selected)}
                  placeholder="选择词库分类"
                  tagColor="green"
                  disabled={!config.kbEnabled}
                />
              </div>
            </div>

            {/* 需：Topic 绑定配置 */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-4">
              <div className="flex items-center mb-2">
                <GitBranch size={14} className="mr-1.5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-700">Topic 绑定配置</span>
                <HelpCircle size={14} className="ml-1 text-slate-400" />
              </div>
              <div className="text-xs text-slate-500 mb-3">
                配置 Topic 的触发行为，与问答对管理中的 Topic 保持一致
              </div>

              {/* Topic Bindings 列表 */}
              <div className="space-y-3">
                {syncedTopicBindings.map((binding, index) => (
                  <div key={binding.categoryId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <select
                        value={binding.categoryName}
                        onChange={(e) => {
                          const matchedCategory = qaCategoryConfigs.find((item) => item.name === e.target.value);
                          const updated = [...syncedTopicBindings];
                          updated[index] = {
                            ...updated[index],
                            categoryId: matchedCategory?.id || updated[index].categoryId,
                            categoryName: matchedCategory?.name || e.target.value,
                          };
                          updateField('topicBindings', updated);
                        }}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-medium"
                      >
                        {qaTopics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${binding.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {binding.enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={binding.entryBehavior}
                        onChange={(e) => {
                          const updated = [...syncedTopicBindings];
                          updated[index] = { ...updated[index], entryBehavior: e.target.value };
                          updateField('topicBindings', updated);
                        }}
                        className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="direct_answer">直接回答</option>
                        <option value="flow_trigger">触发 Flow</option>
                        <option value="tool_call">调用工具</option>
                      </select>
                      <input
                        type="number"
                        value={binding.priority}
                        onChange={(e) => {
                          const updated = [...syncedTopicBindings];
                          updated[index] = { ...updated[index], priority: parseInt(e.target.value) || 0 };
                          updateField('topicBindings', updated);
                        }}
                        className="w-16 text-xs border border-slate-200 rounded px-2 py-1"
                        placeholder="优先级"
                      />
                      <button
                        onClick={() => {
                          const updated = syncedTopicBindings.filter((_, i) => i !== index);
                          updateField('topicBindings', updated);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const usedTopics = syncedTopicBindings.map(b => b.categoryName);
                    const availableCategory =
                      qaCategoryConfigs.find((item) => item.enabled !== false && !usedTopics.includes(item.name)) ||
                      qaCategoryConfigs.find((item) => item.enabled !== false);
                    if (!availableCategory) return;
                    const newBinding = {
                      categoryId: availableCategory.id,
                      categoryName: availableCategory.name,
                      enabled: true,
                      entryBehavior: 'direct_answer',
                      priority: syncedTopicBindings.length + 1
                    };
                    updateField('topicBindings', [...syncedTopicBindings, newBinding]);
                  }}
                  className="w-full py-2 text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  + 添加 Topic 绑定
                </button>
              </div>

              {/* Smalltalk 和 Fallback Flow 配置 */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    <MessageCircle size={12} className="inline mr-1" />
                    闲聊 Topic
                  </label>
                  <select
                    value={normalizedSmalltalkTopicId}
                    onChange={(e) => updateField('smalltalkTopicId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">未指定</option>
                    {qaCategoryConfigs.filter((item) => item.enabled !== false).map((topic) => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    <GitBranch size={12} className="inline mr-1" />
                    Fallback Flow ID
                  </label>
                  <input
                    type="text"
                    value={config.fallbackFlowId || ''}
                    onChange={(e) => updateField('fallbackFlowId', e.target.value)}
                    placeholder="如：fallback_handler"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主题技能库配置 */}
      {activeTab === 'TOPIC_SKILL' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-8 space-y-8 animate-in fade-in">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
                <GitBranch size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">主题技能库</h3>
                <p className="text-xs text-slate-500 mt-1">
                  配置主题技能，提供特定场景下的专业回答能力
                </p>
              </div>
            </div>
            <Switch 
              label="" 
              checked={config.topicSkillLibraryConfig?.enabled || false} 
              onChange={(v) => updateField('topicSkillLibraryConfig', {
                ...config.topicSkillLibraryConfig!,
                enabled: v
              })} 
            />
          </div>

          {config.topicSkillLibraryConfig?.enabled && (
            <div className="space-y-6">
              {/* 操作区 */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  {/* 搜索框 */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索主题技能.."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* 状态筛选 */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ENABLED' | 'DISABLED')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ALL">全部</option>
                    <option value="ENABLED">已启用</option>
                    <option value="DISABLED">已禁用</option>
                  </select>
                  
                  {/* 排序 */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by as 'CREATED' | 'UPDATED' | 'NAME');
                      setSortOrder(order as 'ASC' | 'DESC');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="CREATED-DESC">创建时间降序</option>
                    <option value="CREATED-ASC">创建时间升序</option>
                    <option value="UPDATED-DESC">更新时间降序</option>
                    <option value="UPDATED-ASC">更新时间升序</option>
                    <option value="NAME-ASC">名称升序</option>
                    <option value="NAME-DESC">名称降序</option>
                  </select>
                </div>
                
                {/* 新建按钮 */}
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setIsEditModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  新建主题技能
                </button>
              </div>
              <div className="space-y-4">
                {filteredSkills.length === 0 ? (
                  <div className="text-center py-12">
                    <GitBranch size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? '未找到匹配的主题技能' : '主题技能库为空'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? '尝试调整搜索条件' : '点击"新建主题技能"开始创建'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => {
                          setEditingSkill(null);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center mx-auto transition-colors"
                      >
                        <Plus size={16} className="mr-2" />
                        新建主题技能
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* 批量操作栏 */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">
                          已选择 {selectedSkills.length} 项
                        </span>
                        {selectedSkills.length > 0 && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => batchToggleSkills(true)}
                              className="text-xs px-3 py-1 rounded bg-green-200 text-green-800 hover:bg-green-300 transition-colors"
                            >
                              批量启用
                            </button>
                            <button
                              onClick={() => batchToggleSkills(false)}
                              className="text-xs px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            >
                              批量禁用
                            </button>
                            <button
                              onClick={batchDeleteSkills}
                              className="text-xs px-3 py-1 rounded bg-red-200 text-red-800 hover:bg-red-300 transition-colors"
                            >
                              批量删除
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedSkills([])}
                        disabled={selectedSkills.length === 0}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        清空选择
                      </button>
                    </div>
                    
                    {/* 列表表头 */}
                    <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-t-lg border border-gray-200 font-medium text-sm">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={selectedSkills.length === getPagedData(filteredSkills, currentPage, pageSize).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSkills(getPagedData(filteredSkills, currentPage, pageSize).map(skill => skill.id));
                            } else {
                              setSelectedSkills([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-3">名称</div>
                      <div className="col-span-4">问题</div>
                      <div className="col-span-2">状态</div>
                      <div className="col-span-2">操作</div>
                    </div>
                    
                    {/* 列表内容 */}
                    <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                      {getPagedData(filteredSkills, currentPage, pageSize).map((skill) => (
                        <div
                          key={skill.id}
                          className="grid grid-cols-12 gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="col-span-1 flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSkills([...selectedSkills, skill.id]);
                                } else {
                                  setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-3 flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">{skill.name}</h4>
                          </div>
                          <div className="col-span-4 flex items-center">
                            <p className="text-sm text-gray-500">
                              {skill.exampleQuestions[0] || '无示例问题'}
                            </p>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <SimpleSwitch
                              checked={skill.isEnabled}
                              onChange={() => toggleTopicSkill(skill.id)}
                            />
                          </div>
                          <div className="col-span-2 flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingSkill(skill);
                                setIsEditModalOpen(true);
                              }}
                              className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-800 hover:bg-blue-300 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => deleteTopicSkill(skill.id)}
                              className="text-xs px-2 py-1 rounded bg-red-200 text-red-800 hover:bg-red-300 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 分页控件 */}
              {filteredSkills.length > 0 && (
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-700">
                    显示从<span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filteredSkills.length)}</span> 条，
                    共<span className="font-medium">{filteredSkills.length}</span> 条
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {(() => {
                      const totalPages = Math.ceil(filteredSkills.length / pageSize);
                      return Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page = i + 1;
                        if (totalPages > 5) {
                          if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-md text-sm ${
                              page === currentPage
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredSkills.length / pageSize), prev + 1))}
                      disabled={currentPage === Math.ceil(filteredSkills.length / pageSize)}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 知识库配置 */}
      {activeTab === 'KB' && (
        <div className="bg-white rounded border border-gray-200 shadow-sm p-8 space-y-8 animate-in fade-in">
          {!kcsEnabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">知识库检索</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                知识库检索功能需要开通KCS（知识管理系统）后使用。开通后，您可以配置知识空间、目录和文件，为机器人提供知识检索能力
              </p>
              <button
                onClick={() => setKcsEnabled(true)}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-sky-600 text-sm font-medium transition-all"
              >
                开通KCS
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mr-4">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">启用知识库检索</h3>
                    <p className="text-xs text-slate-500 mt-1">开启后，机器人将使用知识库中的文档内容回答用户提问</p>
                  </div>
                </div>
                <Switch 
                  label="" 
                  checked={config.kcsEnabled || false} 
                  onChange={(v) => updateField('kcsEnabled', v)} 
                />
              </div>

              <div className={`space-y-6 transition-opacity duration-300 ${!config.kcsEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-sm font-bold text-slate-700">知识空间选择</span>
                    <HelpCircle size={14} className="ml-1 text-slate-400" />
                  </div>
                  <div className="text-xs text-slate-500 mb-4">
                    选择要使用的知识空间和目录，用于知识库文档检索
                  </div>
                  
                  {/* 知识空间列表 */}
                  <div className="space-y-3">
                    {knowledgeSpaces.map((space) => (
                      <KnowledgeSpaceItem 
                        key={space.id} 
                        item={space} 
                        isEditMode={isEditMode}
                        onToggle={toggleKnowledgeSpace}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 按钮移到右下角 */}
              {config.kcsEnabled && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 bg-gray-100 text-slate-700 rounded text-sm font-medium hover:bg-gray-200 transition-all"
                      >
                        取消
                      </button>
                      <button 
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-sky-600 transition-all"
                      >
                        保存
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-sky-600 transition-all"
                    >
                      编辑
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 主题技能编辑/新建模态框 */}
      {isEditModalOpen && (
        <TopicSkillEditor
          skill={editingSkill}
          onSave={(skill) => {
            // 移除工具和变量字段，因为我们现在通过提示词直接插入
            const { tools, variables, ...skillWithoutToolsVariables } = skill;
            if (editingSkill) {
              updateTopicSkill(skillWithoutToolsVariables);
            } else {
              addTopicSkill(skillWithoutToolsVariables);
            }
            setIsEditModalOpen(false);
            setEditingSkill(null);
          }}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
};

export default BotKnowledgeConfig;