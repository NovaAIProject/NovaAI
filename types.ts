export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  model: 'gpt-4' | 'claude-3-5-sonnet'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type AIModel = 'gpt-4' | 'claude-3-5-sonnet'
