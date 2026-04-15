import { motion } from 'framer-motion'
import { LifeIcon, TimerIcon, TasksIcon, NotesIcon, MoreIcon } from '../icons/NavIcons.jsx'

const tabs = [
    { key: 'life', label: 'Жизнь', Icon: LifeIcon },
    { key: 'timer', label: 'Таймер', Icon: TimerIcon },
    { key: 'habits', label: 'Задачи', Icon: TasksIcon },
    { key: 'notes', label: 'Заметки', Icon: NotesIcon },
    { key: 'settings', label: 'Настройки', Icon: MoreIcon },
]

function BottomNav({ activeTab, onChange }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
            <div className="mx-auto max-w-md flex justify-between items-end">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key
                    const Icon = tab.Icon

                    return (
                        <button
                            key={tab.key}
                            onClick={() => onChange(tab.key)}
                            className="relative flex flex-col items-center group min-w-[64px] py-1"
                        >
                            {isActive ? (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -top-1 h-1 w-6 bg-gradient-to-r from-accent-glow-light to-accent-glow rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            ) : null}

                            <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-surface-elevated shadow-lg shadow-accent-glow/10' : ''}`}>
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-accent-glow' : 'text-text-tertiary'}`} />
                            </div>

                            <span className={`mt-2 text-[10px] font-medium tracking-wide transition-colors ${isActive ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {tab.label}
              </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

export default BottomNav