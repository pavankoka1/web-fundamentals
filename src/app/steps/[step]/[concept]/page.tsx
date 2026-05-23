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
  const { concept } = await params
  const topic = getTopicBySlug(concept)
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

export default async function Page({ params }: Props) {
  const { step: stepSlug, concept: conceptId } = await params
  const stepMeta = stepBySlug(stepSlug)
  const topic = getTopicBySlug(conceptId)

  if (!stepMeta || !topic) notFound()
  if (TOPIC_STEP_MAP[topic.id]?.step !== stepMeta.step) notFound()

  const { prev, next } = getAdjacentTopics(topic.id)

  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <ProgressTracker topicId={topic.id} />

      {/* WebGL Scene */}
      <div
        className="w-full h-72 md:h-96 relative overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >
        <SceneLoader sceneKey={topic.sceneKey} />
      </div>

      {/* Content */}
      <article>
        <TopicHero topic={topic} />
        <ConceptSection example={topic.example} />
        <div className="px-8 py-4">
          <h2
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Diagram
          </h2>
          <DiagramLoader diagramKey={topic.diagramKey} />
        </div>
        <FactsGrid topic={topic} />
        <InsightCallout insight={topic.insight} />
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
  )
}
