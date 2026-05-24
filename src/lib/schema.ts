import type { Topic } from '@/data/topics'
import type { StepMeta } from '@/lib/steps'

const BASE_URL = 'https://web-internals.dev'

export function topicJsonLd(topic: Topic, step?: StepMeta) {
  const url = step ? `${BASE_URL}/steps/${step.slug}/${topic.id}` : `${BASE_URL}/${topic.id}`
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: topic.title,
    description: topic.seoDescription || topic.subtitle,
    articleSection: step?.title ?? topic.phase,
    position: topic.order,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Web Fundamentals',
      url: BASE_URL,
    },
    author: {
      '@type': 'Organization',
      name: 'Web Fundamentals',
    },
  }
}

export function homeJsonLd(topics: Topic[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Web Internals',
    description: 'The definitive visual guide to how the web works — from URL parsing to GPU compositing, explained with interactive WebGL animations.',
    url: BASE_URL,
    mainEntity: {
      '@type': 'ItemList',
      name: 'How the Web Works — 16 Concepts',
      numberOfItems: topics.length,
      itemListElement: topics.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.title,
        url: `${BASE_URL}/${t.id}`,
        description: t.seoDescription,
      })),
    },
  }
}
