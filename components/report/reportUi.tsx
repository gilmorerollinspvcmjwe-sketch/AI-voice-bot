// 报表页面共享展示工具，服务监控报表各个子模块。
import React from 'react';
import { AlertEvent } from '../../types';

export const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
};

export const formatRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;
export const formatTime = (time: number) => new Date(time).toLocaleString();

export const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  desc?: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  icon?: React.ReactNode;
}> = ({ title, value, desc, tone = 'blue', icon }) => {
  const toneMap = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };

  return (
    <div className={cx('rounded-xl border p-4 shadow-sm', toneMap[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
        </div>
        {icon && <div className="rounded-lg bg-white/70 p-2">{icon}</div>}
      </div>
    </div>
  );
};

export const StatusBadge: React.FC<{ children: React.ReactNode; tone?: 'green' | 'red' | 'amber' | 'blue' | 'slate' }> = ({ children, tone = 'slate' }) => {
  const toneMap = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  return <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', toneMap[tone])}>{children}</span>;
};

export const getRealtimeStatus = (status: string) => {
  const map: Record<string, { label: string; tone: 'green' | 'red' | 'amber' | 'blue' | 'slate' }> = {
    in_call: { label: '通话中', tone: 'green' },
    queueing: { label: '排队中', tone: 'amber' },
    transferring: { label: '转人工中', tone: 'blue' },
    error: { label: '异常', tone: 'red' },
  };
  return map[status] || { label: status, tone: 'slate' };
};

export const getAlertTone = (level: AlertEvent['level']) => {
  if (level === 'high') return { label: '高', tone: 'red' as const };
  if (level === 'medium') return { label: '中', tone: 'amber' as const };
  return { label: '低', tone: 'blue' as const };
};
