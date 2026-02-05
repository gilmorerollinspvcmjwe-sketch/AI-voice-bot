
import React, { useState } from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  Phone, 
  FileText,
  ChevronDown,
  ChevronRight,
  Bell,
  Workflow,
  Database,
  Mic,
  ShoppingBag,
  History,
  Clock,
  ShieldAlert,
  BookOpen,
  Disc,
  Link2,
  Server,
  MessageCircleQuestion,
  Lightbulb,
  BookA,
  Headset,
  Box,
  Music,
  MapPin,
  Route,
  PhoneForwarded,
  Contact,
  ClipboardList,
  MessageSquare,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  activeSubItem: string; 
  onNavigate: (item: string) => void;
}

interface MenuItem {
  type?: string;
  label: string;
  id?: string;
  icon?: any;
  subItems?: { label: string; id: string; icon?: any }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSubItem, onNavigate }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>('外呼任务');

  const menuItems: MenuItem[] = [
    { type: 'header', label: '核心业务' },
    { icon: Headset, label: '智呼坐席管理', id: '智呼坐席管理' },
    { icon: Bot, label: '机器人配置', id: '机器人配置' },
    { 
      icon: PhoneForwarded, 
      label: '外呼任务', 
      id: '外呼任务',
      subItems: [
        { label: '外呼任务', id: '外呼任务列表', icon: ClipboardList },
        { label: '外呼模版', id: '外呼模版', icon: FileText },
        { label: '外呼联系单', id: '外呼联系单', icon: Contact }
      ]
    },
    { icon: History, label: '通话记录', id: '通话记录' },
    { icon: BarChart3, label: '监控报表', id: '监控报表' },
    { icon: MessageSquare, label: '短信管理', id: '短信管理' },
    { icon: Workflow, label: '流程编排', id: '流程编排' },
    { icon: Database, label: '信息提取配置', id: '信息提取配置' },
    
    { type: 'header', label: '资源市场' },
    { icon: Box, label: '机器人模版', id: '机器人模版' },
    { icon: Music, label: '音色市场', id: '音色市场' },

    { type: 'header', label: '知识与语料' },
    { icon: BookA, label: '词库管理', id: '词库管理' },
    { icon: MessageCircleQuestion, label: '问答对管理', id: '问答对管理' },
    { icon: Lightbulb, label: '知识发现', id: '知识发现' },
    
    { type: 'header', label: '基础设施' },
    { icon: Link2, label: '集成中心', id: '集成中心' },
    { icon: Server, label: '通信网关', id: '通信网关' },
    { 
      icon: Settings, 
      label: '系统设置', 
      id: '系统设置',
      subItems: [
        { label: '号码管理', id: '号码管理' },
        { label: 'IVR管理', id: 'IVR管理' },
        { label: '地理组合', id: '地理组合' },
        { label: '工作时间', id: '工作时间' },
        { label: '文件管理', id: '文件管理', icon: FolderOpen },
        { label: '参数设置', id: '参数设置' },
      ]
    },
  ];

  const toggleExpand = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <div className="w-64 bg-sidebar text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-white tracking-wider flex-shrink-0">
        AI VOICEDESK
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="px-6 py-2 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {item.label}
              </div>
            );
          }

          const isActive = activeSubItem === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeSubItem));
          const isExpanded = expandedMenu === item.label;

          return (
            <div key={idx} className="mb-1">
              <div 
                onClick={() => item.subItems ? toggleExpand(item.label) : onNavigate(item.id!)}
                className={`flex items-center px-6 py-2.5 cursor-pointer hover:bg-slate-800 transition-colors ${isActive && !item.subItems ? 'text-white bg-slate-800/50 border-r-2 border-primary' : ''}`}
              >
                {item.icon && <item.icon size={18} className={`mr-3 ${isActive ? 'text-primary' : 'text-slate-400'}`} />}
                <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                {item.subItems && (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </div>
              
              {/* Sub Menu */}
              {item.subItems && isExpanded && (
                <div className="bg-slate-900/50 pb-2 pt-1">
                  {item.subItems.map((sub, sIdx) => (
                    <div 
                      key={sIdx} 
                      onClick={() => onNavigate(sub.id)}
                      className={`pl-14 pr-6 py-2 text-xs cursor-pointer hover:text-white transition-colors flex items-center ${sub.id === activeSubItem ? 'text-primary font-medium' : 'text-slate-400'}`}
                    >
                      {sub.icon && <sub.icon size={12} className="mr-2 opacity-70" />}
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Header: React.FC<{ title?: string }> = ({ title = "机器人配置" }) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 flex-shrink-0">
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <span className="cursor-pointer hover:text-primary">控制台</span>
        <span>/</span>
        <span className="text-slate-800 font-medium">{title}</span>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-slate-500 hover:text-slate-700" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </div>
        <div className="flex items-center cursor-pointer">
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs mr-2">
            AD
          </div>
          <span className="text-sm text-slate-700 font-medium">Admin User</span>
        </div>
      </div>
    </div>
  );
};
