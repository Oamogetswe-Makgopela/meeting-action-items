import { useState } from 'react'
import './App.css'
import AuthGate from './components/AuthGate'
import NotesInput from './components/NotesInput'
import ReviewList from './components/ReviewList'
import TaskList from './components/TaskList'
import { extractActionItems, ExtractionError } from './lib/extraction'
import { saveTasks, SaveError } from './lib/tasks'

function blankItem() {
  return { title: '', description: '', owner: '', due_date: '', status: 'todo' }
}

function App() {
  const [actionItems, setActionItems] = useState([])
  const [sourceNotes, setSourceNotes] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState(null)
  const [savedTasks, setSavedTasks] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  async function handleExtract({ notes, meetingDate }) {
    setIsExtracting(true)
    setExtractionError(null)
    try {
      const items = await extractActionItems({ notes, meetingDate })
      setActionItems(items)
      setSourceNotes(notes)
    } catch (err) {
      const message = err instanceof ExtractionError ? err.message : 'Extraction failed.'
      setExtractionError(message)
    } finally {
      setIsExtracting(false)
    }
  }

  function handleUpdateItem(index, patch) {
    setActionItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function handleDeleteItem(index) {
    setActionItems((items) => items.filter((_, i) => i !== index))
  }

  function handleAddItem() {
    setActionItems((items) => [...items, blankItem()])
  }

  function handleClear() {
    setActionItems([])
    setSourceNotes('')
    setSaveError(null)
  }

  async function handleSave() {
    setIsSaving(true)
    setSaveError(null)
    try {
      const inserted = await saveTasks(actionItems, sourceNotes)
      setSavedTasks((tasks) => [...tasks, ...inserted])
      setActionItems([])
      setSourceNotes('')
    } catch (err) {
      const message = err instanceof SaveError ? err.message : 'Saving failed.'
      setSaveError(message)
    } finally {
      setIsSaving(false)
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
          <ReviewList
            items={actionItems}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onClear={handleClear}
            onSave={handleSave}
            isSaving={isSaving}
            saveError={saveError}
          />
          <TaskList items={savedTasks} />
        </AuthGate>
      </main>
    </div>
  )
}

export default App
