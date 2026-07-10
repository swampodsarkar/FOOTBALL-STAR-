import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
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
}

type Mode = 'idle' | 'attackHome' | 'attackAway' | 'goalHome' | 'goalAway';

const ASPECT = 105 / 68;

function buildSquad(points: PitchPoint[], pushForward: boolean): Player[] {
  return points.map((p, i) => ({
    base: { ...p },
    phase: i * 0.7,
    amp: 0.012 + (i % 3) * 0.004,
    pushing: pushForward && p.x > 0.38,
  }));
}

const PitchCanvas = forwardRef<PitchHandle, PitchProps>(function PitchCanvas(
  { homeColor, awayColor, homeFormation, awayFormation, playerIsHome },
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

      const m = 10;
      const pw = W - m * 2;
      const ph = H - m * 2;
      const px = (x: number) => m + x * pw;
      const py = (y: number) => m + y * ph;

      modeTimer.current += 1;

      drawPitch(ctx, m, pw, ph);

      const t = performance.now() / 1000;

      // ease ball
      ball.current.x += (ball.current.tx - ball.current.x) * 0.05;
      ball.current.y += (ball.current.ty - ball.current.y) * 0.05 + Math.sin(t * 3) * ball.current.curve * 0.01;

      // attacking side drives unit forward
      const attackHome = mode.current === 'attackHome' || mode.current === 'goalHome';
      const attackAway = mode.current === 'attackAway' || mode.current === 'goalAway';

      const drawTeam = (players: Player[], color: string, isAttacking: boolean) => {
        for (const p of players) {
          let bx = p.base.x;
          let by = p.base.y;
          const jitterX = Math.sin(t * 1.1 + p.phase) * p.amp;
          const jitterY = Math.cos(t * 0.9 + p.phase) * p.amp;
          bx += jitterX;
          by += jitterY;
          if (isAttacking && p.pushing) {
            bx += (mode.current === 'attackHome' || mode.current === 'attackAway' ? 0.06 : 0.03);
          }
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth = 1.5;
          ctx.arc(px(bx), py(by), Math.max(4, W * 0.011), 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      };

      // possession drift for idle
      if (mode.current === 'idle') {
        const drift = (possessionHome.current - 50) / 50;
        ball.current.tx = 0.5 + drift * 0.18;
        ball.current.ty = 0.5;
      }

      drawTeam(home.current, homeColor, attackHome);
      drawTeam(away.current, awayColor, attackAway);

      // ball
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.arc(px(ball.current.x), py(ball.current.y), Math.max(3, W * 0.008), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // attack arrow
      if (mode.current === 'attackHome' || mode.current === 'attackAway') {
        const from = { x: ball.current.x, y: ball.current.y };
        const to = mode.current === 'attackHome' ? { x: 0.95, y: 0.5 } : { x: 0.05, y: 0.5 };
        drawArrow(ctx, px(from.x), py(from.y), px(to.x), py(to.y), colors.current.playerIsHome ? (mode.current === 'attackHome' ? homeColor : awayColor) : '#fbbf24');
      }

      // goal flash
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
  }, [homeColor, awayColor, playerIsHome]);

  return (
    <div ref={wrapRef} className="w-full rounded-xl overflow-hidden border border-gray-800 bg-emerald-950/40 relative">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
});

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

  // halfway line
  ctx.beginPath();
  ctx.moveTo(m + pw / 2, m);
  ctx.lineTo(m + pw / 2, m + ph);
  ctx.stroke();

  // center circle
  ctx.beginPath();
  ctx.arc(m + pw / 2, m + ph / 2, ph * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(m + pw / 2, m + ph / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fill();

  // penalty boxes
  const boxW = pw * 0.12;
  const boxH = ph * 0.5;
  ctx.strokeRect(m, m + (ph - boxH) / 2, boxW, boxH);
  ctx.strokeRect(m + pw - boxW, m + (ph - boxH) / 2, boxW, boxH);

  // goal boxes
  const gW = pw * 0.045;
  const gH = ph * 0.22;
  ctx.strokeRect(m, m + (ph - gH) / 2, gW, gH);
  ctx.strokeRect(m + pw - gW, m + (ph - gH) / 2, gW, gH);

  // goals
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(m - 4, m + (ph - gH) / 2, 4, gH);
  ctx.fillRect(m + pw, m + (ph - gH) / 2, 4, gH);

  // nets
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
