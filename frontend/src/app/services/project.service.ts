import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, CreateProjectRequest } from '../models/project.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, request);
  }

  updateProject(id: number, request: CreateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/projects/${id}`, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${id}`);
  }

  addMember(projectId: number, userId: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects/${projectId}/members`, { userId });
  }

  removeMember(projectId: number, userId: number): Observable<Project> {
    return this.http.delete<Project>(`${this.apiUrl}/projects/${projectId}/members/${userId}`);
  }
}