export default function TaskList({ items = [] }) {
  return (
    <section className="panel task-list" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading">Saved Tasks</h2>

      {items.length === 0 ? <p className="empty-state">No saved tasks yet.</p> : null}
    </section>
  )
}
