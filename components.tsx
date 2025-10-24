'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, streamAIResponse } from './lib'
import type { UserProfile, Conversation, Message, AIModel } from './types'

// Auth Component
export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">Nova AI</h1>
          <p className="text-white/70">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent" placeholder="Enter your username" required />
            </div>
          )}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent" placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent" placeholder="Enter your password" required />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

// Chat Messages Component
export function ChatMessages({ messages, isLoading }: { messages: Message[], isLoading: boolean }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-gray-800 text-gray-100'}`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
          <div className="bg-gray-800 rounded-2xl px-4 py-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Sidebar Component
export function Sidebar({ isOpen, conversations, currentConversation, onConversationSelect, onNewConversation, onDeleteConversation, user }: any) {
  return (
    <motion.div animate={{ width: isOpen ? 300 : 0 }} className="bg-gray-800 border-r border-gray-700 overflow-hidden">
      <div className="p-4">
        <button onClick={onNewConversation} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-xl font-medium transition-colors">+ New Chat</button>
      </div>
      <div className="space-y-2 p-4">
        {conversations.map((conv: Conversation) => (
          <div key={conv.id} className={`p-3 rounded-xl cursor-pointer transition-colors ${currentConversation?.id === conv.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`} onClick={() => onConversationSelect(conv)}>
            <div className="flex justify-between items-center">
              <p className="text-white truncate">{conv.title}</p>
              <button onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id) }} className="text-gray-400 hover:text-red-400">×</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
                            }
