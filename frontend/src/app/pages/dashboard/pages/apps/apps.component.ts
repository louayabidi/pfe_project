import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AppModel, AppModelService } from "src/app/services/app.service";
import { AppStateService } from "src/app/services/app-state.service";

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
    private appState: AppStateService,  // ✅ ajouté
    private router: Router
    // ✅ ChangeDetectorRef supprimé — inutile avec OnPush + signals
  ) {}

  ngOnInit(): void { this.loadApps(); }

  trackById(_: number, app: AppModel): number { return app.id; }

  loadApps(): void {
    this.appService.getMyApps().subscribe({
      next: (apps) => {
        this.apps.set(apps);
        this.appState.initialize().subscribe(); // ✅ sync avec AppStateService
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

  // ✅ Sélectionner l'app et naviguer vers ses events
  selectApp(app: AppModel): void {
    this.appState.selectApp(app.id);
    this.router.navigate(['/dashboard/events'], { queryParams: { appId: app.id } });
  }

  deleteApp(app: AppModel): void {
    if (!confirm(`Supprimer "${app.name}" ?`)) return;
    this.deletingId.set(app.id);
    this.appService.deleteApp(app.id).subscribe({
      next: () => {
        this.apps.update(l => l.filter(a => a.id !== app.id));
        this.appState.reloadApps().subscribe(); // ✅ sync état global après suppression
        this.deletingId.set(null);
      },
      error: () => {
        this.error.set('Erreur lors de la suppression');
        this.deletingId.set(null);
      }
    });
  }

  goToRules(appId: number): void {
    this.appState.selectApp(appId);             // ✅ sélectionner avant de naviguer
    this.router.navigate(['/dashboard/rules'], { queryParams: { appId } });
  }

  goToBadges(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/badges'], { queryParams: { appId } });
  }

  goToEvents(appId: number): void {
    this.appState.selectApp(appId);
    this.router.navigate(['/dashboard/events'], { queryParams: { appId } });
  }

  newApp(): void { this.router.navigate(['/dashboard/apps/new']); }
}