
import React from 'react';
import { Play } from 'lucide-react';
import { IntentNode } from '../../../../types';
import { Input, Label } from '../../../ui/FormComponents';
import SimpleErrorHandling from './SimpleErrorHandling';
import AudioSelector from './AudioSelector';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
  availableNodes?: { label: string; value: string }[];
}

const InteractionConfig: React.FC<Props> = ({ node, onChange, availableNodes = [] }) => {
  // 1. Play Audio (播放录音)
  if (node.subType === 'play_audio' || node.subType === 'play_tts') {
    const formatDuration = (seconds?: number) => {
      if (!seconds) return '--:--';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <>
        <Label label="选择录音" required />
        <AudioSelector
          value={node.config?.audioId || ''}
          onChange={(audioId, audioName, audioUrl, duration) => {
            onChange({
              audioId,
              audioName,
              audioUrl,
              duration
            });
          }}
        />

        {/* 显示已选录音信息 */}
        {node.config?.audioId && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded mt-3">
            <div className="flex items-center gap-2">
              <Play size={14} className="text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                {node.config.audioName}
              </span>
            </div>
            {node.config.duration && (
              <div className="text-xs text-slate-500 mt-1 ml-6">
                时长: {formatDuration(node.config.duration)}
              </div>
            )}
            {node.config.audioUrl && (
              <div className="mt-2 ml-6">
                <button
                  onClick={() => {
                    // 预览播放
                    const audio = new Audio(node.config.audioUrl);
                    audio.play().catch(e => console.error('播放失败:', e));
                  }}
                  className="text-xs text-primary hover:text-primary/80 flex items-center"
                >
                  <Play size={12} className="mr-1" /> 预览播放
                </button>
              </div>
            )}
          </div>
        )}

        {/* 旧配置兼容提示 */}
        {node.config?.content && !node.config?.audioId && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded mt-3">
            <p className="text-xs text-amber-700">
              ⚠️ 此节点包含旧版配置，请重新选择录音。
            </p>
          </div>
        )}

        {/* Error Handling */}
        <div className="pt-4 border-t border-gray-100 mt-4">
          <SimpleErrorHandling
            label="播放异常时跳转至"
            tooltip="包括录音文件不存在、格式不支持等"
            value={node.config?.onErrorNodeId || ''}
            onChange={(value) => onChange({ onErrorNodeId: value })}
            availableNodes={availableNodes}
          />
        </div>
      </>
    );
  }

  // 2. Collect / Listen
  if (node.subType === 'collect') {
    return (
      <>
        <Label label="收集类型" />
        <select
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-white outline-none"
          value={node.config?.collectType || 'intent'}
          onChange={(e) => onChange({ collectType: e.target.value })}
        >
          <option value="intent">意图识别 (Intent)</option>
          <option value="slot">槽位提取 (Slot)</option>
          <option value="dtmf">按键输入 (DTMF)</option>
        </select>
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
