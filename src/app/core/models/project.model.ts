import { User } from './user.model';

export interface ProjectRequest {
  name: string;
  description: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  createdBy: User;
  memberCount: number;
  taskCount: number;
  createdAt: string;
}

export interface AddMemberRequest {
  userId: number;
}
