import { Assistant } from '../lib/types'

export default function AssistantCard({ 
  assistant 
}: { 
  assistant: Assistant 
}) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold">{assistant.name}</h3>
      <p>{assistant.description}</p>
    </div>
  )
}
