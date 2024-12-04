'use client'
import { motion } from 'framer-motion'

export interface ErrorFallbackProps {
  error: Error
  componentStack?: string | null
  retry?: () => void
  className?: string
}

export function ErrorFallback({ 
  error, 
  componentStack,
  retry,
  className = ''
}: ErrorFallbackProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-red-500">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong
          </h3>
          <p className="mt-1 text-sm text-red-600 break-words">
            {error.message}
          </p>
          {componentStack && (
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
                View error details
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-x-auto">
                {componentStack}
              </pre>
            </details>
          )}
          {retry && (
            <motion.button
              onClick={retry}
              className="mt-3 px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function InlineError({ 
  message,
  retry,
  className = ''
}: {
  message: string
  retry?: () => void
  className?: string
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-sm text-red-600 flex items-center gap-2 ${className}`}
    >
      <span>{message}</span>
      {retry && (
        <button
          onClick={retry}
          className="text-red-800 hover:text-red-900 underline text-xs"
        >
          Retry
        </button>
      )}
    </motion.div>
  )
}

export function ErrorMessage({
  title = 'Error',
  message,
  retry,
  className = ''
}: {
  title?: string
  message: string
  retry?: () => void
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-lg bg-red-50 p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {retry && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <motion.button
                  onClick={retry}
                  className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try again
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
