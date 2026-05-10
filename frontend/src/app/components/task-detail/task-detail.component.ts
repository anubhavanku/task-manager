import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { CommentService } from '../../services/comment.service';
import { ConfirmService } from '../../services/confirm.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { Comment } from '../../models/comment.model';
import { TaskActivity } from '../../models/activity.model';
import { TaskFormComponent } from '../task-form/task-form.component';

export interface TaskDetailData {
  taskId: number;
  projectId: number;
  project?: any;
}

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  comments: Comment[] = [];
  activities: TaskActivity[] = [];
  loading = true;
  newComment = '';
  submittingComment = false;
  activeTab = 0;
  currentUserId: number = 0;

  priorityColors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444'
  };

  statusColors: Record<string, string> = {
    TODO: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    IN_REVIEW: '#f59e0b',
    DONE: '#10b981'
  };

  constructor(
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDetailData,
    private taskService: TaskService,
    private commentService: CommentService,
    private confirmService: ConfirmService,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.auth.getCurrentUser()?.id || 0;
    this.loadTask();
    this.loadComments();
    this.loadActivity();
  }

  loadTask(): void {
    this.taskService.getTask(this.data.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: () => {
        this.snackbar.open('Failed to load task', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadComments(): void {
    this.commentService.getComments(this.data.taskId).subscribe({
      next: (comments) => this.comments = comments
    });
  }

  loadActivity(): void {
    this.taskService.getTaskActivity(this.data.taskId).subscribe({
      next: (activities) => this.activities = activities
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    this.submittingComment = true;
    this.commentService.addComment(this.data.taskId, this.newComment).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.newComment = '';
        this.submittingComment = false;
        if (this.task) this.task.commentCount++;
      },
      error: () => {
        this.snackbar.open('Failed to add comment', 'Close', { duration: 3000 });
        this.submittingComment = false;
      }
    });
  }

  deleteComment(comment: Comment): void {
    this.confirmService.confirm({
      title: 'Delete Comment',
      message: 'Delete this comment? This cannot be undone.',
      confirmText: 'Delete',
      confirmColor: 'warn'
    }).subscribe(result => {
      if (!result) return;
      this.commentService.deleteComment(comment.id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== comment.id);
          if (this.task) this.task.commentCount--;
          this.snackbar.open('Comment deleted', 'Close', { duration: 3000 });
        },
        error: () => this.snackbar.open('Failed to delete comment', 'Close', { duration: 3000 })
      });
    });
  }

  openEditTask(): void {
    if (!this.task) return;
    const ref = this.dialog.open(TaskFormComponent, {
      width: '560px',
      data: {
        projectId: this.data.projectId,
        project: this.data.project || { members: [] },
        mode: 'edit',
        task: this.task
      }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadTask();
        this.loadActivity();
        this.dialogRef.close({ updated: true });
      }
    });
  }

  deleteTask(): void {
    this.confirmService.confirm({
      title: 'Delete Task',
      message: `Delete "${this.task?.title}"? This cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'warn'
    }).subscribe(result => {
      if (!result) return;
      this.taskService.deleteTask(this.data.taskId).subscribe({
        next: () => {
          this.snackbar.open('Task deleted', 'Close', { duration: 3000 });
          this.dialogRef.close({ deleted: true });
        },
        error: () => this.snackbar.open('Failed to delete task', 'Close', { duration: 3000 })
      });
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  isOverdue(): boolean {
    if (!this.task?.dueDate || this.task.status === 'DONE') return false;
    return new Date(this.task.dueDate) < new Date();
  }
}