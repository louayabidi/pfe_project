import {
  Component, ChangeDetectionStrategy, OnInit, signal
} from '@angular/core';
import { AdminApiService, AdminUser } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminsComponent implements OnInit {

  // ── list state ─────────────────────────────────────────────────────────────
  admins  = signal<AdminUser[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  // ── modal state ────────────────────────────────────────────────────────────
  modalOpen    = signal(false);
  submitting   = signal(false);
  modalError   = signal<string | null>(null);
  showPassword = signal(false);
  touched      = signal(false);

  form = {
    fullName: '',
    email:    '',
    password: ''
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void { this.loadAdmins(); }

  // ── list ───────────────────────────────────────────────────────────────────

  loadAdmins(): void {
    this.loading.set(true);
    this.adminApi.getAdmins().subscribe({
      next:  data => { this.admins.set(data); this.loading.set(false); },
      error: ()   => {
        this.error.set('You do not have permission to view this page.');
        this.loading.set(false);
      }
    });
  }

  onToggleStatus(admin: AdminUser): void {
    this.adminApi.toggleAdmin(admin.id).subscribe({
      next: updated =>
        this.admins.update(list => list.map(a => a.id === updated.id ? updated : a))
    });
  }

  // ── modal ──────────────────────────────────────────────────────────────────

  openModal(): void {
    this.form = { fullName: '', email: '', password: '' };
    this.touched.set(false);
    this.modalError.set(null);
    this.showPassword.set(false);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    if (this.submitting()) return;
    this.modalOpen.set(false);
  }

  fieldError(field: 'fullName' | 'email' | 'password'): boolean {
    if (!this.touched()) return false;
    if (field === 'fullName') return !this.form.fullName.trim();
    if (field === 'email')    return !this.isValidEmail(this.form.email);
    if (field === 'password') return this.form.password.length < 8;
    return false;
  }

  onSubmit(): void {
    this.touched.set(true);
    this.modalError.set(null);

    const hasError =
      !this.form.fullName.trim() ||
      !this.isValidEmail(this.form.email) ||
      this.form.password.length < 8;

    if (hasError) return;

    this.submitting.set(true);
    this.adminApi.createAdmin({
      fullName: this.form.fullName.trim(),
      email:    this.form.email.trim(),
      password: this.form.password
    }).subscribe({
      next: created => {
        this.admins.update(list => [...list, created]);
        this.submitting.set(false);
        this.modalOpen.set(false);
      },
      error: (err) => {
        this.modalError.set(
          err?.error?.message ?? err?.message ?? 'Failed to create admin. Email may already be in use.'
        );
        this.submitting.set(false);
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}