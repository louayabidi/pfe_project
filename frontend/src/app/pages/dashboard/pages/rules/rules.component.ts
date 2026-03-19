import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleService, Rule } from '../../../../services/rule.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  rules        = signal<Rule[]>([]);
  loading      = signal(true);
  confirmingId = signal<number | null>(null);
  appId!: number;

  // Computed : nb de règles actives
  activeCount = computed(() => this.rules().filter(r => r.active).length);

  constructor(
    private ruleService: RuleService,
    private router:      Router,
    private route:       ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.appId = Number(params['appId']);
      if (this.appId) this.loadRules();
    });
  }

  loadRules(): void {
    this.loading.set(true);
    this.ruleService.getRules(this.appId).subscribe({
      next:  (rules) => { this.rules.set(rules); this.loading.set(false); },
      error: ()      => this.loading.set(false)
    });
  }

  toggle(rule: Rule): void {
    this.ruleService.toggleRule(rule.id, !rule.active).subscribe({
      next: (updated) => this.rules.update(list =>
        list.map(r => r.id === updated.id ? updated : r)
      )
    });
  }

  // Suppression avec double-clic de confirmation
  delete(ruleId: number): void {
    if (this.confirmingId() !== ruleId) {
      this.confirmingId.set(ruleId);
      // Reset automatique après 3s si pas confirmé
      setTimeout(() => {
        if (this.confirmingId() === ruleId) this.confirmingId.set(null);
      }, 3000);
      return;
    }
    this.ruleService.deleteRule(ruleId).subscribe({
      next: () => {
        this.rules.update(list => list.filter(r => r.id !== ruleId));
        this.confirmingId.set(null);
      }
    });
  }

  editRule(ruleId: number): void {
    this.router.navigate(['/dashboard/rules', ruleId, 'edit'], {
      queryParams: { appId: this.appId }
    });
  }

  newRule(): void {
    this.router.navigate(['/dashboard/rules/new'], {
      queryParams: { appId: this.appId }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric'
    });
  }
}