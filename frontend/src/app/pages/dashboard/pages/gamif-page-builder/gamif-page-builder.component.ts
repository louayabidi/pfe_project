// frontend/src/app/pages/dashboard/pages/gamif-page-builder/
// gamif-page-builder.component.ts

import {
  Component, OnInit, OnDestroy, signal, computed
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AppStateService } from 'src/app/services/app-state.service';
import { environment } from 'src/environments/environment';

// ── Section types ──────────────────────────────────────────────────────────

export type SectionType = 'hero' | 'leaderboard' | 'badges' | 'stats' | 'activity';

export interface PageSection {
  id       : string;
  type     : SectionType;
  enabled  : boolean;
  title    : string;
  config   : Record<string, any>;
}

export interface PageTheme {
  backgroundColor : string;
  primaryColor    : string;
  accentColor     : string;
  textColor       : string;
  cardColor       : string;
  borderRadius    : number;
  darkMode        : boolean;
  animate         : boolean;
}

// ── Default sections ──────────────────────────────────────────────────────

const DEFAULT_SECTIONS: PageSection[] = [
  {
    id: 's1', type: 'hero', enabled: true, title: 'My Progress',
    config: { showStreak: true, showLifetime: true, showLevel: false }
  },
  {
    id: 's2', type: 'leaderboard', enabled: true, title: 'Leaderboard',
    config: { size: 10, sortBy: 'points', showPodium: true }
  },
  {
    id: 's3', type: 'badges', enabled: true, title: 'My Badges',
    config: { columns: 3, showLocked: true, showNew: true }
  },
  {
    id: 's4', type: 'stats', enabled: false, title: 'Statistics',
    config: { showEvents: true, showDays: true }
  },
  {
    id: 's5', type: 'activity', enabled: false, title: 'Recent Activity',
    config: { limit: 10 }
  },
];

const DEFAULT_THEME: PageTheme = {
  backgroundColor : '#0F0F1A',
  primaryColor    : '#6366F1',
  accentColor     : '#34D399',
  textColor       : '#FFFFFF',
  cardColor       : '#1A1A2E',
  borderRadius    : 16,
  darkMode        : true,
  animate         : true,
};

// ── Section metadata ──────────────────────────────────────────────────────

export const SECTION_META: Record<SectionType, { icon: string; label: string; desc: string }> = {
  hero       : { icon: '⭐', label: 'Points Hero',  desc: 'Large points display + streak' },
  leaderboard: { icon: '🏆', label: 'Leaderboard',  desc: 'Top 3 podium + full ranking' },
  badges     : { icon: '🏅', label: 'Badges Grid',  desc: 'Unlocked & locked achievements' },
  stats      : { icon: '📊', label: 'Statistics',   desc: 'Events, active days, rules' },
  activity   : { icon: '⚡', label: 'Recent Activity', desc: 'Latest events feed' },
};

@Component({
  selector   : 'app-gamif-page-builder',
  templateUrl: './gamif-page-builder.component.html',
  styleUrls  : ['./gamif-page-builder.component.scss'],
})
export class GamifPageBuilderComponent implements OnInit, OnDestroy {

  // ── State ─────────────────────────────────────────────────────────────────
  pageName   = 'My Rewards Page';
  sections   : PageSection[] = structuredClone(DEFAULT_SECTIONS);

  /** Typed array used in the template — avoids TS2345 from inline string literals */
  readonly SECTION_TYPES: SectionType[] =
    ['hero', 'leaderboard', 'badges', 'stats', 'activity'];
  theme      : PageTheme     = structuredClone(DEFAULT_THEME);
  SECTION_META = SECTION_META;

  saved      = false;
  saving     = false;
  savedKey   : string | null = null;
  selectedSection: PageSection | null = null;

  // Drag state
  dragIndex  : number | null = null;
  dragOver   : number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private http    : HttpClient,
    private appState: AppStateService,
  ) {}

  ngOnInit() {
    const appId = this.appState.currentAppId();
    if (!appId) return;

    this.http.get<any[]>(`${environment.apiUrl}/api/gamif-page/${appId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configs) => {
          if (!configs?.length) return;
          const c = configs[0];
          this.savedKey = c.publishableKey;
          this.pageName = c.name ?? this.pageName;
          if (c.sectionsJson) {
            try { this.sections = JSON.parse(c.sectionsJson); } catch {}
          }
          this.theme = {
            backgroundColor: c.backgroundColor ?? this.theme.backgroundColor,
            primaryColor   : c.primaryColor    ?? this.theme.primaryColor,
            accentColor    : c.accentColor     ?? this.theme.accentColor,
            textColor      : c.textColor       ?? this.theme.textColor,
            cardColor      : c.cardColor       ?? this.theme.cardColor,
            borderRadius   : c.borderRadius    ?? this.theme.borderRadius,
            darkMode       : c.darkMode        ?? this.theme.darkMode,
            animate        : c.animate         ?? this.theme.animate,
          };
        },
        error: () => {}
      });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  // ── Computed ──────────────────────────────────────────────────────────────

  get enabledSections(): PageSection[] {
    return this.sections.filter(s => s.enabled);
  }

  // ── Drag & drop reorder ───────────────────────────────────────────────────

  onDragStart(index: number) { this.dragIndex = index; }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    this.dragOver = index;
  }

  onDrop(index: number) {
    if (this.dragIndex === null || this.dragIndex === index) return;
    const moved = this.sections.splice(this.dragIndex, 1)[0];
    this.sections.splice(index, 0, moved);
    this.dragIndex = null;
    this.dragOver  = null;
  }

  onDragEnd() { this.dragIndex = null; this.dragOver = null; }

  // ── Section actions ────────────────────────────────────────────────────────

  toggleSection(s: PageSection) { s.enabled = !s.enabled; }
  selectSection(s: PageSection) {
    this.selectedSection = this.selectedSection?.id === s.id ? null : s;
  }
  updateSectionConfig(key: string, value: any) {
    if (!this.selectedSection) return;
    this.selectedSection.config = { ...this.selectedSection.config, [key]: value };
    const i = this.sections.findIndex(s => s.id === this.selectedSection!.id);
    if (i !== -1) this.sections[i] = { ...this.selectedSection };
  }
  addSection(type: SectionType) {
    const existing = this.sections.find(s => s.type === type);
    if (existing) { existing.enabled = true; return; }
    const meta = SECTION_META[type];
    this.sections.push({
      id     : `s${Date.now()}`,
      type,
      enabled: true,
      title  : meta.label,
      config : {},
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save() {
    const appId = this.appState.currentAppId();
    if (!appId || this.saving) return;
    this.saving = true;

    const payload = {
      name            : this.pageName,
      backgroundColor : this.theme.backgroundColor,
      primaryColor    : this.theme.primaryColor,
      accentColor     : this.theme.accentColor,
      textColor       : this.theme.textColor,
      cardColor       : this.theme.cardColor,
      borderRadius    : this.theme.borderRadius,
      darkMode        : this.theme.darkMode,
      animate         : this.theme.animate,
      showLockedBadges: this.sections.find(s => s.type === 'badges')?.config?.['showLocked'] ?? true,
      badgeColumns    : this.sections.find(s => s.type === 'badges')?.config?.['columns'] ?? 3,
      leaderboardSize : this.sections.find(s => s.type === 'leaderboard')?.config?.['size'] ?? 10,
      leaderboardSortBy: this.sections.find(s => s.type === 'leaderboard')?.config?.['sortBy'] ?? 'points',
      sectionsJson    : JSON.stringify(this.sections),
    };

    this.http.post<any>(`${environment.apiUrl}/api/gamif-page/${appId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.savedKey = res.publishableKey;
          this.saved    = true;
          this.saving   = false;
          setTimeout(() => this.saved = false, 2500);
        },
        error: () => { this.saving = false; }
      });
  }

  // ── Copy snippet ──────────────────────────────────────────────────────────

  copySnippet() {
    if (!this.savedKey) return;
    navigator.clipboard.writeText(
      `// Add this route to your app's navigation:\nGamifPage(apiKey: '${this.savedKey}')`
    );
  }

  // ── Theme helpers ─────────────────────────────────────────────────────────

  setTheme(key: keyof PageTheme, value: any) {
    (this.theme as any)[key] = value;
  }

  getSectionIcon(type: SectionType): string { return SECTION_META[type]?.icon ?? '📦'; }
  getSectionLabel(type: SectionType): string { return SECTION_META[type]?.label ?? type; }
}