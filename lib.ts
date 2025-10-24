// Supabase Client
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// AI Service
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function streamAIResponse(messages: any[], model: 'gpt-4' | 'claude-3-5-sonnet') {
  if (model === 'gpt-4') {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    })
    return stream
  } else {
    const claudeMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user' as const,
      content: msg.content
    }))
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: claudeMessages,
    })
    return stream
  }
      }
