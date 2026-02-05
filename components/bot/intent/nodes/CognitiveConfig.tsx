
import React from 'react';
import { Plus, X } from 'lucide-react';
import { IntentNode, ModelType } from '../../../../types';
import { Label, Select, Slider } from '../../../ui/FormComponents';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
}

const CognitiveConfig: React.FC<Props> = ({ node, onChange }) => {
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
      </>
    );
  }

  return null;
};

export default CognitiveConfig;
