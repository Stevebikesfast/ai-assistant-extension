'use client'
import { useAuth } from '@/hooks/useAuth'

export default function UserMenu() {
  const { user, signOut } = useAuth()

  return (
    <div className="relative group">
      <button 
        className="p-2 text-sm text-gray-700 hover:text-gray-900"
        aria-label="User menu"
      >
        {user?.email || 'Not signed in'}
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg hidden group-hover:block z-50">
        {user ? (
          <>
            <div className="px-4 py-2 border-b">
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </>
        ) : (
          <a
            href="/auth/signin"
            className="block w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign In
          </a>
        )}
      </div>
    </div>
  )
}
