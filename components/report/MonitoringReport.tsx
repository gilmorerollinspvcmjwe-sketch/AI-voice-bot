import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Bot,
  Calendar,
  Download,
  TrendingUp,
  Clock,
  Target,
  Phone,
  ChevronDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { TimeRange } from '../../types';
import { getReportData, MOCK_BOTS } from './mockData';
import DashboardCards from './DashboardCards';
import TrendChart, { HourlyHeatmap } from './TrendChart';
import IntentAccuracyChart from './IntentAccuracyChart';
import CallDurationDistribution from './CallDurationDistribution';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'this_week', label: '本周' },
  { value: 'last_week', label: '上周' },
  { value: 'this_month', label: '本月' },
  { value: 'last_month', label: '上月' },
];

const TAB_OPTIONS = [
  { id: 'overview', label: '总览', icon: BarChart3 },
  { id: 'trends', label: '趋势分析', icon: TrendingUp },
  { id: 'intents', label: '主题分析', icon: Target },
  { id: 'duration', label: '通话质量', icon: Clock },
];

const MonitoringReport: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [showBotDropdown, setShowBotDropdown] = useState(false);
  
  const reportData = useMemo(() => getReportData(timeRange), [timeRange]);

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setIsLoading(true);
    setTimeRange(newRange);
    setTimeout(() => setIsLoading(false), 300);
  };
  
  const handleCustomDateChange = () => {
    setIsLoading(true);
    setTimeRange('custom');
    setTimeout(() => setIsLoading(false), 300);
  };
  
  const handleBotToggle = (botId: string) => {
    setSelectedBots(prev => {
      if (prev.includes(botId)) {
        return prev.filter(id => id !== botId);
      } else {
        return [...prev, botId];
      }
    });
  };
  
  const handleSelectAllBots = () => {
    if (selectedBots.length === MOCK_BOTS.length) {
      setSelectedBots([]);
    } else {
      setSelectedBots(MOCK_BOTS.map(bot => bot.id));
    }
  };

  const handleExport = () => {
    alert('导出功能开发中...');
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardCards
              current={reportData.metrics.current}
              previous={reportData.metrics.previous}
              onCardClick={(metricType) => console.log('Clicked:', metricType)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Phone size={18} className="text-blue-500" />
                    通话趋势
                  </h3>
                </div>
                <TrendChart data={reportData.trendData} type="calls" height={250} />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Clock size={18} className="text-orange-500" />
                    时段分布热力图
                  </h3>
                </div>
                <HourlyHeatmap data={reportData.hourlyDistribution} height={250} />
              </div>
            </div>

          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-800 mb-4">通话量趋势</h3>
                <TrendChart data={reportData.trendData} type="calls" height={300} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-800 mb-4">满意度趋势</h3>
                <TrendChart data={reportData.trendData} type="satisfaction" height={300} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-base font-bold text-slate-800 mb-4">平均通话时长趋势</h3>
              <TrendChart data={reportData.trendData} type="duration" height={300} />
            </div>
          </div>
        );

      case 'intents':
        return (
          <div className="space-y-6">
            <IntentAccuracyChart
              data={reportData.intentAnalysis}
              unmatchedIntents={reportData.unmatchedIntents}
            />
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-6">
            <CallDurationDistribution
              durationData={reportData.durationDistribution}
              hangupReasonData={reportData.hangupReasonDistribution}
              avgWaitTime={reportData.metrics.current.avgDuration * 0.1}
              avgHandleTime={reportData.metrics.current.avgDuration}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">监控报表</h1>
            <p className="text-sm text-slate-500 mt-1">
              实时监控机器人运行状态和关键业务指标
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <Calendar size={16} className="text-slate-400 ml-2" />
              {TIME_RANGE_OPTIONS.filter(option => option.value !== 'custom').map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeRangeChange(option.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    timeRange === option.value
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setTimeRange('custom')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === 'custom'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                自定义
              </button>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
                <CalendarIcon size={16} className="text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm border-none focus:ring-0"
                />
                <span className="text-slate-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm border-none focus:ring-0"
                />
                <button
                  onClick={handleCustomDateChange}
                  className="px-3 py-1 bg-primary text-white text-sm rounded-md"
                >
                  应用
                </button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowBotDropdown(!showBotDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Bot size={16} />
                机器人
                <ChevronDown size={14} className={`transition-transform ${showBotDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showBotDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <button
                      onClick={handleSelectAllBots}
                      className="flex items-center w-full text-left text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBots.length === MOCK_BOTS.length}
                        onChange={handleSelectAllBots}
                        className="mr-2"
                      />
                      全选
                    </button>
                  </div>
                  {MOCK_BOTS.map((bot) => (
                    <div key={bot.id} className="px-4 py-2 hover:bg-slate-50">
                      <button
                        onClick={() => handleBotToggle(bot.id)}
                        className="flex items-center w-full text-left text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBots.includes(bot.id)}
                          onChange={() => handleBotToggle(bot.id)}
                          className="mr-2"
                        />
                        {bot.name}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              导出
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl">
          {TAB_OPTIONS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-in fade-in duration-300">{renderTabContent()}</div>
    </div>
  );
};

export default MonitoringReport;