import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi2';
import type { ActivityType } from '../../types';

interface CalendarDayProps {
  day: number;
  activity?: ActivityType;
  isSelected?: boolean;
  completed?: boolean;
  onClick?: () => void;
  className?: string;
}

const activityColors: Record<string, string> = {
  Training: 'bg-emerald-400',
  Rest: 'bg-blue-400',
  Recovery: 'bg-teal-400',
  Match: 'bg-rose-400',
  Travel: 'bg-amber-400',
  InternationalBreak: 'bg-purple-400',
};

export default function CalendarDay({
  day,
  activity,
  isSelected = false,
  completed = false,
  onClick,
  className = '',
}: CalendarDayProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors
        ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}`}
    >
      {completed && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
          <HiCheck className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      <span>{day}</span>
      {activity && (
        <span
          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activityColors[activity] ?? 'bg-gray-600'}`}
        />
      )}
    </motion.button>
  );
}
