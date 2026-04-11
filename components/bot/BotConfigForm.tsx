
import React, { useState } from 'react';
import { ArrowRight, Workflow, Bot } from 'lucide-react';
import { BotConfiguration, ExtractionConfig, MarketingCampaign, FlowConfig, FlowNodeType, ExitNodeType } from '../../types';
import { generateBotPrompt } from '../../services/geminiService';
import BotBasicConfig from './BotBasicConfig';
import BotStrategyConfig from './BotStrategyConfig';
import BotBusinessConfig from './BotBusinessConfig';
import BotVariableConfig from './BotVariableConfig';
import BotDebugConfig from './BotDebugConfig';
import BotTestConfig from './BotTestConfig';
import BotIntentConfig from './intent/BotIntentConfig';
import BotMarketingConfig from './BotMarketingConfig';

import BotKnowledgeConfig from './BotKnowledgeConfig';
import FlowStudio from '../flow/FlowStudio';

interface BotConfigFormProps {
  initialData: BotConfiguration;
  onSave: (data: BotConfiguration) => void;
  onCancel: () => void;
  extractionConfigs: ExtractionConfig[];
  campaigns: MarketingCampaign[]; 
}

const DEMO_FLOW_CONFIG: FlowConfig = {
  id: 'polyai_flow_workbench',
  name: 'PolyAI Flow Workbench',
  entryFlowId: 'main',
  functions: [
    {
      id: 'code_normalize_phone',
      name: 'normalize_phone_digits',
      description: '清洗手机号中的空格、短横线和口语化停顿，生成标准手机号。',
      parameters: [{ name: 'phone_number', type: 'string', description: '用户输入的手机号', required: true }],
      code: `def normalize_phone_digits(conv, flow, phone_number):
    digits = ''.join(ch for ch in phone_number if ch.isdigit())
    conv.state['normalized_phone_number'] = digits
    return`,
      scope: 'global',
      isBuiltIn: false,
      category: 'visible',
      visibleConfig: {
        executionStrategy: 'sync',
        playFiller: false,
      },
    },
    {
      id: 'code_verify_sms',
      name: 'verify_sms_code',
      description: '根据验证码和用户手机号校验当前会话是否通过验证。',
      parameters: [
        { name: 'phone_number', type: 'string', description: '手机号', required: true },
        { name: 'verification_code', type: 'string', description: '验证码', required: true },
      ],
      code: `def verify_sms_code(conv, flow, phone_number, verification_code):
    conv.state['isVerified'] = verification_code == '9988'
    return`,
      scope: 'flow',
      flowId: 'verification',
      isBuiltIn: false,
      category: 'transition',
      transitionConfig: {
        canGotoStep: true,
        canGotoFlow: true,
        canModifyState: true,
      },
    },
    {
      id: 'code_prepare_handoff',
      name: 'prepare_handoff_summary',
      description: '整理重试过程和失败原因，供转人工时透传。',
      parameters: [{ name: 'retryCount', type: 'number', description: '当前重试次数', required: true }],
      code: `def prepare_handoff_summary(conv, flow, retryCount):
    conv.state['handoff_summary'] = f'验证码校验失败，已重试 {retryCount} 次'
    return`,
      scope: 'global',
      isBuiltIn: false,
      category: 'visible',
      visibleConfig: {
        executionStrategy: 'sync',
        playFiller: false,
      },
    },
  ],
  flows: [
    {
      id: 'main',
      name: '主入口 Flow',
      isEntry: true,
      nodes: [
        {
          id: 'main_start',
          type: FlowNodeType.START,
          position: { x: 80, y: 220 },
          data: { name: '开始', description: '机器人默认入口。' }
        },
        {
          id: 'collect_phone',
          type: FlowNodeType.DEFAULT,
          position: { x: 320, y: 190 },
          data: {
            name: '收集手机号',
            description: '收集并确认用户手机号，用于进入身份验证子 Flow。',
            stepType: 'collect',
            stepPrompt: {
              prompt: '请礼貌收集用户手机号，并调用 /normalize_phone_digits 进行清洗。在手机号有效后进入身份验证子流程。',
              visibleFunctionIds: [],
              transitionFunctionIds: ['builtin_goto_flow'],
              codeBlockIds: ['code_normalize_phone']
            },
            codeBlockIds: ['code_normalize_phone'],
            entityConfig: {
              enabled: true,
              entityName: 'phone_number',
              entityType: 'phone',
              prompt: '请说一下您下单时使用的手机号。',
              asrBiasing: 'number',
              required: true
            },
            retryConfig: {
              enabled: true,
              maxAttempts: 3,
              noInputPrompt: '我还没有听到手机号，请再说一遍。',
              noMatchPrompt: '手机号没有听清，请重新说一遍。'
            },
            fewShotExamples: [
              { input: '13800138000', output: '已收集手机号并准备进入身份验证流程。' }
            ],
            gotoFlowId: 'verification'
          }
        },
        {
          id: 'main_exit',
          type: FlowNodeType.EXIT,
          position: { x: 600, y: 215 },
          data: {
            name: '主流程出口',
            description: '主入口 Flow 的自然结束点。',
            stepType: 'exit',
            exitType: ExitNodeType.FINISH
          }
        }
      ],
      edges: [
        { id: 'main_edge_1', source: 'main_start', target: 'collect_phone', label: '进入收集', edgeType: 'normal' },
        { id: 'main_edge_2', source: 'collect_phone', target: 'main_exit', label: '收集完成', edgeType: 'goto_flow', conditionSummary: '调用 goto_flow 跳转后返回主流程结束' }
      ]
    },
    {
      id: 'verification',
      name: '身份验证 Flow',
      nodes: [
        {
          id: 'verification_start',
          type: FlowNodeType.START,
          position: { x: 80, y: 220 },
          data: { name: '进入身份验证', description: '从主入口 Flow 跳转而来。' }
        },
        {
          id: 'collect_code',
          type: FlowNodeType.DEFAULT,
          position: { x: 320, y: 190 },
          data: {
            name: '收集验证码',
            description: '模拟验证码采集、DTMF 输入和重试策略。',
            stepType: 'advanced',
            stepPrompt: {
              prompt: '请收集用户收到的验证码。支持用户直接说出验证码，也支持按键输入。如果校验失败，继续留在当前 Flow 并触发重试。',
              visibleFunctionIds: [],
              transitionFunctionIds: ['builtin_check_verification', 'builtin_goto_flow', 'code_verify_sms'],
              codeBlockIds: ['code_verify_sms']
            },
            codeBlockIds: ['code_verify_sms'],
            entityConfig: {
              enabled: true,
              entityName: 'verification_code',
              entityType: 'alphanumeric',
              prompt: '请说出您收到的验证码。',
              asrBiasing: 'alphanumeric',
              required: true,
              inputMode: 'speech_or_dtmf',
              dtmfMaxDigits: 6,
              dtmfTerminator: '#',
              dtmfFirstDigitTimeoutMs: 5000,
              dtmfInterDigitTimeoutMs: 2200,
              collectWhileSpeaking: true,
              validationPattern: '^[A-Za-z0-9]{4,6}$',
            },
            retryConfig: {
              enabled: true,
              maxAttempts: 3,
              noInputPrompt: '我还没有听到验证码，请再说一遍。',
              noMatchPrompt: '验证码没有听清，请重新说一遍。',
              confirmationPrompt: '我再确认一次，如果还不对我会帮您转人工处理。',
              fallbackAction: 'handoff',
              fallbackTargetId: 'verification_handoff',
              handoffTargetId: 'handoff_human_service',
            }
          }
        },
        {
          id: 'verify_result',
          type: FlowNodeType.DEFAULT,
          position: { x: 590, y: 120 },
          data: {
            name: '验证结果判断',
            description: '模拟 function step，根据 state 决定继续查询订单或转人工。',
            stepType: 'function',
            stepPrompt: {
              prompt: '根据当前 state 判断用户是否验证通过；如果失败，先整理 /prepare_handoff_summary 再升级到人工。',
              visibleFunctionIds: [],
              transitionFunctionIds: ['builtin_goto_flow', 'builtin_save_state', 'code_verify_sms'],
              codeBlockIds: ['code_prepare_handoff']
            },
            codeBlockIds: ['code_prepare_handoff']
          }
        },
        {
          id: 'verification_lookup',
          type: FlowNodeType.EXIT,
          position: { x: 860, y: 90 },
          data: {
            name: '进入订单查询 Flow',
            description: '验证成功后切换到订单查询子 Flow。',
            stepType: 'exit',
            exitType: ExitNodeType.FINISH,
            gotoFlowId: 'lookup'
          }
        },
        {
          id: 'verification_handoff',
          type: FlowNodeType.EXIT,
          position: { x: 860, y: 260 },
          data: {
            name: '验证失败转人工',
            description: '超过重试次数后结束当前 Flow 并转人工。',
            stepType: 'exit',
            exitType: ExitNodeType.HANDOFF,
            gotoFlowId: 'handoff'
          }
        }
      ],
      edges: [
        { id: 'verification_edge_1', source: 'verification_start', target: 'collect_code', label: '开始验证', edgeType: 'normal' },
        { id: 'verification_edge_2', source: 'collect_code', target: 'verify_result', label: '收到验证码', edgeType: 'normal' },
        { id: 'verification_edge_3', source: 'verify_result', target: 'verification_lookup', label: '验证成功', edgeType: 'conditional', conditionSummary: 'isVerified === true', priority: 1 },
        { id: 'verification_edge_4', source: 'verify_result', target: 'verification_handoff', label: '验证失败', edgeType: 'fallback', conditionSummary: 'retryCount >= 3', priority: 2 }
      ]
    },
    {
      id: 'lookup',
      name: '订单查询 Flow',
      nodes: [
        {
          id: 'lookup_start',
          type: FlowNodeType.START,
          position: { x: 80, y: 220 },
          data: { name: '进入订单查询', description: '身份验证通过后的子 Flow。' }
        },
        {
          id: 'lookup_order',
          type: FlowNodeType.DEFAULT,
          position: { x: 320, y: 190 },
          data: {
            name: '查询订单',
            description: '展示 visible function、few-shot 和业务说明。',
            stepType: 'advanced',
            stepPrompt: {
              prompt: '根据已验证的手机号查询订单摘要，必要时调用 /prepare_handoff_summary 拼接上下文，查询完成后向用户复述结果。',
              visibleFunctionIds: ['builtin_confirm_reservation', 'builtin_send_sms'],
              transitionFunctionIds: ['builtin_goto_step'],
              codeBlockIds: ['code_prepare_handoff']
            },
            codeBlockIds: ['code_prepare_handoff'],
            fewShotExamples: [
              { input: '帮我查订单', output: '调用查询订单能力并向用户复述订单摘要。' }
            ],
            handoffTargetId: 'handoff_vip_service',
          }
        },
        {
          id: 'lookup_finish',
          type: FlowNodeType.EXIT,
          position: { x: 620, y: 215 },
          data: {
            name: '查询结束',
            description: '订单查询成功后的自然结束。',
            stepType: 'exit',
            exitType: ExitNodeType.FINISH
          }
        }
      ],
      edges: [
        { id: 'lookup_edge_1', source: 'lookup_start', target: 'lookup_order', label: '开始查询', edgeType: 'normal' },
        { id: 'lookup_edge_2', source: 'lookup_order', target: 'lookup_finish', label: '查询完成', edgeType: 'normal' }
      ]
    },
    {
      id: 'handoff',
      name: '转人工 Flow',
      nodes: [
        {
          id: 'handoff_start',
          type: FlowNodeType.START,
          position: { x: 80, y: 220 },
          data: { name: '进入转人工', description: '失败兜底 Flow。' }
        },
        {
          id: 'handoff_step',
          type: FlowNodeType.DEFAULT,
          position: { x: 320, y: 190 },
          data: {
            name: '转人工说明',
            description: '说明已超过重试上限，将升级到人工。',
            stepType: 'default',
            stepPrompt: {
              prompt: '向用户说明当前将升级到人工客服，并保持安抚性语气。',
              visibleFunctionIds: ['builtin_transfer'],
              transitionFunctionIds: []
            }
          }
        },
        {
          id: 'handoff_exit',
          type: FlowNodeType.EXIT,
          position: { x: 620, y: 215 },
          data: {
            name: '人工接管',
            description: '结束机器人流程并转人工。',
            stepType: 'exit',
            exitType: ExitNodeType.HANDOFF,
            handoffTargetId: 'handoff_human_service',
            handoffReason: '验证码校验多次失败，需要人工继续处理。'
          }
        }
      ],
      edges: [
        { id: 'handoff_edge_1', source: 'handoff_start', target: 'handoff_step', label: '开始升级', edgeType: 'normal' },
        { id: 'handoff_edge_2', source: 'handoff_step', target: 'handoff_exit', label: '完成转接', edgeType: 'normal' }
      ]
    }
  ],
  annotations: [],
  debugScenarios: [
    {
      id: 'scenario_verify_retry',
      name: '验证失败后重试并转人工',
      initialState: { retryCount: 0, isVerified: false, phone_number: '' },
      mockInputs: ['13800138000', '12A4', '验证码还是不对', '继续失败'],
      expectedPath: ['collect_phone', 'collect_code', 'verify_result', 'verification_handoff', 'handoff_exit'],
      expectedExitType: ExitNodeType.HANDOFF,
    }
  ],
  metadata: {
    description: '内部评审用 PolyAI Flow Workbench 原型数据。',
    updatedAt: Date.now()
  }
};

const BotConfigForm: React.FC<BotConfigFormProps> = ({ initialData, onSave, onCancel, extractionConfigs, campaigns }) => {
  const [config, setConfig] = useState<BotConfiguration>({ 
    ...initialData,
    orchestrationType: initialData.orchestrationType || 'WORKFLOW' 
  });
  
  const [activeTab, setActiveTab] = useState<'BASIC' | 'FLOW' | 'TOOLS' | 'STRATEGY' | 'BUSINESS' | 'VARIABLES' | 'DEBUG' | 'TEST' | 'MARKETING' | 'KNOWLEDGE' | 'FLOW_CONFIG'>('BASIC');
  const [isGenerating, setIsGenerating] = useState(false);

  const updateField = <K extends keyof BotConfiguration>(key: K, value: BotConfiguration[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const flowConfig = config.flowConfig || DEMO_FLOW_CONFIG;

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
        {/* Switch removed here as requested */}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-8 space-x-8 overflow-x-auto">
        {[
          { id: 'BASIC', label: '基础配置' },
          { id: 'FLOW', label: '意图技能' },
          { id: 'FLOW_CONFIG', label: '流程配置' },

          { id: 'STRATEGY', label: '对话策略' },
          { id: 'VARIABLES', label: '变量配置' },
          { id: 'BUSINESS', label: '业务分析' },
          { id: 'MARKETING', label: '营销活动' },
          { id: 'DEBUG', label: '模型调试' },
          { id: 'TEST', label: '批量评测' },
          { id: 'KNOWLEDGE', label: '知识检索配置' },
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
        {activeTab === 'FLOW' && (
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

        {/* PolyAI Flow Editor */}
        {activeTab === 'FLOW_CONFIG' && (
           <div className="animate-in fade-in duration-500 flex flex-col h-[calc(100vh-280px)]">
             <div className="flex-1 min-h-0">
               <FlowStudio
                 initialFlow={flowConfig}
                 onSave={(flow: FlowConfig) => {
                   updateField('flowConfig', flow);
                   // Create and show success toast
                   const toast = document.createElement('div');
                   toast.className = 'fixed top-20 right-8 bg-green-50 text-green-700 border border-green-200 px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-right-5 duration-300';
                   toast.innerHTML = `
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>
                     <div>
                       <h4 class="font-bold text-sm">流程保存成功</h4>
                       <p class="text-xs text-green-600 mt-0.5">流程配置已更新</p>
                     </div>
                   `;
                   document.body.appendChild(toast);
                   setTimeout(() => {
                     toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                     setTimeout(() => toast.remove(), 500);
                   }, 2000);
                 }}
                 readOnly={false}
                 availableFunctions={flowConfig.functions || []}
                 availableVariables={config.variables || []}
                 availableTools={config.agentConfig?.tools || []}
                 availableDelayProfiles={config.agentConfig?.delayProfiles || []}
               />
             </div>
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
            stateDefaults={config.stateDefaults || ''}
            stateWriteRules={config.stateWriteRules || ''}
            onStateDefaultsChange={(value) => updateField('stateDefaults', value)}
            onStateWriteRulesChange={(value) => updateField('stateWriteRules', value)}
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

        {activeTab === 'TEST' && (
          <div className="animate-in fade-in duration-500 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <BotTestConfig 
               config={config} 
               updateField={updateField}
             />
          </div>
        )}

        {activeTab === 'KNOWLEDGE' && (
          <div className="animate-in fade-in duration-500 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <BotKnowledgeConfig 
               config={config} 
               updateField={updateField}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default BotConfigForm;
