import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  PieChart,
  Clock,
  Bot,
  Target,
  Phone,
} from 'lucide-react';
import { TimeRange, ReportMetrics } from '../../types';
import { getReportData } from './mockData';
import DashboardCards from './DashboardCards';
import TrendChart, { HourlyHeatmap } from './TrendChart';
import BotPerformanceTable from './BotPerformanceTable';
import IntentAccuracyChart from './IntentAccuracyChart';
import SatisfactionAnalysis from './SatisfactionAnalysis';
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
  { id: 'bots', label: '机器人性能', icon: Bot },
  { id: 'intents', label: '意图分析', icon: Target },
  { id: 'satisfaction', label: '满意度', icon: PieChart },
  { id: 'duration', label: '通话质量', icon: Clock },
];

const MonitoringReport: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('this_month');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Get report data based on time range
  const reportData = useMemo(() => getReportData(timeRange), [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setIsLoading(true);
    setTimeRange(newRange);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  };

  // Export data handler
  const handleExport = () => {
    alert('导出功能开发中...');
  };

  // Render tab content
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
            {/* Dashboard Cards */}
            <DashboardCards
              current={reportData.metrics.current}
              previous={reportData.metrics.previous}
              onCardClick={(metricType) => console.log('Clicked:', metricType)}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Trend */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Phone size={18} className="text-blue-500" />
                    通话趋势
                  </h3>
                </div>
                <TrendChart data={reportData.trendData} type="calls" height={250} />
              </div>

              {/* Hourly Distribution */}
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

            {/* Bot Performance Preview */}
            <BotPerformanceTable data={reportData.botPerformance} />
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

      case 'bots':
        return (
          <div className="space-y-6">
            <BotPerformanceTable data={reportData.botPerformance} />
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

      case 'satisfaction':
        return (
          <div className="space-y-6">
            <SatisfactionAnalysis
              distribution={reportData.satisfactionDistribution}
              avgSatisfaction={reportData.metrics.current.avgSatisfaction}
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">监控报表</h1>
            <p className="text-sm text-slate-500 mt-1">
              实时监控机器人运行状态和关键业务指标
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
              <Calendar size={16} className="text-slate-400 ml-2" />
              {TIME_RANGE_OPTIONS.map((option) => (
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
            </div>

            {/* Export Button */}
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

      {/* Tabs */}
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

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">{renderTabContent()}</div>
    </div>
  );
};

export default MonitoringReport;
