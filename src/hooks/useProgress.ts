'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'wi-visited'

export function useProgress() {
  const [visited, setVisited] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setVisited(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
  }, [])

  const markVisited = useCallback((id: string) => {
    setVisited(prev => {
      const next = new Set(prev)
      next.add(id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }, [])

  return { visited, markVisited }
}
