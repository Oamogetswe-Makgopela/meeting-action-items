export default function NotesInput() {
  return (
    <section className="panel notes-input" aria-labelledby="notes-input-heading">
      <h2 id="notes-input-heading">Meeting Notes</h2>
      <textarea
        className="notes-textarea"
        placeholder="Paste raw meeting notes here..."
        rows={10}
      />
      <div className="notes-controls">
        <label className="meeting-date-field">
          Meeting date
          <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </label>
        <button type="button" className="btn btn-primary" disabled>
          Extract Action Items
        </button>
      </div>
    </section>
  )
}
