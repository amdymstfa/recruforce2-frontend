import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService, CreateUserRequest } from '../../../core/services/user';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(false);
  showForm = signal(false);
  isEditMode = signal(false);
  editingUserId = signal<number | null>(null);

  error = signal<string | null>(null);
  success = signal<string | null>(null);
  deleteConfirm = signal<number | null>(null);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    phone:     [''],
    role:      ['RECRUITER', Validators.required]
  });

  roles = [
    { value: 'RECRUITER', label: 'Recruteur', color: 'blue' },
    { value: 'MANAGER',   label: 'Manager',   color: 'amber' },
    { value: 'ADMIN',     label: 'Admin',     color: 'rose' },
  ];

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) this.resetFormState();
  }

  private resetFormState(): void {
    this.isEditMode.set(false);
    this.editingUserId.set(null);
    this.form.reset({ role: 'RECRUITER' });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
  }

  editUser(user: User): void {
    this.isEditMode.set(true);
    this.editingUserId.set(user.id);
    this.showForm.set(true);
    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
  }

  saveUser(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode()) {
      this.userService.update(this.editingUserId()!, this.form.value as Partial<User>).subscribe({
        next: () => this.handleSuccess('Profil mis à jour'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.userService.createUser(this.form.value as CreateUserRequest).subscribe({
        next: () => this.handleSuccess('Compte créé avec succès'),
        error: (err) => this.handleError(err)
      });
    }
  }

  // MÉTHODE UNIQUE DE RÉACTIVATION
  reactivateUser(user: User): void {
    this.loading.set(true);
    // On repasse isActive à true via un update
    this.userService.update(user.id, { ...user, isActive: true }).subscribe({
      next: () => {
        this.success.set(`${user.firstName} est à nouveau actif.`);
        this.loadUsers();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set("Erreur lors de la réactivation");
        this.loading.set(false);
      }
    });
  }

  private handleSuccess(msg: string): void {
    this.success.set(msg);
    this.showForm.set(false);
    this.resetFormState();
    this.loadUsers();
    setTimeout(() => this.success.set(null), 3000);
  }

  private handleError(err: any): void {
    this.error.set(err?.error?.message ?? "Une erreur est survenue");
    this.loading.set(false);
  }

  confirmDelete(id: number): void { this.deleteConfirm.set(id); }
  cancelDelete(): void { this.deleteConfirm.set(null); }

  deleteUser(id: number): void {
    this.userService.delete(id).subscribe({
      next: () => {
        this.deleteConfirm.set(null);
        this.success.set("Utilisateur désactivé");
        this.loadUsers();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set("Erreur lors de la désactivation");
        this.deleteConfirm.set(null);
      }
    });
  }

  getRoleInfo(role: string) {
    return this.roles.find(r => r.value === role) ?? { value: role, label: role, color: 'gray' };
  }

  getInitials(u: User): string {
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  countByRole = (role: string) => this.users().filter(u => u.role === role).length;
  countActive = () => this.users().filter(u => u.isActive !== false).length;
}