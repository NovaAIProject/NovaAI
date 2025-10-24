import { NextRequest } from 'next/server'
import { streamAIResponse } from './lib'
import { supabase } from './lib'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, message, model, messages } = await req.json()

    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    const stream = await streamAIResponse(messages, model)

    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('AI API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
