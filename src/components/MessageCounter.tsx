'use client'
import { FREE_MESSAGE_LIMIT } from '../lib/types/limits'
import UpgradeButton from './UpgradeButton'

interface MessageCounterProps {
  current: number
  limit: number
  isPaid: boolean
  className?: string
}

export default function MessageCounter({
  current,
  limit = FREE_MESSAGE_LIMIT,
  isPaid,
  className = ''
}: MessageCounterProps) {
  if (isPaid) return null

  const remaining = limit - current
  const percentage = (current / limit) * 100
  const isApproachingLimit = remaining <= 3
  const isAlmostFull = percentage >= 80

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className={`border-t bg-gray-50 ${className}`}>
      {/* Usage Bar */}
      <div className="flex items-center justify-between p-2">
        <span className="text-sm text-gray-600">
          Messages remaining: {remaining}
        </span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Warning Message */}
      {isApproachingLimit && (
        <div className={`p-2 text-center ${isAlmostFull ? 'bg-red-50' : 'bg-yellow-50'}`}>
          <p className={`text-sm ${isAlmostFull ? 'text-red-600' : 'text-yellow-600'} mb-2`}>
            {remaining === 0 ? (
              'You\'ve reached the message limit'
            ) : remaining === 1 ? (
              'Only 1 message remaining'
            ) : (
              `Only ${remaining} messages remaining`
            )}
          </p>
          <div className="flex justify-center">
            <UpgradeButton 
              className="text-sm py-1"
              variant={isAlmostFull ? 'danger' : 'warning'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
