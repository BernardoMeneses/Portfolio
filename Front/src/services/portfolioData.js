import { API_URL } from '../config/api'

export const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.clone().json()
    return data?.error || data?.message || fallbackMessage
  } catch (error) {
    try {
      const text = await response.text()
      return text || fallbackMessage
    } catch (readError) {
      return fallbackMessage
    }
  }
}

// Several sections need the same data (e.g. skills show which projects use them),
// so each endpoint is fetched once per page load and shared.
const cache = new Map()

const fetchOnce = (path, fallbackMessage) => {
  if (!cache.has(path)) {
    const request = fetch(`${API_URL}${path}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await getApiErrorMessage(res, fallbackMessage))
        return res.json()
      })
      .catch((error) => {
        cache.delete(path) // allow a retry later
        throw error
      })
    cache.set(path, request)
  }
  return cache.get(path)
}

export const getProjects = () =>
  fetchOnce('/api/projects', 'Failed to fetch projects').then((data) => (Array.isArray(data) ? data : []))

export const getSkills = () =>
  fetchOnce('/api/skills', 'Failed to fetch skills').then((data) => data || {})

// Tech labels that mark a project as unfinished rather than describing its stack
export const STATUS_TAGS = ['coming soon', 'coming soon...', 'wip', 'in progress']
export const isStatusTag = (tag = '') => STATUS_TAGS.includes(tag.trim().toLowerCase())
