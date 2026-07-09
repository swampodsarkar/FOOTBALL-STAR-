import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorGradients: Record<string, string> = {
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-400',
  green: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
  yellow: 'bg-gradient-to-r from-amber-500 to-amber-400',
  red: 'bg-gradient-to-r from-rose-500 to-rose-400',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-400',
};

const sizeHeights: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const labelSizes: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'indigo',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(value, max);
  const percentage = max > 0 ? (clamped / max) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className={`text-gray-400 ${labelSizes[size]}`}>{label}</span>
          )}
          {showValue && (
            <span className={`text-gray-300 font-medium ${labelSizes[size]}`}>
              {Math.round(clamped)}/{max}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeHeights[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
           transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className={`h-full rounded-full ${colorGradients[color]}`}
        />
      </div>
    </div>
  );
}
