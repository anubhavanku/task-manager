import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project, ProjectMember } from '../../models/project.model';
import { User } from '../../models/user.model';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  isAdmin = false;
  currentUserId: number = 0;

  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  showMemberPanel = false;
  addingMember = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private projectService: ProjectService,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private confirm: ConfirmService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.currentUserId = this.auth.getCurrentUser()?.id || 0;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(id);
    if (this.isAdmin) this.loadAllUsers();
  }

  loadProject(id: number): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe({
      next: (data) => {
        this.project = data;
        this.filterUsers();
        this.loading = false;
      },
      error: () => {
        this.snackbar.open('Failed to load project', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadAllUsers(): void {
    this.auth.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.filterUsers();
      }
    });
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase();
    const memberIds = this.project?.members.map(m => m.id) || [];
    this.filteredUsers = this.allUsers.filter(u =>
      !memberIds.includes(u.id) &&
      (u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
    );
  }

  addMember(userId: number): void {
    if (!this.project) return;
    this.addingMember = true;
    this.projectService.addMember(this.project.id, userId).subscribe({
      next: () => {
        this.loadProject(this.project!.id);
        this.filterUsers();
        this.snackbar.open('Member added!', 'Close', { duration: 3000 });
        this.addingMember = false;
      },
      error: () => {
        this.snackbar.open('Failed to add member', 'Close', { duration: 3000 });
        this.addingMember = false;
      }
    });
  }

  removeMember(userId: number): void {
    if (!this.project) return;
    this.confirm.confirm({
      title: 'Remove Member',
      message: 'Remove this member from the project?',
      confirmText: 'Remove',
      confirmColor: 'warn'
    }).subscribe(result => {
      if (!result) return;
      this.projectService.removeMember(this.project!.id, userId).subscribe({
        next: () => {
          this.loadProject(this.project!.id);
          this.snackbar.open('Member removed', 'Close', { duration: 3000 });
        },
        error: () => this.snackbar.open('Failed to remove member', 'Close', { duration: 3000 })
      });
    });
  }

  goToBoard(): void {
    this.router.navigate(['/projects', this.project?.id, 'board']);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'OWNER': return '#f59e0b';
      case 'ADMIN': return '#6c63ff';
      default: return '#6b7280';
    }
  }
}