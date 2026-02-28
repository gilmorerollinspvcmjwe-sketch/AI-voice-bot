
import React from 'react';
import { Plus, X } from 'lucide-react';
import { IntentNode, ModelType } from '../../../../types';
import { Label, Select, Slider } from '../../../ui/FormComponents';
import SimpleErrorHandling from './SimpleErrorHandling';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
  availableNodes?: { label: string; value: string }[];
}

const CognitiveConfig: React.FC<Props> = ({ node, onChange, availableNodes = [] }) => {
  // 3. LLM
  if (node.subType === 'llm') {
    return (
      <>
        <Select 
          label="模型选择"
          options={Object.values(ModelType) as string[]}
          value={node.config?.modelType || ModelType.GEMINI_FLASH}
          onChange={(e) => onChange({ modelType: e.target.value })}
        />
        <div>
          <Label label="系统提示词 (System Prompt)" />
          <textarea 
            className="w-full h-40 px-3 py-2 text-xs border border-gray-200 rounded resize-none focus:border-primary outline-none leading-relaxed font-mono"
            placeholder="设定此节点的具体人设和行为规范..."
            value={node.config?.systemPrompt || ''}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
          />
        </div>
        <Slider 
          label="随机性 (Temperature)" 
          min={0} max={1} step={0.1}
          value={node.config?.temperature ?? 0.7}
          onChange={(v) => onChange({ temperature: v })}
        />

        {/* Error Handling */}
        <div className="pt-4 border-t border-gray-100">
          <SimpleErrorHandling
            label="节点执行异常时跳转至"
            tooltip="异常包括API调用失败、响应超时、返回空内容等"
            value={node.config?.onErrorNodeId || ''}
            onChange={(value) => onChange({ onErrorNodeId: value })}
            availableNodes={availableNodes}
          />
        </div>
      </>
    );
  }

  // 4. Collect
  if (node.subType === 'collect') {
    return (
      <>
        <Select 
          label="收集类型"
          options={[
            {label: '意图 (Intent)', value: 'intent'},
            {label: '槽位 (Slot)', value: 'slot'},
            {label: '按键 (DTMF)', value: 'dtmf'}
          ]}
          value={node.config?.collectType || 'intent'}
          onChange={(e) => onChange({ collectType: e.target.value })}
        />
        
        {node.config?.collectType === 'slot' && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
            槽位收集将尝试从用户输入中提取指定变量。
          </div>
        )}

        {node.config?.collectType === 'dtmf' && (
          <>
            <Label label="最大位数" />
            <input 
              type="number"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded"
              value={node.config?.dtmfConfig?.maxDigits || 1}
              onChange={(e) => onChange({ 
                dtmfConfig: { 
                  ...(node.config?.dtmfConfig || {}), 
                  maxDigits: parseInt(e.target.value) 
                } 
              })}
            />
          </>
        )}

        {/* Error Handling */}
        <div className="pt-4 border-t border-gray-100">
          <SimpleErrorHandling
            label="收集异常时跳转至"
            tooltip="包括用户未响应超时、语音识别失败、用户打断等"
            value={node.config?.onCollectErrorNodeId || ''}
            onChange={(value) => onChange({ onCollectErrorNodeId: value })}
            availableNodes={availableNodes}
          />
        </div>
      </>
    );
  }

  return null;
};

export default CognitiveConfig;
