'use client'
import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signUp } = useAuth()

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={() => signUp(email, password)}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Sign Up
      </button>
    </div>
  )
}
