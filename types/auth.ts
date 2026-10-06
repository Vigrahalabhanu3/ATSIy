export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
