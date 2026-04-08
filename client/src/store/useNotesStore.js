import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INBOX_ID = 'inbox'

function nowIso() {
    return new Date().toISOString()
}

function extractTags(text) {
    if (!text) return []
    const tags = new Set()
    const re = /#([A-Za-zА-Яа-яЁё0-9_/-]+)/g
    let m
    while ((m = re.exec(text)) !== null) {
        tags.add(m[1].toLowerCase())
    }
    return Array.from(tags)
}

const useNotesStore = create(
    persist(
        (set, get) => ({
            folders: [
                { id: INBOX_ID, title: 'Inbox', locked: true },
            ],
            notes: [],
            selectedFolderId: INBOX_ID,
            selectedTag: null,
            query: '',

            // ----- folders
            addFolder: (title) =>
                set((state) => {
                    const t = title.trim()
                    if (!t) return state
                    return {
                        folders: [...state.folders, { id: String(Date.now()), title: t, locked: false }],
                    }
                }),

            renameFolder: (id, title) =>
                set((state) => ({
                    folders: state.folders.map((f) =>
                        f.id === id ? { ...f, title: title.trim() || f.title } : f
                    ),
                })),

            deleteFolder: (id) =>
                set((state) => {
                    const folder = state.folders.find((f) => f.id === id)
                    if (!folder || folder.locked) return state

                    // удаляем папку
                    const folders = state.folders.filter((f) => f.id !== id)

                    // переносим заметки в inbox
                    const notes = state.notes.map((n) =>
                        n.folderId === id ? { ...n, folderId: INBOX_ID, updatedAt: nowIso() } : n
                    )

                    return {
                        folders,
                        notes,
                        selectedFolderId: state.selectedFolderId === id ? INBOX_ID : state.selectedFolderId,
                    }
                }),

            setSelectedFolderId: (id) => set({ selectedFolderId: id, selectedTag: null }),
            setSelectedTag: (tag) => set({ selectedTag: tag, selectedFolderId: INBOX_ID }),
            setQuery: (query) => set({ query }),

            // ----- notes
            addNote: (folderId = INBOX_ID) =>
                set((state) => {
                    const id = String(Date.now())
                    const note = {
                        id,
                        folderId,
                        title: '',
                        content: '',
                        tags: [],
                        createdAt: nowIso(),
                        updatedAt: nowIso(),
                    }
                    return { notes: [note, ...state.notes] }
                }),

            updateNote: (id, patch) =>
                set((state) => ({
                    notes: state.notes.map((n) => {
                        if (n.id !== id) return n
                        const next = {
                            ...n,
                            ...patch,
                            updatedAt: nowIso(),
                        }
                        // пересчёт тегов по content/title
                        const tagText = `${next.title}\n${next.content}`
                        next.tags = extractTags(tagText)
                        return next
                    }),
                })),

            deleteNote: (id) =>
                set((state) => ({
                    notes: state.notes.filter((n) => n.id !== id),
                })),

            moveNote: (id, folderId) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id ? { ...n, folderId, updatedAt: nowIso() } : n
                    ),
                })),

            // ----- selectors
            getFilteredNotes: () => {
                const { notes, selectedFolderId, selectedTag, query } = get()
                const q = query.trim().toLowerCase()

                return notes
                    .filter((n) => (selectedTag ? n.tags?.includes(selectedTag) : true))
                    .filter((n) => (selectedFolderId ? n.folderId === selectedFolderId : true))
                    .filter((n) => {
                        if (!q) return true
                        return (
                            (n.title || '').toLowerCase().includes(q) ||
                            (n.content || '').toLowerCase().includes(q)
                        )
                    })
                    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
            },

            getAllTags: () => {
                const tags = new Set()
                for (const n of get().notes) {
                    for (const t of n.tags || []) tags.add(t)
                }
                return Array.from(tags).sort()
            },
        }),
        {
            name: 'one-live-notes',
            version: 1,
            migrate: (state) => {
                const s = state || {}
                const folders = Array.isArray(s.folders) ? s.folders : []
                const hasInbox = folders.some((f) => f.id === INBOX_ID)
                return {
                    ...s,
                    folders: hasInbox ? folders : [{ id: INBOX_ID, title: 'Inbox', locked: true }, ...folders],
                    notes: Array.isArray(s.notes) ? s.notes : [],
                    selectedFolderId: s.selectedFolderId || INBOX_ID,
                    selectedTag: s.selectedTag || null,
                    query: s.query || '',
                }
            },
        }
    )
)

export default useNotesStore