import type { MetadataRoute } from 'next'
import { STEPS, stepByNumber } from '@/lib/steps'
import { topics, TOPIC_STEP_MAP } from '@/data/topics'

const BASE = 'https://web-internals.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const urls: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
  ]
  for (const s of STEPS) {
    urls.push({
      url: `${BASE}/steps/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }
  for (const t of topics) {
    const m = TOPIC_STEP_MAP[t.id]
    if (!m) continue
    const step = stepByNumber(m.step)
    if (!step) continue
    urls.push({
      url: `${BASE}/steps/${step.slug}/${t.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }
  return urls
}
