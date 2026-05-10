import { User } from './user.model';

export interface ProjectMember {
  id: number;
  username: string;
  fullName: string;
  avatarColor: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  owner: User;
  members: ProjectMember[];
  taskCount: number;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}