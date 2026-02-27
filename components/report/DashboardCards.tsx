import React from 'react';
import { Phone, PhoneCall, Clock, Star, Headphones, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { ReportMetrics } from '../../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, change, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
  };

  const isPositive = change >= 0;

  return (
    <div 
      className={`p-5 rounded-xl border ${colorClasses[color]} cursor-pointer transition-all hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
          </div>
          <div className="flex items-center mt-2">
            {isPositive ? (
              <TrendingUp size={14} className="text-green-500 mr-1" />
            ) : (
              <TrendingDown size={14} className="text-red-500 mr-1" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">环比</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface DashboardCardsProps {
  current: ReportMetrics;
  previous: ReportMetrics;
  onCardClick?: (metricType: string) => void;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ current, previous, onCardClick }) => {
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cards = [
    {
      title: '通话总量',
      value: current.totalCalls,
      change: calculateChange(current.totalCalls, previous.totalCalls),
      icon: <Phone size={24} />,
      color: 'blue' as const,
      metricType: 'totalCalls',
    },
    {
      title: '接通率',
      value: `${(current.connectionRate * 100).toFixed(1)}`,
      unit: '%',
      change: calculateChange(current.connectionRate, previous.connectionRate),
      icon: <PhoneCall size={24} />,
      color: 'green' as const,
      metricType: 'connectionRate',
    },
    {
      title: '平均通话时长',
      value: formatDuration(current.avgDuration),
      change: calculateChange(current.avgDuration, previous.avgDuration),
      icon: <Clock size={24} />,
      color: 'orange' as const,
      metricType: 'avgDuration',
    },
    {
      title: '平均满意度',
      value: current.avgSatisfaction.toFixed(1),
      unit: '分',
      change: calculateChange(current.avgSatisfaction, previous.avgSatisfaction),
      icon: <Star size={24} />,
      color: 'purple' as const,
      metricType: 'satisfaction',
    },
    {
      title: '转人工率',
      value: `${(current.transferRate * 100).toFixed(1)}`,
      unit: '%',
      change: calculateChange(current.transferRate, previous.transferRate),
      icon: <Headphones size={24} />,
      color: 'red' as const,
      metricType: 'transferRate',
    },
    {
      title: '机器人解决率',
      value: `${(current.resolutionRate * 100).toFixed(1)}`,
      unit: '%',
      change: calculateChange(current.resolutionRate, previous.resolutionRate),
      icon: <CheckCircle size={24} />,
      color: 'green' as const,
      metricType: 'resolutionRate',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <MetricCard
          key={card.metricType}
          title={card.title}
          value={card.value}
          unit={card.unit}
          change={card.change}
          icon={card.icon}
          color={card.color}
          onClick={() => onCardClick?.(card.metricType)}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
