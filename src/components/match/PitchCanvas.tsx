import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import type { Position } from '../../types';
import {
  type FormationName,
  getFormationPositions,
  mirrorFormation,
  type PitchPoint,
} from '../../utils/formations';

export interface PitchHandle {
  kickoff: () => void;
  attack: (side: 'home' | 'away') => void;
  goal: (side: 'home' | 'away') => void;
  setPossession: (home: number) => void;
  setMomentum: (m: number) => void;
  reset: () => void;
}

interface Player {
  base: PitchPoint;
  phase: number;
  amp: number;
  pushing: boolean;
}

interface PitchProps {
  homeColor: string;
  awayColor: string;
  homeFormation: FormationName;
  awayFormation: FormationName;
  playerIsHome: boolean;
  playerPosition?: Position;
}

type Mode = 'idle' | 'attackHome' | 'attackAway' | 'goalHome' | 'goalAway';

const ASPECT = 105 / 68;

const POS_INDEX: Record<string, number> = {
  GK: 0, LB: 1, CB: 2, RB: 4, CDM: 5, CM: 6, CAM: 7,
  LM: 8, RM: 10, LW: 8, RW: 10, ST: 9, CF: 9,
};

function buildSquad(points: PitchPoint[], pushForward: boolean): Player[] {
  return points.map((p, i) => ({
    base: { ...p },
    phase: i * 0.7,
    amp: 0.012 + (i % 3) * 0.004,
    pushing: pushForward && p.x > 0.38,
  }));
}

function genCrowd(W: number, H: number, pad: number): { x: number; y: number; r: number; c: string }[] {
  const arr: { x: number; y: number; r: number; c: string }[] = [];
  const cols = ['#cbd5e1', '#94a3b8', '#e2e8f0', '#f8fafc', '#64748b', '#a3b1c6'];
  const step = Math.max(3, pad * 0.34);
  for (let x = 4; x < W - 4; x += step) {
    for (let y = 3; y < pad - 2; y += step) {
      arr.push({
        x: x + (Math.random() - 0.5) * step * 0.5,
        y: y + (Math.random() - 0.5) * step * 0.5,
        r: Math.max(0.6, step * 0.13),
        c: cols[(Math.random() * cols.length) | 0],
      });
    }
  }
  for (let y = pad + 8; y < H - pad - 8; y += step) {
    for (const x of [3, W - pad + 3]) {
      arr.push({
        x: x + (Math.random() - 0.5) * step * 0.5,
        y: y + (Math.random() - 0.5) * step * 0.5,
        r: Math.max(0.6, step * 0.13),
        c: cols[(Math.random() * cols.length) | 0],
      });
    }
  }
  return arr;
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

const PitchCanvas = forwardRef<PitchHandle, PitchProps>(function PitchCanvas(
  { homeColor, awayColor, homeFormation, awayFormation, playerIsHome, playerPosition },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const home = useRef<Player[]>([]);
  const away = useRef<Player[]>([]);
  const ball = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, curve: 0 });
  const mode = useRef<Mode>('idle');
  const modeTimer = useRef(0);
  const flash = useRef(0);
  const possessionHome = useRef(50);
  const momentum = useRef(50);
  const colors = useRef({ home: homeColor, away: awayColor, playerIsHome });
  const formations = useRef({ home: homeFormation, away: awayFormation });
  const crowdRef = useRef<{ x: number; y: number; r: number; c: string }[]>([]);
  const crowdSize = useRef({ w: 0, h: 0, pad: 0 });
  const playerIndex = POS_INDEX[playerPosition ?? 'ST'] ?? 9;

  colors.current = { home: homeColor, away: awayColor, playerIsHome };
  formations.current = { home: homeFormation, away: awayFormation };

  const rebuild = () => {
    home.current = buildSquad(getFormationPositions(formations.current.home), true);
    away.current = buildSquad(mirrorFormation(getFormationPositions(formations.current.away)), false);
  };

  useEffect(() => {
    rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rebuild();
  }, [homeFormation, awayFormation]);

  useImperativeHandle(ref, () => ({
    kickoff: () => {
      mode.current = 'idle';
      modeTimer.current = 0;
      ball.current = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, curve: 0 };
    },
    attack: (side) => {
      mode.current = side === 'home' ? 'attackHome' : 'attackAway';
      modeTimer.current = 0;
      const targetX = side === 'home' ? 0.9 : 0.1;
      const targetY = 0.5 + (Math.random() - 0.5) * 0.5;
      ball.current.tx = targetX;
      ball.current.ty = targetY;
      ball.current.curve = (Math.random() - 0.5) * 0.25;
    },
    goal: (side) => {
      mode.current = side === 'home' ? 'goalHome' : 'goalAway';
      modeTimer.current = 0;
      flash.current = 1;
      ball.current.tx = side === 'home' ? 0.985 : 0.015;
      ball.current.ty = 0.5;
    },
    setPossession: (home) => {
      possessionHome.current = home;
    },
    setMomentum: (m) => {
      momentum.current = m;
    },
    reset: () => {
      mode.current = 'idle';
      flash.current = 0;
      rebuild();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const c = canvas.getContext('2d');
    if (!c) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = wrap.clientWidth;
      const H = Math.round(W / ASPECT);
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
      }
      const ctx = c;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const pad = Math.max(16, Math.min(30, W * 0.05));
      const m = pad + 6;
      const pw = W - m * 2;
      const ph = H - m * 2;
      const px = (x: number) => m + x * pw;
      const py = (y: number) => m + y * ph;

      // (re)generate crowd when size changes
      if (
        crowdRef.current.length === 0 ||
        crowdSize.current.w !== W ||
        crowdSize.current.h !== H ||
        crowdSize.current.pad !== pad
      ) {
        crowdRef.current = genCrowd(W, H, pad);
        crowdSize.current = { w: W, h: H, pad };
      }
      drawStadium(ctx, W, H, pad, crowdRef.current, homeColor, awayColor);

      modeTimer.current += 1;
      drawPitch(ctx, m, pw, ph);

      const t = performance.now() / 1000;

      ball.current.x += (ball.current.tx - ball.current.x) * 0.05;
      ball.current.y += (ball.current.ty - ball.current.y) * 0.05 + Math.sin(t * 3) * ball.current.curve * 0.01;

      const attackHome = mode.current === 'attackHome' || mode.current === 'goalHome';
      const attackAway = mode.current === 'attackAway' || mode.current === 'goalAway';

      const drawTeam = (players: Player[], color: string, isAttacking: boolean, highlight: number) => {
        for (let i = 0; i < players.length; i++) {
          const p = players[i];
          let bx = p.base.x;
          let by = p.base.y;
          bx += Math.sin(t * 1.1 + p.phase) * p.amp;
          by += Math.cos(t * 0.9 + p.phase) * p.amp;
          if (isAttacking && p.pushing) {
            bx += (mode.current === 'attackHome' || mode.current === 'attackAway' ? 0.06 : 0.03);
          }
          const cx = px(bx);
          const cy = py(by);
          const isPlayer = i === highlight;
          const radius = isPlayer ? Math.max(6, W * 0.018) : Math.max(4, W * 0.011);

          if (isPlayer) {
            const pulse = 1 + 0.18 * Math.sin(t * 5);
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(250,204,21,0.9)';
            ctx.lineWidth = 2;
            ctx.arc(cx, cy, radius * 1.7 * pulse, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.strokeStyle = isPlayer ? '#facc15' : 'rgba(255,255,255,0.85)';
          ctx.lineWidth = isPlayer ? 2 : 1.5;
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (isPlayer) {
            drawStar(ctx, cx, cy - radius - Math.max(4, W * 0.014), Math.max(3, W * 0.01), '#facc15');
          }
        }
      };

      if (mode.current === 'idle') {
        const drift = (possessionHome.current - 50) / 50;
        ball.current.tx = 0.5 + drift * 0.18;
        ball.current.ty = 0.5;
      }

      drawTeam(home.current, homeColor, attackHome, playerIsHome ? playerIndex : -1);
      drawTeam(away.current, awayColor, attackAway, playerIsHome ? -1 : playerIndex);

      // ball
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.arc(px(ball.current.x), py(ball.current.y), Math.max(3, W * 0.008), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (mode.current === 'attackHome' || mode.current === 'attackAway') {
        const from = { x: ball.current.x, y: ball.current.y };
        const to = mode.current === 'attackHome' ? { x: 0.95, y: 0.5 } : { x: 0.05, y: 0.5 };
        drawArrow(
          ctx,
          px(from.x),
          py(from.y),
          px(to.x),
          py(to.y),
          colors.current.playerIsHome ? (mode.current === 'attackHome' ? homeColor : awayColor) : '#fbbf24',
        );
      }

      if (flash.current > 0) {
        flash.current = Math.max(0, flash.current - 0.012);
        const goalColor = mode.current === 'goalHome' ? homeColor : awayColor;
        ctx.fillStyle = `rgba(255,255,255,${flash.current * 0.5})`;
        ctx.fillRect(0, 0, W, H);
        ctx.font = `900 ${Math.round(H * 0.22)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.strokeText('GOAL!', W / 2, H / 2);
        ctx.fillStyle = goalColor;
        ctx.fillText('GOAL!', W / 2, H / 2);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeColor, awayColor, playerIsHome, playerPosition]);

  return (
    <div ref={wrapRef} className="w-full rounded-xl overflow-hidden border border-gray-800 bg-emerald-950/40 relative">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
});

function drawStadium(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  pad: number,
  crowd: { x: number; y: number; r: number; c: string }[],
  homeColor: string,
  awayColor: string,
) {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, pad);
  ctx.fillRect(0, 0, pad, H);
  ctx.fillRect(W - pad, 0, pad, H);

  for (const d of crowd) {
    ctx.beginPath();
    ctx.fillStyle = d.c;
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ad boards (banners) along inner edges
  ctx.fillStyle = homeColor;
  ctx.fillRect(0, pad - 3, W / 2, 3);
  ctx.fillStyle = awayColor;
  ctx.fillRect(W / 2, pad - 3, W / 2, 3);
  ctx.fillStyle = 'rgba(148,163,184,0.35)';
  ctx.fillRect(pad - 3, pad, 3, H - pad * 2);
  ctx.fillRect(W - pad, pad, 3, H - pad * 2);
}

function drawPitch(
  ctx: CanvasRenderingContext2D,
  m: number,
  pw: number,
  ph: number,
) {
  const stripes = 10;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#0f5132' : '#146c43';
    ctx.fillRect(m + (pw / stripes) * i, m, pw / stripes + 1, ph);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;
  ctx.strokeRect(m, m, pw, ph);

  ctx.beginPath();
  ctx.moveTo(m + pw / 2, m);
  ctx.lineTo(m + pw / 2, m + ph);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(m + pw / 2, m + ph / 2, ph * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(m + pw / 2, m + ph / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fill();

  const boxW = pw * 0.12;
  const boxH = ph * 0.5;
  ctx.strokeRect(m, m + (ph - boxH) / 2, boxW, boxH);
  ctx.strokeRect(m + pw - boxW, m + (ph - boxH) / 2, boxW, boxH);

  const gW = pw * 0.045;
  const gH = ph * 0.22;
  ctx.strokeRect(m, m + (ph - gH) / 2, gW, gH);
  ctx.strokeRect(m + pw - gW, m + (ph - gH) / 2, gW, gH);

  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(m - 4, m + (ph - gH) / 2, 4, gH);
  ctx.fillRect(m + pw, m + (ph - gH) / 2, 4, gH);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  const netDepth = Math.max(3, pw * 0.012);
  for (let i = 1; i <= 4; i++) {
    const off = (gH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(m - 4, m + (ph - gH) / 2 + off);
    ctx.lineTo(m - 4 - netDepth, m + (ph - gH) / 2 + off);
    ctx.moveTo(m + pw + 4, m + (ph - gH) / 2 + off);
    ctx.lineTo(m + pw + 4 + netDepth, m + (ph - gH) / 2 + off);
    ctx.stroke();
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  const head = 9;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(angle) * head, y2 - Math.sin(angle) * head);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(angle - 0.5) * head, y2 - Math.sin(angle - 0.5) * head);
  ctx.lineTo(x2 - Math.cos(angle + 0.5) * head, y2 - Math.sin(angle + 0.5) * head);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export default PitchCanvas;
