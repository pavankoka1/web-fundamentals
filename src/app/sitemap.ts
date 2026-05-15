import type { MetadataRoute } from 'next'
import { topics } from '@/data/topics'

const BASE_URL = 'https://web-internals.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const topicUrls = topics.map(t => ({
    url: `${BASE_URL}/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    ...topicUrls,
  ]
}
