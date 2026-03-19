import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef, NgZone
} from '@angular/core';

// ─── Particle shape ───────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  colorIndex: number; // index into COLORS_RGB — avoids string alloc per frame
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('heroCanvas') private canvasRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('cursor')     private cursorRef!:   ElementRef<HTMLDivElement>;
  @ViewChild('cursorDot')  private cursorDotRef!: ElementRef<HTMLDivElement>;

  // ── Template state ──────────────────────────────────────────────────────────
  isLoaded   = false;
  codeCopied = false;

  // ── Static data ─────────────────────────────────────────────────────────────
  readonly titleWords = ['impossible', 'to', 'forget'];

  readonly marqueeItems = [
    'Smart Badges', 'Rule Engine', 'Live Analytics',
    'Universal SDK', 'Instant Events', 'Leaderboards',
    'Point Systems', 'Streak Tracking', 'Custom Rewards', 'Webhooks'
  ];

  readonly features = [
    { icon: '🏆', title: 'Smart Badges',       tag: 'Rewards',
      desc: 'Design unlimited badges that trigger automatically on any user action.',
      color: '#FFD700', size: 'wide' },
    { icon: '⚙️', title: 'Rule Engine',         tag: 'Automation',
      desc: 'If-this-then-that logic. No code required.',
      color: '#6C63FF', size: 'tall' },
    { icon: '📊', title: 'Live Analytics',      tag: 'Insights',
      desc: 'See which rewards move the needle in real time.',
      color: '#43E97B', size: 'normal' },
    { icon: '🔌', title: 'Universal SDK',       tag: 'Integration',
      desc: 'Flutter, React, Vue, React Native — one key, every platform.',
      color: '#FF6584', size: 'normal' },
    { icon: '⚡', title: 'Sub-100ms',           tag: 'Performance',
      desc: 'Rewards delivered before the user blinks.',
      color: '#4FACFE', size: 'normal' },
    { icon: '🔒', title: 'Enterprise Security', tag: 'Security',
      desc: 'JWT auth, API key isolation, full audit logs.',
      color: '#F093FB', size: 'wide' },
  ] as const;

  readonly stats = [
    { value: '10',   suffix: 'ms', label: 'Avg response time', pct: 98  },
    { value: '99.9', suffix: '%',  label: 'Uptime SLA',        pct: 100 },
    { value: '500K', suffix: '+',  label: 'Events/day',        pct: 75  },
    { value: '3',    suffix: '',   label: 'Lines to integrate', pct: 20  },
  ] as const;

  readonly steps = [
    { step: '01', title: 'Create your app',
      desc: 'Sign up, create a project, get your API key in under 60 seconds.' },
    { step: '02', title: 'Configure your rules',
      desc: 'Define which actions trigger which rewards — no code, just logic.' },
    { step: '03', title: 'Drop in the SDK',
      desc: 'Three lines. The SDK handles all event routing and reward delivery.' },
  ] as const;

  // ── Private: canvas ─────────────────────────────────────────────────────────
  private particles:   Particle[] = [];
  private canvasRaf    = 0;
  private ctx!:         CanvasRenderingContext2D;
  private dpr          = 1;
  private heroVisible  = true;   // FIX 2: pause RAF when hero off-screen

  // Pre-parsed RGB tuples — no string alloc inside hot draw loop
  private readonly COLORS_RGB: [number, number, number][] = [
    [123,  92, 250],
    [245,  71, 106],
    [ 52, 232, 158],
    [ 79, 172, 254],
    [240, 147, 251],
  ];

  // ── Private: cursor ─────────────────────────────────────────────────────────
  private cursorRaf = 0;         // FIX 4: single id — not a growing array
  private mouseX = 0; private mouseY = 0;
  private cursorX = 0; private cursorY = 0;
  private dotX    = 0; private dotY    = 0;
  private isTouchDevice = false;

  // ── Private: cleanup refs ────────────────────────────────────────────────────
  private resizeObserver!:    ResizeObserver;
  private heroObserver!:      IntersectionObserver;
  private scrollObserver!:    IntersectionObserver;
  private boundMouseMove!:    (e: MouseEvent) => void;
  private hoverTargets:       Element[] = [];

  // ─────────────────────────────────────────────────────────────────────────────
  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    requestAnimationFrame(() => {
      this.isLoaded = true;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      if (!this.isTouchDevice) {
        this.initCanvas();
        this.initCursor();
      }
      this.initScrollAnimations();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.canvasRaf);  // FIX 2
    cancelAnimationFrame(this.cursorRaf);  // FIX 4

    this.heroObserver?.disconnect();
    this.scrollObserver?.disconnect();
    this.resizeObserver?.disconnect();

    // FIX 3: guaranteed removal — boundMouseMove always set before listener added
    if (this.boundMouseMove) {
      document.removeEventListener('mousemove', this.boundMouseMove);
    }

    // FIX 5: remove scoped hover listeners
    this.hoverTargets.forEach(el => {
      el.removeEventListener('mouseenter', this.onCursorEnter);
      el.removeEventListener('mouseleave', this.onCursorLeave);
    });
    this.hoverTargets = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CANVAS
  // ═══════════════════════════════════════════════════════════════════════════

  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;

    // FIX 10: DPR-aware — cap at 2× (3× is wasteful on retina)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.sizeCanvas(canvas);
    this.spawnParticles(canvas);

    // ResizeObserver is more accurate than window resize
    this.resizeObserver = new ResizeObserver(() => {
      this.sizeCanvas(canvas);
      this.spawnParticles(canvas);
    });
    this.resizeObserver.observe(canvas);

    // FIX 2a: pause when hero scrolled off screen
    this.heroObserver = new IntersectionObserver(
      ([entry]) => { this.heroVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    this.heroObserver.observe(canvas);

    // FIX 2b: pause when tab is backgrounded
    document.addEventListener('visibilitychange', () => {
      this.heroVisible = document.visibilityState === 'visible';
    });

    this.loopCanvas();
  }

  private sizeCanvas(canvas: HTMLCanvasElement): void {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width  = Math.round(w * this.dpr);
    canvas.height = Math.round(h * this.dpr);
    this.ctx.scale(this.dpr, this.dpr);  // FIX 10
  }

  private spawnParticles(canvas: HTMLCanvasElement): void {
    // FIX 1: hard cap — never more than 60 particles
    const w     = canvas.offsetWidth;
    const h     = canvas.offsetHeight;
    const count = Math.min(60, Math.floor((w * h) / 18000));

    this.particles = Array.from({ length: count }, () => ({
      x:          Math.random() * w,
      y:          Math.random() * h,
      vx:         (Math.random() - 0.5) * 0.25,
      vy:         (Math.random() - 0.5) * 0.25,
      size:       Math.random() * 1.4 + 0.5,
      alpha:      Math.random() * 0.45 + 0.1,
      colorIndex: Math.floor(Math.random() * this.COLORS_RGB.length),
    }));
  }

  private loopCanvas(): void {
    const tick = () => {
      this.canvasRaf = requestAnimationFrame(tick);
      if (!this.heroVisible) return;  // FIX 2: zero GPU cost when off-screen
      this.drawParticles();
    };
    tick();
  }

  private drawParticles(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx    = this.ctx;
    const w      = canvas.offsetWidth;
    const h      = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // FIX 1: O(n) only — O(n²) line loop removed entirely
    for (const p of this.particles) {

      // Mouse repulsion — squared distance avoids sqrt in most cases
      const dx     = p.x - this.mouseX;
      const dy     = p.y - this.mouseY;
      const distSq = dx * dx + dy * dy;  // FIX 1b: no sqrt unless inside radius

      if (distSq < 14400 && distSq > 0.01) {  // 120² = 14400
        const dist  = Math.sqrt(distSq);
        const force = (120 - dist) / 120;
        p.vx += (dx / dist) * force * 0.35;
        p.vy += (dy / dist) * force * 0.35;
      }

      p.vx *= 0.97;
      p.vy *= 0.97;
      p.x  += p.vx;
      p.y  += p.vy;

      // Wrap edges
      if (p.x < 0)  p.x = w;
      if (p.x > w)  p.x = 0;
      if (p.y < 0)  p.y = h;
      if (p.y > h)  p.y = 0;

      // Draw — pre-parsed RGB tuple, no string build overhead each frame
      const [r, g, b] = this.COLORS_RGB[p.colorIndex];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle   = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CURSOR
  // ═══════════════════════════════════════════════════════════════════════════

  private initCursor(): void {
    const cursor    = this.cursorRef?.nativeElement;
    const cursorDot = this.cursorDotRef?.nativeElement;
    if (!cursor || !cursorDot) return;

    // FIX 3: assign before addEventListener so ngOnDestroy can always clean up
    this.boundMouseMove = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };
    // passive:true — browser can handle scroll without waiting for JS
    document.addEventListener('mousemove', this.boundMouseMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // FIX 4: single RAF id — not a growing array
    const tick = () => {
      this.cursorRaf = requestAnimationFrame(tick);
      this.cursorX = lerp(this.cursorX, this.mouseX, 0.12);
      this.cursorY = lerp(this.cursorY, this.mouseY, 0.12);
      this.dotX    = lerp(this.dotX,    this.mouseX, 0.4);
      this.dotY    = lerp(this.dotY,    this.mouseY, 0.4);
      cursor.style.transform    = `translate(${this.cursorX - 20}px, ${this.cursorY - 20}px)`;
      cursorDot.style.transform = `translate(${this.dotX - 4}px, ${this.dotY - 4}px)`;
    };
    tick();

    // FIX 5: scope hover targets to component, not full document
    const host = document.querySelector('app-home') ?? document.body;
    host.querySelectorAll<Element>('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', this.onCursorEnter);
      el.addEventListener('mouseleave', this.onCursorLeave);
      this.hoverTargets.push(el);
    });
  }

  // Stable arrow-fn refs — required for removeEventListener to work
  private readonly onCursorEnter = () =>
    this.cursorRef?.nativeElement.classList.add('cursor--hover');

  private readonly onCursorLeave = () =>
    this.cursorRef?.nativeElement.classList.remove('cursor--hover');

  // ═══════════════════════════════════════════════════════════════════════════
  //  SCROLL ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  private initScrollAnimations(): void {
    this.scrollObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.scrollObserver.unobserve(e.target); // fire once, then stop watching
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const host = document.querySelector('app-home') ?? document;
    host.querySelectorAll<Element>('.animate-on-scroll')
        .forEach(el => this.scrollObserver.observe(el));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CARD TILT — pure DOM manipulation, zero Angular re-render
  // ═══════════════════════════════════════════════════════════════════════════

  onCardTilt(e: MouseEvent, card: HTMLElement): void {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;

    card.style.transform =
      `perspective(600px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateZ(8px)`;

    const glow = card.querySelector<HTMLElement>('.bento-card__glow');
    if (glow) {
      glow.style.background =
        `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, var(--clr) 0%, transparent 60%)`;
      glow.style.opacity = '0.18';
    }
  }

  resetTilt(card: HTMLElement): void {
    card.style.transform = '';
    const glow = card.querySelector<HTMLElement>('.bento-card__glow');
    if (glow) glow.style.opacity = '0';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  COPY CODE
  // ═══════════════════════════════════════════════════════════════════════════

  copyCode(): void {
    const code =
`await GamifySDK.init(apiKey: 'your_key');
await sdk.identify('user_id');
final reward = await sdk.track('FIRST_PURCHASE');`;

    navigator.clipboard?.writeText(code).then(() => {
      this.zone.run(() => {
        this.codeCopied = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.codeCopied = false;
          this.cdr.markForCheck();
        }, 2000);
      });
    });
  }
}