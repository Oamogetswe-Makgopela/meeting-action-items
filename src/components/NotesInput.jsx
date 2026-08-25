import { useState } from 'react'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function NotesInput({ onExtract, isExtracting, error }) {
  const [notes, setNotes] = useState('')
  const [meetingDate, setMeetingDate] = useState(todayIsoDate)

  function handleSubmit(event) {
    event.preventDefault()
    onExtract({ notes, meetingDate })
  }

  return (
    <section className="panel notes-input" aria-labelledby="notes-input-heading">
      <h2 id="notes-input-heading">Meeting Notes</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="notes-textarea"
          placeholder="Paste raw meeting notes here..."
          rows={10}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <div className="notes-controls">
          <label className="meeting-date-field">
            Meeting date
            <input
              type="date"
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!notes.trim() || isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Extract Action Items'}
          </button>
        </div>
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  )
}
