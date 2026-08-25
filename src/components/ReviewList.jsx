export default function ReviewList({ items = [] }) {
  return (
    <section className="panel review-list" aria-labelledby="review-list-heading">
      <h2 id="review-list-heading">Review Action Items</h2>

      {items.length === 0 ? (
        <p className="empty-state">
          No action items yet — paste meeting notes and click Extract Action Items.
        </p>
      ) : null}

      <div className="review-actions">
        <button type="button" className="btn" disabled>
          Add Task
        </button>
        <button type="button" className="btn btn-primary" disabled>
          Save Tasks
        </button>
        <button type="button" className="btn" disabled>
          Clear
        </button>
      </div>
    </section>
  )
}
