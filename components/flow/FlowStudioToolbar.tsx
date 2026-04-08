import React from 'react';
import { Bug, RotateCcw, Workflow, X, ZoomIn, ZoomOut } from 'lucide-react';

type DrawerMode = 'flow' | 'node' | 'edge' | 'debug' | null;

interface FlowStudioToolbarProps {
  drawerMode: DrawerMode;
  zoom: number;
  onCloseDrawer: () => void;
  onOpenDebug: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function FlowStudioToolbar({
  drawerMode,
  zoom,
  onCloseDrawer,
  onOpenDebug,
  onZoomIn,
  onZoomOut,
  onResetView,
}: FlowStudioToolbarProps) {
  const drawerLabel =
    drawerMode === 'flow'
      ? '流程设置'
      : drawerMode === 'node'
        ? '节点配置'
        : drawerMode === 'edge'
          ? '边条件配置'
          : null;

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-primary">
            <Workflow size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Flow Studio</div>
            <div className="text-xs text-slate-400">配置流程节点、提示词、工具引用、边条件，并运行可视化调试场景。</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {drawerLabel ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              当前面板：{drawerLabel}
            </div>
          ) : null}

          <div className="flex items-center rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={onZoomOut}
              className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
              title="缩小"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-14 text-center text-xs font-mono text-slate-600">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={onZoomIn}
              className="rounded p-1.5 text-slate-600 transition-colors hover:bg-white"
              title="放大"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={onResetView}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-1">
              <RotateCcw size={14} />
              重置视图
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenDebug}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="inline-flex items-center gap-1">
              <Bug size={14} />
              场景调试
            </span>
          </button>

          {drawerMode ? (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="inline-flex items-center gap-1">
                <X size={14} />
                关闭面板
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
