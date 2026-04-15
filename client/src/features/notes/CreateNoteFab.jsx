import { useMemo, useRef, useState, useEffect } from 'react'
import { INBOX_FOLDER_ID } from '../../store/useNotesStore'

function FolderPickerSheet({ open, folders, selectedId, onSelect, onClose }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[260] pointer-events-auto">
            <button
                type="button"
                className="absolute inset-0 scrim-smooth scrim-smooth-on"
                onClick={onClose}
                aria-label="close folder picker"
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
                                    <div className="text-[22px] leading-none font-bold text-text">Выбери папку</div>
                                    <div className="mt-2 text-xs text-muted">Куда сохранить заметку</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Готово
                                </button>
                            </div>

                            <div
                                className="mt-4 space-y-2 overflow-y-auto hide-scrollbar"
                                style={{
                                    maxHeight: '42dvh',
                                    WebkitOverflowScrolling: 'touch',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'pan-y',
                                }}
                            >
                                {(folders || []).map((f) => {
                                    const active = f.id === selectedId
                                    return (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => {
                                                onSelect?.(f.id)
                                                onClose?.()
                                            }}
                                            className={active ? 'folder-row folder-row-active' : 'folder-row'}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-text truncate">{f.name}</div>
                                                    <div className="mt-1 text-[11px] text-muted">
                                                        {f.id === INBOX_FOLDER_ID ? 'По умолчанию' : 'Папка'}
                                                    </div>
                                                </div>

                                                <div className={active ? 'text-white/90 text-sm font-semibold' : 'text-muted'}>
                                                    {active ? '✓' : ''}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            <p className="mt-3 text-center text-[11px] text-muted/80">Тап по фону — закрыть</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CreateNoteFab({
                                          bottomOffsetPx = 0,
                                          folders = [],
                                          selectedFolderId = INBOX_FOLDER_ID,
                                          onCreateNote,
                                      }) {
    const fabRef = useRef(null)

    // closed | flying | open
    const [ui, setUi] = useState('closed')
    const [fly, setFly] = useState({ sx: 0, sy: 0, ex: 0, ey: 0 })

    const [folderId, setFolderId] = useState(selectedFolderId || INBOX_FOLDER_ID)
    const [pickerOpen, setPickerOpen] = useState(false)

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')

    const open = ui !== 'closed'

    const FLY_MS = 420
    const BURST_MS = 320
    const OPEN_AFTER_MS = FLY_MS + 80

    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    useEffect(() => {
        if (ui === 'open') setFolderId(selectedFolderId || INBOX_FOLDER_ID)
    }, [ui, selectedFolderId])

    const folderName = useMemo(() => {
        const f = (folders || []).find((x) => x.id === folderId)
        return f?.name || 'Входящие'
    }, [folders, folderId])

    const reset = () => {
        setTitle('')
        setBody('')
        setFolderId(selectedFolderId || INBOX_FOLDER_ID)
        setPickerOpen(false)
    }

    const close = () => {
        setUi('closed')
        setTimeout(reset, 240)
    }

    const startOpen = () => {
        const el = fabRef.current
        const size = 56
        const vw = window.innerWidth
        const vh = window.innerHeight

        if (el) {
            const r = el.getBoundingClientRect()
            const sx = r.left + r.width / 2 - size / 2
            const sy = r.top + r.height / 2 - size / 2
            const ex = vw / 2 - size / 2
            const ey = vh / 2 - size / 2 - 40
            setFly({ sx, sy, ex, ey })
        } else {
            setFly({
                sx: vw / 2 - size / 2,
                sy: vh - 140,
                ex: vw / 2 - size / 2,
                ey: vh / 2 - size / 2 - 40,
            })
        }

        setUi('flying')
        setTimeout(() => setUi('open'), OPEN_AFTER_MS)
    }

    const canSave = useMemo(() => title.trim().length > 0 || body.trim().length > 0, [title, body])

    const fabBottom = `calc(${bottomOffsetPx}px + 22px + env(safe-area-inset-bottom))`
    const showOrb = ui === 'flying'
    const showSheet = ui === 'open'

    return (
        <>
            {!open ? (
                <button
                    ref={fabRef}
                    type="button"
                    onClick={startOpen}
                    className="fixed left-1/2 -translate-x-1/2 z-[180]"
                    style={{ bottom: fabBottom }}
                    aria-label="create note"
                >
                    <div className="press grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-soft">
                        <span className="text-2xl leading-none">+</span>
                    </div>
                </button>
            ) : null}

            <div
                className={['fixed inset-0 z-[220]', open ? 'pointer-events-auto' : 'pointer-events-none'].join(' ')}
                aria-hidden={!open}
            >
                <button
                    type="button"
                    onClick={() => (pickerOpen ? setPickerOpen(false) : close())}
                    className={['absolute inset-0 scrim-smooth', open ? 'scrim-smooth-on' : 'scrim-smooth-off'].join(' ')}
                    aria-label="close"
                />

                {showOrb ? (
                    <div
                        className="fab-fly-orb fab-fly-orb-fly-smooth"
                        style={{
                            '--sx': `${fly.sx}px`,
                            '--sy': `${fly.sy}px`,
                            '--ex': `${fly.ex}px`,
                            '--ey': `${fly.ey}px`,
                            '--flyMs': `${FLY_MS}ms`,
                            '--burstMs': `${BURST_MS}ms`,
                        }}
                    >
                        <div className="fab-fly-orb-inner">+</div>
                    </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
                    <div className="w-full max-w-md">
                        {showSheet ? (
                            <div className="ios-sheet sheet-pop-smooth">
                                <button
                                    type="button"
                                    className="sheet-handle-hit"
                                    onClick={close}
                                    aria-label="close"
                                    title="Закрыть"
                                >
                                    <span className="sheet-handle-bar" />
                                </button>

                                <div className="px-5 pb-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[28px] leading-none font-bold text-text">Новая заметка</div>
                                            <div className="mt-2 text-xs text-muted">Создаётся в текущей папке</div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={close}
                                            className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                        >
                                            Закрыть
                                        </button>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <button
                                            type="button"
                                            onClick={() => setPickerOpen(true)}
                                            className="folder-field press"
                                        >
                                            <div className="folder-field-icon">📁</div>
                                            <div className="min-w-0 flex-1 text-left">
                                                <div className="text-xs text-muted">Папка</div>
                                                <div className="mt-0.5 text-[15px] font-semibold text-text truncate">
                                                    {folderName}
                                                </div>
                                            </div>
                                            <div className="folder-field-chevron">›</div>
                                        </button>

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
                                            placeholder="Запиши мысли..."
                                            className="textarea-liquid"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!canSave) return
                                                onCreateNote?.({ folderId, title: title.trim(), body: body.trim() })
                                                close()
                                            }}
                                            disabled={!canSave}
                                            className={[
                                                'press w-full rounded-2xl py-4 text-sm font-semibold',
                                                canSave
                                                    ? 'bg-accent text-white'
                                                    : 'bg-surface-elevated/50 text-muted border border-border-subtle',
                                            ].join(' ')}
                                        >
                                            Сохранить
                                        </button>
                                    </div>

                                    <p className="mt-3 text-center text-[11px] text-muted/80">
                                        Тап по фону — закрыть
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <FolderPickerSheet
                    open={pickerOpen}
                    folders={folders}
                    selectedId={folderId}
                    onSelect={(id) => setFolderId(id)}
                    onClose={() => setPickerOpen(false)}
                />
            </div>
        </>
    )
}