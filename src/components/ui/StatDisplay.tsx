import type { ReactNode } from 'react';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

interface StatDisplayProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}

export default function StatDisplay({
  label,
  value,
  icon,
  trend,
  color,
  className = '',
}: StatDisplayProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={color ? { backgroundColor: `${color}15`, color } : undefined}
          {...(!color ? { className: 'w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 bg-gray-800 text-gray-300' } : {})}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider truncate">{label}</p>
        <div className="text-lg font-bold text-white">{value}</div>
      </div>
      {trend && trend !== 'neutral' && (
        <div className="ml-auto shrink-0">
          {trend === 'up' ? (
            <HiArrowTrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <HiArrowTrendingDown className="w-5 h-5 text-rose-400" />
          )}
        </div>
      )}
    </div>
  );
}
