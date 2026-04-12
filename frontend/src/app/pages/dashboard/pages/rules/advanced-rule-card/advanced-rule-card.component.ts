import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AdvancedRule } from '../../../../../services/advanced-rule.service';

@Component({
  selector: 'app-advanced-rule-card',
  templateUrl: './advanced-rule-card.component.html',
  styleUrls: ['./advanced-rule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedRuleCardComponent {
  @Input() rule!: AdvancedRule;
  @Input() confirmingId: number | null = null;

  @Output() toggled = new EventEmitter<AdvancedRule>();
  @Output() deleted = new EventEmitter<number>();

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getActionIcon(type: string): string {
    return { POINTS: '★', BADGE: '🏅', MULTIPLIER: '⚡', CUSTOM: '⚙' }[type] ?? '?';
  }
}