import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

const FONTS = [
  { label: 'Handwritten', value: "'Caveat', cursive",         size: '1.35rem' },
  { label: 'Cursive',     value: "'Dancing Script', cursive", size: '1.3rem'  },
  { label: 'Notebook',    value: "'Patrick Hand', cursive",   size: '1.25rem' },
  { label: 'Modern',      value: "'DM Sans', sans-serif",     size: '1.1rem'  },
  { label: 'Typewriter',  value: "'Special Elite', cursive",  size: '1.1rem'  },
  { label: 'Rounded',     value: "'Nunito', sans-serif",      size: '1.1rem'  },
]

const THEMES = [
  { label: 'Cream',    bg: '#FAF6EE', lines: '#E8DFD0', margin: '#E8A090' },
  { label: 'Ivory',    bg: '#FDFBF5', lines: '#EDE8DC', margin: '#D4A0C0' },
  { label: 'Skin',     bg: '#FDF0E8', lines: '#EDD8C8', margin: '#C8A070' },
  { label: 'Pink',     bg: '#FDF0F3', lines: '#EDD0D8', margin: '#E89090' },
  { label: 'Lavender', bg: '#F5F0FD', lines: '#E0D8F0', margin: '#B090D8' },
  { label: 'Blue',     bg: '#EFF5FD', lines: '#D8E4F0', margin: '#90B0D8' },
  { label: 'Mint',     bg: '#EFF9F4', lines: '#D0EBE0', margin: '#70C8A0' },
  { label: 'Peach',    bg: '#FDF3ED', lines: '#EDDBCC', margin: '#E0A080' },
  { label: 'Yellow',   bg: '#FDFAEE', lines: '#EDE8CC', margin: '#D4B860' },
]

const LINE_HEIGHT = 44

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function offsetDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

function loadData(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback }
  catch { return fallback }
}

function saveData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function newTask(text = '') {
  return { id: crypto.randomUUID(), text, done: false, pinned: false }
}

const QUOTES = [
  'A small step forward is still a step.',
  'Begin anywhere.',
  'One task at a time.',
  'Progress, not perfection.',
  'Your future self will thank you.',
  'Done is better than perfect.',
  'Start where you are.',
]

export default function App() {
  const [date,         setDate]         = useState(todayStr)
  const [allTasks,     setAllTasks]     = useState(() => loadData('jt_tasks', {}))
  const [themeIdx,     setThemeIdx]     = useState(() => loadData('jt_theme', 0))
  const [fontIdx,      setFontIdx]      = useState(() => loadData('jt_font', 0))
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch,   setShowSearch]   = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [deletingIds,  setDeletingIds]  = useState(new Set())
  const [pageAnim,     setPageAnim]     = useState('')
  const pageRef = useRef(null)

  const theme = THEMES[themeIdx]
  const font  = FONTS[fontIdx]
  const tasks = allTasks[date] || []

  useEffect(() => saveData('jt_tasks', allTasks), [allTasks])
  useEffect(() => saveData('jt_theme', themeIdx), [themeIdx])
  useEffect(() => saveData('jt_font',  fontIdx),  [fontIdx])

  const setTasks = useCallback((fn) => {
    setAllTasks(prev => {
      const current = prev[date] || []
      const next = typeof fn === 'function' ? fn(current) : fn
      return { ...prev, [date]: next }
    })
  }, [date])

  useEffect(() => {
    if (!allTasks[date] || allTasks[date].length === 0) {
      setTasks(() => [newTask()])
    }
  }, [date])

  const navigate = (dir) => {
    setPageAnim(dir > 0 ? 'slide-left' : 'slide-right')
    setTimeout(() => {
      setDate(d => offsetDate(d, dir))
      setPageAnim(dir > 0 ? 'enter-right' : 'enter-left')
      setTimeout(() => setPageAnim(''), 300)
    }, 150)
  }

  const updateTask = (id, patch) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  const deleteTask = (id) => {
    setDeletingIds(s => new Set(s).add(id))
    setTimeout(() => {
      setTasks(ts => ts.filter(t => t.id !== id))
      setDeletingIds(s => { const ns = new Set(s); ns.delete(id); return ns })
    }, 350)
  }

  const handleKeyDown = (e, idx) => {
    const task = tasks[idx]
    if (e.key === 'Enter') {
      e.preventDefault()
      const newT = newTask()
      setTasks(ts => {
        const next = [...ts]
        next.splice(idx + 1, 0, newT)
        return next
      })
      setTimeout(() => document.getElementById(`task-${newT.id}`)?.focus(), 20)
    } else if (e.key === 'Backspace' && task.text === '' && tasks.length > 1) {
      e.preventDefault()
      deleteTask(task.id)
      setTimeout(() => {
        const prevTask = tasks[Math.max(0, idx - 1)]
        document.getElementById(`task-${prevTask.id}`)?.focus()
      }, 20)
    }
  }

  const handlePageClick = (e) => {
    if (e.target === pageRef.current) {
      const lastTask = tasks[tasks.length - 1]
      if (lastTask?.text === '') {
        document.getElementById(`task-${lastTask.id}`)?.focus()
      } else {
        const newT = newTask()
        setTasks(ts => [...ts, newT])
        setTimeout(() => document.getElementById(`task-${newT.id}`)?.focus(), 20)
      }
    }
  }

  const isToday = date === todayStr()
  const quoteIdx = Math.abs(date.split('-').reduce((a, c) => a + parseInt(c), 0)) % QUOTES.length
  const doneTasks  = tasks.filter(t => t.done && t.text).length
  const totalTasks = tasks.filter(t => t.text).length

  const searchResults = searchQuery.trim()
    ? Object.entries(allTasks).flatMap(([d, ts]) =>
        ts.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(t => ({ ...t, date: d }))
      ).sort((a, b) => b.date.localeCompare(a.date))
    : []

  return (
    <div className="app-shell">

      {/* ── Top bar ── */}
      <div className="topbar">
        <span className="topbar-title">my journal</span>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={() => setShowSearch(s => !s)} title="Search">🔍</button>
          <button className="icon-btn" onClick={() => setDate(todayStr())}     title="Today">📅</button>
          <button className="icon-btn" onClick={() => setShowSettings(true)}   title="Customize">🎨</button>
        </div>
      </div>

      {/* ── Search ── */}
      {showSearch && (
        <div className="search-wrap">
          <div className="search-bar">
            <span style={{ color: '#A89880' }}>🔍</span>
            <input
              className="search-input"
              placeholder="Search all entries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="icon-btn" style={{ width: 24, height: 24, fontSize: '0.8rem' }} onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results">
              {searchResults.length === 0
                ? <div className="search-result-item"><span className="sr-text" style={{ color: '#A89880' }}>No entries found</span></div>
                : searchResults.map(t => (
                  <div key={t.id} className="search-result-item"
                    onClick={() => { setDate(t.date); setShowSearch(false); setSearchQuery('') }}>
                    <div className="sr-date">{formatDate(t.date)}</div>
                    <div className={`sr-text ${t.done ? 'done' : ''}`}>{t.text || '(empty)'}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* ── Notebook ── */}
      <div className={`notebook page-wrap ${pageAnim}`} style={{ background: theme.bg }}>

        {/* Ruled lines */}
        <div className="ruled-bg" style={{
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${LINE_HEIGHT - 1}px, ${theme.lines} ${LINE_HEIGHT - 1}px, ${theme.lines} ${LINE_HEIGHT}px)`,
          backgroundPosition: `0 80px`,
        }} />

        {/* Red margin line */}
        <div className="margin-line" style={{ background: theme.margin }} />

        <div className="notebook-inner" ref={pageRef} onClick={handlePageClick}>

          {/* Date header */}
          <div className="date-header">
            <button className="date-nav-btn" onClick={e => { e.stopPropagation(); navigate(-1) }}>‹</button>
            <div className="date-text">
              {formatDate(date)}
              {isToday && <span className="today-dot" />}
            </div>
            <button className="date-nav-btn" onClick={e => { e.stopPropagation(); navigate(1) }}>›</button>
          </div>

          {/* Quote */}
          <div className="quote-line">
            "{QUOTES[quoteIdx]}"
          </div>

          {/* Tasks */}
          <div className="tasks-area" onClick={e => e.stopPropagation()}>
            {[...tasks]
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((task, idx) => (
                <div key={task.id} className={`task-row ${deletingIds.has(task.id) ? 'deleting' : ''}`}>
                  <div className="checkbox-wrap" onClick={() => updateTask(task.id, { done: !task.done })}>
                    <div className={`custom-check ${task.done ? 'checked' : ''}`}>
                      <span className="checkmark">✓</span>
                    </div>
                  </div>

                  <input
                    id={`task-${task.id}`}
                    className={`task-input ${task.done ? 'done' : ''}`}
                    value={task.text}
                    placeholder={idx === 0 ? 'Start writing your tasks…' : ''}
                    onChange={e => updateTask(task.id, { text: e.target.value })}
                    onKeyDown={e => handleKeyDown(e, tasks.indexOf(task))}
                    spellCheck={false}
                    style={{ fontFamily: font.value, fontSize: font.size }}
                  />

                  <button
                    className={`pin-btn row-action ${task.pinned ? 'pinned' : ''}`}
                    onClick={() => updateTask(task.id, { pinned: !task.pinned })}
                    title={task.pinned ? 'Unpin' : 'Pin to top'}
                  >📌</button>

                  <button
                    className="delete-btn row-action"
                    onClick={() => deleteTask(task.id)}
                    title="Delete"
                  >×</button>
                </div>
              ))}
          </div>

          {/* Progress */}
          {totalTasks > 0 && (
            <div className="stats-bar">
              <span className="stats-text">{doneTasks} / {totalTasks} done</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.round(doneTasks / totalTasks * 100)}%` }} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Settings overlay ── */}
      <div className={`settings-overlay ${showSettings ? 'open' : ''}`} onClick={() => setShowSettings(false)} />
      <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span className="settings-title">Customize</span>
          <button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Page Color</div>
          <div className="theme-grid">
            {THEMES.map((t, i) => (
              <div key={i}
                className={`theme-swatch ${themeIdx === i ? 'active' : ''}`}
                style={{ background: t.bg, borderColor: themeIdx === i ? t.margin : 'transparent' }}
                onClick={() => setThemeIdx(i)}
              >{t.label}</div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Writing Style</div>
          <div className="font-list">
            {FONTS.map((f, i) => (
              <div key={i}
                className={`font-opt ${fontIdx === i ? 'active' : ''}`}
                style={{ fontFamily: f.value, fontSize: f.size }}
                onClick={() => setFontIdx(i)}
              >{f.label}</div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: '0.75rem', color: '#A89880', textAlign: 'center' }}>
          All data saved locally in your browser
        </div>
      </div>

    </div>
  )
}
