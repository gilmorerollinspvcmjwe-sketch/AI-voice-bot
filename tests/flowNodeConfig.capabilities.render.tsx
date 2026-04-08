import React from 'react';
import { renderToString } from 'react-dom/server';
import FlowNodeConfig from '../components/flow/FlowNodeConfig';
import { FlowNode, FlowNodeType } from '../types';

const sampleNode: FlowNode = {
  id: 'step_verify',
  type: FlowNodeType.DEFAULT,
  position: { x: 220, y: 180 },
  data: {
    name: 'Verification Step',
    description: 'Collect verification code and retry when needed.',
    stepType: 'collect',
    stepPrompt: {
      prompt: 'Collect the verification code.',
      visibleFunctionIds: [],
      transitionFunctionIds: [],
    },
    entityConfig: {
      enabled: true,
      entityName: 'verification_code',
      entityType: 'alphanumeric',
      prompt: 'Please say your verification code.',
      asrBiasing: 'alphanumeric',
      required: true,
    },
    retryConfig: {
      enabled: true,
      maxAttempts: 3,
      noInputPrompt: 'Please repeat the code.',
      noMatchPrompt: 'That did not sound like a valid code.',
      fallbackTargetId: 'handoff_exit',
    },
    gotoFlowId: 'lookup',
  },
};

const html = renderToString(<FlowNodeConfig node={sampleNode} />);

for (const text of ['Entity Collection', 'Retry Strategy', 'Flow Navigation', 'DTMF']) {
  if (!html.includes(text)) {
    throw new Error(`Expected FlowNodeConfig to render section: ${text}`);
  }
}

console.log('capabilities render ok');
