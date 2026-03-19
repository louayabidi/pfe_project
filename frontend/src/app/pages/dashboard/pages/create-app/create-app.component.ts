import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppModelService } from '../../../../services/app.service';

@Component({
  selector: 'app-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss']
})
export class CreateAppComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private appService: AppModelService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.appService.createApp(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard/apps']),
      error: (err) => {
        this.error.set(err.error?.error || 'Erreur lors de la création');
        this.loading.set(false);
      }
    });
  }

  get f() { return this.form.controls; }
}