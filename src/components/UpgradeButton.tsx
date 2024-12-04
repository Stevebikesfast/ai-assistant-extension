'use client'

interface UpgradeButtonProps {
  className?: string
  variant?: 'default' | 'warning' | 'danger'
}

export default function UpgradeButton({ 
  className = '',
  variant = 'default'
}: UpgradeButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
      default:
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
    }
  }

  return (
    <button
      onClick={() => window.location.href = '/pricing'}
      className={`
        px-4 py-2 text-white rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        ${getVariantStyles()}
        ${className}
      `}
    >
      Upgrade to Pro
    </button>
  )
}
