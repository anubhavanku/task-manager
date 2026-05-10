import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { WebsocketService } from '../../services/websocket.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { Task, TaskStatus } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  projectId: number = 0;
  loading = true;
  currentUsername = '';

  columns: { status: TaskStatus; label: string; icon: string; color: string; tasks: Task[] }[] = [
    { status: 'TODO', label: 'To Do', icon: 'radio_button_unchecked', color: '#6b7280', tasks: [] },
    { status: 'IN_PROGRESS', label: 'In Progress', icon: 'autorenew', color: '#3b82f6', tasks: [] },
    { status: 'IN_REVIEW', label: 'In Review', icon: 'rate_review', color: '#f59e0b', tasks: [] },
    { status: 'DONE', label: 'Done', icon: 'check_circle', color: '#10b981', tasks: [] }
  ];

  priorityColors: Record<string, string> = {
    LOW: '#10b981',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444'
  };

  private wsSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private wsService: WebsocketService,
    private auth: AuthService,
    private confirm: ConfirmService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUsername = this.auth.getCurrentUser()?.username || '';
    this.loadProject();
    this.loadTasks();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.wsService.disconnect();
  }

  loadProject(): void {
    this.projectService.getProject(this.projectId).subscribe({
      next: (p) => this.project = p
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getProjectTasks(this.projectId).subscribe({
      next: (tasks) => {
        this.columns.forEach(col => {
          col.tasks = tasks
            .filter(t => t.status === col.status)
            .sort((a, b) => a.position - b.position);
        });
        this.loading = false;
      },
      error: () => {
        this.snackbar.open('Failed to load tasks', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  connectWebSocket(): void {
    this.wsService.connect(this.projectId);
    this.wsSub = this.wsService.message$.subscribe(msg => {
      if (msg.actor === this.currentUsername) return;
      this.loadTasks();
      this.snackbar.open(
        `${msg.actor} ${msg.type === 'TASK_MOVED' ? 'moved a task' :
          msg.type === 'TASK_CREATED' ? 'created a task' :
            msg.type === 'TASK_DELETED' ? 'deleted a task' : 'updated a task'}`,
        'Close', { duration: 3000 }
      );
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    const task = event.container.data[event.currentIndex];
    this.taskService.moveTask(task.id, {
      newStatus: targetStatus,
      newPosition: event.currentIndex
    }).subscribe({
      error: () => {
        this.snackbar.open('Failed to move task', 'Close', { duration: 3000 });
        this.loadTasks();
      }
    });
  }

  openCreateTask(): void {
    if (!this.project) {
      this.snackbar.open('Project still loading, try again', 'Close', { duration: 2000 });
      return;
    }
    const ref = this.dialog.open(TaskFormComponent, {
      width: '560px',
      data: { projectId: this.projectId, project: this.project, mode: 'create' }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  openEditTask(task: Task, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(TaskFormComponent, {
      width: '560px',
      data: { projectId: this.projectId, project: this.project, mode: 'edit', task }
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  openTaskDetail(task: Task): void {
    const ref = this.dialog.open(TaskDetailComponent, {
      width: '700px',
      data: { taskId: task.id, projectId: this.projectId, project: this.project }
    });
    ref.afterClosed().subscribe(result => {
      if (result?.deleted || result?.updated) this.loadTasks();
    });
  }

  deleteTask(task: Task, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Delete Task',
      message: `Delete "${task.title}"? This cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'warn'
    }).subscribe(result => {
      if (!result) return;
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.snackbar.open('Task deleted', 'Close', { duration: 3000 });
          this.loadTasks();
        },
        error: () => this.snackbar.open('Failed to delete task', 'Close', { duration: 3000 })
      });
    });
  }

  getColumnIds(): string[] {
    return this.columns.map(c => c.status);
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}