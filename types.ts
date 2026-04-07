
// Enums
export enum ModelType {
  GEMINI_FLASH = 'Gemini Flash 2.0',
  GEMINI_PRO = 'Gemini Pro 1.5',
  GPT4_O = 'GPT-4o',
  CLAUDE_35 = 'Claude 3.5 Sonnet'
}

export enum TTSModel {
  GEMINI_TTS = 'Gemini TTS',
  AZURE_TTS = 'Azure TTS',
  OPENAI_TTS = 'OpenAI TTS',
  VOLC_TTS = 'Volcengine TTS'
}

export enum ASRModel {
  OPENAI_WHISPER = 'Whisper V3',
  AZURE_STT = 'Azure STT',
  GOOGLE_STT = 'Google STT',
  VOLC_ASR = 'Volcengine ASR'
}

export const EMOTIONS = [
  '平静 (Calm)', '开心 (Happy)', '遗憾 (Sad)', '热情 (Excited)', '专业 (Professional)', '温和 (Gentle)'
];

// Basic Types
export interface TagItem {
  name: string;
  description?: string;
}

export interface LabelGroup {
  id: string;
  name: string;
  tags: TagItem[];
  enabled: boolean;
}

export interface BotVariable {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'DATETIME' | 'TIME' | 'BOOLEAN';
  description?: string;
  isSystem: boolean;
  category?: 'INPUT' | 'CONVERSATION' | 'EXTRACTION';
}

export interface Parameter {
  id: string;
  key: string;
  description: string;
}

export interface ExtractionConfig {
  id: string;
  name: string;
  description: string;
  lastUpdated: number;
  params: { id: string; key: string; desc: string }[];
  interfaceUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authType: 'basic' | 'url' | 'none';
  bodyType: 'json' | 'form';
  bodyContent: string;
  responseMapping: { key: string; path: string }[];
}

export type IntentNodeType = 'START' | 'LISTEN' | 'BRANCH' | 'AI_AGENT' | 'LOGIC' | 'ACTION' | 'DATA' | 'TRIGGER' | 'HANGUP' | 'END';

// --- V2 Flow Node Configurations ---
// ... (Existing Node Configs kept for compatibility) ...
export interface NodePreAction {
  type: 'CLEAR_VAR' | 'EXECUTE_SCRIPT';
  payload: string; 
}

export interface NodeCommonConfig {
  preActions?: NodePreAction[];
  nextTimeoutMs?: number; 
  nodeNote?: string; 
  nextNodeId?: string;
}

// 录音市场项目类型
export interface AudioMarketItem {
  id: string;
  name: string;
  url: string;
  duration?: number;
  category?: string;
  description?: string;
}

export interface PlayNodeConfig extends NodeCommonConfig {
  // 播放类型
  playType?: 'audio' | 'tts';  // audio: 播放录音, tts: TTS合成
  // 录音选择字段
  audioId?: string;           // 录音ID
  audioName?: string;         // 录音名称（用于显示）
  audioUrl?: string;          // 录音URL（从录音市场获取）
  duration?: number;          // 录音时长（秒）
  // TTS合成字段
  ttsText?: string;           // TTS合成文本
  ttsVoice?: string;          // TTS音色
  // 异常处理
  onErrorNodeId?: string;     // 播放异常时跳转节点
  // 保留向后兼容的字段
  type?: 'tts' | 'audio_file' | 'ssml';  // 已废弃，仅用于兼容旧数据
  content?: string;  // 已废弃，仅用于兼容旧数据
  voiceOverride?: string;  // 已废弃，仅用于兼容旧数据
  bargeIn?: boolean;
  bargeInThreshold?: number;
  backgroundAudio?: {
    url: string;
    volume: number;
    loop: boolean;
    fade?: 'in' | 'out' | 'cross';
  };
}

export interface WaitNodeConfig extends NodeCommonConfig {
  durationMs: number; 
}

export interface RetryStrategy {
  maxAttempts: number;
  noInputPrompts?: string[]; 
  noMatchPrompts?: string[]; 
  actionAfterExhaustion?: 'hangup' | 'transfer' | 'goto_node';
  exhaustionTargetId?: string;
}

export interface CollectNodeConfig extends NodeCommonConfig {
  collectType: 'intent' | 'slot' | 'dtmf';
  variable?: string;
  maxDurationSeconds?: number;
  silenceThresholdMs?: number;
  bargeIn?: boolean;
  asrBiasing?: 'default' | 'alphanumeric' | 'name' | 'datetime' | 'number' | 'address';
  dtmfConfig?: {
    maxDigits: number;
    terminator: string;
    timeoutMs: number;
  };
  retryStrategy?: RetryStrategy;
  onCollectErrorNodeId?: string;
}

export interface LLMNodeConfig extends NodeCommonConfig {
  modelType?: ModelType;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  userPrompt?: string;
  fewShotExamples?:Array<{
    input: string;
    output: string;
  }>;
  knowledgeBaseIds?: string[];
  toolIds?: string[];
  functionIds?: string[];
  outputFormat?: 'text' | 'json';
  jsonSchema?: string;
  onErrorNodeId?: string;
}

export interface IntentRoute {
  id: string;
  intentName: string; 
  description?: string; 
  keywords?: string[]; 
  targetNodeId?: string;
}

export interface IntentRouterNodeConfig extends NodeCommonConfig {
  routerType: 'llm_semantic' | 'keyword_exact' | 'hybrid';
  routes: IntentRoute[];
  fallbackTargetId?: string;
}

export interface ConditionExpression {
  id: string;
  name: string;
  logic: string; 
  targetNodeId?: string;
}

export interface ConditionNodeConfig extends NodeCommonConfig {
  expressions: ConditionExpression[];
  elseTargetId?: string;
}

// 提取方式
export type ExtractionMethod = 'REGEX' | 'LLM';

// 提取规则配置
export interface ExtractionRule {
  id: string;
  targetVariable: string;
  variableType: string;
  method: ExtractionMethod;
  regexPattern?: string;
  regexGroup?: number;
  llmPrompt?: string;
  sourceText?: string;
  fallbackValue?: string;
}

export interface VariableOperation {
  variableId: string;
  type: 'SET' | 'ADD' | 'SUBTRACT' | 'APPEND' | 'CLEAR';
  value: string;
}

export interface SetVariableNodeConfig extends NodeCommonConfig {
  mode?: 'SYSTEM' | 'EXTRACTION';
  operations?: VariableOperation[];
  extractionRules?: ExtractionRule[];
  voiceCollectionEnabled?: boolean;
  onExtractionErrorNodeId?: string;  // 提取失败时跳转节点
}

export interface TagNodeConfig extends NodeCommonConfig {
  action: 'ADD' | 'REMOVE';
  tags: string[]; 
}

export interface HttpRequestNodeConfig extends NodeCommonConfig {
  apiId?: string;
  paramMapping?: Array<{ paramKey: string; variableId: string }>;
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  bodyType?: 'json' | 'form' | 'raw';
  body?: string;
  timeoutMs?: number;
  responseMapping?: Array<{
    responsePath: string;
    targetVariable: string;
  }>;
  // 多分支结果配置
  successTargetId?: string;
  errorTargetId?: string;
  timeoutTargetId?: string;
  notCalledTargetId?: string;
}

export interface SmsNodeConfig extends NodeCommonConfig {
  templateId: string;
  phoneNumberVariable?: string;
  params?: Record<string, string>;
  onSendErrorNodeId?: string;  // 发送失败时跳转节点（可选）
}

export interface TransferNodeConfig extends NodeCommonConfig {
  transferType: 'sip_trunk' | 'pstn' | 'queue' | 'agent';
  target: string;
  uui?: string;
  playBeforeTransfer?: string;
  maxQueueTimeSeconds?: number;
  queueFullTargetId?: string;
  onTransferErrorNodeId?: string;  // 转接失败时跳转节点
}

export interface ScriptNodeConfig extends NodeCommonConfig {
  language: 'javascript' | 'python';
  code: string;
  inputVariables?: string[];
  outputVariables?: string[];
  onErrorNodeId?: string;  // 执行异常时跳转节点
}

export type V2NodeConfig = 
  | PlayNodeConfig 
  | WaitNodeConfig
  | CollectNodeConfig 
  | LLMNodeConfig 
  | IntentRouterNodeConfig 
  | ConditionNodeConfig 
  | SetVariableNodeConfig 
  | TagNodeConfig
  | HttpRequestNodeConfig 
  | SmsNodeConfig
  | TransferNodeConfig 
  | ScriptNodeConfig
  | any; 

// --- End V2 Types ---

export interface IntentNode {
  id: string;
  type: IntentNodeType;
  subType: string;
  label: string;
  x: number;
  y: number;
  config?: V2NodeConfig; 
}

export interface IntentEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  branchId?: string;
}

export interface BotIntent {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  systemPrompt: string;
  similarQuestions?: string[]; // 相似问法，用于意图识别训练
  flowCanvas: {
    nodes: IntentNode[];
    edges: IntentEdge[];
  };
}

export interface ProfileExtractionRule {
  id: string;
  targetField: string;
  description: string;
}

// --- AGENT MODE TYPES (Updated) ---

export interface AgentToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface AgentTool {
  id: string;
  name: string; // The function name for LLM (e.g. check_order)
  description: string; // The function description
  type: 'API' | 'SMS' | 'TRANSFER' | 'EMAIL' | 'CUSTOM'; // 扩展工具类型
  
  // Link to existing resources
  refId?: string; // ExtractionConfig ID for API
  smsTemplateId?: string; // ID for SMS Template
  
  // LLM Configuration
  parameters: AgentToolParameter[];
  
  // New: Instruction for LLM after receiving tool response
  responseInstruction?: string; 

  // Execution Behavior (Filler/Background)
  executionStrategy?: {
    playFiller: boolean;
    fillerType: 'TTS' | 'AUDIO';
    fillerContent: string; // TTS text or Audio URL
    backgroundMusicId?: string;
  };
  
  // === 新增字段 (用于 Demo 增强) ===
  // 工具分类
  category?: 'api_call' | 'communication' | 'transfer' | 'other';
  // 工具图标 (emoji)
  icon?: string;
  // 平均执行时长（毫秒），用于进度估算
  averageDuration?: number;
  // 是否支持并行执行
  supportsParallel?: boolean;
  // 测试配置
  testConfig?: {
    enabled: boolean;
    testParams: Record<string, any>;
  };
  // 错误处理策略
  errorHandling?: {
    retryCount: number;
    fallbackAction: 'transfer_human' | 'hangup' | 'goto_node';
    fallbackTargetId?: string;
  };
}

// Flow 函数类型 - 用于流程内的可调用函数，类似 Poly.ai 的 Transition Functions
export interface FlowFunction {
  id: string;
  name: string;           // 函数名称，如 save_confirmation_code
  description: string;    // 函数描述，用于 LLM 理解何时调用
  parameters: FlowFunctionParameter[];  // 参数定义
  code?: string;          // 函数实现代码（可选）
  scope: 'flow' | 'global';  // 作用域：流程级别或全局
  flowId?: string;        // 如果是 flow 级别，关联的 flow ID
  isBuiltIn: boolean;     // 是否内置函数
}

export interface FlowFunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
}

// 内置 Flow 函数列表
export const BUILT_IN_FUNCTIONS: FlowFunction[] = [
  {
    id: 'builtin_save_state',
    name: 'save_state',
    description: '保存变量到对话状态',
    parameters: [
      { name: 'key', type: 'string', description: '变量名', required: true },
      { name: 'value', type: 'string', description: '变量值', required: true }
    ],
    code: `def save_state(conv: Conversation, flow: Flow, key: str, value: str):
    """保存变量到对话状态，供后续步骤使用"""
    conv.state[key] = value
    return`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_goto_step',
    name: 'goto_step',
    description: '跳转到指定步骤，控制流程走向',
    parameters: [
      { name: 'step_id', type: 'string', description: '目标步骤名称', required: true }
    ],
    code: `def goto_step(conv: Conversation, flow: Flow, step_id: str):
    """跳转到当前流程中的指定步骤"""
    flow.goto_step(step_id)
    return`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_collect_value',
    name: 'collect_value',
    description: '收集用户输入并保存到变量',
    parameters: [
      { name: 'variable_name', type: 'string', description: '存储变量名', required: true },
      { name: 'prompt', type: 'string', description: '收集提示语', required: false }
    ],
    code: `def collect_value(conv: Conversation, flow: Flow, variable_name: str, prompt: str = None):
    """收集用户输入并保存到变量"""
    # 如果有 prompt，引导 LLM 询问用户
    if prompt:
        return {"utterance": prompt}
    # 否则等待用户输入，存储到 conv.state
    return`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_transfer',
    name: 'transfer_call',
    description: '转接到人工客服或指定技能组',
    parameters: [
      { name: 'destination', type: 'string', description: '目标技能组或坐席', required: true },
      { name: 'reason', type: 'string', description: '转接原因', required: false },
      { name: 'utterance', type: 'string', description: '转接话语', required: false }
    ],
    code: `def transfer_call(conv: Conversation, flow: Flow, destination: str, reason: str = None, utterance: str = None):
    """转接到人工客服或指定技能组"""
    # 构建转接话语
    if not utterance:
        utterance = "好的，我帮您转接人工客服，请稍等。"
    return {
        "action": "transfer",
        "destination": destination,
        "reason": reason,
        "utterance": utterance
    }`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_confirm',
    name: 'confirm_reservation',
    description: '确认预约信息',
    parameters: [
      { name: 'confirmation_code', type: 'string', description: '确认码', required: true },
      { name: 'first_name', type: 'string', description: '名', required: true },
      { name: 'last_name', type: 'string', description: '姓', required: true }
    ],
    code: `def confirm_reservation(conv: Conversation, flow: Flow, confirmation_code: str, first_name: str, last_name: str):
    """确认预约信息是否匹配"""
    # 保存确认信息到状态
    conv.state.confirmation_code = confirmation_code
    conv.state.first_name = first_name
    conv.state.last_name = last_name

    # 检查是否匹配（这里需要连接外部系统验证）
    # 假设验证通过，跳转到确认成功步骤
    flow.goto_step("Confirm success")
    return`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_hangup',
    name: 'hangup',
    description: '挂断电话',
    parameters: [
      { name: 'reason', type: 'string', description: '挂断原因', required: false }
    ],
    code: `def hangup(conv: Conversation, flow: Flow, reason: str = None):
    """挂断当前通话"""
    return {
        "action": "hangup",
        "reason": reason
    }`,
    scope: 'global',
    isBuiltIn: true
  },
  {
    id: 'builtin_check_verification',
    name: 'check_verification',
    description: '检查用户验证状态，支持重试机制',
    parameters: [
      { name: 'max_attempts', type: 'number', description: '最大验证尝试次数', required: false }
    ],
    code: `def check_verification(conv: Conversation, flow: Flow, max_attempts: int = 3):
    """检查用户验证状态，失败则重试，超过次数转人工"""
    attempts = conv.state.verification_attempts or 0
    if not conv.state.is_verified:
        attempts += 1
        conv.state.verification_attempts = attempts
        if attempts >= max_attempts:
            conv.goto_flow("Escalation")
            return
        flow.goto_step("Retry verification")
        return
    flow.goto_step("Continue")
    return`,
    scope: 'global',
    isBuiltIn: true
  }
];

// MCP 服务器配置
export interface McpServer {
  id: string;
  name: string;
  description: string;
  type: 'stdio' | 'http' | 'websocket';
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
  env?: Record<string, string>;
  enabled: boolean;
}

export interface AgentConfig {
  tools: AgentTool[];
  mcpServers?: McpServer[]; // MCP 服务器列表
  generalFiller: {
    enabled: boolean;
    type: 'TTS' | 'AUDIO';
    content: string;
  };
  functionCallModel?: string; // Optional override
}

// === 增强工具类型 (用于 Demo) ===
export interface EnhancedAgentTool extends AgentTool {
  category: 'api_call' | 'communication' | 'transfer' | 'other';
  icon: string;
  averageDuration: number;
  supportsParallel: boolean;
}

// 预设工具类型
export interface PresetTool {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'api_call' | 'communication' | 'transfer';
  defaultType: 'API' | 'SMS' | 'TRANSFER';
}

// ------------------------------

export interface BotConfiguration {
  id: string;
  name: string;
  description: string;
  status: boolean;
  lastUpdated: number;
  
  // Model Config
  llmType: ModelType;
  temperature: number;
  topP: number;
  
  // Voice Config
  ttsModel: TTSModel;
  voiceName: string;
  ttsAutoSwitch?: boolean; 
  ttsVoiceMapping?: Record<string, string>; 
  volume: number;
  speed: number;
  emotion: string;
  
  // ASR Config
  asrModel: ASRModel;
  asrInterruptible: boolean;
  asrSilenceDurationMs: number;
  
  // Logic
  systemPrompt: string;
  variables: BotVariable[];
  parameters: Parameter[];
  
  // Extraction (Legacy field support)
  extractionConfigId?: string;
  extractionPrompt?: string;
  
  // *** ORCHESTRATION SWITCH ***
  orchestrationType?: 'WORKFLOW' | 'AGENT'; // Default 'WORKFLOW'
  agentConfig?: AgentConfig; // New Agent Mode Config
  
  // Intent/Flow (Workflow Mode)
  routerEnabled: boolean;
  intents: BotIntent[];
  
  // Strategy
  protectionDurationMs: number;
  interruptionWaitMs: number;
  maxCallDurationSeconds: number;
  contextItems: any[]; 
  labelGroups: LabelGroup[];
  
  // Knowledge Base Config (New)
  kbEnabled?: boolean;
  kbCategories?: string[]; // Legacy: List of categories enabled for this bot (deprecated, use kbQACategories and kbLexiconCategories)
  kbQACategories?: string[]; // 问答对分类列表
  kbLexiconCategories?: string[]; // 词库分类列表

  // Strategy Details
  welcomeMessageEnabled: boolean;
  welcomeMessage: string;
  welcomeMessageInterruptible?: boolean;
  
  transferIntentDefaultEnabled?: boolean;
  transferIntentCustomEnabled?: boolean;
  transferCustomIntents?: string[];
  transferIntentThreshold: number;
  
  // Scene-based transfer
  transferSceneEnabled?: boolean;
  transferScenes?: Array<{
    id: string;
    scene: string;
    description: string;
  }>;
  transferConditionRoundsEnabled?: boolean;
  transferConditionRounds?: number;
  transferConditionDurationEnabled?: boolean;
  transferConditionDuration?: number;
  transferSpeech?: string;
  transferIvrTarget?: string;

  hangupIntentDefaultEnabled?: boolean;
  hangupIntentCustomEnabled?: boolean;

  // Test Management
  testSuites?: TestSuite[];

  // Hangup settings
  hangupCustomIntents?: string[];
  hangupIntentThreshold: number;
  hangupConditionRoundsEnabled?: boolean;
  hangupConditionRounds?: number;
  hangupConditionDurationEnabled?: boolean;
  hangupConditionDuration?: number;
  hangupSpeech?: string;

  // No answer settings
  noAnswerInterval?: number;
  noAnswerMaxRepeats?: number;
  noAnswerSpeech?: string;

  // Marketing Config
  marketingEnabled?: boolean;
  marketingTimings?: string[];
  marketingConflictStrategy?: 'service_first' | 'marketing_first';
  activeCampaignIds?: string[];

  // Profile Collection Config
  profileCollectionEnabled?: boolean;
  profileExtractionPrompt?: string;
  profileExtractionRules?: ProfileExtractionRule[];
}

// Test Suite and Case Definitions
export interface TestCase {
  id: string;
  name: string;
  suiteName: string; // 所属测试集名称
  sourceTag?: string; // 来源标注
  conversations: TestConversation[]; // 对话轮次（仅用户输入）
  expectedOutcome?: string; // 预期结果
  createdAt: string;
  updatedAt: string;
}

export interface TestConversation {
  id: string;
  userInput: string; // 用户输入内容
  expectedResponse?: string; // 期望的机器人回复（可选）
  timestamp: number;
}

// 测试结果
export interface TestResult {
  caseId: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  actualResponses: string[]; // 实际LLM返回内容
  duration: number; // 测试耗时
  errorMessage?: string;
  completedAt?: string;
}

// 测试集（由测试用例按suiteName聚合而成）
export interface TestSuite {
  name: string; // 测试集名称
  description?: string;
  caseCount: number;
  testCases: TestCase[];
}

// ... (Rest of types unchanged)
// Extraction Trigger
export interface TriggerCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface TriggerAction {
  id: string;
  type: string;
  value: string;
}

export interface TriggerConfigItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  subjectType: string;
  subjectValue: string;
  timing: string;
  conditions: TriggerCondition[];
  logicType: 'ALL' | 'ANY' | 'CUSTOM';
  actions: TriggerAction[];
}

// Knowledge Base
export interface QAPair {
  id: string;
  standardQuestion: string;
  similarQuestions: string[];
  answer: string;
  category?: string; // New Category Field
  validityType: 'permanent' | 'range';
  validityStart?: number;
  validityEnd?: number;
  lastUpdated: number;
  isActive: boolean;
  audioResources?: Record<string, string>;
  toolIds?: string[];
}

export interface KnowledgeCandidate {
  id: string;
  question: string;
  similarQuestions?: string[];
  answer: string;
  sourceType: 'bot_dialog' | 'human_takeover';
  sourceId: string;
  frequency: number;
  confidence: number;
  extractedTime: number;
  status: 'pending' | 'approved' | 'rejected';
  // 新增字段
  category?: string;
  autoCategory?: string;
  categoryConfidence?: number;
  adoptedAt?: number;
  adoptedBy?: string;
}

// 批量操作请求类型
export interface BatchAdoptRequest {
  itemIds: string[];
  category: string;
  syncToQAManager: boolean;
}

export interface BatchUpdateCategoryRequest {
  itemIds: string[];
  category: string;
}

export interface KnowledgeSettings {
  enableExtraction: boolean;
  extractionPrompt: string;
  enableMissingIdentification: boolean;
  heatCalculationCycle: 'daily' | 'weekly' | 'monthly';
  extractionSchedule: 'realtime' | 'daily_2am' | 'manual';
  sourceFilter: 'all' | 'human_takeover';
  confidenceThreshold: number;
}

// --- RAG (Retrieval Augmented Generation) Types ---

export interface RAGConfig {
  enabled: boolean;
  embeddingModel: string;
  vectorDimension: number;
  topK: number;
  similarityThreshold: number;
  searchMode: 'vector' | 'hybrid';
  contextTemplate?: string;
  vectorDB: VectorDBConfig;
}

export interface VectorDBConfig {
  provider: 'qdrant' | 'milvus' | 'pinecone';
  host: string;
  port?: number;
  apiKey?: string;
  collectionName: string;
  https?: boolean;
}

export interface RAGSearchRequest {
  query: string;
  topK?: number;
  threshold?: number;
  category?: string;
  filter?: Record<string, any>;
}

export interface RAGSearchResponse {
  results: RAGResult[];
  total: number;
  latency: number;
}

export interface RAGResult {
  qaPair: QAPair;
  score: number;
  rank: number;
}

export interface EmbeddingRequest {
  texts: string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface QAPairVectorStatus {
  vectorId?: string;
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  lastEmbeddedAt?: number;
  errorMessage?: string;
}

// Extend QAPair with vector status
export interface QAPairWithVector extends QAPair {
  vectorStatus?: QAPairVectorStatus;
}

// Lexicon
export interface LexiconItem {
  id: string;
  term: string;
  synonyms: string[];
  category: string;
  description: string;
  weight: 'HIGH' | 'MEDIUM' | 'LOW';
  isActive: boolean;
  lastUpdated: number;
}

// Seats
export interface Seat {
  id: string;
  name: string;
  botConfigId: string;
  concurrency: number;
  status: 'active' | 'disabled';
  createdAt: number;
}

// Market
export interface VoiceProduct {
  id: string;
  name: string;
  provider: string;
  gender: 'Male' | 'Female';
  language: string;
  tags: string[];
  isVip: boolean;
}

export interface BotTemplate {
  id: string;
  name: string;
  category: string;
  difficulty: 'Simple' | 'Medium' | 'Complex';
  usageCount: number;
  description: string;
  tags: string[];
}

// Number Management
export interface DisplaySettingsConfig {
  defaultOutboundType: 'trunk' | 'pool';
  defaultOutboundValue: string;
  inboundMappingType: 'original' | 'trunk' | 'specific' | 'pool';
  transferDisplayType: 'original' | 'trunk' | 'specific' | 'pool';
  mobileOutboundType: 'same_as_customer' | 'specific_trunk' | 'specific_pool';
}

export interface TrunkNumberItem {
  id: string;
  number: string;
  type: string;
  poolName?: string;
  location: string;
  status: 'active' | 'inactive';
  note?: string;
  name?: string;
}

export interface NumberPoolItem {
  id: string;
  name: string;
  strategy: 'random' | 'round_robin' | 'location' | 'custom';
  numbersCount: number;
  smartFilter: boolean;
  note: string;
}

// Settings
export interface GeoGroup {
  id: string;
  name: string;
  regions: string[];
  updatedAt: number;
  note: string;
}

export interface BusinessHourShift {
  day: number;
  start: string;
  end: string;
  enabled: boolean;
}

export interface BusinessHour {
  id: string;
  name: string;
  timezone: string;
  shifts: BusinessHourShift[];
  note: string;
}

// IVR
export interface RouteRule {
  id: string;
  priority: number;
  name: string;
  status: boolean;
  conditionField: 'trunk' | 'geo' | 'time' | 'user_number';
  conditionOperator: 'equals' | 'include' | 'exclude';
  conditionValue: string;
  jumpTargetType: 'bot' | 'seat' | 'ivr_node';
  jumpTargetValue: string;
  note?: string;
}

// File Management
export interface AudioRecording {
  id: string;
  name: string;
  text: string;
  voice: string;
  duration: number; // seconds
  url: string; // mock url
  updatedAt: number;
}

// --- DEBUG TYPES (New) ---

export type DebugExecutionState = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export type NodeExecutionStatus = 'pending' | 'executing' | 'success' | 'error' | 'skipped';

export interface NodeExecutionInfo {
  nodeId: string;
  status: NodeExecutionStatus;
  input: Record<string, any>;
  output: Record<string, any>;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
  attemptCount: number;
  logs?: string[];  // 执行日志
}

export interface DebugBreakpoint {
  id: string;
  nodeId: string;
  condition?: string;
  enabled: boolean;
  hitCount: number;
}

export interface ExecutionStep {
  id: string;
  nodeId: string;
  timestamp: number;
  executionInfo: NodeExecutionInfo;
  variablesSnapshot: Record<string, any>;
}

export interface DebugSession {
  id: string;
  startTime: number;
  endTime?: number;
  state: DebugExecutionState;
  currentNodeId: string | null;
  executionHistory: ExecutionStep[];
  breakpoints: DebugBreakpoint[];
  variables: Record<string, any>;
  executionSpeed: number;
  maxSteps: number;
  currentStep: number;
  autoPauseOnError: boolean;
}

export interface DebugConfig {
  executionSpeed: number;
  autoPauseOnError: boolean;
  showDetailedLogs: boolean;
  maxSteps: number;
  timeoutMs: number;
}

export type StepType = 'over' | 'into' | 'out';

// ----------------------------

export interface BackgroundMusic {
  id: string;
  name: string;
  fileName: string;
  size: string; // e.g. "2.5 MB"
  url: string;
  uploadedAt: number;
}

// --- Outbound Types ---

export interface ContactList {
  id: string;
  name: string;
  totalCount: number;
  validCount: number;
  status: 'importing' | 'ready' | 'error' | 'running' | 'paused' | 'completed';
  createdAt: number;
  tags?: string[];
  // Stats for task execution
  executedCount?: number;
  connectedCount?: number;
  seatAnsweredCount?: number;
  retryCount?: number;
  successRate?: string;
  priority?: number;
}

export interface OutboundTemplate {
  id: string;
  name: string;
  remark: string;
  
  // Dialing Settings
  ivrMode: boolean; // IVR模式开关
  outboundMode: 'ai_bot' | 'predictive' | 'preview'; // 外呼模式
  botConfigId?: string; // 关联机器人
  
  callerIdType: 'number' | 'pool';
  callerIdValue: string; // ID of trunk or pool
  
  executionTimeId: string; // 关联工作时间ID
  blacklistId: string; // 关联黑名单ID
  
  taskConcurrency: number; // 任务并发
  botConcurrency: number; // 机器人并发
  
  // Call Options
  maxRingDuration: number;
  callValidDuration?: number; // 通话有效性判定时长
  retryStrategy: 'first_priority' | 'retry_priority'; // 首呼优先 vs 重呼优先
}

export interface OutboundTask {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'draft' | 'stopped';
  templateId: string;
  
  // Stats
  totalContacts: number;
  executedCount: number;
  connectedCount: number; // 客户接听
  unansweredCount: number;
  seatAnsweredCount: number;
  retryCount: number;
  
  // Config
  startType: 'manual' | 'scheduled' | 'periodic';
  endTime?: string;
  priority: number;
  stopOnEmpty: boolean;
  
  contactListIds: string[]; // Associated contact lists
  
  remark?: string;
  
  // Detail View Fields
  creator?: string;
  startTime?: string; // Actual start time
  createTime?: string;
  currentConcurrency?: number;
}

export interface CallRecord {
  id: string;
  taskId: string;
  phoneNumber: string;
  customerName?: string;
  startTime: number;
  duration: number; // seconds
  status: 'answered' | 'no_answer' | 'busy' | 'failed';
  intentResult: string; // e.g., 'A级意向', '拒绝'
  botName: string;
  rounds: number;
  recordingUrl?: string;
}

// --- Smart Marketing (New) ---

export interface CustomerProfile {
  id: string;
  name: string;
  phoneNumber: string;
  region: string; // e.g. "Shanghai"
  tags: string[]; // e.g. ["High Net Worth", "Price Sensitive"]
  lastInteraction: number;
  notes?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'ended' | 'scheduled';
  
  // Targeting
  targetRegions: string[]; // e.g. ["Shanghai", "Beijing"]
  targetTags: string[]; // e.g. ["VIP"]
  excludeTags?: string[];
  
  // Validity
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  
  // Content
  speechContent: string; // TTS text for the bot to say
  smsTemplateId?: string; // Optional follow-up SMS
  
  // Stats
  exposureCount: number;
  conversionCount: number;
  
  updatedAt: number;
}

// --- Monitoring Report Types (New) ---

export interface ReportMetrics {
  totalCalls: number;
  connectedCalls: number;
  connectionRate: number;
  avgDuration: number;
  avgSatisfaction: number;
  transferRate: number;
  resolutionRate: number;
}

export interface TrendData {
  date: string;
  totalCalls: number;
  connectedCalls: number;
  avgDuration: number;
  satisfaction: number;
}

export interface BotPerformance {
  botId: string;
  botName: string;
  totalCalls: number;
  connectionRate: number;
  avgDuration: number;
  satisfaction: number;
  intentAccuracy: number;
  transferRate: number;
}

export interface IntentAnalysis {
  intentId: string;
  intentName: string;
  triggerCount: number;
  accuracy: number;
  avgDuration: number;
}

export interface HourlyDistribution {
  hour: number;
  callCount: number;
}

export interface DurationDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface HangupReasonDistribution {
  reason: string;
  count: number;
  percentage: number;
}

export interface UnmatchedIntent {
  text: string;
  count: number;
  lastTime: number;
}

// Extend CallRecord with report-related fields
export interface CallRecordDetail extends CallRecord {
  satisfaction?: number; // 1-5 rating
  hangupReason: 'normal' | 'user_hangup' | 'timeout' | 'transfer' | 'error';
  intentMatched: boolean;
  intentName?: string;
  waitTime: number; // seconds before bot answers
  botId: string;
}

export type TimeRange = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
