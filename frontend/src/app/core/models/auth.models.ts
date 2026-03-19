export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  // companyName intentionally omitted — added later when creating an app
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  companyName: string;
  message: string;
  verified: boolean;
  token: string;
}

export interface AuthState {
  user: AuthResponse | null;
  isLoggedIn: boolean;
}