import { Component, OnInit, OnDestroy, ElementRef, ViewChild,
         NgZone, HostListener } from '@angular/core';
import { WidgetElement, WidgetFrame, COMPONENT_LIBRARY,
         makeElement, WidgetElementType } from '../models/widget-element.model';
import { WidgetConfigService } from '../../../../../services/widget-config.service';
import { AppStateService } from '../../../../../services/app-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const CW = 300;
const CH = 520;

interface DragState {
  phase   : 'sidebar' | 'move' | 'resize';
  elType? : WidgetElementType;
  id?     : string;
  mx?     : number; my?  : number;
  ex?     : number; ey?  : number;
  sw?     : number; sh?  : number;
  handle? : string;
}

@Component({
  selector    : 'app-widget-studio',
  templateUrl : './widget-studio.component.html',
  styleUrls   : ['./widget-studio.component.scss']
})
export class WidgetStudioComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;

  readonly LIB = COMPONENT_LIBRARY;

  elements: WidgetElement[] = [
    makeElement('points',   44, 38),
    makeElement('streak',   44, 112),
    makeElement('badge',    44, 178),
    makeElement('progress', 28, 230),
  ];

  selectedId : string | null = null;
  frame      : WidgetFrame   = { bg: '#12122A', radius: 20 };
  showGrid   = true;
  widgetName = 'My Widget';
  saved      = false;
  saving     = false;
  activeTab  : 'props' | 'layers' = 'props';

  /** Real publishable key returned by the backend after the first save. */
  savedKey: string | null = null;

  ghost: { type: WidgetElementType; x: number; y: number } | null = null;

  private ds       : DragState | null = null;
  private rafId    : number    | null = null;
  private boundMove!: (e: MouseEvent) => void;
  private boundUp!  : (e: MouseEvent) => void;
  private destroy$  = new Subject<void>();

  constructor(
    private zone          : NgZone,
    private widgetService : WidgetConfigService,
    private appState      : AppStateService
  ) {}

  // ── LIFECYCLE ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.boundMove = (e) => this.onGlobalMove(e);
    this.boundUp   = (e) => this.onGlobalUp(e);
    window.addEventListener('mousemove', this.boundMove);
    window.addEventListener('mouseup',   this.boundUp);

    // Restore a previously saved config for this app
    const appId = this.appState.currentAppId();
    if (appId) {
      this.widgetService.getAppConfigs(appId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (configs) => {
            if (!configs?.length) return;
            const cfg = configs[0];
            this.savedKey  = cfg.publishableKey;
            this.widgetName = cfg.name ?? this.widgetName;

            // ── Restore canvas layout ──────────────────────────────────────
            if (cfg.layoutJson) {
              try {
                const parsed = JSON.parse(cfg.layoutJson);
                if (parsed.frame)    { this.frame    = parsed.frame; }
                if (parsed.elements) { this.elements = parsed.elements; }
              } catch { /* ignore malformed JSON */ }
            }

            // ── Restore top-level style from scalar fields (fallback) ──────
            if (!cfg.layoutJson && cfg.backgroundColor) {
              this.frame.bg = cfg.backgroundColor;
            }
            if (cfg.borderRadius != null && !cfg.layoutJson) {
              this.frame.radius = cfg.borderRadius;
            }
          },
          error: () => {} // not saved yet — fine
        });
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.boundMove);
    window.removeEventListener('mouseup',   this.boundUp);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── GETTERS ───────────────────────────────────────────────────────────────

  get selectedEl(): WidgetElement | null {
    return this.elements.find(e => e.id === this.selectedId) ?? null;
  }

  // ── DRAG — SIDEBAR ────────────────────────────────────────────────────────

  onSidebarMouseDown(type: WidgetElementType, e: MouseEvent): void {
    e.preventDefault();
    this.ds    = { phase: 'sidebar', elType: type };
    this.ghost = { type, x: e.clientX, y: e.clientY };
  }

  // ── DRAG — CANVAS ELEMENT ─────────────────────────────────────────────────

  onElementMouseDown(el: WidgetElement, e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();
    this.selectedId = el.id;
    this.activeTab  = 'props';
    this.ds = { phase: 'move', id: el.id,
                mx: e.clientX, my: e.clientY,
                ex: el.x,      ey: el.y };
  }

  // ── DRAG — RESIZE ─────────────────────────────────────────────────────────

  onResizeMouseDown(el: WidgetElement, handle: string, e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();
    this.ds = { phase: 'resize', id: el.id, handle,
                mx: e.clientX, my: e.clientY,
                sw: el.w,      sh: el.h,
                ex: el.x,      ey: el.y };
  }

  // ── GLOBAL MOUSE MOVE ─────────────────────────────────────────────────────

  private onGlobalMove(e: MouseEvent): void {
    if (!this.ds) return;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      if (!this.ds) return;
      this.zone.run(() => {

        if (this.ds!.phase === 'sidebar') {
          this.ghost = { ...this.ghost!, x: e.clientX, y: e.clientY };

        } else if (this.ds!.phase === 'move') {
          const dx = e.clientX - this.ds!.mx!;
          const dy = e.clientY - this.ds!.my!;
          this.elements = this.elements.map(el => el.id !== this.ds!.id ? el : {
            ...el,
            x: Math.max(0, Math.min(CW - el.w, this.ds!.ex! + dx)),
            y: Math.max(0, Math.min(CH - el.h, this.ds!.ey! + dy)),
          });

        } else if (this.ds!.phase === 'resize') {
          const dx = e.clientX - this.ds!.mx!;
          const dy = e.clientY - this.ds!.my!;
          const h  = this.ds!.handle!;
          const { sw, sh, ex, ey } = this.ds!;
          this.elements = this.elements.map(el => {
            if (el.id !== this.ds!.id) return el;
            let { x, y, w, height: ht } = { ...el, height: el.h };
            if (h.includes('e')) w  = Math.max(30, sw! + dx);
            if (h.includes('s')) ht = Math.max(12, sh! + dy);
            if (h.includes('w')) { w = Math.max(30, sw! - dx); x = w === 30 ? ex! + sw! - 30 : ex! + dx; }
            if (h.includes('n')) { ht = Math.max(12, sh! - dy); y = ht === 12 ? ey! + sh! - 12 : ey! + dy; }
            return { ...el, x, y, w, h: ht };
          });
        }
      });
    });
  }

  // ── GLOBAL MOUSE UP ───────────────────────────────────────────────────────

  private onGlobalUp(e: MouseEvent): void {
    if (!this.ds) return;
    this.zone.run(() => {
      if (this.ds!.phase === 'sidebar') {
        const cv = this.canvasRef?.nativeElement;
        if (cv) {
          const rect = cv.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top  && e.clientY <= rect.bottom) {
            const nx = Math.max(0, Math.min(CW - 160, e.clientX - rect.left - 80));
            const ny = Math.max(0, Math.min(CH - 50,  e.clientY - rect.top  - 26));
            const el = makeElement(this.ds!.elType!, nx, ny);
            this.elements = [...this.elements, el];
            this.selectedId = el.id;
            this.activeTab  = 'props';
          }
        }
        this.ghost = null;
      }
      this.ds = null;
    });
  }

  // ── KEYBOARD ──────────────────────────────────────────────────────────────

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'Escape') { this.selectedId = null; return; }
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedId) {
      this.deleteSelected();
    }
  }

  // ── ELEMENT ACTIONS ───────────────────────────────────────────────────────

  updateProp(prop: string, value: any): void {
    this.elements = this.elements.map(el =>
      el.id === this.selectedId ? { ...el, [prop]: value } : el
    );
  }

  deleteSelected(): void {
    this.elements = this.elements.filter(e => e.id !== this.selectedId);
    this.selectedId = null;
  }

  duplicate(): void {
    const el = this.selectedEl;
    if (!el) return;
    const ne = { ...el, id: `el${Date.now()}`, x: el.x + 14, y: el.y + 14 };
    this.elements = [...this.elements, ne];
    this.selectedId = ne.id;
  }

  bringForward(): void {
    const i = this.elements.findIndex(e => e.id === this.selectedId);
    if (i < this.elements.length - 1) {
      const a = [...this.elements]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; this.elements = a;
    }
  }

  sendBackward(): void {
    const i = this.elements.findIndex(e => e.id === this.selectedId);
    if (i > 0) {
      const a = [...this.elements]; [a[i], a[i - 1]] = [a[i - 1], a[i]]; this.elements = a;
    }
  }

  clearCanvas(): void {
    this.elements  = [];
    this.selectedId = null;
  }

  // ── SAVE TO BACKEND ───────────────────────────────────────────────────────

  saveWidget(): void {
    const appId = this.appState.currentAppId();
    if (!appId) {
      console.error('[WidgetStudio] No app selected — cannot save.');
      return;
    }
    if (this.saving) return;
    this.saving = true;

    // ── Derive scalar values from the first matching element ───────────────
    const pointsEl  = this.elements.find(e => e.type === 'points');
    const hasBadge  = this.elements.some(e => e.type === 'badge');
    const hasPoints = !!pointsEl;

    const contentMode =
      hasPoints && hasBadge ? 'both'   :
      hasBadge              ? 'badges' : 'points';

    // ── Serialise the full canvas layout ───────────────────────────────────
    const layoutJson = JSON.stringify({
      frame    : this.frame,
      elements : this.elements,          // full element array with x/y/w/h/colors
    });

    const payload = {
      name            : this.widgetName,
      displayMode     : 'card',           // "card" is the container mode; layout drives actual look
      contentMode,
      backgroundColor : this.frame.bg,
      textColor       : pointsEl?.fg ?? '#FFFFFF',
      accentColor     : this.elements.find(e => e.ac)?.ac ?? '#6366F1',
      label           : pointsEl?.label  ?? 'Points',
      showLifetime    : false,
      showLevel       : this.elements.some(e => e.type === 'level'),
      animate         : true,
      borderRadius    : this.frame.radius,
      language        : 'en',
      layoutJson,       // ← the full canvas snapshot
    };

    this.widgetService.saveConfig(appId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.savedKey = res.publishableKey;
          this.saved    = true;
          this.saving   = false;
          setTimeout(() => this.saved = false, 2500);
        },
        error: (err: any) => {
          console.error('[WidgetStudio] Save failed', err);
          this.saving = false;
        },
      });
  }

  // ── COPY SNIPPET ──────────────────────────────────────────────────────────

  copySnippet(): void {
    if (!this.savedKey) return;
    navigator.clipboard.writeText(`GamifWidget(apiKey: '${this.savedKey}')`);
  }

  // ── TEMPLATE HELPERS ──────────────────────────────────────────────────────

  getLibItem(type: string) { return this.LIB.find(l => l.type === type); }

  getElementStyle(el: WidgetElement): Record<string, string> {
    return {
      position      : 'absolute',
      left          : el.x + 'px',
      top           : el.y + 'px',
      width         : el.w + 'px',
      height        : el.h + 'px',
      background    : (el.type === 'divider' || el.type === 'badge') ? 'transparent' : el.bg,
      borderRadius  : el.r + 'px',
      cursor        : 'move',
      outline       : this.selectedId === el.id ? '2px solid #6366F1' : 'none',
      outlineOffset : '3px',
      zIndex        : this.selectedId === el.id ? '50' : 'auto',
    };
  }

  getProgressWidth(el: WidgetElement): string { return (el.pct ?? 0) + '%'; }

  trackById(_: number, el: WidgetElement): string { return el.id; }
}