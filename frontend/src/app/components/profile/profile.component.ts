import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { AuthResponse } from '../../models/user.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  myTasks: Task[] = [];

  editForm: FormGroup;
  passwordForm: FormGroup;
  showEditForm = false;
  showPasswordForm = false;
  saving = false;
  savingPassword = false;
  hideCurrentPwd = true;
  hideNewPwd = true;

  todoCount = 0;
  inProgressCount = 0;
  doneCount = 0;

  constructor(
    private auth: AuthService,
    private taskService: TaskService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.loadMyTasks();
  }

  loadMyTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.myTasks = tasks;
        this.todoCount = tasks.filter(t => t.status === 'TODO').length;
        this.inProgressCount = tasks.filter(t =>
          t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW').length;
        this.doneCount = tasks.filter(t => t.status === 'DONE').length;
      }
    });
  }

  openEditForm(): void {
    this.editForm.patchValue({
      fullName: this.currentUser?.fullName,
      username: this.currentUser?.username,
      email: this.currentUser?.email
    });
    this.showEditForm = true;
    this.showPasswordForm = false;
  }

  saveProfile(): void {
    if (this.editForm.invalid) return;
    this.saving = true;

    this.auth.updateProfile(this.editForm.value).subscribe({
      next: (updated) => {
        this.currentUser = this.auth.getCurrentUser();
        this.snackbar.open('Profile updated!', 'Close', { duration: 3000 });
        this.showEditForm = false;
        this.saving = false;
      },
      error: (err) => {
        this.snackbar.open(err.error?.error || 'Failed to update profile', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword = true;

    this.auth.updateProfile(this.passwordForm.value).subscribe({
      next: () => {
        this.snackbar.open('Password updated!', 'Close', { duration: 3000 });
        this.passwordForm.reset();
        this.showPasswordForm = false;
        this.savingPassword = false;
      },
      error: (err) => {
        this.snackbar.open(err.error?.error || 'Failed to update password', 'Close', { duration: 3000 });
        this.savingPassword = false;
      }
    });
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return '?';
    return this.currentUser.fullName
      .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getCompletionRate(): number {
    if (this.myTasks.length === 0) return 0;
    return Math.round((this.doneCount / this.myTasks.length) * 100);
  }

  getMemberSince(): string {
    return 'SprintFlow Member';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}