'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  image?: string
  isImageUpload?: boolean
  responsePromptData?: string
  shouldHaveImage?: boolean
}

interface ChatSession {
  id: string
  title: string
  initialImage: string
  lastGeneratedImage?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState<string>('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{chatId: string, title: string} | null>(null)
  const [clearAllConfirmation, setClearAllConfirmation] = useState<boolean>(false)
  const [imagePreview, setImagePreview] = useState<{src: string, alt: string, filename?: string} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsClient(true)
    loadChatSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat sessions from localStorage
  const loadChatSessions = () => {
    try {
      const saved = localStorage.getItem('thumbnail-generator-chats')
      if (saved) {
        const sessions = JSON.parse(saved)
        
        // Convert string timestamps back to Date objects
        const convertedSessions = convertSessionTimestamps(sessions)
        setChatSessions(convertedSessions)
        
        // If there are existing sessions, load the most recent one
        if (convertedSessions.length > 0) {
          const latestSession = convertedSessions[convertedSessions.length - 1]
          setCurrentChatId(latestSession.id)
          setMessages(latestSession.messages)
          setLastGeneratedImage(latestSession.lastGeneratedImage || null)
        } else {
          // Create initial welcome message
          createWelcomeSession()
        }
      } else {
        // Create initial welcome message
        createWelcomeSession()
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
      // Create initial welcome message on error
      createWelcomeSession()
    }
  }

  // Create a welcome session
  const createWelcomeSession = () => {
    const welcomeSession: ChatSession = {
      id: 'welcome',
      title: 'Welcome',
      initialImage: '',
              messages: [{
          id: '1',
          chatId: 'welcome',
          role: 'assistant',
          content: "Hello! I'm your AI thumbnail assistant. I can help you create stunning thumbnails from your images. What would you like to create today?",
          timestamp: new Date(),
          shouldHaveImage: false
        }],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setChatSessions([welcomeSession])
    setCurrentChatId('welcome')
    setMessages(welcomeSession.messages)
    saveChatSessions([welcomeSession])
  }

  // Save chat sessions to localStorage
  const saveChatSessions = (sessions: ChatSession[]) => {
    try {
      localStorage.setItem('thumbnail-generator-chats', JSON.stringify(sessions))
    } catch (error) {
      console.error('Error saving chat sessions:', error)
    }
  }

  // Helper function to convert timestamps in messages
  const convertMessageTimestamps = (messages: any[]): Message[] => {
    return messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp)
    }))
  }

  // Helper function to convert timestamps in chat sessions
  const convertSessionTimestamps = (sessions: any[]): ChatSession[] => {
    return sessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: convertMessageTimestamps(session.messages)
    }))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
    
    // Update current chat session
    if (currentChatId && currentChatId !== 'welcome') {
      setChatSessions(prev => {
        const updated = prev.map(session => {
          if (session.id === currentChatId) {
            return {
              ...session,
              messages: [...session.messages, message],
              updatedAt: new Date()
            }
          }
          return session
        })
        saveChatSessions(updated)
        return updated
      })
    }
  }

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError(null)
      
      // Create preview URL for immediate display
      const url = URL.createObjectURL(file)
      
      // Check if we have an active chat (not welcome)
      if (currentChatId && currentChatId !== 'welcome') {
        // Add image to existing chat
        const userMessage: Message = {
          id: Date.now().toString(),
          chatId: currentChatId,
          role: 'user',
          content: `I've uploaded a new image: ${file.name}`,
          timestamp: new Date(),
          image: url,
          isImageUpload: true
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          chatId: currentChatId,
          role: 'assistant',
          content: "Great! I can see your new image. Now, please describe how you'd like me to transform it into a thumbnail. Be specific about colors, style, text placement, and overall mood.",
          timestamp: new Date()
        }
        
        // Add messages to current chat
        addMessage(userMessage)
        addMessage(aiMessage)
        
        // Update chat session with new image
        setChatSessions(prev => {
          const updated = prev.map(session => {
            if (session.id === currentChatId) {
              return {
                ...session,
                initialImage: url, // Update with new image
                updatedAt: new Date()
              }
            }
            return session
          })
          saveChatSessions(updated)
          return updated
        })
        
      } else {
        // Create new chat session (existing logic)
        const newChatId = Date.now().toString()
        const newSession: ChatSession = {
          id: newChatId,
          title: `Chat ${chatSessions.length + 1}`,
          initialImage: url,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const userMessage: Message = {
          id: Date.now().toString(),
          chatId: newChatId,
          role: 'user',
          content: `I've uploaded an image: ${file.name}`,
          timestamp: new Date(),
          image: url,
          isImageUpload: true
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          chatId: newChatId,
          role: 'assistant',
          content: "Great! I can see your image. Now, please describe how you'd like me to transform it into a thumbnail. Be specific about colors, style, text placement, and overall mood.",
          timestamp: new Date()
        }
        
        // Update session with messages
        newSession.messages = [userMessage, aiMessage]
        
        // Add to chat sessions and save
        const updatedSessions = [...chatSessions, newSession]
        setChatSessions(updatedSessions)
        saveChatSessions(updatedSessions)
        
        // Set as current chat
        setCurrentChatId(newChatId)
        setMessages([userMessage, aiMessage])
      }
      
    } else {
      setError('Please select a valid image file')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim()) return

    // Check if we have a selected file OR if we have a last generated image to continue with
    if (!selectedFile && !lastGeneratedImage) {
      const userMessage: Message = {
        id: Date.now().toString(),
        chatId: currentChatId, // Use current chat ID
        role: 'user',
        content: inputValue,
        timestamp: new Date()
      }
      addMessage(userMessage)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId: currentChatId, // Use current chat ID
        role: 'assistant',
        content: "I'd love to help you create that thumbnail! First, please upload an image by clicking the upload button below.",
        timestamp: new Date()
      }
      addMessage(aiMessage)
    } else {
      // We have either a selected file or can continue with previous work
      const userMessage: Message = {
        id: Date.now().toString(),
        chatId: currentChatId, // Use current chat ID
        role: 'user',
        content: inputValue,
        timestamp: new Date()
      }
      addMessage(userMessage)

      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        chatId: currentChatId, // Use current chat ID
        role: 'assistant',
        content: selectedFile ? 
          "Perfect! I'm analyzing your image and prompt. Let me create something amazing for you..." :
          "Great! I'm working with your previous image and prompt. Let me create something amazing for you...",
        timestamp: new Date()
      }
      addMessage(thinkingMessage)

      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        if (selectedFile) {
          formData.append('image', selectedFile)
        }
        formData.append('prompt', inputValue)
        
        // If we have a previously generated image, include it in the request for fallback
        if (lastGeneratedImage) {
          formData.append('previousImage', lastGeneratedImage)
          console.log('Including previous image in request:', lastGeneratedImage)
        }
        
        // Only include additional previous images for fallback if this is a new chat session
        // (not when uploading to an existing chat)
        if (!selectedFile || (currentChatId === 'welcome' || (() => {
          const session = chatSessions.find(s => s.id === currentChatId)
          return session ? session.messages.length <= 2 : true
        })())) {
          const currentSession = chatSessions.find(session => session.id === currentChatId)
          if (currentSession && currentSession.messages.length > 0) {
            // Get all generated images from the current session (excluding the most recent one)
            const generatedImages = currentSession.messages
              .filter(msg => msg.image && !msg.isImageUpload)
              .map(msg => msg.image)
              .reverse() // Most recent first
              .slice(1, 4) // Get up to 3 additional previous images
            
            if (generatedImages.length > 0) {
              console.log(`Including ${generatedImages.length} fallback images for context`)
              generatedImages.forEach((imageUrl, index) => {
                if (imageUrl) {
                  // Extract filename from URL for backend processing
                  const filename = imageUrl.split('/').pop()
                  if (filename) {
                    formData.append(`previousImage${index + 1}`, filename)
                    console.log(`Including fallback image ${index + 1}:`, filename)
                  }
                }
              })
            } else {
              console.log('No fallback images available for context')
            }
          }
        } else {
          console.log('Uploading to existing chat - excluding previous images for context to focus on new image')
        }

        const response = await axios.post('/api/generate-thumbnail', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id))
        
        const successMessage: Message = {
          id: (Date.now() + 2).toString(),
          chatId: currentChatId,
          role: 'assistant',
          content: response.data.geminiImageUrl 
            ? `🎉 Here's your generated thumbnail! I've created it based on your description. The original image is available at: ${response.data.uploadedImageUrl}${response.data.usedPreviousImage ? ` (Used previous image: ${response.data.usedPreviousImage})` : ''}`
            : `I've processed your request, but I wasn't able to generate an image this time. Please try again with a different prompt or image. The original image is available at: ${response.data.uploadedImageUrl}${response.data.usedPreviousImage ? ` (Used previous image: ${response.data.usedPreviousImage})` : ''}`,
          timestamp: new Date(),
          image: response.data.geminiImageUrl,
          responsePromptData: response.data.responsePromptData,
          shouldHaveImage: true
        }
        addMessage(successMessage)

        // Store the last generated image for future requests
        setLastGeneratedImage(response.data.geminiImagePath)

        // Update chat session with last generated image
        if (currentChatId && currentChatId !== 'welcome') {
          setChatSessions(prev => {
            const updated = prev.map(session => {
              if (session.id === currentChatId) {
                return {
                  ...session,
                  lastGeneratedImage: response.data.geminiImagePath,
                  updatedAt: new Date()
                }
              }
              return session
            })
            saveChatSessions(updated)
            return updated
          })
        }

        setInputValue('')
        // Keep the selectedFile so user can continue working with the same image
        // setSelectedFile(null)
      } catch (err) {
        console.error('Error generating thumbnail:', err)
        setError('Failed to generate thumbnail. Please try again.')
        
        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id))
        
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          chatId: currentChatId, // Use current chat ID
          role: 'assistant',
          content: "I'm sorry, I encountered an error while generating your thumbnail. Please try again or let me know if you need help.",
          timestamp: new Date(),
          shouldHaveImage: false
        }
        addMessage(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleReset = () => {
    const newChatId = Date.now().toString()
    const newSession: ChatSession = {
      id: newChatId,
      title: `Chat ${chatSessions.length + 1}`,
      initialImage: '',
              messages: [{
          id: '1',
          chatId: newChatId,
          role: 'assistant',
          content: "Hello! I'm your AI thumbnail assistant. I can help you create stunning thumbnails from your images. What would you like to create today?",
          timestamp: new Date(),
          shouldHaveImage: false
        }],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to chat sessions and save
    const updatedSessions = [...chatSessions, newSession]
    setChatSessions(updatedSessions)
    saveChatSessions(updatedSessions)
    
    // Set as current chat
    setCurrentChatId(newChatId)
    setMessages(newSession.messages)
    setInputValue('')
    setSelectedFile(null)
    setLastGeneratedImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Delete a specific chat session
  const deleteChatSession = (chatId: string) => {
    // Don't allow deleting the current chat if it's the only one
    if (chatSessions.length === 1) {
      setError('Cannot delete the last chat session. Please create a new one first.')
      return
    }
    
    // Set confirmation state
    const sessionToDelete = chatSessions.find(session => session.id === chatId)
    if (sessionToDelete) {
      setDeleteConfirmation({ chatId: chatId, title: sessionToDelete.title })
    }
  }

  const confirmDelete = () => {
    if (deleteConfirmation) {
      const { chatId } = deleteConfirmation
      
      // Remove the session from state
      const updatedSessions = chatSessions.filter(session => session.id !== chatId)
      setChatSessions(updatedSessions)
      saveChatSessions(updatedSessions)
      
      // If we deleted the current chat, switch to the most recent one
      if (chatId === currentChatId) {
        if (updatedSessions.length > 0) {
          const latestSession = updatedSessions[updatedSessions.length - 1]
          setCurrentChatId(latestSession.id)
          setMessages(latestSession.messages)
          setLastGeneratedImage(latestSession.lastGeneratedImage || null)
        } else {
          // Create a new welcome chat if no sessions remain
          handleReset()
        }
      }
      
      // Clear confirmation state
      setDeleteConfirmation(null)
      // Clear any error messages
      setError(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation(null)
  }

  // Download image function
  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = imageUrl
      
      // Set filename for download
      if (filename) {
        link.download = filename
      } else {
        // Extract filename from URL or generate one
        const urlParts = imageUrl.split('/')
        const extractedFilename = urlParts[urlParts.length - 1]
        link.download = extractedFilename || `image_${Date.now()}.png`
      }
      
      // Append to DOM, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
      setError('Failed to download image. Please try again.')
    }
  }

  // Clear all chat sessions except the current one
  const clearAllChats = () => {
    if (chatSessions.length <= 1) {
      setError('No additional chats to clear.')
      return
    }
    
    // Keep only the current session
    const currentSession = chatSessions.find(session => session.id === currentChatId)
    if (currentSession) {
      setChatSessions([currentSession])
      saveChatSessions([currentSession])
      setError(null)
    }
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${ampm}`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-800">ThumbAI</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        {/* Clear All Chats Button */}
        {chatSessions.length > 1 && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setClearAllConfirmation(true)}
              className="w-full bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All Chats</span>
            </button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-center">
                <p className="text-sm text-red-700 font-medium mb-2">
                  Delete "{deleteConfirmation.title}"?
                </p>
                <p className="text-xs text-red-600 mb-3">
                  This action cannot be undone. All messages and images will be permanently removed.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Dialog */}
        {clearAllConfirmation && (
          <div className="px-4 pb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-center">
                <p className="text-sm text-yellow-700 font-medium mb-2">
                  Clear all chat sessions?
                </p>
                <p className="text-xs text-yellow-600 mb-3">
                  This action cannot be undone. All your chat history and generated images will be permanently cleared.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      clearAllChats();
                      setClearAllConfirmation(false);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setClearAllConfirmation(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-medium py-2 px-3 rounded transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Sessions */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition-all duration-200 ${
                session.id === currentChatId 
                  ? 'bg-blue-100 border border-blue-300 text-blue-800 font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
              }`}
              onClick={() => {
                setCurrentChatId(session.id)
                setMessages(convertMessageTimestamps(session.messages))
                setLastGeneratedImage(session.lastGeneratedImage || null)
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-gray-500">{session.messages.length} messages</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click from propagating to parent div
                    deleteChatSession(session.id);
                  }}
                  className="text-red-500 hover:text-red-600 text-xs font-medium p-1 rounded hover:bg-red-50 transition-colors duration-200 ml-2"
                  title="Delete this chat session"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        <div className="px-4 pb-4">
          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
            currentChatId && currentChatId !== 'welcome' 
              ? 'border-green-200 bg-green-50' 
              : 'border-blue-200 bg-blue-50'
          }`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`font-medium transition-colors duration-200 ${
                currentChatId && currentChatId !== 'welcome' 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              📸 {currentChatId && currentChatId !== 'welcome' ? 'Add Image to Current Chat' : 'Upload Image'}
            </button>
            <p className={`text-sm mt-1 transition-colors duration-200 ${
              currentChatId && currentChatId !== 'welcome' 
                ? 'text-green-500' 
                : 'text-gray-500'
            }`}>
              {currentChatId && currentChatId !== 'welcome' 
                ? 'Image will be added to your current conversation' 
                : 'PNG, JPG, GIF up to 10MB'}
            </p>
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold text-gray-800">AI Thumbnail Generator</h1>
          <p className="text-sm text-gray-600">Create stunning thumbnails with AI assistance</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar - Always on the left for AI, right for user */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-500 ml-3 order-2' 
                  : 'bg-gray-500 mr-3 order-1'
              }`}>
                <span className="text-white text-sm font-medium">
                  {message.role === 'user' ? 'U' : 'AI'}
                </span>
              </div>
              
              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 max-w-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white order-1' 
                  : 'bg-white border border-gray-200 text-gray-800 order-2'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* AI Response Data Display */}
                {message.responsePromptData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 font-medium mb-2">AI Analysis:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{message.responsePromptData}</p>
                  </div>
                )}
                
                {/* Image Display with Preview and Download */}
                {message.image ? (
                  <div className="mt-3">
                    <div className="relative group">
                      <img
                        src={message.image}
                        alt={message.isImageUpload ? "Uploaded image" : "Generated thumbnail"}
                        className="max-w-xs max-h-48 rounded-lg shadow-sm border border-gray-200 object-cover cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => {
                          const filename = message.image?.split('/').pop() || 'image'
                          setImagePreview({
                            src: message.image!,
                            alt: message.isImageUpload ? "Uploaded image" : "Generated thumbnail",
                            filename: filename
                          })
                        }}
                      />
                      
                      {/* Download Button Overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const filename = message.image?.split('/').pop() || 'image'
                            downloadImage(message.image!, filename)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-colors duration-200"
                          title="Download image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : message.role === 'assistant' && !message.isImageUpload && message.shouldHaveImage ? (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Image Not Generated</p>
                        <p className="text-xs text-yellow-700 mt-1">The AI couldn't generate an image this time. Please try again with a different prompt or image.</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                {/* Timestamp */}
                {isClient && (
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading Message */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-gray-600 text-sm">Creating your thumbnail...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Previous Image Indicator */}
        {lastGeneratedImage && (
          <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
            <div className="flex items-center space-x-2 text-blue-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Previous generated image will be included in your next request for context</span>
            </div>
            {/* Show fallback images count */}
            {(() => {
              const currentSession = chatSessions.find(session => session.id === currentChatId)
              if (currentSession) {
                const fallbackCount = currentSession.messages
                  .filter(msg => msg.image && !msg.isImageUpload)
                  .length - 1
                if (fallbackCount > 0) {
                  return (
                    <div className="mt-2 text-xs text-blue-600">
                      +{fallbackCount} additional fallback images available
                    </div>
                  )
                }
              }
              return null
            })()}
          </div>
        )}

        {/* Continue with Same Image Indicator */}
        {selectedFile && lastGeneratedImage && (
          <div className="bg-green-50 border-t border-green-200 px-6 py-3">
            <div className="flex items-center space-x-2 text-green-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
              </svg>
              <span>You can continue working with the same image or upload a new one</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-6 pb-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedFile ? 
                  (lastGeneratedImage ? "Describe how you want to modify the previous thumbnail or create a new one..." : "Describe how you want your thumbnail to look...") 
                  : "Tell me what kind of thumbnail you want to create..."}
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 top-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {imagePreview.alt}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadImage(imagePreview.src, imagePreview.filename)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setImagePreview(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              <img
                src={imagePreview.src}
                alt={imagePreview.alt}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}