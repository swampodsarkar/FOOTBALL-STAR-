import { motion } from 'framer-motion';

interface AttributeDisplayProps {
  attributes: Record<string, number>;
  columns?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const columnsGrid: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const labelSizes: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const barHeights: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

const valueSizes: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function getValueColor(value: number): string {
  if (value >= 90) return 'text-purple-400';
  if (value >= 80) return 'text-sky-400';
  if (value >= 70) return 'text-emerald-400';
  if (value >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

function getBarColor(value: number): string {
  if (value >= 90) return 'from-purple-500 to-purple-400';
  if (value >= 80) return 'from-sky-500 to-sky-400';
  if (value >= 70) return 'from-emerald-500 to-emerald-400';
  if (value >= 60) return 'from-amber-500 to-amber-400';
  return 'from-rose-500 to-rose-400';
}

export default function AttributeDisplay({
  attributes,
  columns = 2,
  size = 'md',
  className = '',
}: AttributeDisplayProps) {
  return (
    <div className={`grid gap-3 ${columnsGrid[columns]} ${className}`}>
      {Object.entries(attributes).map(([name, value]) => (
        <div key={name}>
          <div className="flex justify-between items-center mb-1">
            <span className={`capitalize text-gray-400 ${labelSizes[size]}`}>
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className={`font-semibold ${getValueColor(value)} ${valueSizes[size]}`}>
              {value}
            </span>
          </div>
          <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${barHeights[size]}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(value, 99)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' as const }}
              className={`h-full rounded-full bg-gradient-to-r ${getBarColor(value)}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
