// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

// Service Request types
export interface ServiceRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'New' | 'In Progress' | 'Completed' | 'Archived';
  location: string;
  photo_url?: string;
  ai_summary?: string;
  ai_next_action?: string;
  ai_confidence?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  photo_url?: string;
}

export interface UpdateRequestInput {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  location?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
}