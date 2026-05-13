import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface ApiError {
  status: number;
  message: string;
  errors: { [key: string]: string } | null;
  timestamp: string;
}
