import { User } from './user.model';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assignedToId: number;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  projectId: number;
  projectName: string;
  assignedTo: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface StatusUpdateRequest {
  status: TaskStatus;
}
