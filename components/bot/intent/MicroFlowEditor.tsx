
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, Settings, X, 
  MessageSquare, Globe, ArrowLeft, 
  Zap, PhoneOff, Headset, 
  Move, Plus, GitBranch,
  Bot, UserCog, Search, Clock, Calculator, Loader, Smartphone, Mail, Database, Activity, Volume2,
  Smile, ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw,
  Mic, Split, Trash2, Hash, Music, Tag, Code, Layers, AlertCircle, Check, ChevronDown, List,
  Flag, Timer, PhoneForwarded
} from 'lucide-react';
import { IntentNode, IntentEdge, IntentNodeType, ModelType, TTSModel, ASRModel, ExtractionConfig, LabelGroup } from '../../../types';
import { Input, Label, Select, Switch, Slider } from '../../ui/FormComponents';
import { StringList } from './NodeFormHelpers';

// Node Config Components
import InteractionConfig from './nodes/InteractionConfig';
import CognitiveConfig from './nodes/CognitiveConfig';
import LogicConfig from './nodes/LogicConfig';
import DataConfig from './nodes/DataConfig';

interface MicroFlowEditorProps {
  initialNodes: IntentNode[];
  initialEdges: IntentEdge[];
  onSave: (nodes: IntentNode[], edges: IntentEdge[]) => void;
  readOnly?: boolean;
  extractionConfigs?: ExtractionConfig[]; // Global APIs
  labelGroups?: LabelGroup[]; // Global Labels
}

interface ToolboxItem {
  type: IntentNodeType;
  subType: string;
  label: string;
  icon: any;
  tip: string;
}

// Updated Toolbox Groups
const INTENT_TOOLBOX_GROUPS: { name: string; color: string; items: ToolboxItem[] }[] = [
  {
    name: '交互 (Interaction)',
    color: 'indigo',
    items: [
      { type: 'ACTION', subType: 'play_tts', label: '播放 (Play)', icon: Volume2, tip: '播放录音文件或URL。' },
      { type: 'LISTEN', subType: 'collect', label: '收集 (Collect)', icon: Mic, tip: '收集用户语音意图、槽位或按键输入。' },
      { type: 'ACTION', subType: 'wait', label: '等待 (Wait)', icon: Timer, tip: '静音等待一段时间，通常用于模拟思考或节奏控制。' },
    ]
  },
  {
    name: '认知 (Cognitive)',
    color: 'amber',
    items: [
      { type: 'AI_AGENT', subType: 'llm', label: '大模型生成', icon: Bot, tip: '调用 LLM 生成动态回复。' },
    ]
  },
  {
    name: '逻辑 (Logic)',
    color: 'blue',
    items: [
      { type: 'BRANCH', subType: 'condition', label: '条件分支', icon: Split, tip: '根据变量值或表达式进行逻辑判断。' },
      { type: 'LOGIC', subType: 'set_variable', label: '变量操作', icon: Calculator, tip: '设置、更新或清除上下文变量。' },
      { type: 'LOGIC', subType: 'tag', label: '打标签', icon: Tag, tip: '给当前会话打上业务标签（如：高意向）。' },
      { type: 'LOGIC', subType: 'script', label: '脚本代码', icon: Code, tip: '执行自定义 JavaScript 脚本。' },
    ]
  },
  {
    name: '服务与数据 (Service)',
    color: 'rose',
    items: [
      { type: 'DATA', subType: 'http_request', label: 'HTTP 请求', icon: Globe, tip: '调用外部 API 接口。' },
      { type: 'DATA', subType: 'sms', label: '发送短信', icon: Mail, tip: '触发短信模版发送。' },
      { type: 'ACTION', subType: 'transfer', label: '转人工', icon: Headset, tip: '转接到内呼坐席技能组。' },
      { type: 'ACTION', subType: 'transfer_pstn', label: '转外线', icon: PhoneForwarded, tip: '转接到外部手机或固话号码。' },
      { type: 'ACTION', subType: 'hangup', label: '挂断', icon: PhoneOff, tip: '结束通话。' }
    ]
  },
  {
    name: '流程控制 (Flow)',
    color: 'slate',
    items: [
      { type: 'ACTION', subType: 'end_flow', label: '流程结束', icon: Flag, tip: '标记意图流程的自然结束点。' }
    ]
  }
];

// --- Main Editor Component ---

export default function MicroFlowEditor({ 
  initialNodes, initialEdges, onSave, readOnly,
  extractionConfigs = [], labelGroups = [] 
}: MicroFlowEditorProps) {
  const [nodes, setNodes] = useState<IntentNode[]>(initialNodes.length > 0 ? initialNodes : [{ id: 'start', type: 'START', subType: 'start', label: '流程开始', x: 50, y: 250 }]);
  // edges are now derived mostly from node configs, but we keep state for initial load or manual overrides if we were to support hybrid.
  // For this refactor, we will regenerate edges automatically based on config.
  const [edges, setEdges] = useState<IntentEdge[]>(initialEdges);
  
  // Viewport / Canvas State
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'ADVANCED'>('CONFIG');
  
  // Hover Tooltip
  const [hoveredTool, setHoveredTool] = useState<{ item: ToolboxItem, rect: DOMRect } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-generate edges when nodes change
  useEffect(() => {
    const newEdges: IntentEdge[] = [];
    
    nodes.forEach(node => {
      // 1. Linear connections (nextNodeId)
      if (node.config?.nextNodeId) {
        // Validation: Ensure target exists
        if (nodes.find(n => n.id === node.config.nextNodeId)) {
          newEdges.push({
            id: `e_${node.id}_to_${node.config.nextNodeId}`,
            source: node.id,
            target: node.config.nextNodeId
          });
        }
      }

      // 2. Branch connections (Condition Node)
      if (node.subType === 'condition' && node.config?.expressions) {
        node.config.expressions.forEach((expr: any, idx: number) => {
          if (expr.targetNodeId && nodes.find(n => n.id === expr.targetNodeId)) {
             newEdges.push({
               id: `e_${node.id}_br_${idx}`,
               source: node.id,
               target: expr.targetNodeId,
               label: expr.name || `分支 ${idx+1}`
             });
          }
        });
      }
    });

    setEdges(newEdges);
    // We trigger onSave here to persist changes immediately
    onSave(nodes, newEdges);
  }, [nodes, onSave]);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // --- Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { 
       setIsPanning(true);
       setLastMousePos({ x: e.clientX, y: e.clientY });
       setSelectedNodeId(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    if (!readOnly) {
      setIsDraggingNode(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    if (isPanning) {
      setViewport(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode && selectedNodeId) {
      setNodes(prev => prev.map(n => 
        n.id === selectedNodeId ? { ...n, x: n.x + (deltaX / zoom), y: n.y + (deltaY / zoom) } : n
      ));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingNode(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setViewport({ x: 0, y: 0 });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    
    const type = e.dataTransfer.getData('nodeType') as unknown as IntentNodeType;
    const subType = e.dataTransfer.getData('nodeSubType');
    if (!type) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    const x = (clientX - viewport.x) / zoom;
    const y = (clientY - viewport.y) / zoom;

    let defaultLabel: string = type;
    for(const g of INTENT_TOOLBOX_GROUPS) {
        const found = g.items.find(i => i.type === type && i.subType === subType);
        if(found) defaultLabel = found.label.split(' (')[0];
    }

    const newNode: IntentNode = {
      id: `node_${Date.now()}`,
      type,
      subType,
      label: defaultLabel,
      x,
      y,
      config: {}
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const deleteSelected = () => {
    if (readOnly) return;
    if (selectedNodeId) {
       if (selectedNodeId === 'start') return; 
       
       // Remove node
       setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
       
       // Also clear references to this node in other nodes' configs
       setNodes(prev => prev.map(n => {
         const newConfig = { ...n.config };
         
         // Clear linear nextNodeId
         if (newConfig.nextNodeId === selectedNodeId) {
           delete newConfig.nextNodeId;
         }
         
         // Clear branch targets
         if (n.subType === 'condition' && newConfig.expressions) {
           newConfig.expressions = newConfig.expressions.map((expr: any) => 
             expr.targetNodeId === selectedNodeId ? { ...expr, targetNodeId: undefined } : expr
           );
         }
         
         return { ...n, config: newConfig };
       }));

       setSelectedNodeId(null);
    }
  };

  const updateNodeConfig = (nodeId: string, updates: any) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, config: { ...(n.config || {}), ...updates } } : n
    ));
  };

  // --- Helpers for Dropdown Options ---
  // Returns list of nodes that can be connected to (excluding self and start)
  const getConnectableNodes = (currentNodeId: string) => {
    return nodes
      .filter(n => n.id !== currentNodeId)
      .map(n => ({ label: `${n.label} (${n.subType})`, value: n.id }));
  };

  // --- Render Helpers ---
  const getNodeColor = (type: IntentNodeType, subType?: string) => {
    if (subType === 'end_flow') return 'bg-slate-100 border-slate-300 text-slate-700';
    switch(type) {
      case 'START': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'LISTEN': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'BRANCH': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'AI_AGENT': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'LOGIC': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'ACTION': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'DATA': return 'bg-purple-50 border-purple-200 text-purple-700';
      default: return 'bg-white border-gray-200';
    }
  };

  const getNodeIcon = (node: IntentNode) => {
      if (node.type === 'START') return <Play size={14} />;
      
      for(const g of INTENT_TOOLBOX_GROUPS) {
          const item = g.items.find(i => i.type === node.type && i.subType === node.subType);
          if(item) return <item.icon size={14} />;
      }
      return <Activity size={14} />;
  };

  const renderBezierCurve = (startX: number, startY: number, endX: number, endY: number) => {
    const cp1x = startX + 50;
    const cp1y = startY;
    const cp2x = endX - 50;
    const cp2y = endY;
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-1 h-full relative overflow-hidden bg-slate-50 border border-slate-200 rounded-lg" ref={containerRef} tabIndex={0} onKeyDown={(e) => {
       if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    }}>
      
      {/* Toolbox (Left) */}
      {!readOnly && (
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 z-20 gap-2 overflow-y-auto">
           {INTENT_TOOLBOX_GROUPS.map((group, gIdx) => (
             <React.Fragment key={gIdx}>
                <div className={`text-[8px] font-bold text-${group.color}-600 mt-2 mb-1 px-1 text-center leading-tight`}>{group.name}</div>
                {group.items.map(item => (
                  <div 
                    key={`${item.type}-${item.subType}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-grab hover:bg-${group.color}-50 hover:text-${group.color}-600 transition-colors text-slate-400 border border-transparent hover:border-${group.color}-100`}
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.setData('nodeType', item.type);
                        e.dataTransfer.setData('nodeSubType', item.subType);
                    }}
                    onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredTool({ item, rect });
                    }}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    <item.icon size={18} />
                  </div>
                ))}
                <div className="w-8 h-px bg-gray-100 my-1"></div>
             </React.Fragment>
           ))}
        </div>
      )}

      {/* Main Canvas Area */}
      <div 
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-slate-50 outline-none"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
         {/* Transformed Content Layer */}
         <div 
            style={{ 
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${zoom})`, 
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
         >
             {/* Grid */}
             <div 
                className="absolute inset-[-200%] pointer-events-none opacity-[0.05]" 
                style={{ 
                  backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
                  backgroundSize: '20px 20px',
                }}
             ></div>

             {/* Edges */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                 <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                    </marker>
                 </defs>
                 {edges.map(edge => {
                    const start = nodes.find(n => n.id === edge.source);
                    const end = nodes.find(n => n.id === edge.target);
                    if (!start || !end) return null;
                    
                    const startX = start.x + 180; 
                    const startY = start.y + 30; 
                    const endX = end.x;
                    const endY = end.y + 30;
                    
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;

                    return (
                       <g key={edge.id} className="pointer-events-auto">
                          <path 
                            d={renderBezierCurve(startX, startY, endX, endY)} 
                            stroke="#94a3b8" 
                            strokeWidth="2"
                            fill="none" 
                            markerEnd="url(#arrowhead)"
                          />
                          {edge.label && (
                             <foreignObject x={midX - 30} y={midY - 10} width="60" height="20">
                                <div className="text-[8px] text-center rounded px-1 truncate bg-white border border-gray-200 text-slate-500 shadow-sm">
                                   {edge.label}
                                </div>
                             </foreignObject>
                          )}
                       </g>
                    );
                 })}
             </svg>

             {/* Nodes */}
             {nodes.map(node => (
                <div 
                   key={node.id}
                   className={`absolute w-[180px] h-[60px] rounded-lg border shadow-sm flex items-center px-3 cursor-pointer transition-all select-none ${getNodeColor(node.type, node.subType)} ${selectedNodeId === node.id ? 'ring-2 ring-primary ring-offset-2 z-20' : 'z-10'}`}
                   style={{ left: node.x, top: node.y }}
                   onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                >
                   <div className="mr-3 p-1.5 bg-white/50 rounded">
                      {getNodeIcon(node)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{node.label}</div>
                      <div className="text-[9px] opacity-70 truncate uppercase">
                          {node.subType?.replace('_', ' ') || node.type}
                      </div>
                   </div>
                   {node.type !== 'START' && <div className="absolute -left-1 w-2 h-2 bg-slate-300 rounded-full border border-white" />}
                   
                   {/* Output Indicator (Visual Only now) */}
                   {node.subType !== 'end_flow' && (
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-300 rounded-full border border-white"></div>
                   )}
                </div>
             ))}
         </div>
      </div>

      {/* Canvas Controls */}
      <div className="absolute left-20 bottom-6 flex space-x-2 z-20">
         <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex items-center p-1">
            <button onClick={handleZoomOut} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="缩小"><ZoomOut size={16} /></button>
            <span className="text-[10px] w-10 text-center font-mono text-slate-600">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="放大"><ZoomIn size={16} /></button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button onClick={handleReset} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="复位"><RotateCcw size={14} /></button>
         </div>
         <button onClick={toggleFullscreen} className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-slate-500 hover:text-primary hover:bg-slate-50" title="全屏">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
         </button>
         {(selectedNodeId) && (
            <button onClick={deleteSelected} className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-red-500 hover:bg-red-50" title="删除选中">
               <Trash2 size={16} />
            </button>
         )}
      </div>

      {/* --- Property Panel (Drawer) --- */}
      {selectedNode && !readOnly && (
         <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col animate-in slide-in-from-right-10 duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-sm">
               <div>
                  <div className="text-sm font-bold text-slate-800 flex items-center">
                     {getNodeIcon(selectedNode)}
                     <span className="ml-2">{selectedNode.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{selectedNode.type} / {selectedNode.subType}</div>
               </div>
               <button onClick={() => setSelectedNodeId(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors">
                  <X size={18} />
               </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4">
               <button 
                  onClick={() => setActiveTab('CONFIG')}
                  className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'CONFIG' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  核心配置
               </button>
               <button 
                  onClick={() => setActiveTab('ADVANCED')}
                  className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'ADVANCED' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  高级设置
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
               
               {/* --- Common Fields --- */}
               <div>
                  <Label label="节点名称" />
                  <input 
                     className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-primary outline-none"
                     value={selectedNode.label} 
                     onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? {...n, label: e.target.value} : n))}
                  />
               </div>

               {/* --- CONFIG TAB CONTENT --- */}
               {activeTab === 'CONFIG' && (
                  <>
                     <InteractionConfig node={selectedNode} onChange={(updates) => updateNodeConfig(selectedNode.id, updates)} />
                     <CognitiveConfig node={selectedNode} onChange={(updates) => updateNodeConfig(selectedNode.id, updates)} />
                     {/* Pass available nodes to LogicConfig for branch targeting */}
                     <LogicConfig 
                        node={selectedNode} 
                        onChange={(updates) => updateNodeConfig(selectedNode.id, updates)} 
                        availableNodes={getConnectableNodes(selectedNode.id)}
                        labelGroups={labelGroups}
                     />
                     <DataConfig 
                        node={selectedNode} 
                        onChange={(updates) => updateNodeConfig(selectedNode.id, updates)} 
                        extractionConfigs={extractionConfigs}
                     />
                     
                     {/* Standard Next Step Selector (For Non-Branch/Non-End Nodes) */}
                     {selectedNode.type !== 'BRANCH' && selectedNode.subType !== 'condition' && selectedNode.subType !== 'end_flow' && (
                        <div className="pt-4 border-t border-gray-100 mt-4">
                           <Label label="下一步 (Next Step)" tooltip="当前节点执行完成后，流转到的下一个节点。" />
                           <Select 
                              label=""
                              options={[{label: '无 (结束或断开)', value: ''}, ...getConnectableNodes(selectedNode.id)]}
                              value={selectedNode.config?.nextNodeId || ''}
                              onChange={(e) => updateNodeConfig(selectedNode.id, { nextNodeId: e.target.value })}
                           />
                        </div>
                     )}
                  </>
               )}

               {/* --- ADVANCED TAB CONTENT --- */}
               {activeTab === 'ADVANCED' && (
                  <div className="space-y-6">
                     <div>
                        <Label label="前置动作 (Pre-Actions)" tooltip="进入节点前执行的快速操作，如清空变量。" />
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-400 text-center">
                           暂未添加前置动作
                        </div>
                        <button className="mt-2 w-full py-1.5 border border-slate-200 rounded text-xs text-slate-500 hover:bg-slate-50">
                           + 添加动作
                        </button>
                     </div>

                     <div>
                        <Label label="执行超时 (ms)" />
                        <Input 
                           type="number"
                           value={selectedNode.config?.nextTimeoutMs || 0}
                           onChange={(e) => updateNodeConfig(selectedNode.id, { nextTimeoutMs: parseInt(e.target.value) })}
                           placeholder="0 (无限制)"
                        />
                     </div>

                     {selectedNode.type === 'LISTEN' && (
                        <div className="border-t border-gray-100 pt-4">
                           <h4 className="text-xs font-bold text-slate-800 mb-3">重试策略 (Retry)</h4>
                           <Input 
                              label="最大重试次数"
                              type="number"
                              value={selectedNode.config?.retryStrategy?.maxAttempts || 3}
                              onChange={(e) => updateNodeConfig(selectedNode.id, { retryStrategy: { ...selectedNode.config?.retryStrategy, maxAttempts: parseInt(e.target.value) } })}
                           />
                           <div className="mt-3">
                              <Label label="无输入提示音 (No Input)" />
                              <StringList 
                                 items={selectedNode.config?.retryStrategy?.noInputPrompts || []}
                                 onChange={(items) => updateNodeConfig(selectedNode.id, { retryStrategy: { ...selectedNode.config?.retryStrategy, noInputPrompts: items } })}
                                 placeholder="您还在吗？"
                              />
                           </div>
                           <div className="mt-3">
                              <Label label="拒识提示音 (No Match)" />
                              <StringList 
                                 items={selectedNode.config?.retryStrategy?.noMatchPrompts || []}
                                 onChange={(items) => updateNodeConfig(selectedNode.id, { retryStrategy: { ...selectedNode.config?.retryStrategy, noMatchPrompts: items } })}
                                 placeholder="抱歉我没听清..."
                              />
                           </div>
                        </div>
                     )}

                     {selectedNode.subType === 'play_tts' && (
                        <div className="border-t border-gray-100 pt-4 space-y-4">
                           <div className="flex items-center justify-between">
                              <Label label="允许打断 (Barge-in)" />
                              <Switch 
                                 label=""
                                 checked={selectedNode.config?.bargeIn ?? true}
                                 onChange={(v) => updateNodeConfig(selectedNode.id, { bargeIn: v })}
                              />
                           </div>
                           <div className="px-1">
                              <Slider 
                                 label="打断阈值 (Confidence)"
                                 min={0} max={1} step={0.1}
                                 value={selectedNode.config?.bargeInThreshold ?? 0.8}
                                 onChange={(v) => updateNodeConfig(selectedNode.id, { bargeInThreshold: v })}
                              />
                           </div>
                        </div>
                     )}
                  </div>
               )}

            </div>
         </div>
      )}
      
      {/* Tooltip Portal */}
      {hoveredTool && (
        <div 
           className="fixed z-[100] w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl pointer-events-none"
           style={{
             left: hoveredTool.rect.right + 10,
             top: hoveredTool.rect.top
           }}
        >
          <div className="font-bold mb-1 border-b border-slate-600 pb-1 flex items-center">
             <hoveredTool.item.icon size={10} className="mr-1" />
             {hoveredTool.item.label}
          </div>
          <div className="leading-tight text-slate-300">
             {hoveredTool.item.tip}
          </div>
        </div>
      )}
    </div>
  );
}
