export interface User {
  id: string
  email: string
  subscription_status: 'free' | 'paid'
}

export interface Assistant {
  id: string
  name: string
  description: string
  active: boolean
}

export interface Task {
  id: string  
  assistant_id: string
  name: string
  description: string
}
