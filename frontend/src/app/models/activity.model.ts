import { User } from './user.model';

export interface TaskActivity {
  id: number;
  action: string;
  oldValue: string;
  newValue: string;
  user: User;
  createdAt: string;
}