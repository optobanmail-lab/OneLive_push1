const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
    const url = path.startsWith('http')
        ? path
        : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

    const headers = { ...(options.headers || {}) }

    let body = options.body
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json'
        body = JSON.stringify(body)
    }

    const res = await fetch(url, { ...options, headers, body })

    const ct = res.headers.get('content-type') || ''
    const isJson = ct.includes('application/json')
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

    if (!res.ok) {
        const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`
        throw new Error(msg)
    }

    return data
}

const api = {
    get: (p, o) => request(p, { ...(o || {}), method: 'GET' }),
    post: (p, b, o) => request(p, { ...(o || {}), method: 'POST', body: b }),
    put: (p, b, o) => request(p, { ...(o || {}), method: 'PUT', body: b }),
    patch: (p, b, o) => request(p, { ...(o || {}), method: 'PATCH', body: b }),
    delete: (p, o) => request(p, { ...(o || {}), method: 'DELETE' }),
}

export default api
export { BASE_URL, request }