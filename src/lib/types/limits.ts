export const FREE_MESSAGE_LIMIT = 5
export const FREE_CONVERSATIONS_LIMIT = 2

export interface UsageLimits {
  messages: number
  conversations: number
  loading: boolean
  hasReachedMessageLimit: boolean
  hasReachedConversationLimit: boolean
  remainingMessages: number
  remainingConversations: number
}
