'use client'
import { ReactNode } from 'react'
import UserMenu from '../UserMenu'
import SettingsButton from '../SettingsButton'

interface ExtensionLayoutProps {
  children: ReactNode
}

export default function ExtensionLayout({ children }: ExtensionLayoutProps) {
  return (
    <div className="flex flex-col h-[600px] w-[800px] bg-white">
      <header className="h-14 border-b px-4 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-gray-900">AI Assistant</h1>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
          <div className="h-6 w-px bg-gray-200" />
          <SettingsButton />
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      <footer className="h-6 border-t bg-gray-50 flex items-center justify-between px-3">
        <span className="text-xs text-gray-500">
          AI Assistant v1.0.0
        </span>
        <span className="text-xs text-gray-500">
          Powered by OpenAI
        </span>
      </footer>
    </div>
  )
}
