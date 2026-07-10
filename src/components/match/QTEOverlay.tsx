import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QTEType, QTEResult } from '../../types';
import Card from '../ui/Card';

interface QTEProps {
  type: QTEType;
  onResolve: (result: QTEResult) => void;
}

function judgeTiming(pos: number): QTEResult {
  if (pos >= 44 && pos <= 56) return 'Perfect';
  if (pos >= 36 && pos <= 64) return 'Great';
  if (pos >= 26 && pos <= 74) return 'Good';
  if (pos >= 16 && pos <= 84) return 'Late';
  return 'Miss';
}

function judgePower(pos: number): QTEResult {
  if (pos >= 46 && pos <= 56) return 'Perfect';
  if (pos >= 38 && pos <= 64) return 'Great';
  if (pos >= 30 && pos <= 72) return 'Good';
  if (pos >= 20 && pos <= 82) return 'Late';
  return 'Miss';
}

const RESULT_COLOR: Record<QTEResult, string> = {
  Perfect: 'text-amber-400',
  Great: 'text-emerald-400',
  Good: 'text-blue-400',
  Late: 'text-orange-400',
  Miss: 'text-rose-400',
};
const RESULT_EMOJI: Record<QTEResult, string> = {
  Perfect: '⭐⭐⭐',
  Great: '⭐⭐',
  Good: '⭐',
  Late: '⚠',
  Miss: '✕',
};

const TXT: Record<string, string> = {
  Finish: 'FINISHING CHANCE!',
  Header: 'HEAD THE CROSS!',
  Volley: 'VOLLEY!',
  Penalty: 'PENALTY!',
  GoalkeeperSave: 'MAKE THE SAVE!',
  LongShot: 'RIFLE IT IN!',
  FreeKick: 'FREE KICK!',
  Cross: 'PICK YOUR CROSS!',
  ThroughPass: 'THROUGH BALL!',
  Tackle: 'TIMED TACKLE!',
  Interception: 'READ THE PASS!',
  SlidingBlock: 'BLOCK IT!',
};

function useQTEKeyboard(handler: (key: string) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      handler(e.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handler, active]);
}

function TimingQTE({ onResolve }: { onResolve: (r: QTEResult) => void }) {
  const [pos, setPos] = useState(-10);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<QTEResult | null>(null);
  const raf = useRef<number | null>(null);
  const start = useRef(performance.now());

  useEffect(() => {
    const animate = (now: number) => {
      const progress = ((now - start.current) % 2500) / 2500;
      setPos(-10 + 110 * progress);
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const hit = () => {
    if (done) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const r = judgeTiming(pos);
    setResult(r);
    setDone(true);
    setTimeout(() => onResolve(r), 1100);
  };

  useQTEKeyboard((k) => {
    if (k === ' ' || k === 'Enter') hit();
  }, !done);

  return (
    <div className="space-y-6 py-4" onClick={hit}>
      <p className="text-sm text-gray-500">Tap / press Space at the right moment</p>
      <div className="relative h-16 bg-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-rose-500/30" />
          <div className="flex-1 bg-orange-500/30" />
          <div className="flex-1 bg-emerald-500/30" />
          <div className="flex-1 bg-amber-500/30" />
          <div className="flex-1 bg-rose-500/30" />
        </div>
        <motion.div
          animate={{ left: `${pos}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
          className="absolute top-0 w-1 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ transform: 'translateX(-50%)' }}
        />
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <p className="text-5xl font-black">{RESULT_EMOJI[result]}</p>
            <p className={`text-3xl font-black ${RESULT_COLOR[result]}`}>{result.toUpperCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PowerQTE({ onResolve }: { onResolve: (r: QTEResult) => void }) {
  const [power, setPower] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<QTEResult | null>(null);
  const holding = useRef(false);
  const raf = useRef<number | null>(null);
  const dir = useRef(1);

  useEffect(() => {
    const animate = () => {
      setPower((p) => {
        let np = p + dir.current * 2.2;
        if (np >= 100) { np = 100; dir.current = -1; }
        if (np <= 0) { np = 0; dir.current = 1; }
        return np;
      });
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const release = () => {
    if (done || !holding.current) return;
    holding.current = false;
    if (raf.current) cancelAnimationFrame(raf.current);
    const r = judgePower(power);
    setResult(r);
    setDone(true);
    setTimeout(() => onResolve(r), 1100);
  };

  useQTEKeyboard(
    (k) => {
      if (k === ' ' || k === 'Enter') {
        if (!holding.current) { holding.current = true; }
        else release();
      }
    },
    !done,
  );

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-gray-500">Hold Space / click &amp; release in the green zone</p>
      <div className="relative h-16 bg-gray-800 rounded-xl overflow-hidden flex">
        <div className="flex-1 bg-rose-500/30" />
        <div className="flex-1 bg-orange-500/30" />
        <div className="flex-1 bg-emerald-500/30" />
        <div className="flex-1 bg-amber-500/30" />
        <div className="flex-1 bg-rose-500/30" />
        <div
          className="absolute top-0 h-full bg-white/80 mix-blend-overlay"
          style={{ left: `${power}%`, width: '4%', transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="flex justify-center">
        <button
          onMouseDown={() => (holding.current = true)}
          onMouseUp={release}
          onTouchStart={(e) => { e.preventDefault(); holding.current = true; }}
          onTouchEnd={(e) => { e.preventDefault(); release(); }}
          className="px-8 py-2 rounded-full bg-indigo-600 text-white font-bold"
        >
          POWER
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <p className="text-5xl font-black">{RESULT_EMOJI[result]}</p>
            <p className={`text-3xl font-black ${RESULT_COLOR[result]}`}>{result.toUpperCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DIRS = [
  { key: 'ArrowUp', label: '↑', dx: 0, dy: -1 },
  { key: 'ArrowRight', label: '→', dx: 1, dy: 0 },
  { key: 'ArrowDown', label: '↓', dx: 0, dy: 1 },
  { key: 'ArrowLeft', label: '←', dx: -1, dy: 0 },
] as const;

function DirectionalQTE({ onResolve }: { onResolve: (r: QTEResult) => void }) {
  const [target] = useState(() => DIRS[Math.floor(Math.random() * DIRS.length)]);
  const [ring, setRing] = useState(100);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<QTEResult | null>(null);
  const raf = useRef<number | null>(null);
  const start = useRef(performance.now());

  useEffect(() => {
    const animate = (now: number) => {
      const elapsed = now - start.current;
      setRing(Math.max(0, 100 - (elapsed / 1600) * 100));
      if (elapsed > 1600) {
        if (!done) finish('Miss');
        return;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (r: QTEResult) => {
    if (done) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    setResult(r);
    setDone(true);
    setTimeout(() => onResolve(r), 1100);
  };

  useQTEKeyboard((k) => {
    if (DIRS.some((d) => d.key === k)) {
      let r: QTEResult = 'Miss';
      if (k === target.key) r = ring > 70 ? 'Perfect' : ring > 40 ? 'Great' : 'Good';
      finish(r);
    }
  }, !done);

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-gray-500">Press the matching arrow key / button</p>
      <div className="relative h-40 flex items-center justify-center">
        <div className="absolute w-32 h-32 rounded-full border-4 border-indigo-500/40" />
        <div
          className="absolute rounded-full border-4 border-amber-400"
          style={{ width: `${ring * 1.28}px`, height: `${ring * 1.28}px` }}
        />
        <motion.div
          key={target.key}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-black text-white"
        >
          {target.label}
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <span />
        <button onClick={() => finish(target.key === 'ArrowUp' ? (ring > 70 ? 'Perfect' : ring > 40 ? 'Great' : 'Good') : 'Miss')} className="py-2 rounded bg-gray-800 text-xl">↑</button>
        <span />
        <button onClick={() => finish(target.key === 'ArrowLeft' ? (ring > 70 ? 'Perfect' : ring > 40 ? 'Great' : 'Good') : 'Miss')} className="py-2 rounded bg-gray-800 text-xl">←</button>
        <button onClick={() => finish(target.key === 'ArrowDown' ? (ring > 70 ? 'Perfect' : ring > 40 ? 'Great' : 'Good') : 'Miss')} className="py-2 rounded bg-gray-800 text-xl">↓</button>
        <button onClick={() => finish(target.key === 'ArrowRight' ? (ring > 70 ? 'Perfect' : ring > 40 ? 'Great' : 'Good') : 'Miss')} className="py-2 rounded bg-gray-800 text-xl">→</button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <p className="text-5xl font-black">{RESULT_EMOJI[result]}</p>
            <p className={`text-3xl font-black ${RESULT_COLOR[result]}`}>{result.toUpperCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QTEOverlay({ type, onResolve }: QTEProps) {
  const powerTypes: QTEType[] = ['LongShot', 'FreeKick'];
  const dirTypes: QTEType[] = ['Cross', 'ThroughPass', 'Tackle', 'Interception', 'SlidingBlock'];

  let inner;
  if (powerTypes.includes(type)) inner = <PowerQTE onResolve={onResolve} />;
  else if (dirTypes.includes(type)) inner = <DirectionalQTE onResolve={onResolve} />;
  else inner = <TimingQTE onResolve={onResolve} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -20 }}
        className="w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-indigo-500/50">
          <div className="text-center space-y-2">
            <p className="text-2xl font-black bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              {TXT[type] ?? 'CHANCE!'}
            </p>
            {inner}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
