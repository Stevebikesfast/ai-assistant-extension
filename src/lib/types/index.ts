export interface User {
  id: string
  email: string
  name: string
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled'
    plan: 'free' | 'pro'
    validUntil?: string
  }
}

export interface Assistant {
  id: string
  name: string
  description: string
  model: string
  capabilities: string[]
  avatar_url?: string
  free: boolean
  active: boolean
}

export interface Task {
  id: string
  assistant_id: string
  title: string
  description: string
  created_at: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  task_id: string
  assistant_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  status: 'active' | 'completed'
  messages: Message[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
