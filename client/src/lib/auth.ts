import { queryClient } from "./queryClient";

export interface User {
  id: number;
  email: string;
  name: string;
  location?: string;
  profilePicture?: string;
  skillsOffered?: Array<{ id: number; name: string; type: string }>;
  availability?: Array<{ id: number; timeSlot: string }>;
}

export interface AuthResponse {
  user: User;
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error("Failed to get current user");
    }
    
    const data: AuthResponse = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const data: AuthResponse = await response.json();
  
  // Invalidate and refetch user data
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  return data.user;
};

export const signup = async (email: string, password: string, name: string): Promise<User> => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Signup failed");
  }

  const data: AuthResponse = await response.json();
  
  // Invalidate and refetch user data
  queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  
  return data.user;
};

export const logout = async (): Promise<void> => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  // Invalidate all queries
  queryClient.invalidateQueries();
};
