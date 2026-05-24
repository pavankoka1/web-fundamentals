import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getTopicBySlug,
  getAdjacentTopics,
  TOPIC_STEP_MAP,
  topics,
} from '@/data/topics'
import { stepBySlug, stepByNumber } from '@/lib/steps'
import TopicHero from '@/components/topic/TopicHero'
import ConceptSection from '@/components/topic/ConceptSection'
import FactsGrid from '@/components/topic/FactsGrid'
import InsightCallout from '@/components/topic/InsightCallout'
import CodeDemo from '@/components/topic/CodeDemo'
import TopicNav from '@/components/topic/TopicNav'
import SceneLoader from '@/components/scenes/SceneLoader'
import DiagramLoader from '@/components/diagrams/DiagramLoader'
import ProgressTracker from '@/components/topic/ProgressTracker'
import { topicJsonLd } from '@/lib/schema'

export function generateStaticParams() {
  return topics
    .filter((t) => TOPIC_STEP_MAP[t.id])
    .map((t) => {
      const stepMeta = stepByNumber(TOPIC_STEP_MAP[t.id].step)
      return { step: stepMeta!.slug, concept: t.id }
    })
}

interface Props {
  params: Promise<{ step: string; concept: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step: stepSlug, concept: conceptId } = await params
  const stepMeta = stepBySlug(stepSlug)
  const topic = getTopicBySlug(conceptId)
  if (!stepMeta || !topic) return { title: 'Concept not found' }

  const title = topic.title
  const description = topic.seoDescription || topic.subtitle || `Concept in ${stepMeta.title}.`
  const url = `/steps/${stepMeta.slug}/${topic.id}`

  return {
    title,
    description,
    keywords: [topic.title, stepMeta.title, 'web internals', 'browser internals'],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Web Fundamentals',
      authors: ['Web Fundamentals'],
      images: ['/opengraph-image'],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  }
}

export default async function Page({ params }: Props) {
  const { step: stepSlug, concept: conceptId } = await params
  const stepMeta = stepBySlug(stepSlug)
  const topic = getTopicBySlug(conceptId)

  if (!stepMeta || !topic) notFound()
  if (TOPIC_STEP_MAP[topic.id]?.step !== stepMeta.step) notFound()

  const { prev, next } = getAdjacentTopics(topic.id)

  const jsonLd = topicJsonLd(topic, stepMeta)

  return (
    <main className="relative z-10 mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      {/* JSON-LD payload is built from typed Topic data; JSON.stringify is safe here. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgressTracker topicId={topic.id} />

      {/* WebGL Scene */}
      <div
        className="w-full h-72 md:h-96 relative overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >
        <SceneLoader sceneKey={topic.sceneKey} conceptTitle={topic.title} />
      </div>

      {/* Content */}
      <article>
        <TopicHero topic={topic} />
        <ConceptSection example={topic.example} />
        <section className="mt-20">
          <h2 className="mb-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
            Diagram
          </h2>
          <DiagramLoader diagramKey={topic.diagramKey} />
        </section>
        <FactsGrid topic={topic} />
        <InsightCallout insight={topic.insight} />
        {topic.codeDemo && (
          <CodeDemo
            bad={topic.codeDemo.bad}
            good={topic.codeDemo.good}
            label={topic.codeDemo.label}
          />
        )}
        <TopicNav prev={prev} next={next} />
      </article>
    </main>
  )
}
