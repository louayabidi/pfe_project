import {
  Component, OnInit, signal, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, ProfileResponse } from 'src/app/services/profile.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit, OnDestroy {

  profile      = signal<ProfileResponse | null>(null);
  loading      = signal(true);
  saving       = signal(false);
  changingPwd  = signal(false);
  error        = signal<string | null>(null);
  success      = signal<string | null>(null);
  pwdError     = signal<string | null>(null);
  pwdSuccess   = signal<string | null>(null);
  editMode     = signal(false);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForms(): void {
    this.profileForm = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(2)]],
      companyName: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.profileForm.patchValue({
            fullName:    p.fullName,
            companyName: p.companyName
          });
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.error.set('Impossible de charger le profil');
          this.loading.set(false);
        }
      });
  }

  toggleEdit(): void {
    this.editMode.update(v => !v);
    this.success.set(null);
    this.error.set(null);
    if (!this.editMode()) {
      const p = this.profile();
      if (p) {
        this.profileForm.patchValue({
          fullName: p.fullName,
          companyName: p.companyName
        });
      }
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const { fullName, companyName } = this.profileForm.value;

    this.profileService.updateProfile({ fullName, companyName })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.profile.set(p);
          this.saving.set(false);
          this.editMode.set(false);
          this.success.set('✓ Profil mis à jour avec succès');
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.error.set(err.error?.message || 'Erreur lors de la mise à jour');
          this.saving.set(false);
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const v = this.passwordForm.value;
    if (v.newPassword !== v.confirmPassword) {
      this.pwdError.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.changingPwd.set(true);
    this.pwdError.set(null);
    this.pwdSuccess.set(null);

this.profileService.changePassword({
  currentPassword: v.currentPassword,
  newPassword: v.newPassword,
  confirmPassword: v.confirmPassword
})      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.changingPwd.set(false);
          this.pwdSuccess.set('✓ Mot de passe changé avec succès');
          this.passwordForm.reset();
          setTimeout(() => this.pwdSuccess.set(null), 3000);
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.pwdError.set(err.error?.message || 'Erreur lors du changement');
          this.changingPwd.set(false);
        }
      });
  }

  getInitials(): string {
    const name = this.profile()?.fullName ?? '';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  }

  formatDate(d: string | null | undefined): string {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  }
}
