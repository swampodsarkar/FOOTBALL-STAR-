import { motion } from 'framer-motion';
import { HiStar, HiFire, HiHeart } from 'react-icons/hi2';
import Badge from './Badge';
import ProgressBar from './ProgressBar';

interface PlayerCardProps {
  name: string;
  ovr: number;
  position: string;
  club: string;
  nationality: string;
  form: number;
  energy: number;
  fitness: number;
  morale: number;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

function getOvrGradient(ovr: number): string {
  if (ovr >= 90) return 'from-amber-400 to-purple-500';
  if (ovr >= 80) return 'from-sky-400 to-cyan-500';
  if (ovr >= 70) return 'from-emerald-400 to-teal-500';
  return 'from-amber-600 to-amber-700';
}

function getOvrBorder(ovr: number): string {
  if (ovr >= 90) return 'border-amber-400/40';
  if (ovr >= 80) return 'border-sky-400/30';
  if (ovr >= 70) return 'border-emerald-400/30';
  return 'border-amber-600/30';
}

export default function PlayerCard({
  name,
  ovr,
  position,
  club,
  nationality,
  form,
  energy,
  fitness,
  morale,
  onClick,
  className = '',
  compact = false,
}: PlayerCardProps) {
  const formStars = Math.round(form);
  const moraleColor = morale >= 70 ? 'green' : morale >= 40 ? 'yellow' : 'red';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border ${getOvrBorder(ovr)} bg-gray-900 ${compact ? 'p-4' : 'p-5'} cursor-pointer group ${className}`}
    >
      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${getOvrGradient(ovr)}`} />

      <div className="relative z-10">
        <div className={`flex items-start justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
          <div className="flex items-center gap-2">
            <span className={compact ? 'text-2xl' : 'text-3xl'}>{nationality}</span>
            <div>
              <p className="text-sm text-gray-400">{club}</p>
            </div>
          </div>
          <Badge variant="default">{position}</Badge>
        </div>

        <div className={`flex items-end gap-3 ${compact ? 'mb-2' : 'mb-4'}`}>
          <span
            className={`${compact ? 'text-4xl' : 'text-5xl'} font-black bg-gradient-to-br ${getOvrGradient(ovr)} bg-clip-text text-transparent leading-none`}
          >
            {ovr}
          </span>
          <span className={`${compact ? 'text-base' : 'text-xl'} font-semibold text-white pb-1`}>{name}</span>
        </div>

        {!compact && (
          <div className="flex items-center gap-0.5 mb-4">
            {Array.from({ length: 5 }, (_, i) => (
              <HiStar
                key={i}
                className={`w-4 h-4 ${i < formStars ? 'text-amber-400' : 'text-gray-700'}`}
              />
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <HiFire className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex-1">
              <ProgressBar value={energy} color="yellow" size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HiHeart className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <ProgressBar value={fitness} color="green" size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 shrink-0 flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${morale >= 70 ? 'bg-emerald-400' : morale >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
              />
            </div>
            <div className="flex-1">
              <ProgressBar value={morale} color={moraleColor} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
