import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

import NotesScreen from '../notes/NotesScreen'
import SettingsScreen from '../settings/SettingsScreen'

function MoreScreen() {
    const [view, setView] = useState('menu') // menu | notes | settings

    return (
        <div className="pt-4">
            <AnimatePresence mode="wait" initial={false}>
                {view === 'menu' ? (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <Header title="Ещё" subtitle="Заметки, настройки и другие разделы" />

                        <div className="space-y-3">
                            <button type="button" className="w-full text-left" onClick={() => setView('notes')}>
                                <Card className="press fade">
                                    <p className="text-base font-semibold">Заметки</p>
                                    <p className="mt-1 text-sm text-muted">Папки, теги, быстрый поиск</p>
                                </Card>
                            </button>

                            <button type="button" className="w-full text-left" onClick={() => setView('settings')}>
                                <Card className="press fade">
                                    <p className="text-base font-semibold">Настройки</p>
                                    <p className="mt-1 text-sm text-muted">Тема, ссылки, управление</p>
                                </Card>
                            </button>

                            <Card>
                                <p className="text-sm text-muted">
                                    Скоро тут появятся “Бюджет” и расширенная аналитика.
                                </p>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <div className="mb-3">
                            <Button variant="glass" onClick={() => setView('menu')}>
                                ← Назад
                            </Button>
                        </div>

                        {view === 'notes' ? <NotesScreen /> : <SettingsScreen />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MoreScreen