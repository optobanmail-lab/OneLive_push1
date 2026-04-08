import useUiStore from '../store/useUiStore.js'

function Dashboard() {
    const tasks = useUiStore((state) => state.tasks)
    const focusMinutes = useUiStore((state) => state.focusMinutes)

    const total = tasks.length
    const completed = tasks.filter((task) => task.done).length
    const pending = total - completed
    const recentTasks = tasks.slice(-3).reverse()

    return (
        <div className="page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Your personal workspace inside Telegram Mini App.</p>
            </div>

            <div className="card-grid">
                <div className="card">
                    <h4>Total Tasks</h4>
                    <div className="metric">{total}</div>
                    <p className="muted">All tasks created by you</p>
                </div>

                <div className="card">
                    <h4>Completed</h4>
                    <div className="metric">{completed}</div>
                    <p className="muted">Finished tasks</p>
                </div>

                <div className="card">
                    <h4>Pending</h4>
                    <div className="metric">{pending}</div>
                    <p className="muted">Tasks still in progress</p>
                </div>

                <div className="card">
                    <h4>Focus Time</h4>
                    <div className="metric">{focusMinutes}m</div>
                    <p className="muted">Minutes tracked in timer</p>
                </div>
            </div>

            <div className="card">
                <h3>Recent Tasks</h3>

                {recentTasks.length === 0 ? (
                    <div className="empty-state">
                        No tasks yet. Create your first task in the Tasks section.
                    </div>
                ) : (
                    <div className="task-list">
                        {recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`task-item ${task.done ? 'done' : ''}`}
                            >
                                <div className="task-left">
                                    <input type="checkbox" checked={task.done} readOnly />
                                    <span>{task.title}</span>
                                </div>
                                <span className="muted">{task.done ? 'Done' : 'Active'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard