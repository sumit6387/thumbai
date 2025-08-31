'use client'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🎨 Clean Interface
            <span className="block text-blue-600">Showcase</span>
          </h1>
          <p className="text-xl text-gray-600">
            Experience the new ChatGPT-inspired design for thumbnail generation
          </p>
        </div>

        {/* Interface Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">💬 Chat Interface Preview</h3>
          
          {/* Mock Chat */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* AI Message */}
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Hello! I'm your AI thumbnail assistant. What would you like to create today?
                </p>
                <p className="text-xs mt-2 text-gray-500">2:30 PM</p>
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 max-w-xs">
                <p className="text-sm">I want a thumbnail for my cooking YouTube video</p>
                <p className="text-xs mt-2 text-blue-100">2:31 PM</p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                <p className="text-sm text-gray-800">
                  Great idea! Please upload an image and describe your vision.
                </p>
                <p className="text-xs mt-2 text-gray-500">2:31 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ChatGPT-like Interface</h3>
            <p className="text-gray-600">Clean, modern chat interface that feels familiar and intuitive</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Image Previews</h3>
            <p className="text-gray-600">See uploaded images and generated thumbnails directly in chat</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Fast & Responsive</h3>
            <p className="text-gray-600">Optimized performance with smooth animations and transitions</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Responsive design that works perfectly on all devices</p>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔧 Sidebar Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">New Chat</h4>
              <p className="text-sm text-gray-600">Start fresh conversations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Image Upload</h4>
              <p className="text-sm text-gray-600">Easy file selection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">File Status</h4>
              <p className="text-sm text-gray-600">Track upload progress</p>
            </div>
          </div>
        </div>

        {/* Input Area Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">⌨️ Smart Input</h3>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <textarea
                placeholder="Describe how you want your thumbnail to look..."
                className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled
              />
              <button className="absolute right-2 top-2 w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Back to Main */}
        <div className="text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            💬 Try the New Interface
          </a>
        </div>
      </div>
    </div>
  )
}
