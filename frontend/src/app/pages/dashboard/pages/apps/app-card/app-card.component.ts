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
  @Input() app!: AppModel;
  @Input() isDeleting = false;
  @Input() isCopied   = false;

  @Output() copy   = new EventEmitter<AppModel>();
  @Output() delete = new EventEmitter<AppModel>();
  @Output() rules  = new EventEmitter<number>();
  @Output() update = new EventEmitter<AppModel>();

  showKey = signal(false);
  editing = signal(false);

  toggleKey(): void  { this.showKey.update(v => !v); }
  onCopy(): void     { this.copy.emit(this.app); }
  onDelete(): void   { this.delete.emit(this.app); }
  onRules(): void    { this.rules.emit(this.app.id); }
  onEdit(): void     { this.editing.set(true); }
  onCancelEdit(): void { this.editing.set(false); }
  onSaved(updated: AppModel): void {
    this.editing.set(false);
    this.update.emit(updated);
  }
}