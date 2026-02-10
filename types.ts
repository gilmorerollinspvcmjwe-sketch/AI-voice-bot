
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

export interface PlayNodeConfig extends NodeCommonConfig {
  type: 'tts' | 'audio_file' | 'ssml';
  content: string; 
  voiceOverride?: string; 
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
  dtmfConfig?: {
    maxDigits: number;
    terminator: string;
    timeoutMs: number;
  };
  retryStrategy?: RetryStrategy;
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
  outputFormat?: 'text' | 'json';
  jsonSchema?: string; 
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

export interface VariableOperation {
  variableId: string;
  type: 'SET' | 'ADD' | 'SUBTRACT' | 'APPEND' | 'CLEAR';
  value: string; 
}

export interface SetVariableNodeConfig extends NodeCommonConfig {
  operations: VariableOperation[];
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
  errorTargetId?: string; 
}

export interface SmsNodeConfig extends NodeCommonConfig {
  templateId: string;
  phoneNumberVariable?: string; 
  params?: Record<string, string>; 
}

export interface TransferNodeConfig extends NodeCommonConfig {
  transferType: 'sip_trunk' | 'pstn' | 'queue' | 'agent';
  target: string; 
  uui?: string; 
  playBeforeTransfer?: string; 
  maxQueueTimeSeconds?: number;
  queueFullTargetId?: string;
}

export interface ScriptNodeConfig extends NodeCommonConfig {
  language: 'javascript' | 'python';
  code: string;
  inputVariables?: string[];
  outputVariables?: string[];
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
  type: 'API'; // Simplified: removed 'TRANSFER' | 'SMS'
  
  // Link to existing resources
  refId?: string; // ExtractionConfig ID for API
  
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
}

export interface AgentConfig {
  tools: AgentTool[];
  generalFiller: {
    enabled: boolean;
    type: 'TTS' | 'AUDIO';
    content: string;
  };
  functionCallModel?: string; // Optional override
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
  
  // Strategy Details
  welcomeMessageEnabled: boolean;
  welcomeMessage: string;
  welcomeMessageInterruptible?: boolean;
  
  transferIntentDefaultEnabled?: boolean;
  transferIntentCustomEnabled?: boolean;
  transferCustomIntents?: string[];
  transferIntentThreshold: number;
  transferConditionRoundsEnabled?: boolean;
  transferConditionRounds?: number;
  transferConditionDurationEnabled?: boolean;
  transferConditionDuration?: number;
  transferSpeech?: string;
  transferIvrTarget?: string;

  hangupIntentDefaultEnabled?: boolean;
  hangupIntentCustomEnabled?: boolean;
  hangupCustomIntents?: string[];
  hangupIntentThreshold: number;
  hangupConditionRoundsEnabled?: boolean;
  hangupConditionRounds?: number;
  hangupConditionDurationEnabled?: boolean;
  hangupConditionDuration?: number;
  hangupSpeech?: string;

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
  validityType: 'permanent' | 'range';
  validityStart?: number;
  validityEnd?: number;
  lastUpdated: number;
  isActive: boolean;
  audioResources?: Record<string, string>;
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
