import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, signal
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppModel, AppModelService } from '../../../../../services/app.service';

@Component({
  selector: 'app-edit-app-modal',
  templateUrl: './edit-app-modal.component.html',
  styleUrls: ['./edit-app-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAppModalComponent implements OnInit {
  @Input() app!: AppModel;
  @Output() saved  = new EventEmitter<AppModel>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  saving = signal(false);
  error  = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private appService: AppModelService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        [this.app.name,        [Validators.required, Validators.minLength(2)]],
      description: [this.app.description ?? '']
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set(null);

    const payload = {
      name:        this.form.value.name.trim(),
      description: this.form.value.description?.trim() || null
    };

    this.appService.updateApp(this.app.id, payload).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.saved.emit(updated);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Erreur lors de la mise à jour');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void { this.cancel.emit(); }
}