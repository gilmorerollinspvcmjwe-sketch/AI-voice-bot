import React from 'react';
import { HelpCircle, Plus, X } from 'lucide-react';

interface LabelProps {
  label: string;
  required?: boolean;
  tooltip?: string;
}

export const Label: React.FC<LabelProps> = ({ label, required, tooltip }) => (
  <div className="flex items-center mb-2">
    {required && <span className="text-red-500 mr-1">*</span>}
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {tooltip && (
      <div className="group relative ml-2">
        <HelpCircle size={14} className="text-slate-400 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          {tooltip}
        </div>
      </div>
    )}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean; tooltip?: string; suffix?: string }> = ({ label, required, tooltip, suffix, className, ...props }) => (
  <div className="mb-5">
    {label && <Label label={label} required={required} tooltip={tooltip} />}
    <div className="relative">
      <input
        className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-500 ${className}`}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">{suffix}</span>
      )}
    </div>
  </div>
);

// Added tooltip to Select props to fix App.tsx error
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; required?: boolean; tooltip?: string; options: string[] | { label: string; value: string }[] }> = ({ label, required, tooltip, options, className, ...props }) => (
  <div className="mb-5">
    {label && <Label label={label} required={required} tooltip={tooltip} />}
    <div className="relative">
      <select
        className={`w-full px-3 py-2 text-sm border border-gray-300 rounded appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${className}`}
        {...props}
      >
        {options.map((opt, idx) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const text = typeof opt === 'string' ? opt : opt.label;
          return <option key={idx} value={value}>{text}</option>;
        })}
      </select>
      <div className="absolute right-3 top-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

export const Slider: React.FC<{ label: string; value: number; onChange: (val: number) => void; min: number; max: number; step?: number; tooltip?: string }> = ({ label, value, onChange, min, max, step = 1, tooltip }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-2">
      <Label label={label} tooltip={tooltip} />
      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
    />
    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

export const Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; tooltip?: string }> = ({ label, checked, onChange, tooltip }) => (
  <div className="mb-5 flex items-center justify-between">
    <Label label={label} tooltip={tooltip} />
    <div 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </div>
);

export const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-6 pb-2 border-b border-gray-100">
    <h3 className="text-base font-bold text-slate-800">{title}</h3>
  </div>
);

// Added disabled prop to TagInput to fix App.tsx error and implemented disabled state
export const TagInput: React.FC<{ label: string; tags: string[]; onChange: (tags: string[]) => void; placeholder?: string; disabled?: boolean }> = ({ label, tags, onChange, placeholder, disabled }) => {
  const [input, setInput] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={`mb-5 ${disabled ? 'opacity-60' : ''}`}>
      <Label label={label} />
      <div className={`flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px] transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
        {tags.map((tag, idx) => (
          <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center">
            {tag}
            {!disabled && <X size={12} className="ml-1 cursor-pointer hover:text-blue-900" onClick={() => removeTag(tag)} />}
          </span>
        ))}
        <input
          type="text"
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent disabled:cursor-not-allowed"
          placeholder={tags.length === 0 ? (placeholder || "Type and press Enter") : ""}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>
    </div>
  );
};