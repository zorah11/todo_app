import { useEffect, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'simple-todo-app.todos'

function loadTodos() {
  const savedTodos = window.localStorage.getItem(STORAGE_KEY)

  if (!savedTodos) return []

  try {
    const parsedTodos = JSON.parse(savedTodos)
    return Array.isArray(parsedTodos) ? parsedTodos : []
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function App() {
  const [todos, setTodos] = useState(() => loadTodos())
  const [draft, setDraft] = useState('')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedDraft = draft.trim()
    if (!trimmedDraft) return

    const newTodo = {
      id: crypto.randomUUID(),
      text: trimmedDraft,
      completed: false,
    }

    setTodos((currentTodos) => [newTodo, ...currentTodos])
    setDraft('')
  }

  const toggleTodo = (todoId) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <h1>Todo App</h1>
        <p className="subtitle">Add tasks, mark them done, and keep them after refresh.</p>

        <form className="too-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a new todo..."
            aria-label="New todo"
          />
          <button type="submit">Add todo</button>
        </form>

        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-state">No todos yet. Add one above.</li>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span>{todo.text}</span>
                </label>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}

export default App
