import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { topics, getTopicBySlug, getAdjacentTopics } from '@/data/topics'
import TopicHero from '@/components/topic/TopicHero'
import ConceptSection from '@/components/topic/ConceptSection'
import FactsGrid from '@/components/topic/FactsGrid'
import InsightCallout from '@/components/topic/InsightCallout'
import CodeDemo from '@/components/topic/CodeDemo'
import TopicNav from '@/components/topic/TopicNav'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import SceneLoader from '@/components/scenes/SceneLoader'
import DiagramLoader from '@/components/diagrams/DiagramLoader'
import ProgressTracker from './ProgressTracker'

export async function generateStaticParams() {
  return topics.map(t => ({ slug: t.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) return {}
  return {
    title: topic.title,
    description: topic.seoDescription,
    openGraph: {
      title: `${topic.title} — Web Internals`,
      description: topic.seoDescription,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} — Web Internals`,
      description: topic.seoDescription,
    },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()

  const { prev, next } = getAdjacentTopics(slug)

  return (
    <>
      <TopNav />
      <Sidebar />
      <main className="lg:ml-56 pt-12 min-h-screen">
        <ProgressTracker topicId={topic.id} />

        {/* WebGL Scene */}
        <div className="w-full h-72 md:h-96 relative overflow-hidden"
          style={{ background: 'var(--color-surface)' }}>
          <SceneLoader sceneKey={topic.sceneKey} />
        </div>

        {/* Content */}
        <article className="max-w-3xl mx-auto">
          <TopicHero topic={topic} />
          <ConceptSection example={topic.example} />
          <div className="px-8 py-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--color-text-muted)' }}>Diagram</h2>
            <DiagramLoader diagramKey={topic.diagramKey} />
          </div>
          <FactsGrid topic={topic} />
          <InsightCallout insight={topic.insight} phase={topic.phase} />
          {topic.codeDemo && (
            <CodeDemo
              bad={topic.codeDemo.bad}
              good={topic.codeDemo.good}
              label={topic.codeDemo.label}
              phase={topic.phase}
            />
          )}
          <TopicNav prev={prev} next={next} />
        </article>
      </main>
    </>
  )
}
