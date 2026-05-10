import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { AuthResponse } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  myTasks: Task[] = [];
  projects: Project[] = [];
  loading = true;

  // Stats
  todoCount = 0;
  inProgressCount = 0;
  inReviewCount = 0;
  doneCount = 0;
  overdueCount = 0;
  dueTodayCount = 0;

  // Chart data
  taskStatusChartData: any[] = [];
  taskStatusChartLabels: string[] = [];
  priorityChartData: any[] = [];
  priorityChartLabels: string[] = [];

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  };

  constructor(
    private auth: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.projectService.getMyProjects().subscribe({
      next: (projects) => {
        this.projects = projects.filter(p => p.status === 'ACTIVE');
      }
    });

    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.myTasks = tasks;
        this.computeStats(tasks);
        this.buildCharts(tasks);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  computeStats(tasks: Task[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.todoCount = tasks.filter(t => t.status === 'TODO').length;
    this.inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    this.inReviewCount = tasks.filter(t => t.status === 'IN_REVIEW').length;
    this.doneCount = tasks.filter(t => t.status === 'DONE').length;

    this.overdueCount = tasks.filter(t => {
      if (!t.dueDate || t.status === 'DONE') return false;
      return new Date(t.dueDate) < today;
    }).length;

    this.dueTodayCount = tasks.filter(t => {
      if (!t.dueDate || t.status === 'DONE') return false;
      const due = new Date(t.dueDate);
      return due >= today && due < tomorrow;
    }).length;
  }

  buildCharts(tasks: Task[]): void {
    this.taskStatusChartLabels = ['To Do', 'In Progress', 'In Review', 'Done'];
    this.taskStatusChartData = [{
      data: [this.todoCount, this.inProgressCount, this.inReviewCount, this.doneCount],
      backgroundColor: ['#6b7280', '#3b82f6', '#f59e0b', '#10b981'],
      borderWidth: 0
    }];

    const low = tasks.filter(t => t.priority === 'LOW').length;
    const medium = tasks.filter(t => t.priority === 'MEDIUM').length;
    const high = tasks.filter(t => t.priority === 'HIGH').length;
    const critical = tasks.filter(t => t.priority === 'CRITICAL').length;

    this.priorityChartLabels = ['Low', 'Medium', 'High', 'Critical'];
    this.priorityChartData = [{
      data: [low, medium, high, critical],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0
    }];
  }

  goToBoard(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'board']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      TODO: '#6b7280',
      IN_PROGRESS: '#3b82f6',
      IN_REVIEW: '#f59e0b',
      DONE: '#10b981'
    };
    return colors[status] || '#888';
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      LOW: '#10b981',
      MEDIUM: '#3b82f6',
      HIGH: '#f59e0b',
      CRITICAL: '#ef4444'
    };
    return colors[priority] || '#888';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}