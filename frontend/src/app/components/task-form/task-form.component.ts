import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';

export interface TaskFormData {
  projectId: number;
  project: Project;
  mode: 'create' | 'edit';
  task?: Task;
}

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  members: User[] = [];

  priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

  priorityColors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444'
  };

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskFormData
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      priority: ['MEDIUM', Validators.required],
      status: ['TODO', Validators.required],
      dueDate: [null],
      assigneeId: [null]
    });
  }

  ngOnInit(): void {
    console.log('Project data received:', this.data.project);
    console.log('Members:', this.data.project?.members);
    this.members = this.data.project?.members?.map(m => ({
      id: m.id,
      username: m.username,
      fullName: m.fullName,
      avatarColor: m.avatarColor,
      email: '',
      role: 'MEMBER' as any
    })) || [];

    console.log('Members loaded:', this.members);

    if (this.data.mode === 'edit' && this.data.task) {
      const t = this.data.task;
      this.form.patchValue({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        assigneeId: t.assignee?.id || null
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const val = this.form.value;
    const request = {
      title: val.title,
      description: val.description,
      priority: val.priority,
      status: val.status,
      dueDate: val.dueDate ? this.formatDate(new Date(val.dueDate)) : null,
      assigneeId: val.assigneeId ? Number(val.assigneeId) : null
    };

    if (this.data.mode === 'create') {
      this.taskService.createTask(this.data.projectId, request).subscribe({
        next: () => {
          this.snackbar.open('Task created!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackbar.open('Failed to create task', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.taskService.updateTask(this.data.task!.id, request).subscribe({
        next: () => {
          this.snackbar.open('Task updated!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackbar.open('Failed to update task', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}