import {
  Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';

export type SettingsSection =
  | 'general'
  | 'notifications'
  | 'security'
  | 'api'
  | 'webhooks'
  | 'sdk'
  | 'billing'
  | 'danger';

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: string;
  badge?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {

  // ── State ──────────────────────────────────────────────────────────────────
  activeSection = signal<SettingsSection>('general');
  saving        = signal(false);
  saved         = signal(false);
  apiKeyVisible = signal(false);
  copied        = signal(false);

  // ── Notification toggles ──────────────────────────────────────────────────
  notif = signal({
    badgeUnlock:    true,
    milestone:      true,
    weeklyDigest:   false,
    sdkErrors:      true,
    newUser:        false,
    ruleTriggered:  false,
  });

  // ── SDK config ────────────────────────────────────────────────────────────
  sdkConfig = signal({
    defaultMultiplier: 1.0,
    eventCooldown:     60,
    maxEventsPerDay:   500,
    sandboxMode:       false,
    verboseLogging:    false,
  });

  // ── Webhook list ──────────────────────────────────────────────────────────
  webhooks = signal([
    { id: 1, url: 'https://hooks.example.com/gamify', events: ['badge.awarded', 'points.added'], active: true },
  ]);
  showWebhookForm = signal(false);

  // ── Plan / billing ────────────────────────────────────────────────────────
  plan = signal({
    name: 'Pro',
    eventsUsed: 18_420,
    eventsLimit: 50_000,
    appsUsed: 3,
    appsLimit: 10,
    rulesUsed: 27,
    rulesLimit: 100,
    nextBilling: '2026-06-05',
  });

  // ── Nav ───────────────────────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    { id: 'general',       label: 'General',        icon: 'user' },
    { id: 'notifications', label: 'Notifications',  icon: 'bell' },
    { id: 'security',      label: 'Security',       icon: 'lock' },
    { id: 'api',           label: 'API & Keys',     icon: 'key' },
    { id: 'webhooks',      label: 'Webhooks',       icon: 'zap',  badge: '1' },
    { id: 'sdk',           label: 'SDK Config',     icon: 'code' },
    { id: 'billing',       label: 'Billing',        icon: 'credit-card', badge: 'Pro' },
    { id: 'danger',        label: 'Danger Zone',    icon: 'alert', danger: true },
  ];

  // ── Forms ─────────────────────────────────────────────────────────────────
  generalForm!: FormGroup;
  passwordForm!: FormGroup;
  webhookForm!: FormGroup;

  
  // ── Mocked API key ────────────────────────────────────────────────────────
  // NOSONAR - demo key for UI display only, not a real secret
  readonly demoApiKey = 'sk_live_gfy_8fK2mNpQrXvZwL9dBjT4sYeHuC3a'; // NOSONAR
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadProfile();
  }

  private buildForms(): void {
    this.generalForm = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(2)]],
      companyName: [''],
      timezone:    ['Europe/Paris'],
      language:    ['fr'],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });

    this.webhookForm = this.fb.group({
      url:    ['', [Validators.required, Validators.pattern('https?://.+')]],
      events: [[]],
    });
  }

  private loadProfile(): void {
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => {
        this.generalForm.patchValue({
          fullName:    p.fullName,
          companyName: p.companyName ?? '',
        });
      });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  setSection(id: SettingsSection): void { this.activeSection.set(id); }

  saveGeneral(): void {
    if (this.generalForm.invalid) { this.generalForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const { fullName, companyName } = this.generalForm.value;
    this.profileService.updateProfile({ fullName, companyName })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.saving.set(false); this.flashSaved(); },
        error: () => this.saving.set(false),
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const v = this.passwordForm.value;
    if (v.newPassword !== v.confirmPassword) return;
    this.saving.set(true);
    this.profileService.changePassword({
      currentPassword: v.currentPassword,
      newPassword:     v.newPassword,
      confirmPassword: v.confirmPassword,
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => { this.passwordForm.reset(); this.saving.set(false); this.flashSaved(); },
      error: () => this.saving.set(false),
    });
  }

  toggleNotif(key: keyof ReturnType<typeof this.notif>): void {
    this.notif.update(n => ({ ...n, [key]: !n[key] }));
  }

  setSdkConfig(key: string, value: any): void {
    this.sdkConfig.update(c => ({ ...c, [key]: value }));
  }

 copyApiKey(): void {
  navigator.clipboard.writeText(this.demoApiKey);
  this.copied.set(true);
  setTimeout(() => this.copied.set(false), 2000);
}
  toggleApiKeyVisibility(): void { this.apiKeyVisible.update(v => !v); }

 maskedKey(): string {
  return this.apiKeyVisible()
    ? this.demoApiKey
    : this.demoApiKey.substring(0, 12) + '••••••••••••••••••' + this.demoApiKey.slice(-4);
}

  usagePct(used: number, limit: number): number {
    return Math.min((used / limit) * 100, 100);
  }

  formatNum(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  }

  addWebhook(): void {
    if (this.webhookForm.invalid) return;
    const { url, events } = this.webhookForm.value;
    this.webhooks.update(w => [
      ...w,
      { id: Date.now(), url, events: events ?? [], active: true }
    ]);
    this.webhookForm.reset();
    this.showWebhookForm.set(false);
  }

  deleteWebhook(id: number): void {
    this.webhooks.update(w => w.filter(x => x.id !== id));
  }

  saveSdkConfig(): void { this.flashSaved(); }

  flashSaved(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}