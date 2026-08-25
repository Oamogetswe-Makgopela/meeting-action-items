import { useState } from 'react'
import './App.css'
import AuthGate from './components/AuthGate'
import NotesInput from './components/NotesInput'
import ReviewList from './components/ReviewList'
import TaskList from './components/TaskList'
import { extractActionItems, ExtractionError } from './lib/extraction'

function App() {
  const [actionItems, setActionItems] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState(null)

  async function handleExtract({ notes, meetingDate }) {
    setIsExtracting(true)
    setExtractionError(null)
    try {
      const items = await extractActionItems({ notes, meetingDate })
      setActionItems(items)
    } catch (err) {
      const message = err instanceof ExtractionError ? err.message : 'Extraction failed.'
      setExtractionError(message)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meeting Action Items</h1>
      </header>
      <main className="app-main">
        <AuthGate>
          <NotesInput onExtract={handleExtract} isExtracting={isExtracting} error={extractionError} />
          <ReviewList items={actionItems} />
          <TaskList />
        </AuthGate>
      </main>
    </div>
  )
}

export default App
