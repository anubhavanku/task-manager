import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  isAdmin = false;
  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  selectedProject: Project | null = null;

  name = '';
  description = '';
  submitting = false;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getMyProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: () => {
        this.snackbar.open('Failed to load projects', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.formMode = 'create';
    this.name = '';
    this.description = '';
    this.selectedProject = null;
    this.showForm = true;
  }

  openEditForm(project: Project, event: Event): void {
    event.stopPropagation();
    this.formMode = 'edit';
    this.name = project.name;
    this.description = project.description;
    this.selectedProject = project;
    this.showForm = true;
  }

  submitForm(): void {
    if (!this.name.trim()) return;
    this.submitting = true;

    const request = { name: this.name, description: this.description };

    if (this.formMode === 'create') {
      this.projectService.createProject(request).subscribe({
        next: () => {
          this.snackbar.open('Project created!', 'Close', { duration: 3000 });
          this.showForm = false;
          this.loadProjects();
          this.submitting = false;
        },
        error: () => {
          this.snackbar.open('Failed to create project', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      this.projectService.updateProject(this.selectedProject!.id, request).subscribe({
        next: () => {
          this.snackbar.open('Project updated!', 'Close', { duration: 3000 });
          this.showForm = false;
          this.loadProjects();
          this.submitting = false;
        },
        error: () => {
          this.snackbar.open('Failed to update project', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  deleteProject(project: Project, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.snackbar.open('Project deleted', 'Close', { duration: 3000 });
        this.loadProjects();
      },
      error: () => {
        this.snackbar.open('Failed to delete project', 'Close', { duration: 3000 });
      }
    });
  }

  goToBoard(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'board']);
  }

  goToDetail(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  getStatusColor(status: string): string {
    return status === 'ACTIVE' ? '#4caf50' : '#ff9800';
  }

  getMemberCount(project: Project): number {
    return project.members?.length || 0;
  }
}