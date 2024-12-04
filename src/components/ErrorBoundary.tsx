'use client'
import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  resetKeys?: any[]
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  // Reset error boundary when resetKeys change
  public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (state.hasError && props.resetKeys) {
      const oldKeys = JSON.stringify((props as any).oldResetKeys)
      const newKeys = JSON.stringify(props.resetKeys)
      if (oldKeys !== newKeys) {
        return {
          hasError: false,
          error: null,
          errorInfo: null
        }
      }
    }
    return null
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    })
    
    // Log error
    console.error('Error caught by boundary:', {
      error,
      componentStack: errorInfo.componentStack,
      reactVersion: React.version
    })

    // Call error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report to error service
    this.reportError(error, errorInfo)
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Send to background script for reporting
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'REPORT_ERROR',
          payload: {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        })
      }
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    this.props.onReset?.()
  }

  public render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <ErrorFallback 
          error={error!}
          componentStack={errorInfo?.componentStack}
          retry={this.handleReset}
        />
      )
    }

    return children
  }
}

interface ErrorBoundaryHookProps extends Omit<Props, 'children'> {
  children: (reset: () => void) => ReactNode
}

export function useErrorBoundary({ children, ...props }: ErrorBoundaryHookProps) {
  const [key, setKey] = useState(0)

  const reset = () => {
    setKey(prev => prev + 1)
    props.onReset?.()
  }

  return (
    <ErrorBoundary key={key} {...props}>
      {children(reset)}
    </ErrorBoundary>
  )
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const displayName = Component.displayName || Component.name || 'Component'

  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`
  return WithErrorBoundary
}
