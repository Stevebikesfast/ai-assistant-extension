export default function ErrorMessage({ 
  message,
  retry 
}: { 
  message: string
  retry?: () => void 
}) {
  return (
    <div className="text-center p-4">
      <p className="text-red-500 mb-2">{message}</p>
      {retry && (
        <button 
          onClick={retry}
          className="text-blue-500 hover:underline"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
