import './App.css'
import NotesInput from './components/NotesInput'
import ReviewList from './components/ReviewList'
import TaskList from './components/TaskList'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Meeting Action Items</h1>
      </header>
      <main className="app-main">
        <NotesInput />
        <ReviewList />
        <TaskList />
      </main>
    </div>
  )
}

export default App
