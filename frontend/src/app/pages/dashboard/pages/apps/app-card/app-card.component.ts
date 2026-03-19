import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { AppModel } from '../../../../../services/app.service';

@Component({
  selector: 'app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush  
})
export class AppCardComponent {
  // Reçoit les données du parent
  @Input() app!: AppModel;
  @Input() isDeleting = false;
  @Input() isCopied   = false;

  // Envoie les actions au parent
  @Output() copy    = new EventEmitter<AppModel>();
  @Output() delete  = new EventEmitter<AppModel>();
  @Output() rules   = new EventEmitter<number>();

  // État local à la carte uniquement
  showKey = signal(false);

  toggleKey(): void {
    this.showKey.update(v => !v);
  }

  onCopy(): void    { this.copy.emit(this.app); }
  onDelete(): void  { this.delete.emit(this.app); }
  onRules(): void   { this.rules.emit(this.app.id); }
}