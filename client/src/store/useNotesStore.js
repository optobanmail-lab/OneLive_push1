import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const INBOX_FOLDER_ID = 'inbox'

function ensureInbox(state) {
    const s = state || {}
    const folders = Array.isArray(s.folders) ? s.folders : []
    const notes = Array.isArray(s.notes) ? s.notes : []

    const hasInbox = folders.some((f) => f.id === INBOX_FOLDER_ID)
    const nextFolders = hasInbox
        ? folders
        : [{ id: INBOX_FOLDER_ID, name: 'Входящие', createdAt: Date.now() }, ...folders]

    // если у заметки нет папки — отправим во входящие
    const nextNotes = notes.map((n) => ({
        ...n,
        folderId: n.folderId || INBOX_FOLDER_ID,
        updatedAt: n.updatedAt || n.createdAt || Date.now(),
        createdAt: n.createdAt || Date.now(),
    }))

    return { ...s, folders: nextFolders, notes: nextNotes }
}

const useNotesStore = create(
    persist(
        (set, get) => ({
            folders: [{ id: INBOX_FOLDER_ID, name: 'Входящие', createdAt: Date.now() }],
            notes: [],

            addFolder: (name) => {
                const clean = String(name || '').trim()
                if (!clean) return
                const folder = { id: uid(), name: clean, createdAt: Date.now() }
                set((s) => ({ folders: [folder, ...(s.folders || [])] }))
                return folder.id
            },

            renameFolder: (id, name) => {
                const clean = String(name || '').trim()
                if (!clean) return
                if (id === INBOX_FOLDER_ID) return
                set((s) => ({
                    folders: (s.folders || []).map((f) => (f.id === id ? { ...f, name: clean } : f)),
                }))
            },

            deleteFolder: (id) => {
                if (id === INBOX_FOLDER_ID) return
                set((s) => {
                    // удаляем папку, а заметки переносим во входящие
                    const nextFolders = (s.folders || []).filter((f) => f.id !== id)
                    const nextNotes = (s.notes || []).map((n) =>
                        n.folderId === id ? { ...n, folderId: INBOX_FOLDER_ID, updatedAt: Date.now() } : n
                    )
                    return { folders: nextFolders, notes: nextNotes }
                })
            },

            addNote: ({ folderId, title, body }) => {
                const cleanBody = String(body || '').trim()
                const cleanTitle = String(title || '').trim()

                if (!cleanBody && !cleanTitle) return

                const note = {
                    id: uid(),
                    folderId: folderId || INBOX_FOLDER_ID,
                    title: cleanTitle,
                    body: cleanBody,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }

                set((s) => ({ notes: [note, ...(s.notes || [])] }))
                return note.id
            },

            updateNote: (id, patch) => {
                set((s) => ({
                    notes: (s.notes || []).map((n) =>
                        n.id === id
                            ? {
                                ...n,
                                ...patch,
                                title: patch?.title != null ? String(patch.title) : n.title,
                                body: patch?.body != null ? String(patch.body) : n.body,
                                folderId: patch?.folderId != null ? patch.folderId : n.folderId,
                                updatedAt: Date.now(),
                            }
                            : n
                    ),
                }))
            },

            deleteNote: (id) => {
                set((s) => ({ notes: (s.notes || []).filter((n) => n.id !== id) }))
            },

            getFolderName: (id) => {
                const f = (get().folders || []).find((x) => x.id === id)
                return f?.name || 'Входящие'
            },
        }),
        {
            name: 'notes-store-v1',
            version: 1,
            migrate: (state) => ensureInbox(state),
            partialize: (s) => ({
                folders: s.folders,
                notes: s.notes,
            }),
        }
    )
)

export default useNotesStore
export { INBOX_FOLDER_ID }