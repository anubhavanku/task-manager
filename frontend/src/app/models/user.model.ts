export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  avatarColor: string;
}

export interface AuthRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatarColor: string;
}