import { useState } from 'react'
import type { Status } from '../lib/types/status'

export class AsyncActionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'AsyncActionError'
  }
}

export interface AsyncActionState<T> {
  status: Status
  error: string | null
  data: T | null
}

export function useAsyncAction<T, P extends any[] = any[]>() {
  const [state, setState] = useState<AsyncActionState<T>>({
    status: 'idle',
    error: null,
    data: null
  })

  const execute = async (action: (...args: P) => Promise<T>, ...args: P) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))
    
    try {
      const result = await action(...args)
      setState({
        status: 'success',
        error: null,
        data: result
      })
      return result
    } catch (err) {
      const error = err instanceof AsyncActionError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'An unexpected error occurred'

      setState({
        status: 'error',
        error,
        data: null
      })
      throw err
    }
  }

  const reset = () => {
    setState({
      status: 'idle',
      error: null,
      data: null
    })
  }

  return { 
    ...state,
    execute,
    reset,
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    isIdle: state.status === 'idle'
  }
}
