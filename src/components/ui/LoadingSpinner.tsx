import { motion } from 'framer-motion';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };

export default function LoadingSpinner({ size = 'md', label, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className={`${sizes[size]} border-indigo-500 border-t-transparent rounded-full`}
      />
      {label && <p className="mt-3 text-sm text-gray-500">{label}</p>}
    </div>
  );
}

export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 bg-gray-800 rounded-lg" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}
