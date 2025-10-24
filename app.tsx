'use client'

import { useState, useEffect } from 'react'
import { AuthForm, ChatMessages, Sidebar } from './components'
import { supabase } from './lib'
import type { UserProfile, Conversation, Message } from './types'

export default function NovaAI() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(checkUser)
    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      setUser(profile)
      loadConversations()
    }
  }

  const loadConversations = async () => {
    const { data } = await supabase.from('conversations').select('*').order('updated_at', { ascending: false })
    setConversations(data || [])
  }

  const createNewConversation = async (model: 'gpt-4' | 'claude-3-5-sonnet' = 'gpt-4') => {
    const { data: conversation } = await supabase.from('conversations').insert([{ user_id: user!.id, title: 'New Chat', model }]).select().single()
    if (conversation) {
      setConversations(prev => [conversation, ...prev])
      setCurrentConversation(conversation)
      setMessages([])
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return
    
    setIsLoading(true)
    // Add user message
    const { data: userMessage } = await supabase.from('messages').insert([{ conversation_id: currentConversation.id, role: 'user', content }]).select().single()

    if (userMessage) setMessages(prev => [...prev, userMessage])

    // Get AI response
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: currentConversation.id,
        message: content,
        model: currentConversation.model,
        messages: messages.concat(userMessage ? [userMessage] : [])
      })
    })

    if (response.ok) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantMessage += chunk
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...lastMessage, content: assistantMessage }]
          } else {
            return [...prev, { id: 'temp', conversation_id: currentConversation.id, role: 'assistant', content: assistantMessage, created_at: new Date().toISOString() }]
          }
        })
      }

      await supabase.from('messages').insert([{ conversation_id: currentConversation.id, role: 'assistant', content: assistantMessage }])
      
      if (messages.length === 0 && userMessage) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        await supabase.from('conversations').update({ title }).eq('id', currentConversation.id)
      }
    }
    setIsLoading(false)
  }

  if (!user) {
    return <AuthForm mode={authMode} />
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        currentConversation={currentConversation}
        onConversationSelect={setCurrentConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={async (id: string) => {
          await supabase.from('conversations').delete().eq('id', id)
          setConversations(prev => prev.filter(c => c.id !== id))
          if (currentConversation?.id === id) {
            setCurrentConversation(null)
            setMessages([])
          }
        }}
        user={user}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-700 p-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">☰</button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Nova AI</h1>
          <button onClick={() => supabase.auth.signOut()} className="p-2 hover:bg-gray-800 rounded-lg">Logout</button>
        </header>
        
        <div className="flex-1 overflow-hidden">
          {currentConversation ? (
            <>
              <ChatMessages messages={messages} isLoading={isLoading} />
              <div className="p-4 border-t border-gray-700">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const message = formData.get('message') as string
                  if (message.trim()) {
                    handleSendMessage(message.trim())
                    e.currentTarget.reset()
                  }
                }} className="flex space-x-4">
                  <input name="message" placeholder="Type your message..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                  <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-medium transition-colors">Send</button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to Nova AI</h2>
                <button onClick={() => createNewConversation()} className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all">Start New Chat</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
    }
