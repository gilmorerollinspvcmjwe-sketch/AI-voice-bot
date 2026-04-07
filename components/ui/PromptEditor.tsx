import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Wrench, Code, Variable } from 'lucide-react';
import { AgentTool, FlowFunction } from '../../../types';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variables?: { name: string; description?: string }[];
  availableTools?: AgentTool[];
  availableFunctions?: FlowFunction[];
  height?: string;
}

interface ItemData {
  type: 'variable' | 'tool' | 'codeblock';
  id: string;
  name: string;
  displayText: string;
  desc: string;
}

const CHIP_CLASS: Record<string, string> = {
  variable: 'inline-flex items-center gap-1 px-1.5 py-0 rounded text-[11px] font-mono border bg-emerald-100 text-emerald-700 border-emerald-200',
  tool: 'inline-flex items-center gap-1 px-1.5 py-0 rounded text-[11px] font-mono border bg-primary/10 text-primary border-primary/20',
  codeblock: 'inline-flex items-center gap-1 px-1.5 py-0 rounded text-[11px] font-mono border bg-blue-500/10 text-blue-600 border-blue-200',
};

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function PromptEditor({
  value,
  onChange,
  placeholder = '设定此节点的具体人设和行为规范...',
  variables = [],
  availableTools = [],
  availableFunctions = [],
  height = 'h-40'
}: PromptEditorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const valueFromExternalRef = useRef(value);
  const skipNextInputRef = useRef(false);

  const allItems: ItemData[] = [
    ...variables.map(v => ({ type: 'variable' as const, id: v.name, name: v.name, displayText: `{{${v.name}}}`, desc: v.description || '' })),
    ...availableTools.map(t => ({ type: 'tool' as const, id: t.id, name: t.name, displayText: `/${t.name}`, desc: t.description || '' })),
    ...availableFunctions.map(f => ({ type: 'codeblock' as const, id: f.id, name: f.name, displayText: `/${f.name}`, desc: f.description || '' }))
  ];

  const filteredItems = searchQuery
    ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems;

  const buildHtml = useCallback((text: string): string => {
    if (!text) return '';
    const parts: { type: 'text' | 'chip'; itemType?: string; itemName?: string; content: string }[] = [];
    let remaining = text;

    const patterns = [
      { type: 'variable' as const, regex: /\{\{(\w+)\}\}/ },
      { type: 'tool' as const, regex: /\/([a-zA-Z_]\w*)/ },
      { type: 'codeblock' as const, regex: /\/([a-zA-Z_]\w*)/ },
    ];

    while (remaining.length > 0) {
      let earliestIdx = Infinity;
      let earliestMatch: { type: string; match: RegExpExecArray; end: number } | null = null;

      for (const p of patterns) {
        p.regex.lastIndex = 0;
        const m = p.regex.exec(remaining);
        if (m && m.index < earliestIdx) {
          if (p.type === 'tool' && !availableTools.find(t => t.name === m[1])) continue;
          if (p.type === 'codeblock') {
            if (!availableFunctions.find(f => f.name === m[1])) continue;
            if (availableTools.find(t => t.name === m[1])) continue;
          }
          earliestIdx = m.index;
          earliestMatch = { type: p.type, match: m, end: m.index + m[0].length };
        }
      }

      if (earliestMatch) {
        if (earliestIdx > 0) {
          parts.push({ type: 'text', content: remaining.substring(0, earliestIdx) });
        }
        parts.push({
          type: 'chip',
          itemType: earliestMatch.type,
          itemName: earliestMatch.match[1],
          content: earliestMatch.match[0],
        });
        remaining = remaining.substring(earliestMatch.end);
      } else {
        parts.push({ type: 'text', content: remaining });
        break;
      }
    }

    return parts.map(p => {
      if (p.type === 'text') return escapeHtml(p.content).replace(/\n/g, '<br>');
      const iconMap: Record<string, string> = {
        variable: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`,
        tool: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
        codeblock: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      };
      return `<span contenteditable="false" class="${CHIP_CLASS[p.itemType!]}" data-ref="${escapeHtml(p.content)}">${iconMap[p.itemType!]}${escapeHtml(p.itemName!)}<span class="ml-px cursor-pointer opacity-60 hover:opacity-100 hover:text-red-500" data-remove="true"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></span>`;
    }).join('');
  }, [availableTools, availableFunctions]);

  const saveCursorPos = useCallback((): Range | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0).cloneRange();
  }, []);

  const restoreCursorPos = useCallback((savedRange: Range) => {
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }, []);

  useEffect(() => {
    if (value === valueFromExternalRef.current) return;
    valueFromExternalRef.current = value;

    const el = editorRef.current;
    if (!el) return;

    const savedRange = saveCursorPos();
    el.innerHTML = buildHtml(value) || `<span class="text-slate-400 pointer-events-none">${escapeHtml(placeholder)}</span>`;
    if (savedRange) {
      try { restoreCursorPos(savedRange); } catch {}
    }
  }, [value, buildHtml, placeholder, saveCursorPos, restoreCursorPos]);

  const extractPlainText = (el: HTMLElement): string => {
    let text = '';
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    let node: Node | null;
    while ((node = walk.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as HTMLElement;
        if (elem.tagName === 'BR') text += '\n';
        else if (elem.dataset.ref) text += elem.dataset.ref;
      }
    }
    return text;
  };

  const getCursorPixelPosition = (): { top: number; left: number } | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(false);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    if (!editorRect) return null;
    return {
      top: rect.bottom - editorRect.top + (editorRef.current?.scrollTop || 0),
      left: rect.left - editorRect.left + (editorRef.current?.scrollLeft || 0),
    };
  };

  const handleInput = () => {
    if (skipNextInputRef.current) {
      skipNextInputRef.current = false;
      return;
    }

    const el = editorRef.current;
    if (!el) return;
    const plainText = extractPlainText(el);

    valueFromExternalRef.current = plainText;
    onChange(plainText);

    if (showDropdown) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const beforeCursor = extractPlainTextUpTo(el, range.startContainer, range.startOffset);
        const lastSlashIdx = beforeCursor.lastIndexOf('/');
        if (lastSlashIdx !== -1) {
          const query = beforeCursor.substring(lastSlashIdx + 1);
          if (query.includes(' ') || query.includes('\n')) {
            setShowDropdown(false);
          } else {
            setSearchQuery(query);
            setSelectedIndex(0);
            const pos = getCursorPixelPosition();
            if (pos) setDropdownPos(pos);
          }
        } else {
          setShowDropdown(false);
        }
      }
    }
  };

  function extractPlainTextUpTo(root: Node, container: Node, offset: number): string {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (node === container) return NodeFilter.FILTER_ACCEPT;
        if (root.contains(node)) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_REJECT;
      }
    });
    let result = '';
    let node: Node | null;
    let reached = false;
    while ((node = walker.nextNode())) {
      if (node === container) {
        reached = true;
        if (node.nodeType === Node.TEXT_NODE) {
          result += (node.textContent || '').substring(0, offset);
        } else {
          const childNodes = (node as Element).childNodes;
          let count = 0;
          for (const cn of childNodes) {
            if (cn.nodeType === Node.ELEMENT_NODE && (cn as Element).dataset.ref) {
              result += (cn as Element).dataset.ref || '';
              count++;
            } else if (cn.nodeType === Node.TEXT_NODE) {
              result += cn.textContent || '';
              count++;
            }
            if (count >= offset) break;
          }
        }
        break;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.dataset.ref) result += el.dataset.ref;
        else if (el.tagName === 'BR') result += '\n';
      }
    }
    if (!reached && container === root) {
      const children = (root as Element).childNodes;
      let count = 0;
      for (const cn of children) {
        if (cn.nodeType === Node.ELEMENT_NODE && (cn as Element).dataset.ref) {
          result += (cn as Element).dataset.ref || '';
          count++;
        } else if (cn.nodeType === Node.TEXT_NODE) {
          result += cn.textContent || '';
          count++;
        } else if (cn.nodeType === Node.ELEMENT_NODE && (cn as Element).tagName === 'BR') {
          result += '\n';
          count++;
        }
        if (count >= offset) break;
      }
    }
    return result;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '/' && !showDropdown) {
      e.preventDefault();
      const pos = getCursorPixelPosition();
      if (pos) setDropdownPos(pos);
      setShowDropdown(true);
      setSearchQuery('');
      setSelectedIndex(0);
      insertCharAtCursor('/');
      return;
    }

    if (showDropdown) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        setSearchQuery('');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) insertItem(filteredItems[selectedIndex]);
      } else if (e.key === 'Backspace' && searchQuery.length === 0) {
        setShowDropdown(false);
      }
    }
  };

  function insertCharAtCursor(char: string) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(char);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    skipNextInputRef.current = true;
  }

  const insertItem = (item: ItemData) => {
    const el = editorRef.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const beforeCursor = extractPlainTextUpTo(el, range.startContainer, range.startOffset);
    const afterCursor = value.substring(beforeCursor.length + 1);
    const lastSlashIdx = beforeCursor.lastIndexOf('/');
    const beforeSlash = beforeCursor.substring(0, lastSlashIdx);

    const newValue = beforeSlash + item.displayText + ' ' + afterCursor;
    valueFromExternalRef.current = newValue;
    onChange(newValue);
    setShowDropdown(false);
    setSearchQuery('');

    skipNextInputRef.current = true;

    setTimeout(() => {
      const newEl = editorRef.current;
      if (!newEl) return;
      newEl.innerHTML = buildHtml(newValue);
      const newPos = beforeSlash.length + item.displayText.length + 1;

      const restoreCursor = (node: Node, targetPos: number): boolean => {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let currentPos = 0;
        let n: Node | null;
        while ((n = walker.nextNode())) {
          if (n.nodeType === Node.TEXT_NODE) {
            const len = n.textContent?.length || 0;
            if (currentPos + len >= targetPos) {
              const r = document.createRange();
              r.setStart(n, targetPos - currentPos);
              r.collapse(true);
              const s = window.getSelection();
              if (s) { s.removeAllRanges(); s.addRange(r); }
              return true;
            }
            currentPos += len;
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            const en = n as HTMLElement;
            if (en.dataset.ref) {
              const refLen = en.dataset.ref.length;
              if (currentPos + refLen >= targetPos) {
                const r = document.createRange();
                r.setStartAfter(en);
                r.collapse(true);
                const s = window.getSelection();
                if (s) { s.removeAllRanges(); s.addRange(r); }
                return true;
              }
              currentPos += refLen;
            }
          }
        }
        const r = document.createRange();
        r.selectNodeContents(node);
        r.collapse(false);
        const s = window.getSelection();
        if (s) { s.removeAllRanges(); s.addRange(r); }
        return true;
      };

      restoreCursor(newEl, newPos);
      newEl.focus();
    }, 0);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-remove]')) {
      e.preventDefault();
      e.stopPropagation();
      const chipSpan = target.closest('[data-ref]') as HTMLElement;
      if (chipSpan && chipSpan.dataset.ref) {
        const refText = chipSpan.dataset.ref;
        const idx = value.indexOf(refText);
        if (idx !== -1) {
          const newValue = value.substring(0, idx) + value.substring(idx + refText.length);
          valueFromExternalRef.current = newValue;
          onChange(newValue);
        }
      }
      return;
    }
  };

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editorRef.current && !editorRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (showDropdown && selectedIndex < filteredItems.length) {
      const el = dropdownRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, showDropdown, filteredItems.length]);

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        className={`w-full ${height} px-3 py-2 text-xs border border-gray-200 rounded resize-none focus:border-primary outline-none leading-relaxed font-mono overflow-auto whitespace-pre-wrap break-words`}
        spellCheck={false}
        suppressContentEditableWarning
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-slate-200 py-2 max-h-64 overflow-y-auto"
          style={{ top: dropdownPos.top + 4, left: dropdownPos.left, minWidth: '280px' }}
        >
          <div className="px-3 pb-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">无匹配项</div>
          ) : (
            <>
              {filteredItems.filter(i => i.type === 'variable').length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Variable size={10} /> 变量
                  </div>
                  {filteredItems.filter(i => i.type === 'variable').map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => insertItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 ${globalIdx === selectedIndex ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                      >
                        <span className="font-mono text-emerald-600 font-medium">{item.displayText}</span>
                        {item.desc && <span className="text-slate-400 truncate ml-1">{item.desc}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredItems.filter(i => i.type === 'tool').length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Wrench size={10} /> 工具
                  </div>
                  {filteredItems.filter(i => i.type === 'tool').map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => insertItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 ${globalIdx === selectedIndex ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                      >
                        <span className="font-mono text-primary font-medium">{item.displayText}</span>
                        {item.desc && <span className="text-slate-400 truncate ml-1">{item.desc}</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredItems.filter(i => i.type === 'codeblock').length > 0 && (
                <div className="pt-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Code size={10} /> 代码块
                  </div>
                  {filteredItems.filter(i => i.type === 'codeblock').map((item) => {
                    const globalIdx = filteredItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-index={globalIdx}
                        onClick={() => insertItem(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full px-3 py-2 text-xs text-left flex items-center gap-2 ${globalIdx === selectedIndex ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                      >
                        <span className="font-mono text-blue-600 font-medium">{item.displayText}</span>
                        {item.desc && <span className="text-slate-400 truncate ml-1">{item.desc}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
