export default function SubscriptionGate({
  isPaid,
  children
}: {
  isPaid: boolean
  children: React.ReactNode
}) {
  if (!isPaid) {
    return (
      <div className="text-center p-4">
        <h3>Upgrade to Access</h3>
        <a href="/pricing" className="text-blue-500">
          View Plans
        </a>
      </div>
    )
  }

  return <>{children}</>
}
