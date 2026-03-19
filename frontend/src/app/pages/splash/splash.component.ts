// src/app/pages/splash/splash.component.ts
import {
  Component, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number; alpha: number;
  color: string; life: number;
  maxLife: number;
}

interface FloatingOrb {
  x: number; y: number;
  radius: number; color: string;
  vx: number; vy: number; alpha: number;
}

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Animation state
  phase: 'particles' | 'logo' | 'tagline' | 'exit' = 'particles';
  showLogo = false;
  showTagline = false;
  showSubtitle = false;
  showProgress = false;
  exitActive = false;
  progress = 0;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private orbs: FloatingOrb[] = [];
  private animFrameId = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private W = 0;
  private H = 0;

  private readonly COLORS = [
    '#6C63FF', '#FF6584', '#43E97B',
    '#F093FB', '#4FACFE', '#FFD700'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initCanvas();
    this.spawnOrbs();
    this.startSequence();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.timers.forEach(t => clearTimeout(t));
  }

  // ── Canvas Setup ──────────────────────────────────────────

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    this.W = canvas.width = window.innerWidth;
    this.H = canvas.height = window.innerHeight;
  }

  // ── Floating background orbs ──────────────────────────────

  private spawnOrbs(): void {
    this.orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 80 + Math.random() * 120,
      color: this.COLORS[i % this.COLORS.length],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: 0.04 + Math.random() * 0.06
    }));
  }

  // ── Particle burst from center ────────────────────────────

  private burst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 4;
      const life = 60 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 3,
        alpha: 1,
        color: this.COLORS[Math.floor(Math.random() * this.COLORS.length)],
        life, maxLife: life
      });
    }
  }

  // ── Animation sequence ────────────────────────────────────

  private startSequence(): void {
    const t = (ms: number, fn: () => void) => {
      const id = setTimeout(fn, ms);
      this.timers.push(id);
    };

    // 0ms — initial burst
    t(200, () => {
      this.burst(this.W / 2, this.H / 2, 80);
    });

    // 600ms — second burst + show logo
    t(600, () => {
      this.burst(this.W / 2, this.H / 2, 60);
      this.showLogo = true;
      this.phase = 'logo';
    });

    // 1200ms — tagline
    t(1200, () => {
      this.showTagline = true;
      this.phase = 'tagline';
    });

    // 1800ms — subtitle
    t(1800, () => {
      this.showSubtitle = true;
    });

    // 2200ms — progress bar
    t(2200, () => {
      this.showProgress = true;
      this.animateProgress();
    });

    // 3800ms — exit animation
    t(3800, () => {
      this.exitActive = true;
      this.phase = 'exit';
    });

    // 4500ms — navigate to home
    t(4500, () => {
      this.router.navigate(['/home']);
    });
  }

  private animateProgress(): void {
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      this.progress = Math.min(100, (elapsed / duration) * 100);
      if (this.progress < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Main render loop ──────────────────────────────────────

  private animate(): void {
    this.animFrameId = requestAnimationFrame(() => this.animate());
    const ctx = this.ctx;

    // Fade trail
    ctx.fillStyle = 'rgba(10, 8, 20, 0.18)';
    ctx.fillRect(0, 0, this.W, this.H);

    // Draw orbs
    this.orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -orb.radius) orb.x = this.W + orb.radius;
      if (orb.x > this.W + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = this.H + orb.radius;
      if (orb.y > this.H + orb.radius) orb.y = -orb.radius;

      const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      g.addColorStop(0, orb.color + Math.round(orb.alpha * 255).toString(16).padStart(2, '0'));
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    // Draw + update particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life--;
      p.alpha = p.life / p.maxLife;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.radius * p.alpha), 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Continuous small sparks
    if (Math.random() < 0.3 && this.phase !== 'exit') {
      const cx = this.W / 2 + (Math.random() - 0.5) * 60;
      const cy = this.H / 2 + (Math.random() - 0.5) * 60;
      this.burst(cx, cy, 3);
    }
  }

  skipSplash(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.router.navigate(['/home']);
  }
}