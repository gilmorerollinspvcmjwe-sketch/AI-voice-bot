
import React from 'react';
import { IntentNode } from '../../../../types';
import { Input, Label, Select } from '../../../ui/FormComponents';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
}

const InteractionConfig: React.FC<Props> = ({ node, onChange }) => {
  // 1. Play / TTS
  if (node.subType === 'play_tts') {
    return (
      <>
        <Select 
          label="播放类型"
          options={[{label: '音频文件 URL', value: 'audio_file'}]}
          value={node.config?.type || 'audio_file'}
          onChange={(e) => onChange({ type: e.target.value })}
        />
        <div>
          <Label label="内容文本 / URL" required />
          <textarea 
            className="w-full h-32 px-3 py-2 text-xs border border-gray-200 rounded resize-none focus:border-primary outline-none leading-relaxed"
            placeholder="https://example.com/audio.mp3"
            value={node.config?.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        </div>
        <Select 
          label="指定播报音色 (可选)"
          options={[{label: '默认 (跟随全局)', value: ''}, {label: 'Xiaoxiao (女声)', value: 'Xiaoxiao'}, {label: 'Yunxi (男声)', value: 'Yunxi'}]}
          value={node.config?.voiceOverride || ''}
          onChange={(e) => onChange({ voiceOverride: e.target.value })}
        />
      </>
    );
  }

  // 2. Collect / Listen
  if (node.subType === 'collect') {
    return (
      <>
        <Select 
          label="收集类型"
          options={[{label: '意图识别 (Intent)', value: 'intent'}, {label: '槽位提取 (Slot)', value: 'slot'}, {label: '按键输入 (DTMF)', value: 'dtmf'}]}
          value={node.config?.collectType || 'intent'}
          onChange={(e) => onChange({ collectType: e.target.value })}
        />
        {node.config?.collectType !== 'intent' && (
          <Input 
            label="存储变量名"
            placeholder="如: user_age"
            value={node.config?.variable || ''}
            onChange={(e) => onChange({ variable: e.target.value })}
          />
        )}
        {node.config?.collectType === 'dtmf' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="最大位数"
              type="number"
              value={node.config?.dtmfConfig?.maxDigits || 1}
              onChange={(e) => onChange({ dtmfConfig: { ...node.config?.dtmfConfig, maxDigits: parseInt(e.target.value) } })}
            />
            <Input 
              label="结束符"
              placeholder="#"
              value={node.config?.dtmfConfig?.terminator || '#'}
              onChange={(e) => onChange({ dtmfConfig: { ...node.config?.dtmfConfig, terminator: e.target.value } })}
            />
          </div>
        )}
      </>
    );
  }

  // 3. Wait (New)
  if (node.subType === 'wait') {
    return (
      <Input 
        label="等待时长 (ms)"
        type="number"
        value={node.config?.durationMs || 1000}
        onChange={(e) => onChange({ durationMs: parseInt(e.target.value) })}
        placeholder="1000"
      />
    );
  }

  return null;
};

export default InteractionConfig;
