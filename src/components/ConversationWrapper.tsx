'use client'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'
import { useMessageLimits } from '../hooks/useMessageLimits'
import { FREE_MESSAGE_LIMIT, FREE_CONVERSATIONS_LIMIT } from '../lib/types/limits'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import UpgradeButton from './UpgradeButton'
import ChatWindow from './ChatWindow'
import MessageCounter from './MessageCounter'

interface ConversationWrapperProps {
  conversationId: string
  assistantId: string
  userId: string
}

export default function ConversationWrapper({
  conversationId,
  assistantId,
  userId
}: ConversationWrapperProps) {
  const {
    status: subscriptionStatus,
    error: subscriptionError,
    isLoading: isSubscriptionLoading
  } = useSubscriptionStatus(userId)

  const {
    messages: messageCount,
    conversations: conversationCount,
    loading: isCountLoading,
    hasReachedMessageLimit,
    hasReachedConversationLimit,
    remainingMessages,
    remainingConversations
  } = useMessageLimits(userId)

  // Handle loading states
  if (isSubscriptionLoading || isCountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Handle subscription error
  if (subscriptionError) {
    return (
      <div className="p-4">
        <ErrorMessage message="Failed to load subscription status. Please try again later." />
      </div>
    )
  }

  // Show upgrade prompt for free users who have reached limits
  if (subscriptionStatus === 'free' && (hasReachedMessageLimit || hasReachedConversationLimit)) {
    return (
      <div className="space-y-6">
        <MessageCounter
          current={messageCount}
          limit={FREE_MESSAGE_LIMIT}
          isPaid={false}
          className="mb-6"
        />
        <div className="text-center p-6 border rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-bold mb-4">Free Limit Reached</h3>
          <p className="mb-4 text-gray-600">
            {hasReachedMessageLimit
              ? `You've reached the ${FREE_MESSAGE_LIMIT} message limit`
              : `You've reached the ${FREE_CONVERSATIONS_LIMIT} conversation limit`}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Upgrade to Pro for unlimited messages and conversations
          </p>
          <UpgradeButton />
        </div>
      </div>
    )
  }

  // Show usage counter and chat for free users
  if (subscriptionStatus === 'free') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow flex flex-col">
          <ChatWindow 
            conversationId={conversationId}
            assistantId={assistantId}
            onBeforeSend={async () => {
              if (remainingMessages <= 1) {
                return window.confirm(
                  'This is your last free message for this conversation. Send it anyway?'
                )
              }
              return true
            }}
          />
          <MessageCounter
            current={messageCount}
            limit={FREE_MESSAGE_LIMIT}
            isPaid={false}
          />
        </div>
      </div>
    )
  }

  // Show chat only for paid users
  return (
    <div className="bg-white rounded-lg shadow">
      <ChatWindow 
        conversationId={conversationId}
        assistantId={assistantId}
      />
    </div>
  )
}
