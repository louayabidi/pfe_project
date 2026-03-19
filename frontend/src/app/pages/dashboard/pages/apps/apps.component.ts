import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AppModel, AppModelService } from "src/app/services/app.service";

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AppsComponent implements OnInit {
  apps       = signal<AppModel[]>([]);
  loading    = signal(true);
  error      = signal<string | null>(null);
  copiedKey  = signal<number | null>(null);
  deletingId = signal<number | null>(null);

  constructor(
    private appService: AppModelService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadApps(); }

  trackById(_: number, app: AppModel): number { return app.id; }

  loadApps(): void {
    this.appService.getMyApps().subscribe({
      next: (apps) => {
        this.apps.set(apps);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  copyApiKey(app: AppModel): void {
    navigator.clipboard.writeText(app.apiKey);
    this.copiedKey.set(app.id);
    setTimeout(() => this.copiedKey.set(null), 2000);
  }

  deleteApp(app: AppModel): void {
    if (!confirm(`Supprimer "${app.name}" ?`)) return;
    this.deletingId.set(app.id);
    this.appService.deleteApp(app.id).subscribe({
      next:  () => {
        this.apps.update(l => l.filter(a => a.id !== app.id));
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('Erreur lors de la suppression');
        this.deletingId.set(null);
      }
    });
  }

  goToRules(appId: number): void {
    this.router.navigate(['/dashboard/rules'], { queryParams: { appId } });
  }

  newApp(): void { this.router.navigate(['/dashboard/apps/new']); }
}