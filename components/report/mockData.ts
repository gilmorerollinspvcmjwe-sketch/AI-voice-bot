import { 
  ReportMetrics, 
  TrendData, 
  BotPerformance, 
  IntentAnalysis, 
  HourlyDistribution,
  DurationDistribution,
  HangupReasonDistribution,
  UnmatchedIntent,
  CallRecordDetail,
  TimeRange
} from '../../types';

// Bot configurations for mock data
const MOCK_BOTS = [
  { id: 'bot_1', name: '滴滴出行智能客服' },
  { id: 'bot_2', name: '电商售后机器人' },
  { id: 'bot_3', name: '银行信用卡服务' },
  { id: 'bot_4', name: '保险理赔助手' },
  { id: 'bot_5', name: '餐饮预订机器人' },
];

// Intent configurations for mock data
const MOCK_INTENTS = [
  { id: 'intent_1', name: '🚨 高危安全拦截' },
  { id: 'intent_2', name: '👜 物品遗失查找' },
  { id: 'intent_3', name: '💰 费用异议/绕路' },
  { id: 'intent_4', name: '🧾 发票与报销' },
  { id: 'intent_5', name: '😤 投诉与建议' },
  { id: 'intent_6', name: '📦 订单查询' },
  { id: 'intent_7', name: '💳 账单查询' },
  { id: 'intent_8', name: '🔄 退换货申请' },
  { id: 'intent_9', name: '📅 预约改期' },
  { id: 'intent_10', name: '❓ 常见问题' },
];

// Generate dates for the last 30 days
export function generateDates(days: number = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Generate random number with some realistic variation
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

// Generate trend data for the last 30 days
export function generateTrendData(days: number = 30): TrendData[] {
  const dates = generateDates(days);
  return dates.map((date, index) => {
    // Simulate weekday vs weekend patterns
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCalls = isWeekend ? 80 : 150;
    const variation = randomInt(-30, 30);
    
    const totalCalls = Math.max(50, baseCalls + variation);
    const connectionRate = randomFloat(0.65, 0.85);
    const connectedCalls = Math.floor(totalCalls * connectionRate);
    
    return {
      date,
      totalCalls,
      connectedCalls,
      avgDuration: randomFloat(120, 300),
      satisfaction: randomFloat(3.5, 4.8),
    };
  });
}

// Generate current metrics with comparison to previous period
export function generateCurrentMetrics(): { current: ReportMetrics; previous: ReportMetrics } {
  const currentTotalCalls = randomInt(800, 1500);
  const currentConnectedCalls = Math.floor(currentTotalCalls * randomFloat(0.65, 0.85));
  
  const previousTotalCalls = randomInt(700, 1400);
  const previousConnectedCalls = Math.floor(previousTotalCalls * randomFloat(0.60, 0.80));
  
  return {
    current: {
      totalCalls: currentTotalCalls,
      connectedCalls: currentConnectedCalls,
      connectionRate: parseFloat((currentConnectedCalls / currentTotalCalls).toFixed(2)),
      avgDuration: randomFloat(120, 300),
      avgSatisfaction: randomFloat(3.5, 4.8),
      transferRate: randomFloat(0.1, 0.25),
      resolutionRate: randomFloat(0.6, 0.85),
    },
    previous: {
      totalCalls: previousTotalCalls,
      connectedCalls: previousConnectedCalls,
      connectionRate: parseFloat((previousConnectedCalls / previousTotalCalls).toFixed(2)),
      avgDuration: randomFloat(110, 290),
      avgSatisfaction: randomFloat(3.3, 4.6),
      transferRate: randomFloat(0.12, 0.28),
      resolutionRate: randomFloat(0.55, 0.80),
    },
  };
}

// Generate bot performance data
export function generateBotPerformance(): BotPerformance[] {
  return MOCK_BOTS.map(bot => {
    const totalCalls = randomInt(100, 500);
    const connectedCalls = Math.floor(totalCalls * randomFloat(0.60, 0.90));
    
    return {
      botId: bot.id,
      botName: bot.name,
      totalCalls,
      connectionRate: parseFloat((connectedCalls / totalCalls).toFixed(2)),
      avgDuration: randomFloat(100, 350),
      satisfaction: randomFloat(3.2, 4.9),
      intentAccuracy: randomFloat(0.75, 0.95),
      transferRate: randomFloat(0.08, 0.30),
    };
  });
}

// Generate intent analysis data
export function generateIntentAnalysis(): IntentAnalysis[] {
  return MOCK_INTENTS.map(intent => ({
    intentId: intent.id,
    intentName: intent.name,
    triggerCount: randomInt(50, 500),
    accuracy: randomFloat(0.70, 0.98),
    avgDuration: randomFloat(60, 240),
  }));
}

// Generate hourly distribution (24 hours)
export function generateHourlyDistribution(): HourlyDistribution[] {
  return Array.from({ length: 24 }, (_, hour) => {
    // Simulate peak hours (9-12, 14-17)
    const isPeakHour = (hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 17);
    const baseCount = isPeakHour ? 80 : 20;
    const variation = randomInt(-15, 15);
    
    return {
      hour,
      callCount: Math.max(5, baseCount + variation),
    };
  });
}

// Generate duration distribution
export function generateDurationDistribution(): DurationDistribution[] {
  const ranges = [
    { range: '0-30秒', min: 0, max: 30 },
    { range: '30-60秒', min: 30, max: 60 },
    { range: '1-3分钟', min: 60, max: 180 },
    { range: '3-5分钟', min: 180, max: 300 },
    { range: '5分钟以上', min: 300, max: 600 },
  ];
  
  const total = 1000;
  const distributions = [
    { count: randomInt(150, 250), percentage: 0 },
    { count: randomInt(200, 300), percentage: 0 },
    { count: randomInt(300, 400), percentage: 0 },
    { count: randomInt(100, 180), percentage: 0 },
    { count: randomInt(50, 100), percentage: 0 },
  ];
  
  return ranges.map((range, index) => ({
    range: range.range,
    count: distributions[index].count,
    percentage: parseFloat(((distributions[index].count / total) * 100).toFixed(1)),
  }));
}

// Generate hangup reason distribution
export function generateHangupReasonDistribution(): HangupReasonDistribution[] {
  const reasons = [
    { reason: '正常结束', weight: 45 },
    { reason: '用户主动挂断', weight: 25 },
    { reason: '转人工', weight: 15 },
    { reason: '超时挂断', weight: 10 },
    { reason: '异常中断', weight: 5 },
  ];
  
  const total = 1000;
  return reasons.map(r => {
    const count = randomInt(
      Math.floor(total * (r.weight - 5) / 100),
      Math.floor(total * (r.weight + 5) / 100)
    );
    return {
      reason: r.reason,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    };
  });
}

// Generate unmatched intents (TOP 10)
export function generateUnmatchedIntents(): UnmatchedIntent[] {
  const unmatchedTexts = [
    '我要投诉你们的服务',
    '这个订单什么时候能到',
    '帮我查一下余额',
    '我要退货怎么操作',
    '你们的人工客服在哪里',
    '这个费用是怎么算的',
    '我想修改我的地址',
    '帮我取消这个订单',
    '你们的营业时间是什么',
    '我要申请退款',
    '这个产品质量有问题',
    '帮我转接经理',
  ];
  
  return unmatchedTexts
    .map(text => ({
      text,
      count: randomInt(5, 50),
      lastTime: Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// Generate satisfaction distribution (1-5 stars)
export function generateSatisfactionDistribution(): { rating: number; count: number; percentage: number }[] {
  const ratings = [1, 2, 3, 4, 5];
  const weights = [5, 10, 20, 35, 30]; // Percentage distribution
  
  const total = 1000;
  return ratings.map((rating, index) => {
    const count = randomInt(
      Math.floor(total * (weights[index] - 3) / 100),
      Math.floor(total * (weights[index] + 3) / 100)
    );
    return {
      rating,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    };
  });
}

// Generate call records for detailed view
export function generateCallRecords(count: number = 50): CallRecordDetail[] {
  const statuses: ('answered' | 'no_answer' | 'busy' | 'failed')[] = ['answered', 'no_answer', 'busy', 'failed'];
  const hangupReasons: ('normal' | 'user_hangup' | 'timeout' | 'transfer' | 'error')[] = ['normal', 'user_hangup', 'timeout', 'transfer', 'error'];
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[randomInt(0, statuses.length - 1)];
    const isAnswered = status === 'answered';
    
    return {
      id: `call_${Date.now()}_${i}`,
      taskId: `task_${randomInt(1, 10)}`,
      phoneNumber: `138${randomInt(10000000, 99999999)}`,
      customerName: `客户${i + 1}`,
      startTime: Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000),
      duration: isAnswered ? randomInt(30, 600) : 0,
      status,
      intentResult: isAnswered ? ['A级意向', 'B级意向', 'C级意向', '拒绝'][randomInt(0, 3)] : '',
      botName: MOCK_BOTS[randomInt(0, MOCK_BOTS.length - 1)].name,
      rounds: isAnswered ? randomInt(1, 15) : 0,
      recordingUrl: isAnswered ? `https://example.com/recordings/call_${i}.mp3` : undefined,
      satisfaction: isAnswered ? randomInt(1, 5) : undefined,
      hangupReason: hangupReasons[randomInt(0, hangupReasons.length - 1)],
      intentMatched: Math.random() > 0.15,
      intentName: isAnswered ? MOCK_INTENTS[randomInt(0, MOCK_INTENTS.length - 1)].name : undefined,
      waitTime: randomInt(1, 10),
      botId: MOCK_BOTS[randomInt(0, MOCK_BOTS.length - 1)].id,
    };
  });
}

// Get data based on time range
export function getReportData(timeRange: TimeRange) {
  let days = 30;
  switch (timeRange) {
    case 'today':
    case 'yesterday':
      days = 1;
      break;
    case 'this_week':
    case 'last_week':
      days = 7;
      break;
    case 'this_month':
    case 'last_month':
      days = 30;
      break;
    default:
      days = 30;
  }
  
  return {
    trendData: generateTrendData(days),
    metrics: generateCurrentMetrics(),
    botPerformance: generateBotPerformance(),
    intentAnalysis: generateIntentAnalysis(),
    hourlyDistribution: generateHourlyDistribution(),
    durationDistribution: generateDurationDistribution(),
    hangupReasonDistribution: generateHangupReasonDistribution(),
    unmatchedIntents: generateUnmatchedIntents(),
    satisfactionDistribution: generateSatisfactionDistribution(),
    callRecords: generateCallRecords(50),
  };
}
