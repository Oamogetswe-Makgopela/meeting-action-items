import ErrorMessage from './ErrorMessage'

const STATUS_OPTIONS = ['todo', 'in_progress', 'done']

export default function ReviewList({
  items = [],
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onClear,
  onSave,
  isSaving,
  saveError,
}) {
  return (
    <section className="panel review-list" aria-labelledby="review-list-heading">
      <h2 id="review-list-heading">Review Action Items</h2>

      {items.length === 0 ? (
        <p className="empty-state">
          No action items yet — paste meeting notes and click Extract Action Items.
        </p>
      ) : (
        <ul className="review-rows">
          {items.map((item, index) => (
            <li className="review-row" key={index}>
              <input
                type="text"
                className="review-row-title"
                placeholder="Task title"
                value={item.title}
                onChange={(event) => onUpdateItem(index, { title: event.target.value })}
              />
              <textarea
                className="review-row-description"
                placeholder="Description"
                rows={2}
                value={item.description}
                onChange={(event) => onUpdateItem(index, { description: event.target.value })}
              />
              <div className="review-row-fields">
                <input
                  type="text"
                  placeholder="Owner"
                  value={item.owner}
                  onChange={(event) => onUpdateItem(index, { owner: event.target.value })}
                />
                <input
                  type="date"
                  value={item.due_date}
                  onChange={(event) => onUpdateItem(index, { due_date: event.target.value })}
                />
                <select
                  value={item.status}
                  onChange={(event) => onUpdateItem(index, { status: event.target.value })}
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
                  onClick={() => onDeleteItem(index)}
                  aria-label="Delete task"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="review-actions">
        <button type="button" className="btn" onClick={onAddItem}>
          Add Task
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={items.length === 0 || isSaving}>
          {isSaving ? 'Saving...' : 'Save Tasks'}
        </button>
        <button type="button" className="btn" onClick={onClear} disabled={items.length === 0 || isSaving}>
          Clear
        </button>
      </div>
      <ErrorMessage message={saveError} />
    </section>
  )
}
