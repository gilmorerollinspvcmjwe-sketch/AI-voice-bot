
import React from 'react';
import { IntentNode, ExtractionConfig } from '../../../../types';
import { Input, Label, Select } from '../../../ui/FormComponents';
import { KeyValueList } from '../NodeFormHelpers';

interface Props {
  node: IntentNode;
  onChange: (updates: any) => void;
  extractionConfigs?: ExtractionConfig[];
}

const DataConfig: React.FC<Props> = ({ node, onChange, extractionConfigs = [] }) => {
  // 7. HTTP Request (Updated)
  if (node.subType === 'http_request') {
    const selectedApi = extractionConfigs.find(c => c.id === node.config?.apiId);

    return (
      <>
        <Label label="选择全局接口" />
        <Select 
          options={[
            {label: '请选择...', value: ''}, 
            ...extractionConfigs.map(c => ({label: c.name, value: c.id}))
          ]}
          value={node.config?.apiId || ''}
          onChange={(e) => onChange({ apiId: e.target.value })}
        />
        
        {selectedApi ? (
          <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-600 mb-4">
             <div className="font-bold mb-1">{selectedApi.method} {selectedApi.interfaceUrl}</div>
             <div className="text-slate-400">{selectedApi.description}</div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700 mb-4">
             请选择一个预先配置好的接口。如需新增，请前往“信息提取配置”。
          </div>
        )}

        <div className="border-t border-gray-100 pt-3">
          <Label label="参数映射 (Params Mapping)" tooltip="将当前对话变量赋值给接口参数" />
          <KeyValueList 
            keyLabel="API Param"
            valueLabel="Bot Variable"
            items={node.config?.paramMapping?.map((m: any) => ({key: m.paramKey, value: m.variableId})) || []}
            onChange={(items) => {
              const paramMapping = items.map(i => ({ paramKey: i.key, variableId: i.value }));
              onChange({ paramMapping });
            }}
          />
        </div>

        <div className="border-t border-gray-100 pt-3">
          <Label label="返回值映射 (Response Mapping)" tooltip="将接口返回字段赋值给机器人变量" />
          <KeyValueList 
            keyLabel="JSONPath"
            valueLabel="Bot Variable"
            items={node.config?.responseMapping?.map((m: any) => ({key: m.responsePath, value: m.targetVariable})) || []}
            onChange={(items) => {
              const responseMapping = items.map(i => ({ responsePath: i.key, targetVariable: i.value }));
              onChange({ responseMapping });
            }}
          />
        </div>
      </>
    );
  }

  // SMS (New)
  if (node.subType === 'sms') {
    return (
      <>
        <Input 
          label="短信模版ID"
          placeholder="SMS_12345678"
          value={node.config?.templateId || ''}
          onChange={(e) => onChange({ templateId: e.target.value })}
        />
        <Input 
          label="接收号码变量"
          placeholder="user_phone"
          value={node.config?.phoneNumberVariable || 'user_phone'}
          onChange={(e) => onChange({ phoneNumberVariable: e.target.value })}
        />
        <div className="border-t border-gray-100 pt-3">
          <Label label="模版参数 (Params)" />
          <KeyValueList 
            items={node.config?.params ? Object.entries(node.config.params).map(([k,v]) => ({key:k, value:v as string})) : []}
            onChange={(items) => {
              const params = items.reduce((acc, curr) => ({...acc, [curr.key]: curr.value}), {});
              onChange({ params });
            }}
          />
        </div>
      </>
    );
  }

  // 8. Transfer (Updated)
  if (node.subType === 'transfer' || node.subType === 'transfer_pstn') {
    const isPstn = node.subType === 'transfer_pstn';
    return (
      <>
        <Label label="转接目标类型" />
        <div className="flex bg-slate-100 p-1 rounded mb-4">
           <button 
             className={`flex-1 py-1 text-xs rounded ${!isPstn ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
             onClick={() => onChange({ transferType: 'queue' })} // Actually need to change subType in parent, but mocking config change here for UI
           >
             内呼坐席
           </button>
           <button 
             className={`flex-1 py-1 text-xs rounded ${isPstn ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
             onClick={() => onChange({ transferType: 'pstn' })}
           >
             外部号码 (PSTN)
           </button>
        </div>

        {isPstn ? (
           <Input 
             label="外部电话号码"
             placeholder="13800138000"
             value={node.config?.target || ''}
             onChange={(e) => onChange({ target: e.target.value })}
           />
        ) : (
           <Select 
             label="技能组队列"
             options={[{label: '通用客服', value: 'queue_general'}, {label: 'VIP专席', value: 'queue_vip'}]}
             value={node.config?.target || 'queue_general'}
             onChange={(e) => onChange({ target: e.target.value })}
           />
        )}

        <Input 
          label="转接前播报 (TTS)"
          placeholder="正在为您转接..."
          value={node.config?.playBeforeTransfer || ''}
          onChange={(e) => onChange({ playBeforeTransfer: e.target.value })}
        />
      </>
    );
  }

  return null;
};

export default DataConfig;
