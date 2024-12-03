import { Task } from '../lib/types'

export default function TaskCard({
  task,
  onSelect
}: {
  task: Task
  onSelect: (task: Task) => void  
}) {
  return (
    <button 
      onClick={() => onSelect(task)}
      className="p-4 border rounded-lg text-left w-full">
      <h4 className="font-bold">{task.name}</h4>
      <p>{task.description}</p>
    </button>
  )
}
