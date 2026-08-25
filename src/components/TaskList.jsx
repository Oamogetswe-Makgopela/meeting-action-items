import ErrorMessage from './ErrorMessage'

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function rowClassName(task) {
  if (task.status === 'done') return 'task-row task-row-completed'
  if (task.due_date && task.due_date < todayIsoDate()) return 'task-row task-row-overdue'
  return 'task-row'
}

export default function TaskList({
  items = [],
  isLoading,
  error,
  onUpdateTask,
  onDeleteTask,
  pendingTaskIds = new Set(),
}) {
  return (
    <section className="panel task-list" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading">Saved Tasks</h2>

      {isLoading ? <p>Loading...</p> : null}
      <ErrorMessage message={error} />

      {!isLoading && items.length === 0 ? <p className="empty-state">No saved tasks yet.</p> : null}

      {!isLoading && items.length > 0 ? (
        <ul className="task-rows">
          {items.map((task) => {
            const isPending = pendingTaskIds.has(task.id)
            return (
              <li key={task.id} className={rowClassName(task)}>
                <input
                  type="text"
                  className="task-row-title"
                  value={task.title}
                  disabled={isPending}
                  onChange={(event) => onUpdateTask(task.id, { title: event.target.value })}
                />
                <div className="task-row-fields">
                  <input
                    type="text"
                    placeholder="Owner"
                    value={task.owner || ''}
                    disabled={isPending}
                    onChange={(event) => onUpdateTask(task.id, { owner: event.target.value })}
                  />
                  <input
                    type="date"
                    value={task.due_date || ''}
                    disabled={isPending}
                    onChange={(event) => onUpdateTask(task.id, { due_date: event.target.value || null })}
                  />
                  <select
                    value={task.status}
                    disabled={isPending}
                    onChange={(event) => onUpdateTask(task.id, { status: event.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDeleteTask(task.id)}
                    disabled={isPending}
                    aria-label="Delete saved task"
                  >
                    {isPending ? 'Working...' : 'Delete'}
                  </button>
                </div>
                {task.status !== 'done' && task.due_date && task.due_date < todayIsoDate() ? (
                  <span className="task-overdue-badge">Overdue</span>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
