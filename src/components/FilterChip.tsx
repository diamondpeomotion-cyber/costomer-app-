import React from 'react';
import { X } from 'lucide-react';

export interface FilterChipProps {
  label: string;
  category?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  count?: number;
  variant?: 'default' | 'violet' | 'emerald' | 'amber' | 'indigo' | 'rose';
  ariaLabel?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  category,
  icon,
  isActive = true,
  onRemove,
  onClick,
  count,
  variant = 'violet',
  ariaLabel,
}) => {
  const variantStyles = {
    violet: {
      active: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 shadow-sm',
      tag: 'text-violet-600',
      removeBtn: 'hover:bg-violet-200 text-violet-600 hover:text-violet-900',
    },
    emerald: {
      active: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm',
      tag: 'text-emerald-600',
      removeBtn: 'hover:bg-emerald-200 text-emerald-600 hover:text-emerald-900',
    },
    amber: {
      active: 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 shadow-sm',
      tag: 'text-amber-700',
      removeBtn: 'hover:bg-amber-200 text-amber-700 hover:text-amber-900',
    },
    indigo: {
      active: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm',
      tag: 'text-indigo-600',
      removeBtn: 'hover:bg-indigo-200 text-indigo-600 hover:text-indigo-900',
    },
    rose: {
      active: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-sm',
      tag: 'text-rose-600',
      removeBtn: 'hover:bg-rose-200 text-rose-600 hover:text-rose-900',
    },
    default: {
      active: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-sm',
      tag: 'text-slate-500',
      removeBtn: 'hover:bg-slate-300 text-slate-500 hover:text-slate-800',
    },
  };

  const currentStyles = variantStyles[variant] || variantStyles.violet;

  return (
    <div
      role="group"
      aria-label={ariaLabel || `${category ? category + ': ' : ''}${label}`}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs min-h-[44px] transition-all duration-150 select-none shadow-xs ${
        isActive
          ? currentStyles.active
          : 'bg-[#FFFFFF] border-[#D8D0E7] text-[#65567E] hover:text-[#242132] hover:bg-[#ECE7FF]'
      }`}
    >
      {/* Clickable chip body to trigger toggle / modal */}
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5841E8] rounded py-1 min-h-[36px]"
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {category && (
          <span className={`text-[10px] uppercase font-bold tracking-wider ${currentStyles.tag}`}>
            {category}:
          </span>
        )}
        <span className="truncate max-w-[150px] sm:max-w-[200px] font-semibold">{label}</span>
        {count !== undefined && (
          <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#ECE7FF] text-[#5841E8] text-[10px] font-bold">
            {count}
          </span>
        )}
      </button>

      {/* Direct Remove Action Button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove filter: ${label}`}
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ml-0.5 ${currentStyles.removeBtn}`}
          title="Remove filter"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
