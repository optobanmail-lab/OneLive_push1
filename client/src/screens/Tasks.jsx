import { useState } from 'react'
import useUiStore from '../store/useUiStore.js'

function Tasks() {
    const tasks = useUiStore((state) => state.tasks)
    const addTask = useUiStore((state) => state.addTask)
    const toggleTask = useUiStore((state) => state.toggleTask)
    const removeTask = useUiStore((state) => state.removeTask)

    const [title, setTitle] = useState('')

    const handleAdd = () => {
        if (!title.trim()) return
        addTask(title)
        setTitle('')
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>Tasks</h1>
                <p>Add and manage only the things you really need.</p>
            </div>

            <div className="card">
                <div className="input-row">
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter a task..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd()
                        }}
                    />
                    <button className="primary-btn" onClick={handleAdd}>
                        Add Task
                    </button>
                </div>
            </div>

            <div className="card">
                <h3>Your Tasks</h3>

                {tasks.length === 0 ? (
                    <div className="empty-state">
                        No tasks yet. Add your first one above.
                    </div>
                ) : (
                    <div className="task-list">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className={`task-item ${task.done ? 'done' : ''}`}
                            >
                                <div className="task-left">
                                    <input
                                        type="checkbox"
                                        checked={task.done}
                                        onChange={() => toggleTask(task.id)}
                                    />
                                    <span>{task.title}</span>
                                </div>

                                <button
                                    className="secondary-btn"
                                    onClick={() => removeTask(task.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Tasks