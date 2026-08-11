import { Check, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { IconButton, Input } from '@/components/ui'
import type { WidgetComponentProps, WidgetDefinition } from '@/dashboard/types'
import { createId } from '@/lib/utils'

const taskSchema = z.object({ id: z.string(), text: z.string(), completed: z.boolean() })
const schema = z.object({ showCompleted: z.boolean(), tasks: z.array(taskSchema) })
type Settings = z.infer<typeof schema>

function TasksWidget({ settings, updateSettings }: WidgetComponentProps<Settings>) {
  const [text, setText] = useState('')
  const visible = settings.showCompleted
    ? settings.tasks
    : settings.tasks.filter((task) => !task.completed)
  const add = () => {
    const value = text.trim()
    if (!value) return
    updateSettings({
      tasks: [...settings.tasks, { id: createId('task'), text: value, completed: false }],
    })
    setText('')
  }
  return (
    <div className="flex h-full flex-col">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          add()
        }}
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a task…"
          aria-label="New task"
        />
        <IconButton
          label="Add task"
          type="submit"
          className="shrink-0 bg-cyan-400/10 text-cyan-300"
        >
          <Plus size={17} />
        </IconButton>
      </form>
      <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-auto">
        {visible.length === 0 && (
          <div className="grid h-full place-items-center text-sm text-[var(--muted)]">
            Your list is clear.
          </div>
        )}
        {visible.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
          >
            <button
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              className={`grid size-5 shrink-0 place-items-center rounded border ${task.completed ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-[var(--border)]'}`}
              onClick={() =>
                updateSettings({
                  tasks: settings.tasks.map((item) =>
                    item.id === task.id ? { ...item, completed: !item.completed } : item,
                  ),
                })
              }
            >
              {task.completed && <Check size={13} />}
            </button>
            <span
              className={`min-w-0 flex-1 truncate text-sm ${task.completed ? 'text-[var(--muted)] line-through' : ''}`}
            >
              {task.text}
            </span>
            <IconButton
              label="Delete task"
              className="size-7 opacity-0 group-hover:opacity-100"
              onClick={() =>
                updateSettings({ tasks: settings.tasks.filter((item) => item.id !== task.id) })
              }
            >
              <Trash2 size={13} />
            </IconButton>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-[var(--muted)]">
        {settings.tasks.filter((task) => !task.completed).length} remaining · stored locally
      </div>
    </div>
  )
}

export const tasksWidget: WidgetDefinition<Settings> = {
  type: 'tasks',
  version: 1,
  name: 'Tasks',
  description: 'A lightweight local task list.',
  category: 'productivity',
  icon: 'list-checks',
  component: TasksWidget,
  defaultSize: { width: 4, height: 4 },
  minSize: { width: 3, height: 3 },
  defaultSettings: {
    showCompleted: true,
    tasks: [
      { id: 'welcome-task', text: 'Customize this dashboard', completed: false },
      { id: 'edit-task', text: 'Try Edit Mode', completed: true },
    ],
  },
  settingsFields: [{ key: 'showCompleted', type: 'boolean', label: 'Show completed tasks' }],
  settingsSchema: schema,
}
