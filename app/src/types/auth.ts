export interface AuthUserProfile {
  id: string;
  email: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: AuthUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
