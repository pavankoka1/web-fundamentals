'use client'
import { useEffect } from 'react'
import { useProgress } from '@/hooks/useProgress'

export default function ProgressTracker({ topicId }: { topicId: string }) {
  const { markVisited } = useProgress()
  useEffect(() => { markVisited(topicId) }, [topicId, markVisited])
  return null
}
