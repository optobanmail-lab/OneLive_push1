import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import useNotesStore, { INBOX_FOLDER_ID } from '../../store/useNotesStore'
import CreateNoteFab from './CreateNoteFab.jsx'

const NAV_CLEARANCE_PX = 92
const FAB_SLOT_H = 56 + 18

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}

function formatDateTime(ts) {
    try {
        return new Date(ts).toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return ''
    }
}

function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'press rounded-full px-3 py-2 text-xs border border-border-subtle whitespace-nowrap',
                active ? 'bg-accent text-white' : 'bg-surface-elevated/55 text-text',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

/** как в TimerScreen — без translate-анимаций */
function Scene({ active, children }) {
    return (
        <div
            className={[
                'absolute inset-0 transition-opacity duration-200 ease-out',
                active ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
        >
            {children}
        </div>
    )
}

/** FIX: не button, чтобы не было button внутри button */
function NoteRowCompact({ note, folderName, onOpen, onDelete }) {
    const title = (note.title || '').trim()
    const body = (note.body || '').trim()
    const preview = body.replace(/\s+/g, ' ').slice(0, 160)
    const finalTitle = title || (preview ? preview.slice(0, 42) : 'Без названия')

    return (
        <div
            className="panel-row row-clickable"
            role="button"
            tabIndex={0}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpen?.()
            }}
            style={{ paddingTop: 12, paddingBottom: 12 }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted">
              {folderName}
            </span>
                        <span className="text-[11px] text-muted">
              {formatDateTime(note.updatedAt || note.createdAt)}
            </span>
                    </div>

                    <div className="mt-2">
                        <p className="text-[15px] font-semibold text-text truncate">{finalTitle}</p>
                        {preview ? (
                            <p
                                className="mt-1 text-sm text-muted"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {preview}
                            </p>
                        ) : null}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete?.()
                            }}
                            className="press rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger"
                        >
                            Удалить
                        </button>
                    </div>
                </div>

                <div className="shrink-0 pt-1 pointer-events-none">
                    <div
                        className="grid place-items-center rounded-full border border-border-subtle bg-white/5 text-muted"
                        style={{ width: 42, height: 42 }}
                    >
                        <span className="text-lg leading-none">✎</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FolderManagerSheet({
                                open,
                                folders,
                                selectedFolderId,
                                onSelectFolder,
                                onAddFolder,
                                onDeleteFolder,
                                onClose,
                            }) {
    const [name, setName] = useState('')

    useEffect(() => {
        if (!open) return
        setName('')
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    if (!open) return null

    const canAdd = name.trim().length > 0

    return (
        <div className="fixed inset-0 z-[240] pointer-events-auto">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 scrim-smooth scrim-smooth-on"
                aria-label="close folders"
            />

            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <div className="w-full max-w-md">
                    <div className="ios-sheet sheet-pop-smooth">
                        <button
                            type="button"
                            className="sheet-handle-hit"
                            onClick={onClose}
                            aria-label="close"
                            title="Закрыть"
                        >
                            <span className="sheet-handle-bar" />
                        </button>

                        <div className="px-5 pb-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[26px] leading-none font-bold text-text">Папки</div>
                                    <div className="mt-2 text-xs text-muted">Добавить / удалить / выбрать</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Готово
                                </button>
                            </div>

                            {/* Add folder */}
                            <div className="mt-5 space-y-2">
                                <div className="ios-field">
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Новая папка..."
                                        className="w-full bg-transparent outline-none text-[15px] text-text"
                                    />
                                </div>

                                <button
                                    type="button"
                                    disabled={!canAdd}
                                    onClick={() => {
                                        if (!canAdd) return
                                        onAddFolder?.(name.trim())
                                        setName('')
                                    }}
                                    className={[
                                        'press w-full rounded-2xl py-3 text-sm font-semibold',
                                        canAdd
                                            ? 'bg-accent text-white'
                                            : 'bg-surface-elevated/50 text-muted border border-border-subtle',
                                    ].join(' ')}
                                >
                                    Добавить папку
                                </button>
                            </div>

                            {/* Folder list */}
                            <div
                                className="mt-5 space-y-2 overflow-y-auto hide-scrollbar"
                                style={{
                                    maxHeight: '40dvh',
                                    WebkitOverflowScrolling: 'touch',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'pan-y',
                                }}
                            >
                                {(folders || []).map((f) => {
                                    const active = f.id === selectedFolderId
                                    const canDelete = f.id !== INBOX_FOLDER_ID

                                    return (
                                        <div
                                            key={f.id}
                                            className={active ? 'folder-man-row folder-man-row-active' : 'folder-man-row'}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                onSelectFolder?.(f.id)
                                                onClose?.()
                                            }}
                                        >
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-text truncate">{f.name}</div>
                                                <div className="mt-1 text-[11px] text-muted">
                                                    {f.id === INBOX_FOLDER_ID ? 'Системная папка' : 'Папка'}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {active ? (
                                                    <span className="text-white/90 text-sm font-semibold">✓</span>
                                                ) : (
                                                    <span className="text-muted text-sm"> </span>
                                                )}

                                                <button
                                                    type="button"
                                                    disabled={!canDelete}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (!canDelete) return
                                                        onDeleteFolder?.(f.id)
                                                    }}
                                                    className={[
                                                        'press rounded-xl px-3 py-2 text-xs border border-border-subtle',
                                                        canDelete ? 'bg-danger/15 text-danger' : 'bg-surface-elevated/40 text-muted',
                                                    ].join(' ')}
                                                    title={canDelete ? 'Удалить папку' : 'Нельзя удалить'}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <p className="mt-3 text-center text-[11px] text-muted/80">
                                Выбор папки — тап по строке. “Входящие” удалить нельзя.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NoteEditActionSheet({ open, onClose, onEdit, onDelete }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[420] pointer-events-auto">
            <button
                type="button"
                className="absolute inset-0 scrim-smooth scrim-smooth-on"
                onClick={onClose}
                aria-label="close edit menu"
            />

            <div className="absolute inset-x-0 bottom-0 px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <div className="mx-auto w-full max-w-md space-y-2">
                    <div className="action-sheet-card">
                        <button type="button" className="action-sheet-btn" onClick={onEdit}>
                            Редактировать
                        </button>
                        <button
                            type="button"
                            className="action-sheet-btn action-sheet-btn-danger"
                            onClick={onDelete}
                        >
                            Удалить
                        </button>
                    </div>

                    <div className="action-sheet-card">
                        <button type="button" className="action-sheet-btn" onClick={onClose}>
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NoteModal({ open, note, folders, folderName, onClose, onSave, onDelete }) {
    const [mode, setMode] = useState('view') // view | edit
    const [menuOpen, setMenuOpen] = useState(false)

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [folderId, setFolderId] = useState(INBOX_FOLDER_ID)

    useEffect(() => {
        if (!open || !note) return
        setMode('view')
        setMenuOpen(false)
        setTitle(note.title || '')
        setBody(note.body || '')
        setFolderId(note.folderId || INBOX_FOLDER_ID)
    }, [open, note])

    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    if (!open || !note) return null

    const canSave = title.trim().length > 0 || body.trim().length > 0

    return (
        <div className="fixed inset-0 z-[250] pointer-events-auto">
            <button
                type="button"
                onClick={() => (menuOpen ? setMenuOpen(false) : onClose())}
                className="absolute inset-0 scrim-smooth scrim-smooth-on"
                aria-label="close note"
            />

            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
                <div className="w-full max-w-md">
                    <div className="ios-sheet sheet-pop-smooth">
                        <button
                            type="button"
                            className="sheet-handle-hit"
                            onClick={() => {
                                if (mode === 'view') setMenuOpen(true)
                                else setMode('view')
                            }}
                            aria-label={mode === 'view' ? 'open edit menu' : 'back to view'}
                            title={mode === 'view' ? 'Меню редактирования' : 'К просмотру'}
                        >
                            <span className="sheet-handle-bar" />
                        </button>

                        <div className="px-5 pb-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[28px] leading-none font-bold text-text">
                                        {mode === 'view' ? 'Просмотр' : 'Редактирование'}
                                    </div>
                                    <div className="mt-2 text-xs text-muted">
                                        {mode === 'view'
                                            ? 'Нажми на ручку — меню редактирования'
                                            : 'Нажми на ручку — вернуться к просмотру'}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Закрыть
                                </button>
                            </div>

                            {mode === 'view' ? (
                                <div className="mt-5 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="note-chip">{folderName}</span>
                                        <span className="text-[11px] text-muted">
                      {formatDateTime(note.updatedAt || note.createdAt)}
                    </span>
                                    </div>

                                    <div className="note-view-card">
                                        {(note.title || '').trim() ? (
                                            <div className="note-view-title">{note.title}</div>
                                        ) : null}

                                        <div className="note-body">
                                            {(note.body || '').trim() ? note.body : 'Пустая заметка'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    <div className="ios-field">
                                        <select
                                            value={folderId}
                                            onChange={(e) => setFolderId(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[15px] text-text"
                                        >
                                            {folders.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {f.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="ios-field">
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Заголовок (необязательно)"
                                            className="w-full bg-transparent outline-none text-[15px] text-text"
                                        />
                                    </div>

                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Текст заметки..."
                                        className="textarea-liquid"
                                    />

                                    <button
                                        type="button"
                                        disabled={!canSave}
                                        onClick={() => {
                                            if (!canSave) return
                                            onSave?.({ title: title.trim(), body: body.trim(), folderId })
                                            setMode('view')
                                        }}
                                        className={[
                                            'press w-full rounded-2xl py-4 text-sm font-semibold',
                                            canSave
                                                ? 'bg-accent text-white'
                                                : 'bg-surface-elevated/50 text-muted border border-border-subtle',
                                        ].join(' ')}
                                    >
                                        Сохранить
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMode('view')}
                                        className="press w-full rounded-2xl py-3 text-sm font-semibold border border-border-subtle bg-surface/75 text-text"
                                    >
                                        К просмотру
                                    </button>
                                </div>
                            )}

                            <p className="mt-3 text-center text-[11px] text-muted/80">
                                Тап по фону — закрыть
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <NoteEditActionSheet
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                onEdit={() => {
                    setMenuOpen(false)
                    setMode('edit')
                }}
                onDelete={() => {
                    setMenuOpen(false)
                    onDelete?.()
                }}
            />
        </div>
    )
}

export default function NotesScreen() {
    const folders = useNotesStore((s) => s.folders)
    const notes = useNotesStore((s) => s.notes)

    const addFolder = useNotesStore((s) => s.addFolder)
    const deleteFolder = useNotesStore((s) => s.deleteFolder)

    const addNote = useNotesStore((s) => s.addNote)
    const updateNote = useNotesStore((s) => s.updateNote)
    const deleteNote = useNotesStore((s) => s.deleteNote)

    const getFolderName = useNotesStore((s) => s.getFolderName)

    const [selectedFolderId, setSelectedFolderId] = useState(INBOX_FOLDER_ID)
    const [panel, setPanel] = useState('none') // none | list

    const [foldersOpen, setFoldersOpen] = useState(false)

    const [activeNoteId, setActiveNoteId] = useState(null)
    const activeNote = useMemo(
        () => (notes || []).find((n) => n.id === activeNoteId) || null,
        [notes, activeNoteId]
    )

    // no page scroll (как Таймер)
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    useEffect(() => {
        const exists = (folders || []).some((f) => f.id === selectedFolderId)
        if (!exists) setSelectedFolderId(INBOX_FOLDER_ID)
    }, [folders, selectedFolderId])

    const folderNotes = useMemo(() => {
        return (notes || [])
            .filter((n) => (n.folderId || INBOX_FOLDER_ID) === selectedFolderId)
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    }, [notes, selectedFolderId])

    useEffect(() => {
        setPanel(folderNotes.length > 0 ? 'list' : 'none')
    }, [folderNotes.length])

    const folderName = useMemo(
        () => getFolderName(selectedFolderId),
        [selectedFolderId, getFolderName]
    )

    // panel height like TimerScreen (до слота FAB)
    const panelWrapRef = useRef(null)
    const fabSlotRef = useRef(null)
    const [panelH, setPanelH] = useState(0)

    const recomputeTargetH = () => {
        const wrapTop = panelWrapRef.current?.getBoundingClientRect().top
        const slotTop = fabSlotRef.current?.getBoundingClientRect().top
        if (wrapTop == null || slotTop == null) return
        const next = slotTop - wrapTop - 12
        setPanelH(clamp(next, 180, 680))
    }

    useEffect(() => {
        if (panel === 'none') {
            setPanelH(0)
            return
        }
        setPanelH(0)
        requestAnimationFrame(() => requestAnimationFrame(recomputeTargetH))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panel, selectedFolderId, folderNotes.length])

    useEffect(() => {
        const vv = window.visualViewport
        vv?.addEventListener('resize', recomputeTargetH)
        window.addEventListener('resize', recomputeTargetH)
        return () => {
            vv?.removeEventListener('resize', recomputeTargetH)
            window.removeEventListener('resize', recomputeTargetH)
        }
    }, [])

    const panelOpen = panel !== 'none'

    const bottomOffset = NAV_CLEARANCE_PX + 12
    const fabBottomOffsetPx = NAV_CLEARANCE_PX + 14
    const fabSlotBottom = `calc(${fabBottomOffsetPx}px + 22px + env(safe-area-inset-bottom))`

    return (
        <div
            className="space-y-4"
            style={{ paddingBottom: `calc(${bottomOffset}px + 76px + env(safe-area-inset-bottom))` }}
        >
            <Header title="Заметки" />

            {/* HERO like Timer */}
            <section className="hero-card">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-xs text-muted">Текущая папка</div>
                        <div className="mt-1 text-base font-semibold text-text truncate">{folderName}</div>
                        <div className="mt-1 text-xs text-muted">{folderNotes.length} заметок</div>
                    </div>

                    {/* вместо "+ Папка" -> "Папки" (меню управления) */}
                    <button
                        type="button"
                        onClick={() => setFoldersOpen(true)}
                        className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                    >
                        Папки
                    </button>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    <Chip active={panel === 'list'} onClick={() => setPanel((p) => (p === 'list' ? 'none' : 'list'))}>
                        Список
                    </Chip>

                    {(folders || []).map((f) => (
                        <Chip
                            key={f.id}
                            active={f.id === selectedFolderId}
                            onClick={() => setSelectedFolderId(f.id)}
                        >
                            {f.name}
                        </Chip>
                    ))}
                </div>
            </section>

            {/* Expandable panel like Timer */}
            <div
                ref={panelWrapRef}
                className={[
                    'relative overflow-hidden transition-[height,opacity] duration-200 ease-out',
                    panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                style={{ height: panelOpen ? panelH : 0, willChange: 'height' }}
            >
                <div className="absolute inset-0">
                    <Scene active={panel === 'list'}>
                        <section className="panel-card relative h-full flex flex-col overflow-hidden">
                            <div className="relative mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-text">Заметки</div>
                                    <div className="mt-1 text-xs text-muted">{folderNotes.length} шт.</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPanel('none')}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Скрыть
                                </button>
                            </div>

                            <div
                                className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 pr-1 pb-2"
                                style={{
                                    WebkitOverflowScrolling: 'touch',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'pan-y',
                                }}
                            >
                                {folderNotes.length === 0 ? (
                                    <div className="h-full grid place-items-center text-center">
                                        <div className="max-w-[320px]">
                                            <div className="text-xl font-semibold text-text">Нет заметок</div>
                                            <div className="mt-2 text-sm text-muted">
                                                Нажми “+” снизу, чтобы создать заметку в этой папке.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    folderNotes.map((n) => (
                                        <NoteRowCompact
                                            key={n.id}
                                            note={n}
                                            folderName={getFolderName(n.folderId)}
                                            onOpen={() => setActiveNoteId(n.id)}
                                            onDelete={() => deleteNote(n.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </section>
                    </Scene>
                </div>
            </div>

            {/* slot to compute panel height until FAB */}
            <div
                ref={fabSlotRef}
                className="fixed left-0 right-0 pointer-events-none"
                style={{
                    bottom: fabSlotBottom,
                    height: FAB_SLOT_H,
                    zIndex: 100,
                }}
            />

            {/* FAB: creates ONLY note */}
            <CreateNoteFab
                bottomOffsetPx={fabBottomOffsetPx}
                folders={folders || []}
                selectedFolderId={selectedFolderId}
                onCreateNote={(payload) => addNote(payload)}
            />

            <FolderManagerSheet
                open={foldersOpen}
                folders={folders || []}
                selectedFolderId={selectedFolderId}
                onSelectFolder={(id) => setSelectedFolderId(id)}
                onAddFolder={(name) => addFolder(name)}
                onDeleteFolder={(id) => deleteFolder(id)}
                onClose={() => setFoldersOpen(false)}
            />

            <NoteModal
                open={Boolean(activeNoteId)}
                note={activeNote}
                folders={folders || []}
                folderName={activeNote ? getFolderName(activeNote.folderId) : ''}
                onClose={() => setActiveNoteId(null)}
                onSave={(patch) => updateNote(activeNoteId, patch)}
                onDelete={() => {
                    deleteNote(activeNoteId)
                    setActiveNoteId(null)
                }}
            />
        </div>
    )
}