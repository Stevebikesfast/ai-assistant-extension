export type SubscriptionTier = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'incomplete'

export interface Subscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export type UserSubscriptionState = 'loading' | SubscriptionTier

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  return subscription.status === 'active' && subscription.tier !== 'free'
}

export function getSubscriptionTier(subscription: Subscription | null): SubscriptionTier {
  if (!subscription || subscription.status !== 'active') return 'free'
  return subscription.tier
}

export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'cancelled':
      return 'Cancelled'
    case 'past_due':
      return 'Payment Past Due'
    case 'incomplete':
      return 'Incomplete'
    default:
      return 'Unknown'
  }
}

export function shouldShowUpgradePrompt(subscription: Subscription | null): boolean {
  if (!subscription) return true
  return subscription.tier === 'free' || subscription.status !== 'active'
}
