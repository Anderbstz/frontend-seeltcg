'use client'

import { useState, useRef, useEffect } from 'react'
import { API_URL } from '@/lib/config'
import { useAuth } from '@/contexts/AuthContext'
import { FiMessageSquare, FiX, FiSend, FiUser } from 'react-icons/fi'

interface ChatMessage {
  text: string
  sender: 'bot' | 'user'
}

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: '¡Hola! Soy Seatcg, tu asistente. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ])
  const [escribiendo, setEscribiendo] = useState(false)
  const [userAvatar, setUserAvatar] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated, auth } = useAuth()

  // Load user avatar from localStorage
  useEffect(() => {
    const loadUserAvatar = () => {
      try {
        const username = auth?.user?.username
        if (username) {
          const key = `seatcg_profile_${username}`
          const saved = localStorage.getItem(key)
          if (saved) {
            const parsed = JSON.parse(saved)
            setUserAvatar(parsed?.avatar || '')
          }
        }
      } catch (error) {
        console.error('Error loading avatar:', error)
        setUserAvatar('')
      }
    }
    loadUserAvatar()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('seatcg_profile_')) loadUserAvatar()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [auth?.user?.username])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    if (!isAuthenticated()) {
      setMessages(prev => [
        ...prev,
        { text: 'Para poder chatear conmigo debes iniciar sesión. ¡Es rapidito! 😊', sender: 'bot' }
      ])
      return
    }

    const userMessage: ChatMessage = { text: message, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setEscribiendo(true)

    try {
      const response = await fetch(`${API_URL}/ai-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.token}`
        },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        { text: data.reply || 'Lo siento, no entendí eso.', sender: 'bot' }
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      let errmsg = 'Lo siento, ocurrió un error al enviar tu mensaje.'
      setMessages(prev => [
        ...prev,
        { text: errmsg, sender: 'bot' }
      ])
    } finally {
      setEscribiendo(false)
    }
  }

  return (
    <div className={`fixed bottom-[30px] right-[30px] z-[1000] transition-all duration-300`}>
      {isOpen ? (
        <div className="w-[350px] h-[500px] bg-white rounded-xl shadow-[0_5px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 flex justify-between items-center text-white" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9E1F)' }}>
            <div className="flex items-center gap-2.5">
              <img src="/Icon_Seatcg.png" alt="Seatcg" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h3 className="m-0 text-base font-semibold">Seatcg</h3>
                <p className="text-xs opacity-80 m-0">En línea</p>
              </div>
            </div>
            <button className="bg-transparent border-none text-white text-xl cursor-pointer opacity-80 hover:opacity-100" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4" style={{ backgroundColor: '#f8fafc' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2.5 max-w-[80%] ${msg.sender === 'bot' ? 'self-start' : 'self-end flex-row-reverse'}`}>
                {msg.sender === 'bot' ? (
                  <img src="/Icon_Seatcg.png" alt="Bot" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-auto overflow-hidden" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>
                    {userAvatar ? (
                      <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="text-base" />
                    )}
                  </div>
                )}
                <div className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                  msg.sender === 'bot'
                    ? 'bg-white rounded-[18px] rounded-tl-[4px] text-[#1e293b] shadow-sm'
                    : 'text-white rounded-[18px] rounded-tr-[4px]'
                }`} style={msg.sender === 'user' ? { background: 'linear-gradient(135deg, #FF6B35, #FF9E1F)' } : {}}>
                  <p className="m-0">{msg.text}</p>
                </div>
              </div>
            ))}

            {escribiendo && (
              <div className="flex gap-2.5 self-start max-w-[80%]">
                <img src="/Icon_Seatcg.png" alt="Bot" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto" />
                <div className="flex gap-1 px-3.5 py-2.5 bg-white rounded-[18px] w-fit shadow-sm">
                  <span className="w-2 h-2 rounded-full inline-block bg-[#94a3b8] animate-bounce" style={{ animationDelay: '-0.32s' }}></span>
                  <span className="w-2 h-2 rounded-full inline-block bg-[#94a3b8] animate-bounce" style={{ animationDelay: '-0.16s' }}></span>
                  <span className="w-2 h-2 rounded-full inline-block bg-[#94a3b8] animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex p-4 bg-white border-t border-[#e2e8f0]">
            <input
              type="text"
              value={message}
              placeholder="Escribe tu mensaje..."
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isAuthenticated()}
              className="flex-1 px-4 py-2.5 border border-[#e2e8f0] rounded-[20px] text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!message.trim() || !isAuthenticated()}
              className="w-10 h-10 rounded-full border-none ml-2.5 flex items-center justify-center cursor-pointer transition-all duration-200 disabled:bg-[#e2e8f0] disabled:cursor-not-allowed disabled:shadow-none text-white"
              style={message.trim() && isAuthenticated() ? { background: 'linear-gradient(135deg, #FF6B35, #FF9E1F)', boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)' } : { background: '#e2e8f0' }}
            >
              <FiSend />
            </button>
          </form>

          {!isAuthenticated() && (
            <div className="p-4 text-center text-sm border-t border-[#fef3c7]" style={{ background: '#fffbeb', color: '#92400e' }}>
              Debes iniciar sesión para continuar. 😊
            </div>
          )}
        </div>
      ) : (
        <button
          className="fixed bottom-[30px] right-[30px] w-[60px] h-[60px] bg-transparent border-none cursor-pointer flex items-center justify-center z-[1000] p-0 transition-transform duration-300 hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <img src="/Icon_Seatcg.png" alt="Chat" className="w-[60px] h-[60px] object-contain transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:scale-105 hover:drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]" />
        </button>
      )}
    </div>
  )
}

export default ChatBubble
