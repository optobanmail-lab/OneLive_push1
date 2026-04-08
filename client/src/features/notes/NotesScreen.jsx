import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import useNotesStore from '../../store/useNotesStore'

function NoteCard({ note, onOpen }) {
    const title = note.title?.trim() || 'Без названия'
    const snippet = (note.content || '').trim().slice(0, 120)

    return (
        <button
            type="button"
            onClick={onOpen}
            className="w-full text-left"
        >
            <Card className="press fade">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-text">{title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {snippet || 'Пустая заметка…'}
                        </p>

                        {note.tags?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {note.tags.slice(0, 4).map((t) => (
                                    <span key={t} className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted">
                    #{t}
                  </span>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <span className="shrink-0 text-xs text-muted">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
                </div>
            </Card>
        </button>
    )
}

function NotesScreen() {
    const folders = useNotesStore((s) => s.folders)
    const selectedFolderId = useNotesStore((s) => s.selectedFolderId)
    const selectedTag = useNotesStore((s) => s.selectedTag)
    const query = useNotesStore((s) => s.query)

    const setSelectedFolderId = useNotesStore((s) => s.setSelectedFolderId)
    const setSelectedTag = useNotesStore((s) => s.setSelectedTag)
    const setQuery = useNotesStore((s) => s.setQuery)

    const addFolder = useNotesStore((s) => s.addFolder)
    const renameFolder = useNotesStore((s) => s.renameFolder)
    const deleteFolder = useNotesStore((s) => s.deleteFolder)

    const addNote = useNotesStore((s) => s.addNote)
    const updateNote = useNotesStore((s) => s.updateNote)
    const deleteNote = useNotesStore((s) => s.deleteNote)
    const moveNote = useNotesStore((s) => s.moveNote)

    const getFilteredNotes = useNotesStore((s) => s.getFilteredNotes)
    const getAllTags = useNotesStore((s) => s.getAllTags)

    const notes = getFilteredNotes()
    const tags = getAllTags()

    const selectedFolder = useMemo(
        () => folders.find((f) => f.id === selectedFolderId),
        [folders, selectedFolderId]
    )

    const [activeNoteId, setActiveNoteId] = useState(null)

    const activeNote = useMemo(
        () => notes.find((n) => n.id === activeNoteId) || null,
        [notes, activeNoteId]
    )

    const openNewNote = () => {
        addNote(selectedFolderId)
        // заметка добавится первой (мы вставляем в начало), найдём её как newest
        const newest = useNotesStore.getState().notes[0]
        if (newest?.id) setActiveNoteId(newest.id)
    }

    const onFolderMenu = (folder) => {
        if (folder.locked) return
        const action = window.prompt('folder: rename / delete', 'rename')
        if (action === 'delete') deleteFolder(folder.id)
        if (action === 'rename') {
            const nextTitle = window.prompt('Новое название папки', folder.title)
            if (nextTitle) renameFolder(folder.id, nextTitle)
        }
    }

    return (
        <div className="pt-4">
            <AnimatePresence mode="wait" initial={false}>
                {activeNote ? (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <Header title="Заметка" subtitle="Markdown позже — пока быстрые заметки" />

                        <div className="mb-3 flex gap-2">
                            <Button variant="glass" onClick={() => setActiveNoteId(null)}>
                                Назад
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    deleteNote(activeNote.id)
                                    setActiveNoteId(null)
                                }}
                            >
                                Удалить
                            </Button>
                        </div>

                        <Card className="mb-3">
                            <p className="mb-2 text-xs text-muted">Папка</p>
                            <div className="flex flex-wrap gap-2">
                                {folders.map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => moveNote(activeNote.id, f.id)}
                                        className={`press rounded-full px-3 py-2 text-xs ${
                                            activeNote.folderId === f.id
                                                ? 'bg-accent text-white'
                                                : 'bg-white/5 text-text'
                                        }`}
                                    >
                                        {f.title}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="mb-3">
                            <p className="mb-2 text-xs text-muted">Заголовок</p>
                            <input
                                value={activeNote.title}
                                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                                placeholder="Название заметки…"
                                className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 text-text outline-none"
                            />
                        </Card>

                        <Card>
                            <p className="mb-2 text-xs text-muted">Текст</p>
                            <textarea
                                value={activeNote.content}
                                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                                placeholder="Пиши сюда. Хэштеги: #учеба #деньги #идеи …"
                                rows={10}
                                className="w-full resize-none rounded-2xl border border-border bg-surface2 px-4 py-3 text-text outline-none"
                            />
                            {activeNote.tags?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {activeNote.tags.map((t) => (
                                        <span key={t} className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted">
                      #{t}
                    </span>
                                    ))}
                                </div>
                            ) : null}
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <Header
                            title="Заметки"
                            subtitle={
                                selectedTag
                                    ? `Фильтр: #${selectedTag}`
                                    : `Папка: ${selectedFolder?.title || '—'}`
                            }
                        />

                        <Card className="mb-3">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Поиск по заметкам…"
                                className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 text-text outline-none"
                            />
                        </Card>

                        <div className="mb-3 flex gap-2">
                            <Button
                                variant="glass"
                                onClick={() => {
                                    const name = window.prompt('Название папки')
                                    if (name) addFolder(name)
                                }}
                            >
                                + Папка
                            </Button>

                            <Button variant="primary" onClick={openNewNote}>
                                + Заметка
                            </Button>
                        </div>

                        <Card className="mb-3">
                            <p className="mb-2 text-xs text-muted">Папки</p>
                            <div className="flex flex-wrap gap-2">
                                {folders.map((f) => {
                                    const active = selectedFolderId === f.id && !selectedTag
                                    return (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setSelectedFolderId(f.id)}
                                            onContextMenu={(e) => {
                                                e.preventDefault()
                                                onFolderMenu(f)
                                            }}
                                            className={`press rounded-full px-3 py-2 text-xs ${
                                                active ? 'bg-accent text-white' : 'bg-white/5 text-text'
                                            }`}
                                            title={f.locked ? 'Системная папка' : 'ПКМ/Long-press: rename/delete'}
                                        >
                                            {f.title}
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="mt-2 text-[11px] text-muted">
                                Переименовать/удалить папку: ПКМ на ПК (позже сделаем long-press на телефоне).
                            </p>
                        </Card>

                        {tags.length ? (
                            <Card className="mb-3">
                                <p className="mb-2 text-xs text-muted">Теги</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTag(null)}
                                        className={`press rounded-full px-3 py-2 text-xs ${
                                            !selectedTag ? 'bg-accent text-white' : 'bg-white/5 text-text'
                                        }`}
                                    >
                                        Все
                                    </button>
                                    {tags.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setSelectedTag(t)}
                                            className={`press rounded-full px-3 py-2 text-xs ${
                                                selectedTag === t ? 'bg-accent text-white' : 'bg-white/5 text-text'
                                            }`}
                                        >
                                            #{t}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        ) : null}

                        <div className="space-y-3">
                            {notes.length === 0 ? (
                                <Card>
                                    <p className="text-center text-sm text-muted">
                                        Пока нет заметок. Создай первую.
                                    </p>
                                </Card>
                            ) : (
                                notes.map((n) => (
                                    <NoteCard key={n.id} note={n} onOpen={() => setActiveNoteId(n.id)} />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotesScreen