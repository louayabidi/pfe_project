import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { Rule } from '../../../../../services/rule.service';

@Component({
  selector: 'app-rule-card',
  templateUrl: './rule-card.component.html',
  styleUrls: ['./rule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush  // ← clé de la performance
})
export class RuleCardComponent {
  @Input()  rule!: Rule;
  @Input()  confirmingId: number | null = null;

  @Output() toggled   = new EventEmitter<Rule>();
  @Output() deleted   = new EventEmitter<number>();
  @Output() edited    = new EventEmitter<number>();

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}