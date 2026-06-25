import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://127.0.0.1:8000/api/'
const TODOS_URL = `${API_BASE_URL}todos/`
const TOKEN_KEY = 'todo-app.auth-token'
const USERNAME_KEY = 'todo-app.username'

function App() {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState(() => window.localStorage.getItem(USERNAME_KEY))
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [todos, setTodos] = useState([])
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!token) return

    fetch(TODOS_URL, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTodos(data))
  }, [token])

  const handleAuthChange = (event) => {
    setAuthForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleAuthSubmit = (event) => {
    event.preventDefault()
    setAuthError('')

    const url = authMode === 'login' ? `${API_BASE_URL}login/` : `${API_BASE_URL}register/`
    const body = {
      username: authForm.username,
      password: authForm.password,
    }

    if (authMode === 'register') {
      body.email = authForm.email
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) =>
        res.json().then((data) => ({
          ok: res.ok,
          data,
        })),
      )
      .then(({ ok, data }) => {
        if (!ok) {
          setAuthError(data.error || 'Please check your details and try again.')
          return
        }

        window.localStorage.setItem(TOKEN_KEY, data.token)
        window.localStorage.setItem(USERNAME_KEY, data.username)
        setToken(data.token)
        setUsername(data.username)
        setAuthForm({ username: '', email: '', password: '' })
      })
  }

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USERNAME_KEY)
    setToken(null)
    setUsername(null)
    setTodos([])
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedDraft = draft.trim()
    if (!trimmedDraft) return

    fetch(TODOS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ text: trimmedDraft, completed: false }),
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodos((current) => [newTodo, ...current])
        setDraft('')
      })
  }

  const toggleTodo = (todoId) => {
    const todo = todos.find((t) => t.id === todoId)

    fetch(`${TODOS_URL}${todoId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ completed: !todo.completed }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTodos((current) =>
          current.map((t) => (t.id === todoId ? updated : t)),
        )
      })
  }

  if (!token) {
    return (
      <main className="app-shell">
        <section className="todo-card auth-card">
          <h1>{authMode === 'login' ? 'Log in' : 'Create account'}</h1>
          <p className="subtitle">Use an account so your todos belong to you.</p>

          <form className="todo-form" onSubmit={handleAuthSubmit}>
            <input
              name="username"
              type="text"
              value={authForm.username}
              onChange={handleAuthChange}
              placeholder="Username"
              aria-label="Username"
              required
            />
            {authMode === 'register' && (
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="Email"
                aria-label="Email"
                required
              />
            )}
            <input
              name="password"
              type="password"
              value={authForm.password}
              onChange={handleAuthChange}
              placeholder="Password"
              aria-label="Password"
              required
            />
            <button type="submit">{authMode === 'login' ? 'Log in' : 'Sign up'}</button>
          </form>

          {authError && <p className="error-message">{authError}</p>}

          <button
            className="text-button"
            type="button"
            onClick={() => {
              setAuthError('')
              setAuthMode(authMode === 'login' ? 'register' : 'login')
            }}
          >
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <div className="card-header">
          <div>
            <h1>Todo App</h1>
            <p className="subtitle">Signed in as {username}</p>
          </div>
          <button className="text-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>

        <form className="todo-form" onSubmit={handleSubmit}>
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
